# Aquanova - Análisis de Lógica de Negocio y Propuesta de Valor

## Visión General

**Aquanova** es una herramienta digital de caracterización de predios que transforma la gestión de asentamientos informales en Bogotá y zonas de cobertura para la EAAB (Empresa de Acueducto y Alcantarillado de Bogotá).

---

## Flujo Principal del Sistema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FLUJO DE VALOR AQUANOVA                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌───────────┐ │
│  │   EAAB       │───▶│  Configurar  │───▶│  Publicar    │───▶│ Recopilar │ │
│  │   (Admin)    │    │  Jerarquía   │    │  Formularios │    │   Datos   │ │
│  └──────────────┘    │  Geográfica  │    │  Dinámicos   │    │           │ │
│                      └──────────────┘    └──────────────┘    └─────┬─────┘ │
│                                                                    │       │
│                      Ciudad                                        ▼       │
│                        └── Localidad                     ┌───────────────┐ │
│                              └── Barrio + Mapa SVG       │  Comunidad /  │ │
│                                    └── Lotes (Predios)   │  Operadores   │ │
│                                                          └───────┬───────┘ │
│                                                                  │         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       ▼         │
│  │  Dashboard   │◀───│  Análisis y  │◀───│  Digital     │◀───[Respuestas]│
│  │  Reportes    │    │  Decisiones  │    │  Twin        │    + GPS       │
│  └──────────────┘    └──────────────┘    └──────────────┘    + Multimedia │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Módulos Principales

### 1. Gestión de Niveles Geográficos
Jerarquía de tres niveles para organizar la cobertura territorial:

```
Ciudad (ej: Bogotá)
  └── Localidad (ej: Ciudad Bolívar)
       └── Barrio (ej: Paraíso) + Mapa SVG
            └── Lotes/Predios individuales
```

### 2. Gemelos Digitales (Digital Twin)
Visualización interactiva de mapas SVG con:
- Zoom y navegación con gestos
- Identificación visual de cada predio
- Panel de información y edición por lote

### 3. Estados del Ciclo de Vida de un Predio

| Estado | Color | Descripción |
|--------|-------|-------------|
| `sin_informacion` | 🔘 Gris | Predio identificado sin caracterizar |
| `censado` | 🔵 Azul | Predio con datos recopilados pendiente de validación |
| `registrado` | 🟢 Verde | Predio completamente vinculado al sistema EAAB |

### 4. Formularios Dinámicos
9 tipos de campos configurables:

| Tipo | Descripción |
|------|-------------|
| Opción múltiple | Selección única (radio) |
| Casillas de verificación | Selección múltiple (checkbox) |
| Lista desplegable | Selector (select) |
| Respuesta textual | Campo de texto largo |
| Numérico | Solo números |
| Fecha | Selector de fecha |
| Cargar imagen/video | Archivos multimedia |
| Solo texto | Información sin respuesta |
| Selector de Lote | Mapa interactivo para elegir predio |

### 5. Formularios Públicos (Onboarding)
- Acceso sin autenticación previa mediante URL única
- Registro de usuario + envío de respuestas en un solo paso
- Captura automática de geolocalización GPS
- Sistema de códigos de referido

---

## Propuesta de Valor

### Para la EAAB

| Beneficio | Descripción | Impacto |
|-----------|-------------|---------|
| **Reducción de pérdidas** | Identificación precisa de conexiones no registradas mediante georreferenciación | Disminución del índice de agua no contabilizada (IANC) |
| **Gemelos Digitales** | Visualización en tiempo real del estado de cada predio por barrio | Toma de decisiones basada en datos visuales |
| **Trazabilidad** | Registro histórico de formularios, respuestas y cambios de estado | Auditoría y cumplimiento normativo |
| **Escalabilidad geográfica** | Jerarquía Ciudad → Localidad → Barrio permite expansión ordenada | Cobertura progresiva de nuevas zonas |
| **Automatización** | Reportes automáticos por barrio/localidad/ciudad | Reducción de costos operativos |

### Para Operadores de Campo

| Beneficio | Descripción |
|-----------|-------------|
| **Formularios contextualizados** | 9 tipos de campos incluyendo selector de lotes sobre el mapa |
| **Captura multimedia** | Soporte para fotos y videos como evidencia |
| **Geolocalización automática** | GPS integrado para validar ubicación del operador |
| **Interfaz intuitiva** | Diseño mobile-first para trabajo en campo |

### Para la Comunidad

| Beneficio | Descripción |
|-----------|-------------|
| **Autogestión** | Formularios públicos sin necesidad de registro previo |
| **Selección visual de predio** | Mapa interactivo para identificar su lote |
| **Transparencia** | Visibilidad del estado de su solicitud |
| **Referidos** | Sistema de códigos para incentivar participación comunitaria |

---

## Diferenciadores Técnicos

```
┌────────────────────────────────────────────────────────────────┐
│                    STACK TECNOLÓGICO                           │
├────────────────────────────────────────────────────────────────┤
│  • Formularios 100% configurables (schema dinámico)            │
│  • Mapas SVG vectoriales (escalables, livianos)                │
│  • Zoom/Pan interactivo con react-zoom-pan-pinch               │
│  • Almacenamiento multimedia en Cloudinary                     │
│  • Autenticación JWT + onboarding en un solo paso              │
│  • API RESTful con versionado de formularios                   │
└────────────────────────────────────────────────────────────────┘
```

---

## Oportunidades de Mejora

| Área | Descripción | Prioridad |
|------|-------------|-----------|
| **Dashboard de métricas** | Módulo de reportes y analytics consolidado | Alta |
| **Notificaciones** | Sistema de alertas para cambios de estado de predios | Media |
| **Modo offline** | Sincronización diferida para zonas con conectividad limitada | Alta |
| **Validación de duplicados** | Detección de predios ya registrados por GPS | Media |
| **Integración con sistemas EAAB** | API para sincronizar con sistemas legacy | Alta |
| **Firma digital** | Validación de identidad del encuestado | Baja |
| **Workflow de aprobación** | Estados intermedios con revisión multinivel | Media |

---

## Propuesta de Valor Refinada

> **Aquanova** es una plataforma de **caracterización inteligente de predios** que transforma la gestión de asentamientos informales mediante:
>
> 1. **Gemelos digitales** de barrios que permiten visualizar el estado de cada predio en tiempo real
> 2. **Formularios dinámicos** configurables sin código, con captura multimedia y geolocalización
> 3. **Onboarding simplificado** que reduce la fricción para la comunidad y operadores
> 4. **Trazabilidad completa** del ciclo de vida del predio: identificación → censo → registro
>
> **Resultado**: Reducción medible del agua no contabilizada y vinculación acelerada de usuarios al sistema formal de la EAAB.

---

## Arquitectura de Servicios

| Servicio | Responsabilidad |
|----------|-----------------|
| `authService` | Autenticación y gestión de sesiones JWT |
| `formService` | CRUD de formularios dinámicos |
| `neighborhoodService` | Gestión de jerarquía geográfica |
| `prediosService` | Mapas, lotes y gemelos digitales |
| `publicFormService` | Formularios públicos y onboarding |
| `submissionsService` | Envío y almacenamiento de respuestas |
| `cloudinaryService` | Gestión de archivos multimedia |
| `usersService` | Administración de usuarios |

---

## Rutas de la Aplicación

| Ruta | Módulo | Acceso |
|------|--------|--------|
| `/login` | Autenticación | Público |
| `/formulario/:formKey` | Formulario Público | Público |
| `/home` | Digital Twin (Mapas) | Privado |
| `/forms` | Lista de Formularios | Privado |
| `/form_creation` | Crear/Editar Formulario | Privado |
| `/neighborhoods` | Niveles Geográficos | Privado |
| `/user-management` | Gestión de Usuarios | Privado |
| `/my-account` | Perfil de Usuario | Privado |

---

*Documento generado el 19 de marzo de 2026*
