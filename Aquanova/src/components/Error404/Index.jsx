import React from 'react';
import { useNavigate } from 'react-router-dom';

const Error404 = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <div className="relative mb-8">
        <h1 className="text-[120px] font-bold text-[#f1f5f9] tracking-tighter sm:text-[150px]">
          404
        </h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-work font-bold text-[#2138C4] drop-shadow-sm border-b-[3px] border-[#2138C4] pb-1">
            Oops!
          </span>
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-slate-800 mb-4 font-work">
        Página no encontrada
      </h2>
      
      <p className="text-slate-500 max-w-md mx-auto mb-8 text-sm md:text-base leading-relaxed">
        Lo sentimos, la página que estás buscando no existe, ha sido movida o está temporalmente inactiva.
      </p>
      
      <button
        onClick={() => navigate('/home')}
        className="flex items-center gap-2 bg-[#2138C4] text-white px-6 py-2.5 rounded-[30px] font-medium hover:bg-[#1a2d9c] transition-colors shadow-sm transform hover:scale-105 duration-200"
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