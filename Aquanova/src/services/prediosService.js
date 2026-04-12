// src/services/prediosService.js
import { apiRequest } from './apiClient';

export const prediosService = {
  getDigitalTwinData(neighborhoodId) {
    const path = neighborhoodId 
      ? `/map/digital-twin/${neighborhoodId}` 
      : `/map/digital-twin`;
    return apiRequest(path, { method: 'GET' });
  },

  updateLotInfo(lotId, payload) {
    return apiRequest(`/map/predios/${lotId}`, {
      method: 'PATCH',
      body: payload,
    });
  },

  getNeighborhoods() {
    return apiRequest('/map/neighborhoods', { method: 'GET' });
  },

  getAvailableLots(neighborhoodId) {
    return apiRequest(`/map/available-lots/${neighborhoodId}`, { method: 'GET' });
  },

  updateTopology(payload) {
    return apiRequest('/map/topology-update', {
      method: 'POST',
      body: payload
    });
  },

  undoTopology(payload) {
    return apiRequest('/map/topology-update', {
      method: 'POST',
      body: payload
    });
  },

  /**
   * Actualiza el código/nombre de una manzana (bloque).
   * @param {string} databaseBlockId - UUID real de la manzana en la tabla `blocks`
   * @param {object} payload - { code: 'Nuevo nombre' }
   */
  updateBlockInfo(databaseBlockId, payload) {
    return apiRequest(`/map/blocks/${databaseBlockId}`, {
      method: 'PATCH',
      body: payload,
    });
  }
};
