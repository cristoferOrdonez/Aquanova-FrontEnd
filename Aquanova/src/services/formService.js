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
   * Desactiva un formulario por ID (soft delete).
   * El formulario no se elimina permanentemente: se marca como is_active = false
   * junto con todas sus publicaciones asociadas.
   * @param {string} id - UUID del formulario
   */
  async delete(id) {
    return apiRequest(`/forms/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },

  /**
   * Busca formularios por un término de búsqueda.
   * La búsqueda se realiza sobre: título, descripción y nombre del barrio asociado.
   * La respuesta incluye el campo `metadata` con la imagen de portada (Cloudinary),
   * igual que el endpoint GET /api/forms.
   * @param {string} query - Término de búsqueda (requerido).
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

  /**
   * Actualiza un formulario existente (PUT /api/forms/:id).
   * El endpoint acepta multipart/form-data. Campos disponibles:
   *  - imagen   {File}    Imagen de portada → se sube a Cloudinary
   *  - title    {string}  Nuevo título
   *  - description {string} Nueva descripción
   *  - is_active {string} "true" o "false"
   *  - neighborhood_id {string} UUID del barrio
   *  - schema   {string} Array de preguntas JSON stringificado → genera nueva versión
   * @param {string} id - UUID del formulario
   * @param {FormData} formData - FormData con los campos a actualizar (al menos uno requerido)
   */
  async update(id, formData) {
    if (!id) throw new Error('Se requiere un ID para actualizar el formulario');
    if (!formData || typeof formData !== 'object') throw new Error('formData inválido para update form');

    const data = await apiRequest(`/forms/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: formData,
    });

    return data;
  },
};

export default formService;