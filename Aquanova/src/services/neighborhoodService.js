import { apiRequest, getAuthHeaders } from './apiClient';

function extractListFromResponse(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.neighborhoods)) return data.neighborhoods;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;

  const maybeArray = Object.values(data || {}).find(Array.isArray);
  return Array.isArray(maybeArray) ? maybeArray : [];
}

/**
 * Servicio para obtener niveles geográficos (temporalmente llamado neighborhood)
 *
 * Contratos:
 * - getAll(): para SELECTS / UI simple => [{ id, label }]
 * - getFullList(): para LISTADOS / cards => objetos completos del backend
 */
export const neighborhoodService = {
  /**
   * Para selects (FormCreation / GeoLevelCreation): retorna { id, label }
   * Mantiene compatibilidad con el comportamiento histórico.
   */
  async getAll() {
    const data = await apiRequest('/neighborhoods', {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const list = extractListFromResponse(data);

    return list.map((n, idx) => {
      if (!n) return { id: String(idx), label: String(n) };
      if (typeof n === 'string') return { id: String(idx), label: n };

      const id = n?.id ?? n?._id ?? n?.code ?? String(idx);
      const label = n?.name ?? n?.nombre ?? n?.label ?? String(id);

      return { id: String(id), label: String(label) };
    });
  },

  /**
   * Para GeoLevelList: retorna el objeto completo.
   * Normaliza mínimamente id/name/label para hacer la UI resiliente.
   */
  async getFullList() {
    const data = await apiRequest('/neighborhoods', {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const list = extractListFromResponse(data);

    return list.map((n, idx) => {
      if (!n || typeof n !== 'object') {
        return {
          id: String(idx),
          name: String(n ?? ''),
          code: undefined,
          parent_id: undefined,
          metadata: undefined,
          label: String(n ?? ''),
        };
      }

      const id = n?.id ?? n?._id ?? n?.code ?? String(idx);
      const name = n?.name ?? n?.nombre ?? n?.label;

      return {
        ...n,
        id: String(id),
        name: name != null ? String(name) : String(id),
        label: name != null ? String(name) : String(id),
      };
    });
  },

  async create(payload) {
    const data = await apiRequest('/neighborhoods', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: payload,
    });

    return data;
  },
};
