import React, { useEffect, useState, useRef } from 'react'
import logo from './../../assets/images/logo_frog.png'
import { UserCircleIcon } from '@heroicons/react/24/outline' 
import { useNavigate } from 'react-router-dom'

const navItems = [
    {name:'Inicio', href:''},
    {name:'Campañas', href:'/'}
  ]

function Navbar() {
  const[menuOpen, setMenuOpen]= useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()

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
    // cerrar sesion
    console.log('Cerrar sesión')
  }

  const handleMain = () => {
    // inicio
    console.log('Cerrar sesión')
  }

  return (
    <nav className='flex flex-row items-center w-full bg-(--blue-navbar) p-2 gap-10 pr-10'>
      <div>
        <img
          src={logo}
          width={87}
          height={87}
          className='shrink-0 '
          alt='Logo'
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer' }}
        />
      </div>

      <div className='flex flex-1 gap-10'>
        <button
          type='button'
          onClick={() => navigate('/')}
          className='text-xl text-bold text-white hover:opacity-80 transition-opacity'
        >
          Inicio
        </button>
        <button
          type='button'
          onClick={() => navigate('/')}
          className='text-xl text-bold text-white hover:opacity-80 transition-opacity'
        >
          Campañas
        </button>
        <button
          type='button'
          onClick={() => navigate('/neighborhoods')}
          className='text-xl text-bold text-white hover:opacity-80 transition-opacity'
        >
          Barrios
        </button>
      </div>



      <div className='relative' ref={menuRef}>

      
        <button
          type='button'
          onClick={() => setMenuOpen(v => !v)}
          className='inline-flex items-center justify-center rounded-full p-1 hover:bg-white/10 transition-colors'
          aria-haspopup='menu'
          aria-expanded={menuOpen}
        >
          <UserCircleIcon className='shrink-0 h-10 w-10 text-white' />
        </button>

        {menuOpen && (
          <div
            className='absolute right-0 mt-2 w-44 rounded-md bg-white shadow-lg ring-1 ring-black/5 overflow-hidden z-50'
            role='menu'
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
              onClick={handleLogout} // CAMBIO 13.1: cierra y ejecuta acción
              className='w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100'
              role='menuitem'
            >
              Cerrar sesión
            </button>
          </div>
        )}

      </div>
      

    </nav>
  )
}

export default Navbar