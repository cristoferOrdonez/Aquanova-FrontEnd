# Documentación de Endpoints - API Aquanova

Base URL: `http://localhost:3000/api`
Autenticación: JWT Bearer en la cabecera `Authorization: Bearer <token>`

Rol administrador: `role_id = 1` (muchas rutas de escritura requieren este rol)

---

**Auth**

- **POST /api/auth/login**
  - Descripción: Iniciar sesión y recibir token JWT.
  - Body (application/json):
    - `document_number` (string) - requerido
    - `password` (string) - requerido
  - Respuestas:
    - 200: `{ ok: true, message: 'Login exitoso', token, user: { id, name, document_number, email, role } }`
    - 400/401: errores de validación o credenciales
  - Ejemplo curl:
    ```bash
    curl -X POST http://localhost:3000/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{"document_number":"1000000000","password":"admin123"}'
    ```

- **GET /api/auth/me**
  - Descripción: Devuelve información del usuario del token.
  - Auth: requerido (Bearer token)
  - Respuesta 200: `{ ok: true, message: '¡Acceso autorizado!', my_data: <decoded token> }`

- **GET /api/auth/admin-zona**
  - Descripción: Ruta de ejemplo exclusiva para administradores.
  - Auth: requerido y rol `1` (authorize([1]))
  - Respuesta 200: acceso permitido; 403 si no es admin.

---

**Users** (Prefijo: `/api/users`) - Todas protegidas: Token + rol `1` (Admin)

- **GET /api/users**
  - Descripción: Listar todos los usuarios.
  - Auth: Bearer + rol `1`.
  - Respuesta 200: `{ ok: true, users: [...] }`

- **POST /api/users**
  - Descripción: Crear nuevo usuario (ADMIN).
  - Auth: Bearer + rol `1`.
  - Body (application/json) requerido:
    - `name` (string)
    - `document_number` (string)
    - `password` (string)
    - `role_id` (integer)
    - opcionales: `email`, `neighborhood_id`
  - Respuesta 201: `{ ok: true, message: 'Usuario creado exitosamente', userId }`

