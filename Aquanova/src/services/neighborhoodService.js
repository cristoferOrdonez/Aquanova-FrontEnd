import { apiRequest, getAuthHeaders } from './apiClient';

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.neighborhoods)) return data.neighborhoods;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;
  const maybeArray = Object.values(data || {}).find(Array.isArray);
  return Array.isArray(maybeArray) ? maybeArray : [];
}

/**
 * Servicio para barrios y localidades.
 *
 * Campos del backend: id, name, code, parent_id, parent_name, is_active, metadata, created_at
 *
 * Contratos:
 * - getAll()      → selects / UI simple  → [{ id, label, parent_id, parent_name }]  (solo activos)
 * - getFullList() → listados / cards     → objetos completos del backend             (solo activos)
 * - search(query) → búsqueda en servidor → objetos completos                         (solo activos)
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
      .filter((n) => n?.is_active !== false)   // excluir inactivos
      .map((n, idx) => {
        if (!n || typeof n !== 'object') return { id: String(idx), label: String(n ?? ''), parent_id: null, parent_name: null };

        const id    = n.id  ?? n._id  ?? n.code  ?? String(idx);
        const label = n.name ?? n.nombre ?? n.label ?? String(id);

        return {
          id:          String(id),
          label:       String(label),
          parent_id:   n.parent_id   ?? null,
          parent_name: n.parent_name ?? null,
        };
      });
  },

  /**
   * Para GeoLevelList: retorna objetos completos — solo registros activos.
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
          return { id: String(idx), name: String(n ?? ''), code: undefined, parent_id: null, parent_name: null, is_active: true, metadata: undefined, created_at: undefined, label: String(n ?? '') };
        }

        const id   = n.id  ?? n._id  ?? n.code  ?? String(idx);
        const name = n.name ?? n.nombre ?? n.label;

        return {
          ...n,
          id:          String(id),
          name:        name != null ? String(name) : String(id),
          label:       name != null ? String(name) : String(id),
          type:        n.type        ?? null,
          parent_id:   n.parent_id   ?? null,
          parent_name: n.parent_name ?? null,
          // Normalizar a boolean para consistencia (MySQL devuelve int 1/0)
          is_active:   n.is_active == null ? true : Boolean(n.is_active),
          created_at:  n.created_at  ?? null,
        };
      });
  },

  /**
   * Búsqueda en el servidor por nombre o código.
   * Retorna objetos completos (mismo contrato que getFullList).
   */
  async search(query) {
    const data = await apiRequest(`/neighborhoods/search?query=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const list = extractList(data);

    return list
      .filter((n) => Boolean(n?.is_active))   // excluir inactivos (1/0 y true/false)
      .map((n, idx) => {
        if (!n || typeof n !== 'object') return { id: String(idx), name: String(n ?? ''), label: String(n ?? '') };

        const id   = n.id  ?? n._id  ?? n.code  ?? String(idx);
        const name = n.name ?? n.nombre ?? n.label;

        return {
          ...n,
          id:          String(id),
          name:        name != null ? String(name) : String(id),
          label:       name != null ? String(name) : String(id),
          type:        n.type        ?? null,
          parent_id:   n.parent_id   ?? null,
          parent_name: n.parent_name ?? null,
          // Normalizar a boolean para consistencia (MySQL devuelve int 1/0)
          is_active:   n.is_active == null ? true : Boolean(n.is_active),
          created_at:  n.created_at  ?? null,
        };
      });
  },

  async create(payload) {
    return apiRequest('/neighborhoods', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: payload,
    });
  },

  /**
   * Detalle de un barrio / localidad / ciudad con jerarquía completa.
   *
   * El backend retorna:
   *   { ok, data: { id, name, code, parent_id, is_active, metadata, created_at, type, parent } }
   *
   * `type`   – calculado por el servidor: "Ciudad" | "Localidad" | "Barrio"
   * `parent` – objeto anidado recursivo con la misma estructura, hasta llegar
   *            a la Ciudad cuyo `parent` es null.
   *
   * Este método retorna el nodo ya normalizado (sin envolturas extra).
   */
  async getById(id) {
    const res = await apiRequest(`/neighborhoods/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    // Extraer el nodo del wrapper { ok, data }
    const raw = res?.data ?? res;

    // Normalizar recursivamente para garantizar campos consistentes
    const normalize = (node) => {
      if (!node || typeof node !== 'object') return null;
      return {
        id:          String(node.id   ?? ''),
        name:        node.name        ?? '',
        code:        node.code        ?? '',
        type:        node.type        ?? null,   // "Barrio" | "Localidad" | "Ciudad"
        parent_id:   node.parent_id   ?? null,
        is_active:   node.is_active   ?? true,
        metadata:    node.metadata    ?? null,   // { imagen, descripcion } en barrios
        created_at:  node.created_at  ?? null,
        parent:      node.parent ? normalize(node.parent) : null,
      };
    };

    return normalize(raw);
  },
};
