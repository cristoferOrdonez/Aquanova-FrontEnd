# Requerimientos Frontend/Backend: Integración de "Estado del Predio" en Mapas

Para cumplir con el requerimiento de que los lotes del mapa se coloreen dependiendo del estado de ocupación/construcción (e.g. "Predio Demolido", "Predio en Obra"), es indispensable un ajuste en el esquema de la base de datos de Predios (Lots) y en el endpoint de jerarquía del mapa.

## El Problema Actual
Actualmente, el mapa renderiza los lotes usando la propiedad `status`, cuyos valores corresponden al flujo de recolección de datos (`sin_informacion`, `censado`, `registrado`). Sin embargo, el **Estado del Predio** es un dato capturado dinámicamente en los formularios y no está mapeado directamente a la entidad de base de datos del Lote.

Para que el mapa principal y el seleccionador de lotes coloreen los predios según su estado físico, el Frontend necesita que este dato esté disponible.

## Acciones Requeridas en el Backend (Base de Datos)

### 1. Extender el modelo del Predio (Lot)
Añadir una nueva columna (por ejemplo `property_state` o `estado_predio`) en la tabla de Lotes/Predios para rastrear el estado estructural de la propiedad.
Los posibles valores que el Frontend espera recibir y puede manejar son:

*Estados Originales:*
- `Predio Demolido`
- `Predio Solo (Habitado)`
- `Predio Desocupado`
- `Predio en Obra`

*Nuevos Estados Adicionales:*
- `Predio solo`
- `Predio para vincular`
- `Predio sin construir (solo)`
- `Lote en construcción o en obras`
- `Lote con cuenta contrato - vinculado`

*(Opcionalmente, usar Enums/Slugs que representen estos estados y notificarlos al Frontend).*

### 2. Sincronización desde Formularios al Predio
Actualmente, los formularios guardan esto en un documento JSON atado a la "Respuesta del Formulario". 
Se requiere crear un **Trigger o Hook** en el Backend para que, cuando se reciba y procese un formulario que contenga la respuesta "Estado del Predio", **se actualice automáticamente el valor `property_state`** del Lote correspondiente en la tabla central de Lotes.

### 3. Exponer el campo mediante API
Incluir el nuevo campo en la carga útil (Payload) de los siguientes endpoints:
- `GET /map/hierarchy`
- `GET /map/neighborhoods/:id/available-lots`

**Ejemplo del output modificado:**
```json
{
  "id": "uuid-lot-1",
  "number": "Lote-01",
  "status": "censado",
  "property_state": "Predio Demolido",
  "path": "...",
  "centroid": { "x": 100, "y": 100 }
}
```

## Cambios Realizados en el Frontend Anticipados a esta Mejora
El Frontend ya ha sido ajustado localmente para que, en cuanto el backend empiece a devolver `property_state`, o cuando el usuario responda la pregunta directamente en el formulario (de forma dinámica en tiempo real), el color del mapa cambie en base a la siguiente paleta:
- **Demolido:** Rojo (`#EF4444`)
- **Solo (Habitado):** Morado (`#8B5CF6`)
- **Desocupado:** Ambar (`#F59E0B`)
- **En Obra:** Cyan (`#06B6D4`)
- **Predio solo:** Azul oscuro (`#1E3A8A`)
- **Predio para vincular:** Rosado (`#EC4899`)
- **Predio sin construir (solo):** Verde (`#10B981`)
- **Lote en construcción o en obras:** Naranja (`#F97316`)
- **Lote con cuenta contrato - vinculado:** Amarillo (`#EAB308`)
