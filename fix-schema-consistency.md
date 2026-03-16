# Fix: Estandarizar estructura del schema de formularios y respuestas

## Problema

Actualmente existen **dos formatos diferentes** para el schema de preguntas y las keys de las respuestas, lo que causa inconsistencia en la base de datos y hace imposible hacer consultas SQL uniformes.

### Formato del seed.js (correcto)

```json
// form_versions.schema
[
  { "key": "nombre_jefe", "label": "Nombre del jefe de hogar", "type": "text", "required": true },
  { "key": "genero", "label": "Género", "type": "radio", "required": true, "options": ["Masculino", "Femenino"] }
]

// submissions.responses
{ "nombre_jefe": "María López", "genero": "Masculino" }
```

### Formato actual del frontend (incorrecto)

```json
// form_versions.schema
[
  { "id": 1710576123456, "title": "Nombre del jefe de hogar", "type": "Respuesta textual", "required": true },
  { "id": 1710576234567, "title": "Género", "type": "Opcion multiple", "required": true, "options": [{"id": 1710576345678, "value": "Masculino"}] }
]

// submissions.responses (flujo público/onboarding)
{ "1710576123456": "María López", "1710576234567": "Masculino" }

// submissions.responses (flujo admin)
{ "Nombre del jefe de hogar": "María López", "Género": "Masculino" }
```

### Problemas concretos

1. El schema usa `id` (timestamp numérico) y `title` en lugar de `key` (slug legible) y `label`
2. El `type` se guarda en español (`"Respuesta textual"`) en lugar de un código estandarizado (`"text"`)
3. Las `options` se guardan como `[{id: number, value: string}]` en lugar de `["string"]`
4. Las respuestas del flujo público usan `String(id)` como key (ej: `"1710576123456"`)
5. Las respuestas del flujo admin usan el `title` como key (ej: `"Nombre del jefe de hogar"`)
6. Ambos flujos deberían usar el mismo formato de key en responses

---

## Solución requerida

Estandarizar **todo** al formato del seed. Todos los cambios son en el frontend.

### Formato objetivo

```json
// form_versions.schema (lo que se envía al backend)
[
  {
    "key": "nombre-del-jefe-de-hogar",
    "label": "Nombre del jefe de hogar",
    "type": "text",
    "required": true,
    "options": []
  },
  {
    "key": "genero",
    "label": "Género",
    "type": "radio",
    "required": true,
    "options": ["Masculino", "Femenino", "No binario"]
  }
]

// submissions.responses (AMBOS flujos)
{ "nombre-del-jefe-de-hogar": "María López", "genero": "Masculino" }
```

---

## Archivos a modificar

### 1. `src/components/FormCreation/components/containers/EditingSection.jsx`

**Cambio:** Al crear/guardar una pregunta, generar un `key` tipo slug a partir del título en lugar de usar `Date.now()` como `id`.

```js
// Helper para generar slug
const generateKey = (title) => {
  return title
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quitar tildes
    .replace(/[^a-z0-9\s-]/g, '')                     // quitar caracteres especiales
    .trim()
    .replace(/\s+/g, '-')                              // espacios a guiones
    + '-' + Date.now().toString().slice(-4);            // sufijo único para evitar duplicados
};
```

Al construir el objeto de la pregunta:

- Reemplazar `id: Date.now()` por `key: generateKey(questionTitle)`
- Reemplazar `title: editingSection.questionTitle` por `label: editingSection.questionTitle`
- Mantener el `id` interno solo para el manejo de estado en React (no enviarlo al backend)

### 2. `src/components/FormCreation/context/FormCreationProvider.jsx`

**Cambio:** En las funciones `createForm()` y `updateForm()`, al serializar el schema para enviar al backend, transformar al formato estandarizado.

Donde actualmente se hace:
```js
const schema = questions.map(q => ({
    id: q.id,
    title: q.title,
    type: q.type,
    required: !!q.required,
    options: Array.isArray(q.options) ? q.options.map(o => ({ id: o.id, value: o.value })) : [],
}));
```

Cambiar a:
```js
const TYPE_MAP_REVERSE = {
    'Opcion multiple':             'radio',
    'Casillas de verificacion':    'checkbox',
    'Lista desplegable':           'select',
    'Respuesta textual':           'textarea',
    'Numerico':                    'number',
    'Fecha':                       'date',
    'Cargar imagen':               'file',
    'Solo texto (sin respuestas)': 'info',
};

const schema = questions.map(q => ({
    key: q.key,
    label: q.label ?? q.title,
    type: TYPE_MAP_REVERSE[q.type] ?? q.type,
    required: !!q.required,
    options: Array.isArray(q.options) ? q.options.map(o => o.value ?? o) : [],
}));
```

### 3. `src/components/PublicForm/hooks/usePublicForm.js`

**Cambio:** Simplificar la normalización del schema al cargar. Ahora el backend ya envía `key`, `label` y `type` estandarizado, así que la normalización solo es un fallback por compatibilidad con datos antiguos.