Ejemplo curl (reemplazar TOKEN):
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Juan","document_number":"123","password":"secret","role_id":2}'
```

---

**Forms** (Prefijo: `/api/forms`) - Todas requieren Token; operaciones de escritura requieren rol `1` (admin)

- **GET /api/forms**
  - Descripción: Listar formularios activos con barrios publicados.
  - Auth: Bearer required.
  - Respuesta 200: `{ ok: true, forms: [...] }`

- **GET /api/forms/:id**
  - Descripción: Obtener detalle y esquema (última versión) del formulario `:id`.
  - Auth: Bearer required.
  - Respuesta 200: `{ ok: true, data: { id, title, key, created_at, version, schema } }`

- **POST /api/forms**
  - Descripción: Crear nuevo formulario (Admin).
  - Auth: Bearer + rol `1`.
  - Body (application/json) requerido:
    - `title` (string)
    - `schema` (array) - estructura JSON de preguntas
    - `neighborhood_id` (string)
    - opcional: `description` (string)
  - Respuesta 201: `{ ok: true, message: 'Formulario y Versión 1 creados exitosamente', data: { id, key, title, neighborhood_id } }`

- **PUT /api/forms/:id**
  - Descripción: Actualizar `title`, `description` o `is_active` (Admin).
  - Auth: Bearer + rol `1`.
  - Body (application/json) opcional: `title`, `description`, `is_active` (boolean)
  - Respuesta 200: `{ ok: true, message: 'Formulario actualizado exitosamente', data: <form> }`

- **DELETE /api/forms/:id**
  - Descripción: Desactivar (soft-delete) formulario y sus publicaciones (Admin).
  - Auth: Bearer + rol `1`.
  - Respuesta 200: `{ ok: true, message: 'Formulario desactivado exitosamente' }`

---

**Neighborhoods** (Prefijo: `/api/neighborhoods`) - Lectura para roles con token; creación solo Admin

- **GET /api/neighborhoods**
  - Descripción: Listar barrios.
  - Auth: Bearer required.
  - Respuesta 200: `{ ok: true, neighborhoods: [...] }`

- **GET /api/neighborhoods/:id**
  - Descripción: Obtener detalle de barrio por `:id`.
  - Auth: Bearer required.
  - Respuesta 200: `{ ok: true, data: <neighborhood> }` o 404 si no existe.

- **POST /api/neighborhoods**
  - Descripción: Crear barrio (Admin).
  - Auth: Bearer + rol `1`.
  - Body (application/json) requerido: `name`, `code`.
    - opcional: `parent_id`, `metadata` (objeto)
  - Respuesta 201: `{ ok: true, message: 'Barrio creado exitosamente', data: { id, name, code, ... } }`

---

**Submissions** (Prefijo: `/api/submissions`) - Requieren Token

- **POST /api/submissions**
  - Descripción: Enviar respuestas a un formulario (usuario autenticado).
  - Auth: Bearer required.
  - Body (application/json) requerido:
    - `form_id` (string)
    - `neighborhood_id` (string)
    - `responses` (object) - respuestas según el `schema` del formulario
    - opcional: `location` (object) `{ lat, lng }`
  - Respuesta 201: `{ ok: true, message: 'Respuestas guardadas exitosamente', submissionId }`

- **GET /api/submissions/:formId**
  - Descripción: Obtener todas las respuestas para un formulario dado.
  - Auth: Bearer required.
  - Respuesta 200: `{ ok: true, count, data: [ { id, responses, location_lat, location_lng, created_at, collected_by, neighborhood } ] }`

---

**Autenticación / Uso de Token**

1. Llama a `POST /api/auth/login` con `document_number` y `password`.
2. Recibirás `token` en la respuesta.
3. Incluye en cada petición protegida la cabecera:
   - `Authorization: Bearer <token>`

Ejemplo:
```bash
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/forms
```

---

**Notas técnicas y recomendaciones**

- Middlewares:
  - `src/middlewares/authMiddleware.js` valida el JWT y setea `req.user = { uid, role, role_name }`.
  - `src/middlewares/roleMiddleware.js` protege endpoints por `role_id`.

- Estructura de base de datos: los modelos en `src/models` muestran tablas usadas: `users`, `user_roles`, `roles`, `forms`, `form_versions`, `form_publications`, `neighborhoods`, `submissions`.

- Probar conexión a BD:
  - El pool de conexiones está en `src/config/db.js`. Puedes ejecutar:
    ```bash
    node src/config/db.js
    ```
    para probar la conexión (mostrará éxito o el error detallado).

- Swagger UI está disponible en: `http://localhost:3000/api-docs` (documentación auto-generada).

---

**Archivos relevantes**

- Rutas: [src/routes/authRoutes.js](src/routes/authRoutes.js#L1-L200), [src/routes/userRoutes.js](src/routes/userRoutes.js#L1-L200), [src/routes/formRoutes.js](src/routes/formRoutes.js#L1-L300), [src/routes/submissionRoutes.js](src/routes/submissionRoutes.js#L1-L200), [src/routes/neighborhoodRoutes.js](src/routes/neighborhoodRoutes.js#L1-L300)
- Controladores: [src/controllers/authController.js](src/controllers/authController.js#L1-L200), [src/controllers/userController.js](src/controllers/userController.js#L1-L200), [src/controllers/formController.js](src/controllers/formController.js#L1-L400), [src/controllers/submissionController.js](src/controllers/submissionController.js#L1-L200), [src/controllers/neighborhoodController.js](src/controllers/neighborhoodController.js#L1-L200)
- Middlewares: [src/middlewares/authMiddleware.js](src/middlewares/authMiddleware.js#L1-L200), [src/middlewares/roleMiddleware.js](src/middlewares/roleMiddleware.js#L1-L200)

---

Si quieres, genero ejemplos de payloads para cada endpoint (JSON completos) y ejemplos `curl` adicionales o un archivo Postman/Insomnia exportable. ¿Qué prefieres ahora?