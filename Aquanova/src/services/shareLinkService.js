const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0'])

function isLocalHost(hostname = '') {
  return LOCAL_HOSTS.has(hostname) || hostname.endsWith('.localhost')
}

function sanitizePublicOrigin(url) {
  if (url.port === '5173' && !isLocalHost(url.hostname)) {
    url.port = ''
  }
  return url
}

function getPreferredFrontendOrigin() {
  const envUrl = import.meta.env.VITE_FRONTEND_URL
  if (envUrl) {
    try {
      const parsed = sanitizePublicOrigin(new URL(envUrl))
      return parsed.origin
    } catch {
      // Si la variable viene mal formada, usamos el origin actual como fallback.
    }
  }

  if (typeof window !== 'undefined') {
    const parsed = sanitizePublicOrigin(new URL(window.location.origin))
    return parsed.origin
  }

  return null
}

/**
 * Normaliza un link de formulario público para evitar dominios de desarrollo.
 * Si el backend devuelve localhost, se reemplaza por el dominio público del frontend.
 */
export function normalizeShareLink(rawLink, { formKey = null, referralCode = null } = {}) {
  const preferredOrigin = getPreferredFrontendOrigin()
  const fallbackPath = formKey ? `/formulario/${formKey}` : null

  if (!rawLink && !fallbackPath) return null

  const baseOrigin = preferredOrigin || 'https://aquavisor.co'
  let url

  try {
    url = new URL(rawLink || fallbackPath, baseOrigin)
  } catch {
    if (!fallbackPath) return null
    url = new URL(fallbackPath, baseOrigin)
  }

  if (preferredOrigin) {
    const preferred = new URL(preferredOrigin)
    // Siempre usamos el dominio del frontend para links públicos de formularios.
    // Esto evita que se filtre localhost u otros hosts del backend.
    url.protocol = preferred.protocol
    url.host = preferred.host
  } else if (isLocalHost(url.hostname)) {
    // Fallback defensivo cuando no existe origin disponible (escenario atípico).
    url.protocol = 'https:'
    url.host = 'aquavisor.co'
  }

  sanitizePublicOrigin(url)

  if (referralCode && !url.searchParams.get('ref')) {
    url.searchParams.set('ref', referralCode)
  }

  return url.toString()
}
