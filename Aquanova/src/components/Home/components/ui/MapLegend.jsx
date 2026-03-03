// src/components/mapa/MapLegend.jsx
import React from 'react';

// Colores oficiales según la guía de integración frontend
const items = [
  { label: 'Registrado',      hex: '#4CAF50' },
  { label: 'Censado',         hex: '#2196F3' },
  { label: 'Sin Información', hex: '#9E9E9E' },
];

const MapLegend = () => (
  <div className="bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-200">
    <h3 className="font-bold text-gray-700 mb-3 text-xs uppercase tracking-wider border-b pb-2">Estado Catastral</h3>
    <div className="space-y-2">
      {items.map((item) => (
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
);

export default MapLegend;