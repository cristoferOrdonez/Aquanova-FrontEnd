// src/components/mapa/MapTooltip.jsx
import React from 'react';

const formatStatus = (status) => {
  if (!status) return 'Desconocido';
  // Reemplaza guiones bajos por espacios y capitaliza
  return status.replace(/_/g, ' ').toUpperCase();
};

const MapTooltip = ({ lot, onClose, onAction }) => {
  if (!lot) return null;

  // Estilos de badge según estado
  const statusBadgeColor = {
    registrado: "bg-emerald-100 text-emerald-800 border-emerald-200",
    censado: "bg-orange-100 text-orange-800 border-orange-200",
    sin_informacion: "bg-gray-100 text-gray-600 border-gray-200"
  }[lot.status] || "bg-gray-100";

  return (
    <div className="absolute top-0 right-0 h-full w-80 bg-white shadow-2xl border-l border-gray-200 p-0 flex flex-col transform transition-transform duration-300 z-20">
      
      {/* Header Estilizado */}
      <div className="bg-slate-800 text-white p-6">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Ficha Técnica</h3>
                <h2 className="text-3xl font-bold">Lote {lot.number}</h2>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">✕</button>
        </div>
        <div className={`mt-4 inline-flex px-3 py-1 rounded text-xs font-bold border ${statusBadgeColor}`}>
            {formatStatus(lot.status)}
        </div>
      </div>

      {/* Cuerpo de Datos */}
      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        
        {/* Sección Medidor */}
        <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-50 rounded text-blue-600">
                💧 {/* Icono simple */}
            </div>
            <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Medidor Acueducto</p>
                <p className="font-mono text-lg font-semibold text-gray-800">
                    {lot.water_meter_code || "NO REGISTRADO"}
                </p>
            </div>
        </div>

        {/* Sección Dirección */}
        <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-50 rounded text-slate-600">
                📍
            </div>
            <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Dirección / Ubicación</p>
                <p className="text-sm font-medium text-gray-700">
                    {lot.address || "Sin nomenclatura"}
                </p>
            </div>
        </div>

        {/* Sección Área */}
        <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
             <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Área Total</p>
                <p className="text-xl font-bold text-gray-800">{lot.area_m2} <span className="text-sm font-normal">m²</span></p>
             </div>
             {/* Espacio para ID Catastral futuro */}
             <div>
                <p className="text-xs text-gray-500 uppercase font-bold">ID Interno</p>
                <p className="text-sm font-mono text-gray-600 truncate">{lot.id}</p>
             </div>
        </div>
      </div>

      {/* Footer Acciones */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <button 
          onClick={() => onAction(lot)}
          className="w-full bg-blue-600 text-white py-3 rounded shadow hover:bg-blue-700 transition-all font-medium flex justify-center items-center gap-2"
        >
          <span>✏️</span> Editar Registro
        </button>
      </div>
    </div>
  );
};

export default MapTooltip;