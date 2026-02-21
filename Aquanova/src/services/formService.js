import { apiRequest, getAuthHeaders } from './apiClient';

/**
 * Servicio para manejar formularios (forms)
 * Sigue la convención utilizada por otros servicios en /src/services
 */
export const formService = {
  /**
   * Obtiene todos los formularios
   */
  async getAll() {
    // GET /api/forms
    // Se envían headers con el token para validar sesión
    return apiRequest('/forms', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  /**
   * Elimina un formulario por ID
   */
  async delete(id) {
    return apiRequest(`/forms/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },

  /**
   * Busca formularios por un término de búsqueda.
   * @param {string} query - Término de búsqueda.
   */
  async search(query) {
    return apiRequest(`/forms/search?query=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  /**
   * Obtiene un formulario por ID
   * @param {string} id - UUID del formulario
   */
  async getById(id) {
    return apiRequest(`/forms/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

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