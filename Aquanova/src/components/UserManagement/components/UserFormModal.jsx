import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const modalVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { type: 'spring', damping: 25, stiffness: 300 } 
  },
  exit: { 
    opacity: 0, 
    y: 20, 
    scale: 0.95, 
    transition: { duration: 0.2 } 
  },
}

export default function UserFormModal({ isOpen, onClose, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    name: '',
    document_number: '',
    email: '',
    password: '',
    confirm_password: '',
    role_id: 3, // Default a usuario
  })

  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido'

    if (!formData.document_number.trim()) {
      newErrors.document_number = 'El documento es requerido'
    } else if (!/^\d{8,10}$/.test(formData.document_number.trim())) {
      newErrors.document_number = 'La cédula debe tener entre 8 y 10 dígitos numéricos'
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}/.test(formData.password)) {
      newErrors.password = 'Mín. 8 caracteres, mayúscula, minúscula, número y un símbolo especial'
    }

    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Las contraseñas no coinciden'
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Correo electrónico inválido'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetForm = () => {
    setFormData({
      name: '',
      document_number: '',
      email: '',
      password: '',
      confirm_password: '',
      role_id: 3,
    })
    setErrors({})
  }

  const handleClose = () => {
    onClose()
    // Pequeño retraso para que la animación de cierre termine antes de vaciar los campos visualmente
    setTimeout(resetForm, 300)
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === 'document_number' && value && !/^\d*$/.test(value)) {
      return // Solo permite números
    }

    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'role_id' ? parseInt(value, 10) : value 
    }))
    // Limpiar error al escribir
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (validate()) {
      // eslint-disable-next-line no-unused-vars
      const { confirm_password, ...submitData } = formData
      if (!submitData.email) {
        submitData.email = null // Importante para no generar conflicto de llave única en BD con string vacío
      }
      
      // Llamamos onsubmit e inyectamos la lógica de limpieza local sólo si fue exitoso
      try {
        await onSubmit(submitData)
        resetForm()
      } catch (error) {
        // En caso de que onsubmit sea asincrónico y falle (aunque Index.jsx lo previene)
        console.error("Fallo al enviar en componente", error)
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={!isSubmitting ? handleClose : undefined}
          />

          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[var(--card-stroke)] overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--card-stroke)] bg-slate-50">
              <h2 className="text-xl font-bold text-[var(--text)]">Agregar Nuevo Usuario</h2>
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors disabled:opacity-50"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5" autoComplete="off" autoCorrect="off">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--gray-subtitles)] mb-1">
                    Nombre Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="new-password"
                    data-lpignore="true"
                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[var(--blue-buttons)] focus:border-[var(--blue-buttons)] outline-none transition-all ${errors.name ? 'border-red-500 bg-red-50' : 'border-[var(--card-stroke)]'}`}
                    placeholder="Ej. Juan Pérez"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--gray-subtitles)] mb-1">
                      Documento <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="document_number"
                      value={formData.document_number}
                      onChange={handleChange}
                      autoComplete="new-password"
                      data-lpignore="true"
                      className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[var(--blue-buttons)] focus:border-[var(--blue-buttons)] outline-none transition-all ${errors.document_number ? 'border-red-500 bg-red-50' : 'border-[var(--card-stroke)]'}`}
                      placeholder="Número de documento"
                    />
                    {errors.document_number && <p className="mt-1 text-sm text-red-500">{errors.document_number}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--gray-subtitles)] mb-1">
                      Rol <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="role_id"
                      value={formData.role_id}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-[var(--card-stroke)] focus:ring-2 focus:ring-[var(--blue-buttons)] focus:border-[var(--blue-buttons)] outline-none bg-white transition-all"
                    >
                      <option value={1}>Administrador</option>
                      <option value={2}>Operador</option>
                      <option value={3}>Usuario</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--gray-subtitles)] mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="new-password"
                    data-lpignore="true"
                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[var(--blue-buttons)] focus:border-[var(--blue-buttons)] outline-none transition-all ${errors.email ? 'border-red-500 bg-red-50' : 'border-[var(--card-stroke)]'}`}
                    placeholder="correo@ejemplo.com (Opcional)"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--gray-subtitles)] mb-1">
                      Contraseña <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      data-lpignore="true"
                      className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[var(--blue-buttons)] focus:border-[var(--blue-buttons)] outline-none transition-all ${errors.password ? 'border-red-500 bg-red-50' : 'border-[var(--card-stroke)]'}`}
                      placeholder="••••••••"
                    />
                    {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--gray-subtitles)] mb-1">
                      Confirmar Contraseña <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      data-lpignore="true"
                      className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[var(--blue-buttons)] focus:border-[var(--blue-buttons)] outline-none transition-all ${errors.confirm_password ? 'border-red-500 bg-red-50' : 'border-[var(--card-stroke)]'}`}
                      placeholder="••••••••"
                    />
                    {errors.confirm_password && <p className="mt-1 text-sm text-red-500">{errors.confirm_password}</p>}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 font-medium">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-[var(--gray-subtitles)] hover:bg-slate-100 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[var(--blue-buttons)] text-white shadow-sm hover:bg-blue-600 transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Guardar Usuario</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}