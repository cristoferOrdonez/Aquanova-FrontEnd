import { apiRequest, getAuthHeaders } from './apiClient';

export const submissionsService = {
  /**
   * Enviar respuestas de un formulario
   * payload: { form_id, neighborhood_id, responses, location? }
   */
  async submit(payload) {
    if (!payload || typeof payload !== 'object') throw new Error('payload inválido para submit submission');

    return apiRequest('/submissions', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: payload,
    });
  },
};

export default submissionsService;
