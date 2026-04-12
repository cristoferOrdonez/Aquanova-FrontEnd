// src/components/mapa/MapLegend.jsx
import React from 'react';

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

const MapLegend = () => (
  <div className="bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-200 flex flex-col gap-4">
    {/* Estado Catastral */}
    <div>
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
);

export default MapLegend;