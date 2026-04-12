# Implementación del Sistema de Deshacer (Undo) - Guía para el Backend

El frontend ha sido actualizado para soportar la reversión de modificaciones topológicas en el mapa (Unir predios / Dividir predio). 

Se ha introducido la acción **`RESTORE`** al momento de comunicarse con el endpoint `/map/topology-update`.

## Flujo Lógico desde el Frontend

1. Cada vez que un usuario realiza exitosamente una operación de tipo `MERGE` o `SPLIT`, el frontend registra el estado exacto de los lotes **eliminados** y aquellos que **se han creado**, guardándolos en un historial local (`historyStack`).
2. Al pulsar el botón "Deshacer", el frontend procesa la última operación con la intención de revertirla y llama a `prediosService.undoTopology(payload)` (el cual apunta internamente a `/map/topology-update`).
3. El frontend enviará el siguiente payload:
   
```json
{
  "action": "RESTORE",
  "deletedLots": [
    { "id": "id-del-poligono-fusionado-o-dividido", "version": 1 }
  ],
  "newLots": [
    {
      "id": "uuid-del-lote-original",
      "display_id": "Lote-01",
      "svg_path": "...",
      "path": "...",
      "centroid": [x, y],
      "area_m2": 150.5,
      ...
    }
  ]
}
```

## Requisitos de Implementación para el Backend

Para que esta funcionalidad opere correctamente y refleje de manera persistente los cambios del mapa, el endpoint backend que atiende las peticiones a `/map/topology-update` (usualmente en el controlador de predios) debe manejar la acción `RESTORE`.

### 1. Dar Soporte a la Acción `RESTORE`

Actualmente tu endpoint `/map/topology-update` probablemente espera `MERGE` o `SPLIT`. Debes extenderlo para:

- **Aceptar la acción `RESTORE`**.
- El flujo de la base de datos es idéntico estructuralmente a un `SPLIT` o un `MERGE`, porque es **una operación de borrado y creación**:
  1. Se eliminan (o se les aplica borrado lógico / estado inactivo) a los lotes que llegan en el array `deletedLots`.
  2. Se vuelven a crear (o se activan desde un estado inactivo) los lotes que llegan en el array `newLots`.

### 2. Preservar o Reutilizar IDs Reales (Opcional pero Recomendado)

- Cuando el frontend manda el payload `RESTORE`, la llave primaria de los elementos dentro de `newLots` será la id que **originalmente tenían en tu base de datos**.
- Forma ideal de procesarlos: Haz un Soft Delete al "combinar", y en un `RESTORE` simplemente reactiva el lote en estado activo y remueve el nuevo (Hard o Soft Delete del elemento en `deletedLots`).
- Forma sencilla de operarlo (Si no manejas historial DB): Simplemente haz un `DELETE` total de los `deletedLots` recibidos, e `INSERT` de `newLots` reutilizando los UUIDs o generando unos nuevos (y en este caso devolver dichos lotes nuevos en la propiedad `newData` del response del body).

### Ejemplo de Respuesta Esperada (Response):

El frontend espera el mismo esquema de respuesta que en `MERGE` y `SPLIT`. Si asignas identificadores internos de transaccion o actualizas los datos (`database_block_id`, `version`), debes devolver los objetos completos de `newLots` creados/restaurados en la llave `newData`.

**Status HTTP:** `200 OK`
```json
{
  "ok": true,
  "newData": [
    {
      "id": "el-mismo-uuid-original-o-uno-nuevo",
      "block_id": "UUID-del-bloque",
      "svg_path": "...",
      ...
    }
  ]
}
```

## Beneficios
Con esta implementación, el backend simplemente se encarga de un enrutamiento de transacciones (eliminar X y guardar Y) recibiendo la topología exacta desde el frontend, el cual preserva en memoria todos los bordes, uniones de polígonos, IDs de bloque y coordenadas SVG tal como debían estar antes del cambio.