import { apiRequest, getAuthHeaders } from './apiClient';

/**
 * Servicio para obtener barrios desde el backend
 * Mantiene una interfaz simple que devuelve un arreglo de nombres
 */
export const neighborhoodService = {
  async getAll() {
    const data = await apiRequest('/neighborhoods', {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    // Soportar distintas formas de respuesta: array directo o wrappers { data: [], neighborhoods: [] }
    let list = [];
    if (Array.isArray(data)) {
      list = data;
    } else if (Array.isArray(data?.data)) {
      list = data.data;
    } else if (Array.isArray(data?.neighborhoods)) {
      list = data.neighborhoods;
    } else if (Array.isArray(data?.rows)) {
      list = data.rows;
    } else {
      // si la respuesta no es un array reconocible, intentar extraer claves que puedan contener items
      const maybeArray = Object.values(data || {}).find(Array.isArray);
      if (Array.isArray(maybeArray)) list = maybeArray;
    }

    // Normalizar a un arreglo de objetos { id, label }
    return list.map((n, idx) => {
      if (!n) return { id: String(idx), label: String(n) };
      if (typeof n === 'string') return { id: String(idx), label: n };

      const id = n?.id ?? n?._id ?? n?.code ?? String(idx);
      const label = n?.name ?? n?.nombre ?? n?.label ?? id;
      return { id: String(id), label: String(label) };
    });
  },
  async create(payload) {
    // payload puede incluir: name, code, parent_id, metadata, type
    const data = await apiRequest('/neighborhoods', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: payload,
    });

    return data;
  },
};
