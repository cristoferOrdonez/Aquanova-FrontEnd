// src/services/submissionService.js
import { apiRequest } from './apiClient';

export const submissionService = {
  /**
   * Obtiene todas las respuestas de un formulario específico
   * @param {string} formId 
   */
  getSubmissionsByFormId(formId) {
    // 1. Obtenemos el token almacenado en el navegador
    const token = localStorage.getItem('token'); 

    // 2. Lo enviamos en los headers de la petición
    return apiRequest(`/submissions/${formId}`, { 
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`, // Formato Bearer esperado por tu backend
        'Content-Type': 'application/json'
      }
    });
  }
};