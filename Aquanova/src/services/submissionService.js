import { apiRequest, getAuthHeaders } from './apiClient';

export const submissionService = {
  /**
   * Crea una nueva submission (envío de respuestas)
   * payload: { form_id, neighborhood_id, responses, location? }
   */
  async create(payload) {
    if (!payload || typeof payload !== 'object') throw new Error('payload inválido para submission');
    return apiRequest('/submissions', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: payload,
    });
  },
};

export default submissionService;
