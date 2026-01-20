import { apiRequest, getAuthHeaders } from './apiClient';

/**
 * Servicio para manejar formularios (forms)
 * Sigue la convención utilizada por otros servicios en /src/services
 */
export const formService = {
  /**
   * Crea un nuevo formulario en el backend.
   * payload debe contener: { title, schema: Array, neighborhood_id, description? }
   */
  async create(payload) {
    if (!payload || typeof payload !== 'object') throw new Error('payload inválido para create form');

    const data = await apiRequest('/forms', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: payload,
    });

    return data;
  },
};

export default formService;
