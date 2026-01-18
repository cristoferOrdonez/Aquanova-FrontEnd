import { apiRequest, getAuthHeaders } from './apiClient';

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

  // Aquí podrías agregar getById, create, update, etc.
};
