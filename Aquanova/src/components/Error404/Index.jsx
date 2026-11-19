import React from 'react';
import { useNavigate } from 'react-router-dom';
import mascot from '../../assets/images/logo_aquanova.png';

const Error404 = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 bg-[var(--surface-app)]">
      {/* 404 con la mascota buscando con su lupa */}
      <div className="relative mb-8 flex items-center justify-center">
        <h1 className="text-[120px] font-display font-extrabold text-[#E2E8F0] tracking-tighter sm:text-[170px] select-none">
          404
        </h1>
        {/* Mascota encima del 0 central, buscando la página perdida */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <img
              src={mascot}
              alt="La mascota de Aquanova buscando la página perdida"
              className="h-28 w-28 sm:h-36 sm:w-36 rounded-full object-cover bg-white ring-4 ring-[var(--color-accent)]/15 shadow-xl p-1"
              draggable={false}
            />
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[var(--color-accent)] text-white text-xs font-display font-bold px-3 py-1 rounded-full shadow-md whitespace-nowrap">
              ¿Dónde está?
            </span>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-display font-bold text-[var(--text-strong)] mb-4">
        Página no encontrada
      </h2>

      <p className="text-[var(--text-muted)] max-w-md mx-auto mb-8 text-sm md:text-base leading-relaxed">
        Lo sentimos, la página que estás buscando no existe, ha sido movida o está
        temporalmente inactiva. Nuestra mascota ya salió con su lupa a buscarla.
      </p>

      <button
        onClick={() => navigate('/home')}
        className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-6 py-2.5 rounded-full font-semibold hover:bg-[var(--color-primary-hover)] transition-colors shadow-sm transform hover:scale-105 duration-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Volver al inicio
      </button>
    </div>
  );
};

export default Error404;
