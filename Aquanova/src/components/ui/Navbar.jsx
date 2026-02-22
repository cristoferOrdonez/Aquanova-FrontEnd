import React, { useEffect, useState, useRef } from 'react'
import logo from './../../assets/images/logo_frog.png'
import { UserCircleIcon } from '@heroicons/react/24/outline' 
import { useNavigate, useLocation } from 'react-router-dom'
import { authService } from '../../services/authService'
import { motion } from 'framer-motion'

const navLinks = [
  { name: 'Inicio', path: '/home' },
  { name: 'Campañas', path: '/forms' },
  { name: 'Barrios', path: '/neighborhoods' },
]

const navItems = [
    {name:'Inicio', href:''},
    {name:'Campañas', href:'/'}
  ]

function Navbar() {
  const[menuOpen, setMenuOpen]= useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const user = authService.getUser()

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  useEffect(()=>{

    function onMouseDown(e) {
      if (!menuRef.current) return
    
      if (!menuRef.current.contains(e.target)) setMenuOpen(false)

    }
    
    function onKeyDown(e) {
      if (e.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }

  }, [])


  const handleMyAccount = () => {
    setMenuOpen(false)
    // entrar a la pag de mi cuenta
    console.log('Mi cuenta')
  }

  const handleLogout = () => {
    setMenuOpen(false)
    authService.logout()
    navigate('/login')
  }

  const handleMain = () => {
    // inicio
    console.log('Cerrar sesión')
  }

  return (
    <nav className='flex flex-row items-center w-full bg-(--blue-navbar) p-2 pr-10'>
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

      {/* Links centrados */}
      <div className='flex flex-1 justify-center gap-10'>
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
              {/* Subrayado: permanente si activo, animado al hover si no */}
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

      {/* Bienvenida usuario */}
      <motion.div
        className='flex items-center gap-3'
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

      {/* Menú usuario */}
      <div className='relative ml-3' ref={menuRef}>
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

        {menuOpen && (
          <motion.div
            className='absolute right-0 mt-2 w-44 rounded-md bg-white shadow-lg ring-1 ring-black/5 overflow-hidden z-50'
            role='menu'
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            <button
              type='button'
              onClick={handleMyAccount}
              className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
              role='menuitem'
            >
              Mi cuenta
            </button>

            <button
              type='button'
              onClick={handleLogout}
              className='w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100'
              role='menuitem'
            >
              Cerrar sesión
            </button>
          </motion.div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
