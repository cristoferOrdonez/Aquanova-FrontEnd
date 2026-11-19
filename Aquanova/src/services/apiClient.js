const API_URL = import.meta.env.VITE_API_URL;

export const getToken = () => {
  return localStorage.getItem('token');
};

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
  const token = getToken();
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  // Construir headers: NO incluir Content-Type para FormData (el browser lo asigna con boundary)
  const finalHeaders = isFormData
    ? { ...authHeader, ...headers }
    : { 'Content-Type': 'application/json', ...authHeader, ...headers };

  try {
    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers: finalHeaders,
      body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
      credentials: 'include',
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      if ((res.status === 401 || (res.status === 403 && data?.message?.includes('token'))) &&
          typeof window !== 'undefined' &&
          !window.location.pathname.startsWith('/login') &&
          !window.location.pathname.startsWith('/formulario')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      const msg = data?.message || `HTTP ${res.status}: ${res.statusText || 'Error desconocido'}`;
      const err = new Error(msg);
      err.status = res.status;
      err.data = data;
      err.isApiError = true;
      throw err;
    }

    return data;
  } catch (err) {
    // Si ya es un error de API estructurado, lo relanzamos
    if (err.isApiError) throw err;

    // Manejo específico para errores de red (offline)
    if (err.name === 'TypeError' || err.message.includes('NetworkError')) {
      const networkErr = new Error('Error de conexión: No se pudo contactar con el servidor.');
      networkErr.isNetworkError = true;
      throw networkErr;
    }

    throw err;
  }
}

