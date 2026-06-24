# Aquabot — Contrato de integración frontend

**Versión:** 2.1 — Junio 2026  
**Endpoint base:** `POST /api/chat`  
**Autenticación:** ninguna (endpoint público)  
**Formato:** `application/json`

---

## Estado de implementación

| Capacidad | Backend | Frontend |
|---|---|---|
| Respuestas de texto (Markdown) | ✅ | ✅ implementado |
| Historial de conversación | ✅ | ✅ implementado |
| Widget flotante redimensionable | — | ✅ implementado |
| Gráficos interactivos (`charts[]`) | ✅ | ⏳ pendiente |
| Reportes descargables PDF/Excel (`report`) | ✅ | ⏳ pendiente |

---

## 1. Archivos del frontend

```
src/
├─ components/
│   └─ Aquabot/
│       ├─ AquabotWidget.jsx     ← Widget completo (FAB + panel de chat)
│       └─ hooks/
│           └─ useAquabot.js     ← Lógica de estado y envío de mensajes
└─ services/
    └─ chatService.js            ← Llamada HTTP al endpoint /chat
```

---

## 2. API — POST /api/chat

### Request

```
POST /api/chat
Content-Type: application/json
```

```json
{
  "message": "¿Cuántos predios hay censados?",
  "history": []
}
```

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `message` | `string` | ✅ | Pregunta en lenguaje natural |
| `history` | `array` | ❌ | Turnos previos (ver §6). Omitir o `[]` para conversación nueva |

### Response `200 OK`

```jsonc
{
  "ok": true,
  "answer": "El censo registra **224 predios** en total...",

  // Presente solo cuando Aquabot generó gráficos (pendiente en frontend)
  "charts": [
    {
      "type": "bar",
      "title": "Predios censados por manzana",
      "x_label": "Manzana",
      "y_label": "Cantidad de predios",
      "labels": ["1", "2", "3", "4", "5"],
      "datasets": [
        {
          "label": "Cantidad de predios",
          "data": [18, 22, 15, 30, 12],
          "backgroundColor": "#0ea5e9"
        }
      ]
    }
  ],

  // Presente solo cuando Aquabot generó un reporte (pendiente en frontend)
  "report": {
    "id": "a1b2c3d4-...",   // UUID — válido durante 1 hora
    "title": "Reporte del Censo Las Mercedes"
  },

  "history": [
    { "role": "user",      "content": "¿Cuántos predios hay censados?" },
    { "role": "assistant", "content": "El censo registra..." }
  ],
  "usage": {
    "input_tokens": 1240,
    "output_tokens": 320
  }
}
```

| Campo | Tipo | Siempre presente | Descripción |
|---|---|---|---|
| `ok` | `boolean` | ✅ | `true` en respuestas exitosas |
| `answer` | `string` | ✅ | Respuesta en Markdown — renderizada con `react-markdown` |
| `charts` | `array` | ❌ | Datos de gráficos compatible con Chart.js v4 |
| `report` | `object` | ❌ | Referencia a reporte descargable |
| `history` | `array` | ✅ | Historial actualizado — guardar y reenviar en el siguiente turno |
| `usage` | `object` | ✅ | Tokens consumidos |

---

## 3. Widget — AquabotWidget.jsx

### Estructura del componente

```
AquabotWidget
├─ AquabotPanel          ← Panel de chat (redimensionable)
│   ├─ Handle de resize  ← Esquina superior-izquierda, drag mouse/touch
│   ├─ Header            ← Logo, nombre, botones reset y cerrar
│   ├─ Área de mensajes  ← flex-1, overflow-y-auto, scroll suave
│   │   ├─ MessageBubble (user)      ← Burbuja azul derecha
│   │   ├─ MessageBubble (assistant) ← Burbuja blanca izquierda + Markdown
│   │   ├─ MessageBubble (error)     ← Burbuja roja izquierda
│   │   └─ TypingIndicator           ← 3 puntos animados
│   └─ Input             ← Textarea autoexpandible + botón enviar
└─ FAB                   ← Botón flotante circular que abre/cierra el panel
```

### Redimensionamiento

El panel se puede redimensionar arrastrando el handle de la esquina superior-izquierda:

| Dimensión | Mínimo | Defecto | Máximo |
|---|---|---|---|
| Ancho | 280 px | 360 px | 760 px |
| Alto | 360 px | 520 px | 900 px |

El redimensionamiento funciona con **mouse** (desktop) y **touch** (móvil). En pantallas pequeñas, el panel respeta `max-width: calc(100vw - 48px)` y `max-height: calc(100vh - 96px)` para no salirse de pantalla.

### Posicionamiento

```css
/* Anclado abajo-derecha, encima del resto del contenido */
position: fixed;
bottom: 24px;
right: 24px;
z-index: 50;
```

---

## 4. Hook — useAquabot.js

```js
const {
  // Estado del panel
  isOpen,        // boolean
  open,          // () => void
  close,         // () => void
  toggle,        // () => void

  // Mensajes en UI
  messages,      // ChatMessage[]  { id, role: 'user'|'assistant'|'error', content }

  // Input
  input,         // string
  setInput,      // (v: string) => void
  inputRef,      // ref del textarea

  // Estado de carga
  loading,       // boolean — true mientras espera respuesta
  unavailable,   // boolean — true si el servidor devolvió 503

  // Acciones
  send,          // () => Promise<void>
  reset,         // () => void — limpia mensajes e historial
  handleKeyDown, // (e) => void — Enter envía, Shift+Enter nueva línea
} = useAquabot();
```

El hook gestiona internamente el array `history` que se reenvía al backend en cada turno. No es necesario manejarlo desde el exterior.

---

## 5. Servicio — chatService.js

```js
import { apiRequest } from './apiClient';

export async function sendChatMessage(message, history = []) {
  return apiRequest('/chat', {
    method: 'POST',
    body: { message, history },
  });
}
```

`apiRequest` aplica el `baseURL` del entorno y serializa/deserializa JSON automáticamente.

---

## 6. Historial de conversación

El backend aplica un límite de **20 turnos** (40 mensajes). Los turnos más viejos se descartan automáticamente. El frontend:

1. Recibe `data.history` en cada respuesta
2. Lo almacena internamente en `useAquabot`
3. Lo reenvía en el siguiente `POST /api/chat`
4. Lo vacía al llamar `reset()`

---

## 7. Errores

| HTTP | `ok` | Causa | Comportamiento en UI |
|---|---|---|---|
| `400` | `false` | `message` vacío | Burbuja de error genérico |
| `429` | `false` | Límite de Claude | Burbuja: "Demasiadas consultas. Espera un momento…" |
| `503` | `false` | API key no configurada | Burbuja de error + flag `unavailable` — input deshabilitado |
| `500` | `false` | Error interno | Burbuja: "Ocurrió un error. Intenta de nuevo." |
| Network error | — | Sin conexión | Burbuja: "Ocurrió un error. Intenta de nuevo." |

---

## 8. Pendiente — Gráficos (charts[])

Cuando el backend devuelve el campo `charts[]`, el frontend **actualmente lo ignora**. Para implementarlo:

```bash
npm install chart.js react-chartjs-2
```

```jsx
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, ArcElement, Title, Tooltip, Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, ArcElement, Title, Tooltip, Legend
);

const CHART_COMPONENTS = { bar: Bar, line: Line, pie: Pie, doughnut: Doughnut };

function ChartRenderer({ chart }) {
  const Component = CHART_COMPONENTS[chart.type];
  return (
    <div style={{ maxWidth: '100%', margin: '0.75rem 0' }}>
      <Component
        data={{ labels: chart.labels, datasets: chart.datasets }}
        options={{
          responsive: true,
          plugins: {
            title: { display: true, text: chart.title },
            legend: { position: 'top' },
          },
          scales: ['bar', 'line'].includes(chart.type) ? {
            x: { title: { display: !!chart.x_label, text: chart.x_label } },
            y: { title: { display: !!chart.y_label, text: chart.y_label }, beginAtZero: true },
          } : undefined,
        }}
      />
    </div>
  );
}
```

El `MessageBubble` para `assistant` deberá recibir `charts` además de `content` y renderizar un `<ChartRenderer>` por cada elemento.

---

## 9. Pendiente — Reportes descargables (report)

Cuando el backend devuelve `report.id`, el frontend **actualmente lo ignora**. Para implementarlo, agregar en la burbuja del asistente:

```jsx
{message.report && (
  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm">
    <p className="font-medium text-gray-800 mb-2">
      Reporte listo: {message.report.title}
    </p>
    <div className="flex gap-2">
      <a
        href={`/api/chat/report/${message.report.id}/pdf`}
        download
        className="px-3 py-1.5 bg-[#0D448A] text-white rounded-lg text-xs hover:bg-[#1361C5] transition-colors"
      >
        Descargar PDF
      </a>
      <a
        href={`/api/chat/report/${message.report.id}/xlsx`}
        download
        className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs hover:bg-gray-50 transition-colors"
      >
        Descargar Excel
      </a>
    </div>
    <p className="text-[10px] text-gray-400 mt-1.5">El enlace expira en 1 hora</p>
  </div>
)}
```

Endpoints del backend:
```
GET /api/chat/report/:id/pdf
GET /api/chat/report/:id/xlsx
```

No requieren autenticación. El `id` actúa como token de acceso de un solo uso con TTL de 1 hora.

---

## 10. Variables de entorno del servidor

```env
ANTHROPIC_API_KEY=sk-ant-...              # Requerida
CLAUDE_MODEL=claude-haiku-4-5-20251001    # Opcional — default: Haiku
```

| Modelo | Velocidad | Uso recomendado |
|---|---|---|
| `claude-haiku-4-5-20251001` | ⚡ Rápido | Default. Consultas de datos, preguntas rutinarias |
| `claude-sonnet-4-6` | Medio | Reportes complejos, análisis con múltiples variables |

---

## 11. Tiempos de respuesta esperados

| Tipo de pregunta | Tiempo aprox. |
|---|---|
| Pregunta conceptual (sin BD) | 1–2 s |
| Consulta simple (1 query SQL) | 2–4 s |
| Gráfico (1 query + procesamiento) | 3–5 s |
| Reporte complejo (múltiples queries) | 5–12 s |

---

## 12. Preguntas de ejemplo

**Texto**
- "¿Cuántos predios hay censados en total?"
- "¿Cuántas familias no tienen acceso al agua?"
- "Lista los predios de la manzana 4 con su estado"

**Gráficos** *(activan `charts[]` — pendiente en frontend)*
- "Muéstrame una gráfica de predios por manzana"
- "Gráfico de torta con la distribución de estados de predio"
- "Visualiza el acceso al agua por manzana"

**Reportes** *(activan `report` — pendiente en frontend)*
- "Genera un reporte completo del censo"
- "Crea un informe con todas las manzanas y estadísticas de agua"
- "Necesito un reporte para la junta del acueducto"
