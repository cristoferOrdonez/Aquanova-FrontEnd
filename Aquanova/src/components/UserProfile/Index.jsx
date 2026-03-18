import { UserCircleIcon, IdentificationIcon, ShieldCheckIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline'
import { authService } from '../../services/authService'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: 'easeOut',
      when: 'beforeChildren',
      staggerChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: 'easeOut' },
  },
}

function UserInfoRow({ icon: Icon, label, value }) {
  return (
    <motion.div
      variants={itemVariants}
      className='flex items-start gap-3 rounded-2xl border border-[var(--card-stroke)] bg-[var(--card-bg)] p-4 shadow-sm'
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
    >
      <Icon className='h-6 w-6 text-[var(--blue-buttons)] shrink-0 mt-0.5' />
      <div className='min-w-0'>
        <p className='text-xs font-semibold uppercase tracking-wide text-[var(--gray-subtitles)]'>{label}</p>
        <p className='text-base font-semibold text-[var(--text)] break-words'>{value || 'No disponible'}</p>
      </div>
    </motion.div>
  )
}

function Index() {
  const navigate = useNavigate()
  const user = authService.getUser() || {}

  const fullName = user.name || user.full_name || user.fullName
  const document = user.document_number || user.document || user.documentNumber
  const role = user.role
  const email = user.email || 'No registrado'
  const phone = user.phone || 'No registrado'

  return (
    <motion.section
      variants={containerVariants}
      initial='hidden'
      animate='visible'
      className='w-full max-w-4xl mx-auto font-work'
    >
      <div className='rounded-2xl border border-[var(--card-stroke)] bg-[var(--card-bg)] overflow-hidden shadow-sm'>
        <motion.header variants={itemVariants} className='bg-[var(--blue-navbar)] px-6 py-5 text-white'>
          <h1 className='text-2xl font-bold'>Informacion del usuario</h1>
          <p className='text-sm text-white/80 mt-1'>Consulta los datos principales de tu cuenta.</p>
        </motion.header>

        <div className='p-4 sm:p-6 grid gap-4'>
          <UserInfoRow icon={UserCircleIcon} label='Nombre completo' value={fullName} />
          <UserInfoRow icon={IdentificationIcon} label='Documento' value={document} />
          <UserInfoRow icon={EnvelopeIcon} label='Correo' value={email} />
          <UserInfoRow icon={PhoneIcon} label='Teléfono' value={phone} />
          <UserInfoRow icon={ShieldCheckIcon} label='Rol' value={role} />

          <motion.div variants={itemVariants} className='pt-2'>
            <button
              type='button'
              onClick={() => navigate('/user-management')}
              className='w-full sm:w-auto rounded-full bg-[var(--blue-buttons)] px-6 py-3 text-white font-semibold shadow-sm hover:bg-blue-600 transition-colors'
            >
              Acceder a gestion de usuarios
            </button>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}

export default Index
