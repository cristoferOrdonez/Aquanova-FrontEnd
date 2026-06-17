# Guía de Obtención de Datos Semilla (seed.js) desde el Frontend

Este documento detalla cómo obtener a través de la API del Backend los diferentes datos inicializados por el script de base de datos (`seed.js`) en **Aquanova**.

Toda la comunicación con las rutas protegidas requiere enviar el token JWT en las cabeceras HTTP de la siguiente forma:
```http
Authorization: Bearer <TOKEN_JWT>
```

---

## Índice
1. [Autenticación y Datos de Usuario](#1-autenticación-y-datos-de-usuario)
2. [Roles de Usuario](#2-roles-de-usuario)
3. [Barrios y Localidades (Estructura Geográfica)](#3-barrios-y-localidades-estructura-geográfica)
4. [Formularios y Preguntas (Schemas)](#4-formularios-y-preguntas-schemas)
5. [Configuraciones de Sorteos (Giveaways)](#5-configuraciones-de-sorteos-giveaways)
6. [Gemelo Digital (Mapa, Manzanas y Lotes)](#6-gemelo-digital-mapa-manzanas-y-lotes)

---

## 1. Autenticación y Datos de Usuario

El script `seed.js` crea un usuario administrador por defecto con las siguientes credenciales:
* **Número de Documento (`document_number`):** `1000000000`
* **Correo Electrónico:** `admin@aquanova.com`
* **Contraseña:** `admin123`

### A. Iniciar Sesión (Obtener Token)
Para obtener el token JWT necesario para consumir los endpoints protegidos, el frontend debe realizar una petición POST.

* **Endpoint:** `POST /api/auth/login`
* **Acceso:** Público
* **Cuerpo de la Petición (JSON):**
```json
{
  "document_number": "1000000000",
  "password": "admin123"
}
```
* **Respuesta Exitosa (200 OK):**
```json
{
  "ok": true,
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-del-usuario-admin",
    "name": "Super Administrador",
    "email": "admin@aquanova.com",
    "role": "administrador"
  }
}
```

### B. Obtener Perfil del Usuario Autenticado
Una vez autenticado, el frontend puede verificar la identidad del usuario actual enviando el token recibido.

* **Endpoint:** `GET /api/auth/me`
* **Acceso:** Protegido (Requiere Token)
* **Respuesta Exitosa (200 OK):**
```json
{
  "ok": true,
  "message": "¡Acceso autorizado! Token válido.",
  "my_data": {
    "id": "uuid-del-usuario-admin",
    "name": "Super Administrador",
    "email": "admin@aquanova.com",
    "role_id": 1,
    "role": "administrador"
  }
}
```

### C. Listar Todos los Usuarios del Sistema
Permite visualizar la lista de usuarios, incluyendo el administrador semilla y cualquier usuario registrado a través de los formularios.

* **Endpoint:** `GET /api/users`
* **Acceso:** Protegido (Solo Administrador - Rol `1`)
* **Respuesta Exitosa (200 OK):**
```json
{
  "ok": true,
  "users": [
    {
      "id": "uuid-del-usuario-admin",
      "name": "Super Administrador",
      "document_number": "1000000000",
      "email": "admin@aquanova.com",
      "role_name": "administrador",
      "neighborhood_name": null
    }
  ]
}
```

---

## 2. Roles de Usuario

El script `seed.js` inserta tres roles fundamentales en la tabla `roles`:
1. `administrador` (ID: 1)
2. `operador` (ID: 2)
3. `usuario` (ID: 3)

### Cómo obtener e interactuar con estos datos en el Frontend:
* **No existe un endpoint directo** como `GET /api/roles`.
* **Obtención:** Se recuperan como parte de los datos del usuario en los endpoints `GET /api/users` (campo `role_name`) y `GET /api/auth/me` (campo `role_id` o `role`).
* **Uso en Registro:** Al registrar un nuevo usuario en `POST /api/users` o en la finalización de un onboarding en `POST /api/submissions/onboarding`, el frontend envía el ID correspondiente (por ejemplo, `3` para un `usuario` común).

---

## 3. Barrios y Localidades (Estructura Geográfica)

El script `seed.js` inicializa una base geográfica robusta:
* El barrio raíz `San Miguel de la Cañada` (`SMC-001`).
* Un barrio hijo de este, `Barrio Las Mercedes` (`SMCN-001`), que contiene la información del mapa interactivo.
* Un listado completo de **Localidades de Bogotá** (`LOC-01` a `LOC-20`) y sus respectivos **Barrios** (`BAR-XXXX`) con sus descripciones e imágenes de Cloudinary guardadas en su campo `metadata`.

### A. Listar todos los Barrios y Localidades
Retorna la lista jerárquica plana con la información de imágenes y descripciones. El frontend debe estructurar y agrupar este JSON.

* **Endpoint:** `GET /api/neighborhoods`
* **Acceso:** Protegido (Cualquier usuario autenticado)
* **Respuesta Exitosa (200 OK):**
```json
{
  "ok": true,
  "neighborhoods": [
    {
      "id": "uuid-localidad-usaquen",
      "name": "Usaquén",
      "code": "LOC-01",
      "parent_id": null,
      "parent_name": null,
      "is_active": true,
      "metadata": {
        "imagen": "https://res.cloudinary.com/.../descarga_dq3qip.jpg",
        "descripcion": "Localidad del norte de Bogotá con ambiente histórico y colonial..."
      },
      "created_at": "2026-02-22T10:00:00.000Z"
    },
    {
      "id": "uuid-barrio-cedritos",
      "name": "Cedritos",
      "code": "BAR-0105",
      "parent_id": "uuid-localidad-usaquen",
      "parent_name": "Usaquén",
      "is_active": true,
      "metadata": {
        "imagen": "https://res.cloudinary.com/.../bogota-cedritos-hero_ukrcgl.png",
        "descripcion": "Barrio residencial de clase media-alta con alta densidad de apartamentos modernos..."
      },
      "created_at": "2026-02-22T10:00:00.000Z"
    }
  ]
}
```

> [!TIP]
> En el Frontend, puedes agrupar este array reduciéndolo por `parent_id`. Si `parent_id === null` representa una Localidad (nodo raíz); de lo contrario, representa un Barrio asociado a la localidad cuyo ID coincide con `parent_id`.

### B. Buscar Barrios/Localidades por Coincidencia
Útil para barras de búsqueda predictivas en la interfaz.
* **Endpoint:** `GET /api/neighborhoods/search?query=<termino_busqueda>`
* **Acceso:** Protegido (Cualquier usuario autenticado)
* **Ejemplo:** `GET /api/neighborhoods/search?query=cedritos`

### C. Obtener Detalle de un Barrio con Jerarquía Recursiva
Retorna un nodo geográfico con todo su árbol de padres embebido.
* **Endpoint:** `GET /api/neighborhoods/:id`
* **Acceso:** Protegido (Cualquier usuario autenticado)
* **Respuesta Exitosa (200 OK):**
```json
{
  "ok": true,
  "data": {
    "id": "uuid-barrio-cedritos",
    "name": "Cedritos",
    "code": "BAR-0105",
    "type": "Barrio",
    "parent_id": "uuid-localidad-usaquen",
    "is_active": true,
    "metadata": { ... },
    "parent": {
      "id": "uuid-localidad-usaquen",
      "name": "Usaquén",
      "code": "LOC-01",
      "type": "Localidad",
      "parent_id": "uuid-ciudad",
      "parent": { ... }
    }
  }
}
```

---

## 4. Formularios y Preguntas (Schemas)

El script de seed registra **11 formularios** de forma predeterminada:
* **10 formularios estructurados:** Censo Demográfico 2026, Encuesta de Servicios Públicos Domiciliarios, Registro de Predios, Encuesta de Seguridad, Censo de Mascotas, Encuesta de Movilidad, Establecimientos Comerciales, Salud Comunitaria, Parques y Espacio Público, y Conectividad Digital.
* **1 formulario especial cargado desde seed-censo-form.js:** Censo de Usuarios (`censo-masivo-catastro-v2`), que contiene un esquema detallado de 40+ preguntas específicas para relevamiento catastral/de agua.

### A. Listar Formularios con Estado e Imagen (Uso del Administrador/Operador)
Devuelve los formularios registrados, indicando en qué barrios están publicados (`neighborhoods`), su imagen de Cloudinary y el link de referido dinámico del usuario actual.

* **Endpoint:** `GET /api/forms`
* **Acceso:** Protegido (Cualquier usuario autenticado)
* **Respuesta Exitosa (200 OK):**
```json
{
  "ok": true,
  "forms": [
    {
      "id": "uuid-formulario-censo",
      "key": "censo-demografico-2026",
      "title": "Censo Demográfico 2026",
      "description": "Recolección de datos poblacionales de los hogares del barrio.",
      "metadata": {
        "imagen": "https://res.cloudinary.com/.../h8g43jmkpwo7g3nx7s4a.jpg",
        "imagen_public_id": "aquanova/forms/h8g43jmkpwo7g3nx7s4a"
      },
      "is_active": true,
      "created_by": "Super Administrador",
      "created_at": "2026-05-28T02:12:00.000Z",
      "neighborhoods": [
        {
          "id": "uuid-barrio-san-miguel",
          "name": "San Miguel de la Cañada",
          "code": "SMC-001",
          "parent_id": null
        }
      ],
      "share_link": "http://localhost:5173/formulario/censo-demografico-2026?ref=EAL34TM"
    }
  ]
}
```

### B. Obtener Detalle y Preguntas de un Formulario Específico (Por ID)
* **Endpoint:** `GET /api/forms/:id`
* **Acceso:** Protegido (Cualquier usuario autenticado)
* **Respuesta Exitosa (200 OK):** Retorna el formulario completo junto con el arreglo de campos del `schema` de preguntas de su última versión publicada.

### C. Cargar Formulario Público (Por Key / Slug)
Este es el endpoint clave usado por el frontend cuando un usuario no autenticado accede a un enlace compartido para rellenar un formulario (`/formulario/:key?ref=XYZ`).

* **Endpoint:** `GET /api/forms/public/:key`
* **Acceso:** Público (No requiere autenticación)
* **Ejemplo:** `GET /api/forms/public/censo-demografico-2026`
* **Respuesta Exitosa (200 OK):**
```json
{
  "ok": true,
  "data": {
    "id": "uuid-formulario-censo",
    "key": "censo-demografico-2026",
    "title": "Censo Demográfico 2026",
    "description": "Recolección de datos poblacionales...",
    "metadata": {
      "imagen": "https://res.cloudinary.com/.../h8g43jmkpwo7g3nx7s4a.jpg"
    },
    "version": 1,
    "schema": [
      {
        "key": "nombre_jefe",
        "type": "text",
        "label": "Nombre del jefe de hogar",
        "required": true,
        "placeholder": "Ej: María López"
      },
      {
        "key": "num_personas",
        "type": "number",
        "label": "Número de personas en el hogar",
        "required": true,
        "min": 1,
        "max": 20
      }
    ],
    "giveaway": {
      "points_per_referral": 10,
      "is_active": true
    },
    "registration_fields": {
      "name": { "required": true, "type": "text", "label": "Nombre completo" },
      "document_number": { "required": true, "type": "text", "label": "Número de documento" },
      "password": { "required": false, "type": "password", "label": "Crear contraseña" },
      "email": { "required": false, "type": "email", "label": "Correo electrónico" },
      "phone": { "required": false, "type": "tel", "label": "Teléfono" }
    }
  }
}
```

---

## 5. Configuraciones de Sorteos (Giveaways)

El script de seed crea automáticamente una fila en `giveaway_configs` para cada formulario, activándolo de manera predeterminada y definiendo que se otorguen **10 puntos** por referido exitoso.

### A. Obtener Configuración de Sorteo
* **Obtención:** Se devuelve embebido dentro de la respuesta de `GET /api/forms/public/:key` (objeto `giveaway`, ver endpoint anterior).

### B. Listar Ranking / Tabla de Líderes del Sorteo (Leaderboard)
Muestra la lista de usuarios que más puntos han acumulado invitando a otros a llenar un formulario específico.

* **Endpoint:** `GET /api/giveaways/:formId/leaderboard`
* **Acceso:** Público (No requiere autenticación)
* **Parámetros Opcionales (Query):** `limit` (número máximo de participantes a retornar, por defecto 50).
* **Ejemplo:** `GET /api/giveaways/uuid-formulario-censo/leaderboard?limit=10`
* **Respuesta Exitosa (200 OK):**
```json
{
  "ok": true,
  "count": 1,
  "data": [
    {
      "user_id": "uuid-usuario-referente",
      "name": "Juan Pérez",
      "total_points": "30",
      "referrals_count": 3
    }
  ]
}
```

---

## 6. Gemelo Digital (Mapa, Manzanas y Lotes)

El script de seed procesa el archivo SVG de topología (`Mapa Barrio Las Mercedes.svg` o su fallback `map-data-seed.json`) y carga en la base de datos:
* La manzana / bloque con código `M-01` asociada al barrio `Barrio Las Mercedes` (`SMCN-001`).
* Decenas de lotes / predios interactivos que componen la manzana, cada uno con su número identificador, geometría en formato SVG (`svg_path` o `path`), área en metros cuadrados y su centroide (`centroid`) para posicionar etiquetas.

### A. Obtener Estructura Completa del Gemelo Digital (Por Barrio)
Permite renderizar el mapa interactivo en 2D en el frontend utilizando componentes `<svg>`, `<path>` y vinculando eventos de mouseover/click.

* **Endpoint:** `GET /api/map/digital-twin/:neighborhoodId`
* **Acceso:** Protegido o Público (Dependiendo de la configuración, usualmente libre para consulta del gemelo digital).
* **Ejemplo:** `GET /api/map/digital-twin/uuid-barrio-las-mercedes`
* **Respuesta Exitosa (200 OK):**
```json
{
  "ok": true,
  "data": {
    "viewBox": "0 0 1200 800",
    "blocks": [
      {
        "id": "uuid-bloque-m01",
        "code": "M-01",
        "geom_path": "M 100,100 L 500,100 L 500,400 L 100,400 Z",
        "label_position": { "x": 300, "y": 250 },
        "lots": [
          {
            "id": "uuid-lote-1",
            "number": "1",
            "status": "sin_informacion",
            "water_meter_code": null,
            "cadastral_id": null,
            "area_m2": 150,
            "path": "M 100,100 L 200,100 L 200,250 L 100,250 Z",
            "centroid": { "x": 150, "y": 175 }
          },
          {
            "id": "uuid-lote-2",
            "number": "2",
            "status": "sin_informacion",
            "water_meter_code": null,
            "cadastral_id": null,
            "area_m2": 120,
            "path": "M 200,100 L 320,100 L 320,250 L 200,250 Z",
            "centroid": { "x": 260, "y": 175 }
          }
        ]
      }
    ]
  }
}
```

> [!IMPORTANT]
> El campo `status` del lote puede ser `sin_informacion`, `censado` o `registrado`. En el frontend, puedes cambiar el color de relleno (`fill`) de los elementos `<path>` del SVG dinámicamente según este valor (por ejemplo: gris para `sin_informacion`, amarillo para `censado`, verde para `registrado`).

### B. Obtener Lotes Disponibles (Para Selector de Formularios)
Cuando un inspector en campo está llenando una encuesta y necesita seleccionar qué predio está censando, este endpoint retorna los lotes y agrega un campo booleano `available` indicando si está libre para ser seleccionado (el estado debe ser `sin_informacion`).

* **Endpoint:** `GET /api/map/available-lots/:neighborhoodId`
* **Acceso:** Público (Diseñado para el llenado de encuestas)
* **Ejemplo:** `GET /api/map/available-lots/uuid-barrio-las-mercedes`
* **Respuesta Exitosa (200 OK):**
```json
{
  "ok": true,
  "data": {
    "viewBox": "0 0 1200 800",
    "blocks": [
      {
        "id": "uuid-bloque-m01",
        "code": "M-01",
        "lots": [
          {
            "id": "uuid-lote-1",
            "number": "1",
            "status": "sin_informacion",
            "path": "M 100,100...",
            "centroid": { "x": 150, "y": 175 },
            "available": true
          },
          {
            "id": "uuid-lote-ocupado",
            "number": "3",
            "status": "censado",
            "path": "M 320,100...",
            "centroid": { "x": 380, "y": 175 },
            "available": false
          }
        ]
      }
    ]
  }
}
```