Donde actualmente se hace (líneas 75-80):
```js
const schema = rawSchema.map((field, i) => ({
    ...field,
    key: field.key ?? String(field.id ?? `field_${i}`),
    label: field.label ?? field.title ?? '',
    type: TYPE_MAP[field.type] ?? field.type,
}));
```

Mantener esta normalización como está (es retrocompatible). El punto clave es que las **responses** deben usar `field.key` como ya lo hacen.

**No requiere cambios adicionales** — este flujo ya usa `field.key` correctamente.

### 4. `src/components/FormSubmission/context/FormSubmissionProvider.jsx`

**Cambio critico:** El flujo admin actualmente usa el `title` como key de las respuestas. Debe usar `field.key` igual que el flujo público.

Donde actualmente se construyen las responses (líneas 58-99), reemplazar toda la lógica que usa `baseLabel`/`q.label`/`q.title` como key por:

```js
const responses = {};
parsedFields.forEach((q, idx) => {
    // Usar la key estandarizada, con fallback para datos antiguos
    const responseKey = q.key ?? String(q.id ?? `field_${idx}`);
    const idKey = q.id || q._id || q.key || q.label || `field_${idx}`;
    const raw = answers[idKey];

    if (raw === undefined || raw === null || raw === '') return;

    // Para arrays (checkbox), mapear IDs a texto visible de la opción
    if (Array.isArray(raw)) {
        responses[responseKey] = raw.map(id => {
            if (Array.isArray(q.options)) {
                const opt = q.options.find(o => (o.id ?? o) == id || (o.value ?? o) === id);
                return opt ? (opt.value ?? opt) : id;
            }
            return id;
        });
    }
    // Para radio/select, resolver ID a texto visible
    else if (['radio', 'select', 'Opcion multiple', 'Lista desplegable'].includes(q.type)) {
        if (Array.isArray(q.options)) {
            const opt = q.options.find(o => (o.id ?? o) == raw || (o.value ?? o) === raw);
            responses[responseKey] = opt ? (opt.value ?? opt) : raw;
        } else {
            responses[responseKey] = raw;
        }
    }
    else {
        responses[responseKey] = raw;
    }
});
```

### 5. `src/components/FormSubmission/components/FormSubmissionContent.jsx`

**Cambio:** Actualizar la key que se usa para identificar cada campo en el estado de answers.

Donde actualmente se hace:
```js
const key = field.id || field._id || field.key || field.label || `field_${field?.index}`;
```

Cambiar a:
```js
const key = field.key ?? String(field.id ?? `field_${field?.index}`);
```

Esto asegura que el flujo admin use la misma key que el flujo público para acumular respuestas.

### 6. Constants: `src/components/FormCreation/constants/typeQuestionOptions.jsx`

**Cambio opcional pero recomendado:** Agregar un mapeo de tipo estandarizado junto al label visual.

```js
export const typeQuestionOptions = [
    { label: "Opcion multiple",             value: "radio" },
    { label: "Casillas de verificacion",    value: "checkbox" },
    { label: "Lista desplegable",           value: "select" },
    { label: "Respuesta textual",           value: "textarea" },
    { label: "Numerico",                    value: "number" },
    { label: "Fecha",                       value: "date" },
    { label: "Cargar imagen",               value: "file" },
    { label: "Solo texto (sin respuestas)", value: "info" },
];
```

Usar `option.label` para mostrar en UI y `option.value` para almacenar en el schema.

---

## Retrocompatibilidad

Los formularios que ya existen en la base de datos con el formato antiguo (`id`/`title`/tipo en español) seguirán funcionando gracias a la normalización con fallback que ya existe en `usePublicForm.js`:

```js
key:   field.key   ?? String(field.id ?? `field_${i}`)
label: field.label  ?? field.title ?? ''
type:  TYPE_MAP[field.type] ?? field.type
```

Asegurar que esta misma normalización se aplique en el flujo admin (`FormSubmissionProvider.jsx`) al parsear el schema del backend.

---

## Resultado esperado

Después de aplicar estos cambios:

1. **Nuevos formularios** se guardarán con `key`, `label`, `type` estandarizado
2. **Todas las respuestas** (público y admin) usarán `field.key` como clave
3. **Formularios antiguos** seguirán funcionando por los fallbacks
4. **Las consultas SQL** podrán usar un solo formato:

```sql
SELECT
    COALESCE(q.q_label, q.q_title) AS pregunta,
    COALESCE(
        JSON_UNQUOTE(JSON_EXTRACT(s.responses, CONCAT('$.', q.q_key))),
        JSON_UNQUOTE(JSON_EXTRACT(s.responses, CONCAT('$.', q.q_id))),
        JSON_UNQUOTE(JSON_EXTRACT(s.responses, CONCAT('$."', q.q_title, '"')))
    ) AS respuesta
FROM ...
```
