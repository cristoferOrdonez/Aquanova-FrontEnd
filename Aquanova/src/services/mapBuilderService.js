import { apiRequest, getAuthHeaders } from './apiClient';

/**
 * Transforma el array de polígonos plano del editor al formato blocks/lots
 * que espera el backend.
 *
 * Estructura esperada por backend:
 * blocks: [{ id, code, geom_path, label_position, lots: [{ id, number, svg_path, ... }] }]
 *
 * @param {Array} polygons - Polígonos del editor con type 'block'|'lot'|'unassigned'
 * @returns {Array} Array de blocks con lots anidados
 */
function polygonsToBlocks(polygons) {
  if (!polygons || !Array.isArray(polygons)) return [];

  const blockPolygons = polygons.filter((p) => p.type === 'block');
  const lotPolygons = polygons.filter((p) => p.type === 'lot');

  return blockPolygons.map((block) => ({
    id: block.id,
    code: block.code || null,
    geom_path: block.svgPath || '',
    label_position: block.centroid || null,
    lots: lotPolygons
      .filter((lot) => lot.parentId === block.id)
      .map((lot) => ({
        id: lot.id,
        number: lot.number || null,
        svg_path: lot.svgPath || '',
        centroid: lot.centroid || null,
        area_m2: lot.area || 0,
        cadastral_id: lot.metadata?.cadastralId || null,
        water_meter_code: lot.metadata?.waterMeterCode || null,
        status: lot.metadata?.status || 'sin_informacion',
      })),
  }));
}

/**
 * Servicio para el módulo Map Builder.
 *
 * Endpoints:
 * - POST /api/map-builder/save          → Guardar mapa completo
 * - GET  /api/map-builder/:id           → Cargar mapa por neighborhoodId
 * - POST /api/map-builder/validate      → Validar mapa en servidor
 * - POST /api/map-builder/import-svg    → Importar archivo SVG (multipart)
 * - POST /api/map-builder/draft         → Guardar borrador
 * - GET  /api/map-builder/draft/:id     → Obtener borrador
 * - DELETE /api/map-builder/draft/:id   → Eliminar borrador
 */
export const mapBuilderService = {
  /**
   * Guarda el mapa completo en el servidor.
   * Transforma los polígonos del editor al formato blocks/lots del backend.
   *
   * @param {object} payload - Datos del mapa (polygons, metadata, neighborhoodId, etc.)
   * @returns {Promise<object>} Respuesta del servidor
   */
  async saveMap(payload) {
    const {
      polygons,
      neighborhoodId,
      viewBox,
      gridSize,
      showGrid,
      exportedAt,
      deletedBlockIds,
      deletedLotIds,
    } = payload;

    return apiRequest('/map-builder/save', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: {
        neighborhoodId,
        blocks: polygonsToBlocks(polygons),
        // El backend borra por ID explícito; omitirlos dejaba en la BD las
        // manzanas y predios eliminados en el editor.
        deletedBlockIds: deletedBlockIds || [],
        deletedLotIds: deletedLotIds || [],
        viewBox,
        gridSize,
        showGrid,
        exportedAt,
      },
    });
  },

  /**
   * Carga el mapa guardado para un barrio específico.
   *
   * @param {string} neighborhoodId - ID del barrio
   * @returns {Promise<object>} Datos del mapa guardado
   */
  async loadMap(neighborhoodId) {
    return apiRequest(`/map-builder/${neighborhoodId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  /**
   * Valida la geometría del mapa en el servidor.
   *
   * @param {object} payload - Polígonos y metadata a validar
   * @returns {Promise<object>} Resultado de validación { isValid, errors[], warnings[] }
   */
  async validateMap(payload) {
    return apiRequest('/map-builder/validate', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: payload,
    });
  },

  /**
   * Importa un archivo SVG al mapa.
   * Envía como multipart/form-data (el browser asigna Content-Type con boundary).
   *
   * @param {File} file - Archivo SVG a importar
   * @returns {Promise<object>} Polígonos extraídos del SVG
   */
  async importSvg(file) {
    const formData = new FormData();
    formData.append('file', file);

    return apiRequest('/map-builder/import-svg', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });
  },

  /**
   * Guarda un borrador del mapa actual.
   *
   * A diferencia de `saveMap`, el borrador guarda los polígonos crudos del editor
   * dentro de `canvasState` (que es lo que espera el endpoint): convertirlos a
   * blocks/lots perdería los vértices y los polígonos aún sin asignar.
   *
   * @param {object} payload - Estado actual del mapa (polygons, metadata, neighborhoodId)
   * @returns {Promise<object>} Confirmación del borrador guardado
   */
  async saveDraft(payload) {
    const { polygons, neighborhoodId, viewBox, gridSize, showGrid, savedAt } = payload;
    return apiRequest('/map-builder/draft', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: {
        neighborhoodId,
        canvasState: {
          polygons,
          viewBox,
          gridSize,
          showGrid,
          savedAt,
        },
      },
    });
  },

  /**
   * Obtiene el borrador guardado para un barrio.
   *
   * @param {string} neighborhoodId - ID del barrio
   * @returns {Promise<object|null>} Borrador guardado o null si no existe
   */
  async getDraft(neighborhoodId) {
    return apiRequest(`/map-builder/draft/${neighborhoodId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  /**
   * Elimina el borrador de un barrio.
   *
   * @param {string} neighborhoodId - ID del barrio
   * @returns {Promise<object>} Confirmación de eliminación
   */
  async deleteDraft(neighborhoodId) {
    return apiRequest(`/map-builder/draft/${neighborhoodId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },
};
