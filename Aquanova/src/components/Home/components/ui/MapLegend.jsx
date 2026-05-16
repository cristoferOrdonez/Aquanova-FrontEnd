// src/components/mapa/MapLegend.jsx
import React, { useState } from 'react';

// Colores oficiales según la guía de integración frontend
const ITEMS_CATASTRALES = [
  { label: 'Registrado',      hex: '#4CAF50' },
  { label: 'Censado',         hex: '#2196F3' },
  { label: 'Sin Información', hex: '#9E9E9E' },
];

const ITEMS_ESTADO_PREDIO = [
  // Estados originales
  { label: 'Predio Demolido',        hex: '#EF4444' }, // Rojo
  { label: 'Predio Solo (Habitado)', hex: '#8B5CF6' }, // Morado
  { label: 'Predio Desocupado',      hex: '#F59E0B' }, // Ambar
  { label: 'Predio en Obra',         hex: '#06B6D4' }, // Cyan
  // Nuevos estados
  { label: 'Predio solo',                         hex: '#1E3A8A' }, // Azul oscuro
  { label: 'Predio para vincular',                hex: '#EC4899' }, // Rosado
  { label: 'Predio sin construir (solo)',         hex: '#10B981' }, // Verde
  { label: 'Lote en construcción o en obras',     hex: '#F97316' }, // Naranja
  { label: 'Lote con cuenta contrato - vinculado',hex: '#EAB308' }, // Amarillo
];

const MapLegend = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Cabecera del Acordeón para Móvil */}
      <div 
        className="p-4 flex justify-between items-center cursor-pointer md:cursor-default"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          Leyenda del Mapa
        </h2>
        <button 
          className="md:hidden text-gray-500 hover:text-gray-700 transition-transform"
          style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Contenido (oculto en móvil si no está expandido) */}
      <div className={`px-4 pb-4 flex-col gap-4 md:flex ${isExpanded ? 'flex' : 'hidden'}`}>
        {/* Estado Catastral */}
        <div className="mt-2 md:mt-0">
          <h3 className="font-bold text-gray-700 mb-3 text-xs uppercase tracking-wider border-b pb-2">Estado Catastral</h3>
          <div className="space-y-2">
            {ITEMS_CATASTRALES.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-sm shadow-sm border border-black/10 shrink-0"
                  style={{ backgroundColor: item.hex }}
                />
                <span className="text-xs text-gray-700 font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Estado Físico del Predio */}
        <div>
          <h3 className="font-bold text-gray-700 mb-3 text-xs uppercase tracking-wider border-b pb-2">Estado del Predio</h3>
          <div className="space-y-2">
            {ITEMS_ESTADO_PREDIO.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-sm shadow-sm border border-black/10 shrink-0"
                  style={{ backgroundColor: item.hex }}
                />
                <span className="text-xs text-gray-700 font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapLegend;