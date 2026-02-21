// src/services/prediosService.js
import { apiRequest } from './apiClient';

export const prediosService = {
  /**
   * Obtiene la estructura completa del mapa (Manzanas + Predios)
   * @param {string} [neighborhoodId] - ID del barrio (opcional)
   */
  getDigitalTwinData(neighborhoodId) {
    const path = neighborhoodId 
      ? `/map/digital-twin/${neighborhoodId}` 
      : `/map/digital-twin`;
      
    // Usamos el apiClient que ya tienes configurado
    return apiRequest(path, { method: 'GET' });
  },

  /**
   * Actualiza la información de un predio (Estado, Medidor, Catastro)
   * @param {string} lotId - ID del predio en la base de datos
   * @param {object} payload - Objeto con los datos a actualizar { status, water_meter_code, ... }
   */
  updateLotInfo(lotId, payload) {
    return apiRequest(`/map/predios/${lotId}`, {
      method: 'PATCH',
      body: payload,
    });
  },

  /**
   * Obtiene la lista de todos los sectores/barrios disponibles
   * para llenar el selector de mapas en el frontend.
   */
  getNeighborhoods() {
    return apiRequest('/map/neighborhoods', { method: 'GET' });
  }
};