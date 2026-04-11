import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
  UsersIcon,
  LockClosedIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import { useUsers } from './hooks/useUsers'
import UserFormModal from './components/UserFormModal'
import { usersService } from '../../services/usersService'
import { authService } from '../../services/authService'

const containerVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
      when: 'beforeChildren',
      staggerChildren: 0.07,
    },
  },
}

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.24, ease: 'easeOut' } },
}

function ActionButton({ title, icon: Icon, tone = 'default', onClick }) {
  const toneClass = tone === 'danger'
    ? 'text-[var(--red-base)] hover:bg-red-50'
    : 'text-[var(--blue-buttons)] hover:bg-blue-50'

  return (
    <button
      type='button'
      title={title}
      aria-label={title}
      onClick={onClick}
      className={`rounded-full p-2 transition-colors ${toneClass}`}
    >
      <Icon className='h-5 w-5' />
    </button>
  )
}

function Index() {
  const { usersList, loading, error, refreshUsers } = useUsers()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentUser = authService.getUser()
  const isAdmin = currentUser?.role?.toLowerCase() === 'administrador' || currentUser?.role?.toLowerCase() === 'admin'

  if (!isAdmin) {
    return <Navigate to="/home" replace />
  }

  const handleCreateUser = async (userData) => {
    try {
      setIsSubmitting(true)
      await usersService.createUser(userData)
      // Recargar la lista después de crear
      if (refreshUsers) await refreshUsers()
      setIsModalOpen(false)
      // La limpieza del formulario se maneja desde el modal al cerrarse exitosamente si disparamos un evento o estado,
      // pero para mantenerlo simple, delegaremos una prop key que reinicia el componente o la invocamos desde adentro.
    } catch (err) {
      console.error('Error al crear usuario:', err)
      alert(err.data?.message || err.response?.data?.message || err.message || 'Error al crear usuario. Revisa los datos.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.section
      variants={containerVariants}
      initial='hidden'
      animate='visible'
      className='w-full max-w-5xl mx-auto font-work relative min-h-[70vh]'
    >
      <div className='rounded-2xl border border-[var(--card-stroke)] bg-[var(--card-bg)] shadow-sm p-4 sm:p-6 lg:p-8'>
        <motion.div variants={rowVariants} className='flex items-center gap-3 mb-6'>
          <UsersIcon className='h-7 w-7 text-[var(--blue-buttons)]' />
          <h1 className='text-2xl font-bold text-[var(--text)]'>Gestion de usuarios</h1>
        </motion.div>

        <div className='overflow-x-auto rounded-xl border border-[var(--card-stroke)]'>
          <table className='w-full min-w-[740px] border-collapse'>
            <thead>
              <tr className='bg-slate-50 border-b border-[var(--card-stroke)]'>
                <th className='text-left px-5 py-3 text-sm font-semibold text-[var(--gray-subtitles)]'>Documento</th>
                <th className='text-left px-5 py-3 text-sm font-semibold text-[var(--gray-subtitles)]'>Nombre completo</th>
                <th className='text-left px-5 py-3 text-sm font-semibold text-[var(--gray-subtitles)]'>Rol</th>
                <th className='text-left px-5 py-3 text-sm font-semibold text-[var(--gray-subtitles)]'>Opciones</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-[var(--gray-subtitles)]">
                    Cargando usuarios...
                  </td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-red-500">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && (!usersList || usersList.length === 0) && (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-[var(--gray-subtitles)]">
                    No hay usuarios registrados
                  </td>
                </tr>
              )}
              {!loading && !error && Array.isArray(usersList) && usersList.map((user, index) => {
                if (!user) return null;
                return (
                <motion.tr
                  key={user.id || `user-row-${index}`}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  className='border-b border-[var(--card-stroke)] last:border-b-0 hover:bg-slate-50/70 transition-colors'
                >
                  <td className='px-5 py-4 text-sm text-[var(--text)]'>{user.document_number}</td>
                  <td className='px-5 py-4 text-sm font-medium text-[var(--text)]'>{user.name}</td>
                  <td className='px-5 py-4 text-sm text-[var(--text)] capitalize'>
                    {(typeof user.role === 'object' ? user.role?.name : user.role) || (user.role_id === 1 ? 'Administrador' : 'Operador')}
                  </td>
                  <td className='px-5 py-4'>
                    <div className='flex items-center gap-1'>
                      <ActionButton title='Bloquear usuario' icon={LockClosedIcon} onClick={() => {}} />
                      <ActionButton title='Editar usuario' icon={PencilSquareIcon} onClick={() => {}} />
                      <ActionButton title='Eliminar usuario' icon={TrashIcon} tone='danger' onClick={() => {}} />
                    </div>
                  </td>
                </motion.tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>

      <motion.button
        type='button'
        onClick={() => setIsModalOpen(true)}
        variants={rowVariants}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        className='fixed right-14 bottom-14 h-18 w-18 rounded-full bg-[var(--blue-buttons)] text-white shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center z-50'
        title='Agregar usuario'
        aria-label='Agregar usuario'
      >
        <PlusIcon className='h-9 w-9' strokeWidth={2.8} />
      </motion.button>

      <UserFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateUser}
        isSubmitting={isSubmitting}
      />
    </motion.section>
  )
}

export default Index
