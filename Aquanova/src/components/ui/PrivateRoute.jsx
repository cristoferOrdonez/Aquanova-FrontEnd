import { Navigate } from 'react-router-dom'
import { authService } from '../../services/authService'

/**
 * Protege rutas de administración.
 * - Sin sesión → redirige a /login
 * - Rol 'usuario' (creado por link de referidos) → redirige a /login
 */
function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  const user = authService.getUser()

  if (!token || !user) {
    return <Navigate to='/login' replace />
  }

  if (user.role === 'usuario') {
    return <Navigate to='/login' replace />
  }

  return children
}

export default PrivateRoute
