import { apiRequest, getAuthHeaders } from './apiClient';

/**
 * Servicio para la gestión de usuarios
 */
export const usersService = {
  /**
   * Obtiene la lista de todos los usuarios
   * @returns {Promise<Object>} Respuesta con la lista de usuarios { ok: true, users: [...] }
   */
  getUsers: async () => {
    return apiRequest('/users', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  /**
   * Crea un nuevo usuario
   * @param {Object} userData Datos del usuario a crear (name, document_number, password, role_id, etc.)
   * @returns {Promise<Object>} Respuesta de la creación
   */
  createUser: async (userData) => {
    return apiRequest('/users', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: userData,
    });
  }
};
