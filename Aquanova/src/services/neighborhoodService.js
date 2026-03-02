import { apiRequest, getAuthHeaders } from './apiClient';

/**
 * Extrae la lista de neighborhoods de la respuesta del API.
 *
 * Formato documentado: { ok: true, neighborhoods: [...] }
 * Mantiene fallbacks defensivos por compatibilidad.
 */
function extractList(data) {
  if (Array.isArray(data)) return data;
  // Formato documentado: { ok, neighborhoods }
  if (Array.isArray(data?.neighborhoods)) return data.neighborhoods;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

/**
 * Servicio para barrios y localidades.
 *
 * Endpoint de listado: GET /api/neighborhoods
 * Respuesta: { ok: true, neighborhoods: [...] }
 *
 * Campos de cada registro:
 *   id, name, code, parent_id, parent_name, is_active, metadata, created_at
 *
 * El campo `type` NO viene en el listado; se infiere de `parent_id`:
 *   - parent_id === null → Localidad (raíz)
 *   - parent_id !== null → Barrio (hijo de una localidad)
 *
 * Contratos:
 * - getAll()      → selects / UI simple  → [{ id, label, parent_id, parent_name }]  (solo activos)
 * - getFullList() → listados / cards     → objetos completos con tipo inferido      (solo activos)
 * - search(query) → búsqueda en servidor → objetos completos con tipo inferido      (solo activos)
 */
export const neighborhoodService = {
  /**
   * Para selects (FormCreation / GeoLevelCreation).
   * Retorna { id, label, parent_id, parent_name } — solo registros activos.
   */
  async getAll() {
    const data = await apiRequest('/neighborhoods', {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const list = extractList(data);

    return list
      .filter((n) => Boolean(n?.is_active))   // excluir inactivos (boolean o int 1/0)
      .map((n, idx) => {
        if (!n || typeof n !== 'object') return { id: String(idx), label: String(n ?? ''), parent_id: null, parent_name: null };

        const id    = n.id  ?? n._id  ?? n.code  ?? String(idx);
        const label = n.name ?? n.label ?? String(id);

        return {
          id:          String(id),
          label:       String(label),
          parent_id:   n.parent_id   ?? null,
          parent_name: n.parent_name ?? null,
        };
      });
  },

  /**
   * Para GeoLevelList (cards): retorna objetos completos — solo registros activos.
   *
   * El tipo se infiere de parent_id ya que el endpoint de listado no retorna `type`:
   *   parent_id === null → "Localidad"
   *   parent_id !== null → "Barrio"
   */
  async getFullList() {
    const data = await apiRequest('/neighborhoods', {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const list = extractList(data);

    return list
      .filter((n) => Boolean(n?.is_active))   // excluir inactivos (1/0 y true/false)
      .map((n, idx) => {
        if (!n || typeof n !== 'object') {
          return { id: String(idx), name: String(n ?? ''), code: '', parent_id: null, parent_name: null, is_active: true, metadata: null, created_at: null, type: 'Localidad', label: String(n ?? '') };
        }

        const id   = n.id  ?? n._id  ?? n.code  ?? String(idx);
        const name = n.name ?? n.label;

        // Inferir tipo desde parent_id (el listado no incluye `type`)
        const type = n.parent_id ? 'Barrio' : 'Localidad';

        return {
          ...n,
          id:          String(id),
          name:        name != null ? String(name) : String(id),
          label:       name != null ? String(name) : String(id),
          type,
          parent_id:   n.parent_id   ?? null,
          parent_name: n.parent_name ?? null,
          // Normalizar a boolean para consistencia (MySQL devuelve int 1/0)
          is_active:   n.is_active == null ? true : Boolean(n.is_active),
          metadata:    n.metadata    ?? null,   // { imagen, imagen_public_id, descripcion }
          created_at:  n.created_at  ?? null,
        };
      });
  },

  /**
   * Búsqueda en el servidor por nombre o código.
   *
   * Endpoint: GET /api/neighborhoods/search?query=<término>
   * Respuesta: { ok: true, neighborhoods: [...] }
   *
   * La búsqueda se realiza sobre `name` y `code`.
   * Retorna los mismos campos que el listado (mismo contrato que getFullList).
   *
   * Errores documentados:
   *   400 → { ok: false, message: "Debe enviar un parámetro de búsqueda \"query\"" }
   *   500 → { ok: false, message: "Error al buscar barrios" }
   *
   * @param {string} query - Término de búsqueda (nombre o código).
   * @returns {Promise<Array>} Lista de registros normalizados (solo activos).
   */
  async search(query) {
    // Validar query para evitar un 400 del backend
    const trimmed = String(query ?? '').trim();
    if (!trimmed) return [];

    const data = await apiRequest(`/neighborhoods/search?query=${encodeURIComponent(trimmed)}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const list = extractList(data);

    return list
      .filter((n) => Boolean(n?.is_active))   // excluir inactivos (1/0 y true/false)
      .map((n, idx) => {
        if (!n || typeof n !== 'object') return { id: String(idx), name: String(n ?? ''), label: String(n ?? ''), type: 'Localidad' };

        const id   = n.id  ?? n._id  ?? n.code  ?? String(idx);
        const name = n.name ?? n.label;

        // Inferir tipo desde parent_id (mismo criterio que getFullList)
        const type = n.parent_id ? 'Barrio' : 'Localidad';

        return {
          ...n,
          id:          String(id),
          name:        name != null ? String(name) : String(id),
          label:       name != null ? String(name) : String(id),
          type,
          parent_id:   n.parent_id   ?? null,
          parent_name: n.parent_name ?? null,
          // Normalizar a boolean para consistencia (MySQL devuelve int 1/0)
          is_active:   n.is_active == null ? true : Boolean(n.is_active),
          metadata:    n.metadata    ?? null,   // { imagen, imagen_public_id, descripcion }
          created_at:  n.created_at  ?? null,
        };
      });
  },

  /**
   * Crea un nuevo barrio, localidad o ciudad.
   *
   * Endpoint: POST /api/neighborhoods
   * Content-Type: multipart/form-data (con imagen) o application/json (sin imagen)
   *
   * Soporta dos modos:
   *   1. Con imagen (File): envía como multipart/form-data, el backend sube a Cloudinary.
   *   2. Sin imagen: envía como JSON estándar.
   *
   * Respuesta exitosa (201):
   *   { ok: true, message: "Barrio creado exitosamente", data: { id, name, code, parent_id, metadata } }
   *
   * Errores documentados:
   *   400 → Faltan name/code, o código duplicado
   *   403 → No tiene permisos de administrador
   *   404 → parent_id no existe
   *   500 → Error interno (incluye fallos de Cloudinary)
   *
   * @param {object} payload - { name, code, parent_id, metadata }
   * @param {File|null} [imageFile] - Archivo de imagen opcional para subir a Cloudinary.
   * @returns {Promise<object>} Respuesta del backend.
   */
  async create(payload, imageFile = null) {
    // Si hay imagen, enviar como multipart/form-data
    if (imageFile) {
      const formData = new FormData();
      if (payload.name) formData.append('name', payload.name);
      if (payload.code) formData.append('code', payload.code);
      if (payload.parent_id) formData.append('parent_id', payload.parent_id);

      // metadata se envía como JSON string en multipart
      if (payload.metadata) {
        const meta = typeof payload.metadata === 'string'
          ? payload.metadata
          : JSON.stringify(payload.metadata);
        formData.append('metadata', meta);
      }

      // Campo 'imagen' para Cloudinary
      formData.append('imagen', imageFile);

      return apiRequest('/neighborhoods', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      });
    }

    // Sin imagen: enviar como JSON
    return apiRequest('/neighborhoods', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: payload,
    });
  },

  /**
   * Actualiza un barrio existente con opción de reemplazar la imagen.
   *
   * Endpoint: PUT /api/neighborhoods/:id
   * Content-Type: multipart/form-data (con nueva imagen) o application/json (sin cambio de imagen)
   *
   * Si se sube una nueva imagen, la anterior se elimina automáticamente de Cloudinary.
   *
   * Respuesta exitosa (200):
   *   { ok: true, message: "Barrio actualizado exitosamente", data: { id, name, code, ... } }
   *
   * Errores documentados:
   *   400 → Datos inválidos, código duplicado, o intento de asignarse a sí mismo como padre
   *   403 → No tiene permisos de administrador
   *   404 → El barrio o parent_id no existen
   *   500 → Error interno (incluye fallos de Cloudinary)
   *
   * @param {string} id - UUID del barrio a actualizar.
   * @param {object} payload - Campos a actualizar: { name, code, parent_id, metadata }.
   * @param {File|null} [imageFile] - Nueva imagen opcional (reemplaza la anterior en Cloudinary).
   * @returns {Promise<object>} Respuesta del backend.
   */
  async update(id, payload, imageFile = null) {
    // Si hay imagen nueva, enviar como multipart/form-data
    if (imageFile) {
      const formData = new FormData();
      if (payload.name) formData.append('name', payload.name);
      if (payload.code) formData.append('code', payload.code);
      if (payload.parent_id !== undefined) {
        formData.append('parent_id', payload.parent_id || '');
      }

      // metadata como JSON string
      if (payload.metadata) {
        const meta = typeof payload.metadata === 'string'
          ? payload.metadata
          : JSON.stringify(payload.metadata);
        formData.append('metadata', meta);
      }

      // Nueva imagen (la anterior se elimina automáticamente de Cloudinary)
      formData.append('imagen', imageFile);

      // DEBUG: log FormData entries
      console.log('[neighborhoodService.update] FormData entries:');
      for (const [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `File(${value.name}, ${value.type}, ${value.size} bytes)` : value);
      }

      return apiRequest(`/neighborhoods/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: formData,
      });
    }

    // Sin nueva imagen: enviar como JSON
    console.log('[neighborhoodService.update] JSON body:', JSON.stringify(payload));
    return apiRequest(`/neighborhoods/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: payload,
    });
  },

  /**
   * Elimina un barrio del sistema. La imagen asociada en Cloudinary se elimina automáticamente.
   *
   * Endpoint: DELETE /api/neighborhoods/:id
   *
   * ⚠️ No se puede eliminar un barrio que tenga sub-barrios (hijos) asociados.
   *
   * Respuesta exitosa (200):
   *   { ok: true, message: "Barrio eliminado exitosamente", data: { id, name, code } }
   *
   * Errores documentados:
   *   400 → Tiene sub-barrios asociados o está referenciado en otros registros
   *   403 → No tiene permisos de administrador
   *   404 → El barrio no existe
   *   500 → Error interno
   *
   * @param {string} id - UUID del barrio a eliminar.
   * @returns {Promise<object>} Respuesta del backend.
   */
  async delete(id) {
    return apiRequest(`/neighborhoods/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },

  /**
   * Detalle de un barrio / localidad / ciudad con jerarquía completa.
   *
   * Endpoint: GET /api/neighborhoods/:id
   *
   * Respuesta exitosa (200):
   *   { ok: true, data: { id, name, code, parent_id, is_active, metadata, created_at, type, parent } }
   *
   * Campos calculados por el backend:
   *   `type`   – "Ciudad" (sin ancestros) | "Localidad" (1 ancestro) | "Barrio" (2+ ancestros)
   *   `parent` – objeto anidado recursivo con la misma estructura, hasta llegar
   *              a la Ciudad cuyo `parent` es null.
   *
   * Metadata disponible en barrios y localidades:
   *   `metadata.imagen`           – URL de imagen en Cloudinary (res.cloudinary.com)
   *   `metadata.imagen_public_id` – ID público de la imagen en Cloudinary (uso interno para gestión)
   *   `metadata.descripcion`      – Descripción contextualizada del lugar
   *
   * Errores documentados:
   *   404 → { ok: false, message: "Barrio no encontrado" }
   *   401 → { ok: false, message: "Token no proporcionado" }
   *   500 → { ok: false, message: "Error al obtener barrio" }
   *
   * Este método retorna el nodo ya normalizado (sin envolturas extra).
   */
  async getById(id) {
    const res = await apiRequest(`/neighborhoods/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    // El apiClient ya lanza error para códigos HTTP no-ok (401, 404, 500),
    // por lo que aquí solo manejamos la respuesta exitosa.

    // Verificar respuesta del wrapper { ok, data }
    if (res?.ok === false) {
      throw new Error(res.message || 'Error al obtener el detalle del barrio');
    }

    // Extraer el nodo del wrapper { ok, data }
    const raw = res?.data ?? res;

    // Normalizar recursivamente para garantizar campos consistentes
    const normalize = (node) => {
      if (!node || typeof node !== 'object') return null;

      const name = node.name ?? '';

      return {
        id:          String(node.id   ?? ''),
        name:        name,
        label:       name,  // alias para compatibilidad con selects / FormCreation
        code:        node.code        ?? '',
        type:        node.type        ?? null,   // "Barrio" | "Localidad" | "Ciudad"
        parent_id:   node.parent_id   ?? null,
        // Normalizar a boolean (MySQL puede devolver int 1/0)
        is_active:   node.is_active == null ? true : Boolean(node.is_active),
        metadata:    node.metadata    ?? null,   // { imagen, imagen_public_id, descripcion } en barrios y localidades
        created_at:  node.created_at  ?? null,
        parent:      node.parent ? normalize(node.parent) : null,
      };
    };

    return normalize(raw);
  },
};
