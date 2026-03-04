// src/services/publicFormService.js
import { apiRequest } from './apiClient';

/**
 * Servicio para endpoints públicos de formularios (sin autenticación).
 */
export const publicFormService = {
  /**
   * Obtiene un formulario público por su key (slug).
   * No requiere token.
   *
   * @param {string} formKey - Slug del formulario (ej: "encuesta-movilidad-2026")
   * @returns {Promise<{ok: boolean, data: import('./publicFormService').PublicFormData}>}
   */
  async getByKey(formKey) {
    if (!formKey) throw new Error('formKey es requerido');
    return apiRequest(`/forms/public/${formKey}`);
  },

  /**
   * Registra un usuario y envía sus respuestas en un solo paso.
   * No requiere token.
   *
   * @param {object} payload
   * @param {string}  payload.form_key
   * @param {string}  payload.neighborhood_id
   * @param {object}  payload.responses          - { [field_key]: value }
   * @param {string}  payload.name
   * @param {string}  payload.document_number
   * @param {string}  payload.password
   * @param {string}  [payload.referral_code]
   * @param {string}  [payload.email]
   * @param {string}  [payload.phone]
   * @param {{lat: number, lng: number}} [payload.location]
   * @returns {Promise<import('./publicFormService').OnboardingResponse>}
   */
  async onboarding(payload) {
    if (!payload || typeof payload !== 'object') throw new Error('payload inválido para onboarding');
    return apiRequest('/submissions/onboarding', {
      method: 'POST',
      body: payload,
    });
  },
};

export default publicFormService;
