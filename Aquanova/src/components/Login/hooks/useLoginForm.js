import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../../services/authService'

export function useLoginForm() {
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [documentNumber, setDocumentNumber] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const togglePasswordVisibility = () => setShowPassword(v => !v)

  const cedulaInputOnInput = (e) => {
    if (e.target.value.length > 10) e.target.value = e.target.value.slice(0, 10)
  }

  const cedulaInputOnKeyDown = (e) => {
    if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault()
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')

    if (!documentNumber.trim() || !password) {
      setError('Por favor ingresa cédula y contraseña.')
      return
    }

    setLoading(true)
    try {
      const result = await authService.login({
        document_number: documentNumber.trim(),
        password,
      })

      authService.saveSession({ token: result.token, user: result.user })
      navigate('/')
    } catch (err) {
      setError(err?.message || 'No fue posible iniciar sesión.')
    } finally {
      setLoading(false)
    }
  }

  return {
    // estadis
    showPassword,
    documentNumber,
    password,
    loading,
    error,

    // setters
    setDocumentNumber,
    setPassword,

    // handlers
    togglePasswordVisibility,
    cedulaInputOnInput,
    cedulaInputOnKeyDown,
    submit,
  }
}