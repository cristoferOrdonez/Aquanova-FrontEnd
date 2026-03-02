const API_URL = import.meta.env.VITE_API_URL;

export const getToken = () => localStorage.getItem('token');

export const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Realiza una petición al API.
 *
 * Soporta dos tipos de body:
 *   - Objeto JS → se serializa como JSON con Content-Type: application/json
 *   - FormData  → se envía tal cual (el browser asigna Content-Type con boundary)
 *
 * @param {string} path - Ruta relativa del endpoint (ej: '/neighborhoods')
 * @param {object} options - { method, headers, body }
 * @returns {Promise<any>} Respuesta parseada como JSON
 */
export async function apiRequest(path, { method = 'GET', headers = {}, body } = {}) {
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  // Construir headers: NO incluir Content-Type para FormData (el browser lo asigna con boundary)
  const finalHeaders = isFormData
    ? { ...headers }
    : { 'Content-Type': 'application/json', ...headers };

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = data?.message || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}
