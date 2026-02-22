// src/services/submissionService.js
import { apiRequest } from './apiClient';

export const submissionService = {
  /**
   * Obtiene todas las respuestas de un formulario específico
   * @param {string} formId 
   */
  getSubmissionsByFormId(formId) {
    return apiRequest(`/submissions/${formId}`, { method: 'GET' });
  }
};