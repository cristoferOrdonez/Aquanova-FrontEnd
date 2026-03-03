import React, { useEffect, useState, useRef } from 'react'
import logo from './../../assets/images/logo_frog.png'
import { UserCircleIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useNavigate, useLocation } from 'react-router-dom'
import { authService } from '../../services/authService'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { name: 'Inicio', path: '/home' },
  { name: 'Campañas', path: '/forms' },
  { name: 'Barrios', path: '/neighborhoods' },
]

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const user = authService.getUser()

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  // Cierra el menú de usuario al hacer click fuera
  useEffect(() => {
    function onMouseDown(e) {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') { setMenuOpen(false); setMobileOpen(false) }
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  // Cierra el menú móvil al cambiar de ruta
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const handleMyAccount = () => {
    setMenuOpen(false)
    setMobileOpen(false)
    console.log('Mi cuenta')
  }

  const handleLogout = () => {
    setMenuOpen(false)
    setMobileOpen(false)
    authService.logout()
    navigate('/login')
  }

  const handleNavLink = (path) => {
    setMobileOpen(false)
    navigate(path)
  }

  return (
    <>
      <nav className='flex flex-row items-center w-full bg-(--blue-navbar) p-2 pr-4 tablet:pr-10 relative z-40'>
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <img
            src={logo}
            width={87}
            height={87}
            className='shrink-0'
            alt='Logo'
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          />
        </motion.div>

        {/* Links centrados — solo en pantallas grandes */}
        <div className='hidden tablet:flex flex-1 justify-center gap-10'>
          {navLinks.map((link, i) => {
            const active = isActive(link.path)
            return (
              <motion.button
                key={link.path}
                type='button'
                onClick={() => navigate(link.path)}
                className='relative text-xl font-bold text-white group'
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
              >
                {link.name}
                <motion.span
                  className='absolute -bottom-1 left-0 h-[2px] bg-white rounded-full'
                  initial={false}
                  animate={{ width: active ? '100%' : '0%' }}
                  transition={{ duration: 0.25 }}
                />
                {!active && (
                  <span className='absolute -bottom-1 left-0 h-[2px] w-0 bg-white/50 rounded-full transition-all duration-300 group-hover:w-full' />
                )}
              </motion.button>
            )
          })}
        </div>

        {/* Bienvenida usuario — solo en pantallas grandes */}
        <motion.div
          className='hidden tablet:flex items-center gap-3'
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {user && (
            <span className='text-white text-sm font-medium leading-tight text-right'>
              <span className='text-white/70'>Bienvenido,</span>{' '}
              <span className='font-semibold'>{user.name}</span>
              {user.role && (
                <span className='block text-xs text-white/60'>{user.role}</span>
              )}
            </span>
          )}
        </motion.div>

        {/* Menú usuario (avatar dropdown) — solo en pantallas grandes */}
        <div className='hidden tablet:block relative ml-3' ref={menuRef}>
          <motion.button
            type='button'
            onClick={() => setMenuOpen(v => !v)}
            className='inline-flex items-center justify-center rounded-full p-1 hover:bg-white/10 transition-colors'
            aria-haspopup='menu'
            aria-expanded={menuOpen}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <UserCircleIcon className='shrink-0 h-10 w-10 text-white' />
          </motion.button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                className='absolute right-0 mt-2 w-44 rounded-md bg-white shadow-lg ring-1 ring-black/5 overflow-hidden z-50'
                role='menu'
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <button type='button' onClick={handleMyAccount} className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100' role='menuitem'>
                  Mi cuenta
                </button>
                <button type='button' onClick={handleLogout} className='w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100' role='menuitem'>
                  Cerrar sesión
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Botón hamburguesa — solo en pantallas pequeñas/medianas */}
        <div className='flex tablet:hidden ml-auto'>
          <motion.button
            type='button'
            onClick={() => setMobileOpen(v => !v)}
            className='inline-flex items-center justify-center rounded-md p-2 hover:bg-white/10 transition-colors text-white'
            aria-label='Abrir menú'
            whileTap={{ scale: 0.9 }}
          >
            {mobileOpen
              ? <XMarkIcon className='h-7 w-7' />
              : <Bars3Icon className='h-7 w-7' />
            }
          </motion.button>
        </div>
      </nav>

      {/* Panel móvil */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className='fixed inset-0 bg-black/40 z-30 tablet:hidden'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              className='fixed top-0 right-0 h-full w-72 bg-[var(--blue-navbar)] shadow-2xl z-40 tablet:hidden flex flex-col'
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Cabecera del drawer */}
              <div className='flex items-center justify-between p-4 border-b border-white/20'>
                <div className='flex items-center gap-3'>
                  <UserCircleIcon className='h-10 w-10 text-white shrink-0' />
                  {user && (
                    <div className='leading-tight'>
                      <p className='text-white font-semibold text-sm'>{user.name}</p>
                      {user.role && <p className='text-white/60 text-xs'>{user.role}</p>}
                    </div>
                  )}
                </div>
                <button
                  type='button'
                  onClick={() => setMobileOpen(false)}
                  className='p-1 rounded-md hover:bg-white/10 text-white transition-colors'
                >
                  <XMarkIcon className='h-6 w-6' />
                </button>
              </div>

              {/* Links de navegación */}
              <div className='flex flex-col py-4 flex-1'>
                {navLinks.map((link, i) => {
                  const active = isActive(link.path)
                  return (
                    <motion.button
                      key={link.path}
                      type='button'
                      onClick={() => handleNavLink(link.path)}
                      className={`text-left px-6 py-3.5 text-base font-semibold transition-colors ${active ? 'text-white bg-white/15 border-l-4 border-white' : 'text-white/80 hover:text-white hover:bg-white/10 border-l-4 border-transparent'}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                    >
                      {link.name}
                    </motion.button>
                  )
                })}
              </div>

              {/* Acciones de cuenta */}
              <div className='border-t border-white/20 py-3'>
                <button type='button' onClick={handleMyAccount} className='w-full text-left px-6 py-3 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors'>
                  Mi cuenta
                </button>
                <button type='button' onClick={handleLogout} className='w-full text-left px-6 py-3 text-sm text-red-300 hover:text-red-200 hover:bg-white/10 transition-colors'>
                  Cerrar sesión
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar
