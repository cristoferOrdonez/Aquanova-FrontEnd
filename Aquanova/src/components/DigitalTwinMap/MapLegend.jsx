// src/components/mapa/MapLegend.jsx
import React from 'react';

const MapLegend = () => {
  const items = [
    { label: 'Registrado', color: 'bg-emerald-500' },
    { label: 'Censado', color: 'bg-orange-400' },
    { label: 'Sin Información', color: 'bg-gray-300' },
  ];

  return (
    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-200 z-10">
      <h3 className="font-bold text-gray-700 mb-3 text-xs uppercase tracking-wider border-b pb-2">Estado Catastral</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-sm shadow-sm border border-black/10 ${item.color}`} />
            <span className="text-xs text-gray-700 font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapLegend;