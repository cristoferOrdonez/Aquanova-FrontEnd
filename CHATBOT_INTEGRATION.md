# Chatbot Aquanova — Contrato de integración frontend

**Endpoint base:** `POST /api/chat`  
**Autenticación:** ninguna (endpoint público)  
**Formato:** `application/json`

---

## 1. Descripción

El chatbot está impulsado por **Claude (Anthropic)**. Responde preguntas en lenguaje natural sobre los datos del sistema Aquanova (censo, predios, estadísticas del barrio, etc.) y también preguntas conceptuales sobre la plataforma. Internamente usa *tool use* para consultar la base de datos en modo solo lectura cuando la pregunta requiere datos concretos.

---

## 2. Request

```
POST /api/chat
Content-Type: application/json
```

```json
{
  "message": "¿Cuántos predios han sido censados en la manzana 3?",
  "history": []
}
```

| Campo     | Tipo              | Requerido | Descripción |
|-----------|-------------------|-----------|-------------|
| `message` | `string`          | ✅ Sí     | Pregunta del usuario en lenguaje natural |
| `history` | `array` (ver §4)  | ❌ No     | Historial de turnos previos. Omitir o enviar `[]` para iniciar una conversación nueva |

---

## 3. Response exitosa `200 OK`

```json
{
  "ok": true,
  "answer": "En la **manzana 3** hay **12 predios censados** de un total de 28.\n\n...",
  "history": [
    { "role": "user",      "content": "¿Cuántos predios han sido censados en la manzana 3?" },
    { "role": "assistant", "content": "En la **manzana 3** hay **12 predios censados** de un total de 28.\n\n..." }
  ],
  "usage": {
    "input_tokens": 842,
    "output_tokens": 97
  }
}
```

| Campo     | Tipo     | Descripción |
|-----------|----------|-------------|
| `ok`      | `boolean`| Siempre `true` en respuestas exitosas |
| `answer`  | `string` | Respuesta del asistente. **Contiene markdown** — renderizar con un parser (ej. `react-markdown`) |
| `history` | `array`  | Historial actualizado que incluye este nuevo turno. Guardarlo en el estado del componente y reenviarlo en la próxima llamada |
| `usage`   | `object` | Tokens consumidos en esta llamada (útil para debug / analytics) |

---

## 4. Conversaciones con múltiples turnos (historial)

Para que el chatbot recuerde el contexto de la conversación, el frontend debe:

1. Guardar el array `history` devuelto en la respuesta anterior.
2. Enviarlo en el campo `history` de la siguiente petición.

El backend aplica un límite de **20 turnos** (40 mensajes: 20 user + 20 assistant). Si la conversación es más larga, los turnos más viejos se descartan automáticamente.

```ts
// Ejemplo de implementación en React
const [history, setHistory] = useState([]);

async function sendMessage(userMessage: string) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: userMessage, history })
  });
  const data = await res.json();

  if (data.ok) {
    setHistory(data.history);   // guardar historial actualizado
    renderAnswer(data.answer);  // data.answer es markdown
  }
}
```

**Reiniciar conversación:** simplemente vaciar el array de historial (`setHistory([])`).

---

## 5. Errores

| HTTP | `ok`    | Causa | `message` de ejemplo |
|------|---------|-------|----------------------|
| `400` | `false` | `message` vacío o faltante | `"El campo \"message\" es requerido."` |
| `429` | `false` | Límite de Claude alcanzado | `"Límite de uso de Claude alcanzado. Intenta en un momento."` |
| `503` | `false` | `ANTHROPIC_API_KEY` no configurada en el servidor | `"El chatbot no está configurado (ANTHROPIC_API_KEY faltante)."` |
| `500` | `false` | Error interno | `"Error interno del chatbot."` |

**Manejo recomendado:**
- `503`: mostrar banner "Chatbot temporalmente no disponible".
- `429`: mostrar mensaje "Demasiadas consultas, espera un momento" con opción de reintento.
- `400` / `500`: mostrar mensaje genérico de error.

---

## 6. Renderizado de respuestas

El campo `answer` contiene **markdown** (negrita, tablas, listas). Usar un componente de renderizado:

```bash
npm install react-markdown
```

```tsx
import ReactMarkdown from 'react-markdown';

<ReactMarkdown>{data.answer}</ReactMarkdown>
```

---

## 7. Indicador de carga ("pensando")

Las consultas que requieren acceso a la base de datos pueden tardar **2–5 segundos** porque Claude hace una o más llamadas internas antes de responder. Mostrar un spinner o indicador de escritura mientras se espera.

---

## 8. Capacidades del chatbot

El asistente puede responder preguntas como:

- "¿Cuántos predios hay en total y cuántos han sido censados?"
- "¿Cuántas familias tienen acceso al agua en la manzana 5?"
- "¿Qué formularios están activos en el sistema?"
- "¿Cuál es el estado de los predios con código de medidor?"
- "¿Cuántas respuestas ha recibido el censo este mes?"
- "¿Qué es Aquanova y cómo funciona el sistema de acueducto comunitario?"
- "¿Qué datos recoge el formulario de censo?"

**Restricciones de seguridad (transparentes para el usuario):**
- Solo puede leer datos, nunca modificarlos.
- No revela contraseñas, tokens ni datos de autenticación de usuarios.
- Los resultados de BD se limitan a 200 filas por consulta.

---

## 9. Variables de entorno requeridas en el servidor

```env
ANTHROPIC_API_KEY=sk-ant-...   # API key de Anthropic (console.anthropic.com)
CLAUDE_MODEL=claude-haiku-4-5-20251001  # Modelo a usar (opcional, este es el default)
```

**Modelos disponibles** (de menor a mayor costo/capacidad):

| Modelo | Uso recomendado |
|--------|----------------|
| `claude-haiku-4-5-20251001` | Default. Respuestas rápidas, bajo costo |
| `claude-sonnet-4-6` | Mayor razonamiento en consultas complejas |

---

## 10. Ejemplo completo con `fetch`

```ts
// Primera pregunta (sin historial)
const response1 = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: '¿Cuántos predios hay censados?'
  })
});
const { answer: answer1, history: history1 } = await response1.json();
// → answer1: "Actualmente hay **212 predios censados** de 224 totales..."
// → history1: [{ role:'user', ... }, { role:'assistant', ... }]

// Segunda pregunta (continuando la conversación)
const response2 = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: '¿Y cuántos tienen medidor de agua?',
    history: history1   // <-- reenviar el historial previo
  })
});
const { answer: answer2, history: history2 } = await response2.json();
// El chatbot recordará el contexto de la respuesta anterior
```
