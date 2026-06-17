import React from 'react';

function LotSidePanel({ lot, onSave, onDeselect, onCenterMap }) {
  if (!lot) {
    return (
      <div className="p-6 text-center text-gray-500 flex flex-col items-center justify-center h-full">
        <span className="text-4xl mb-2">🗺</span>
        <p className="text-sm">Selecciona un predio en el plano para ver su información catastral y de censo.</p>
      </div>
    );
  }

  const { censusData } = lot;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Cabecera del Panel */}
      <div className="p-4 border-b border-gray-200 bg-slate-50 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Predio {lot.display_id}</h3>
          <p className="text-xs text-gray-500 break-all">ID Físico: {lot.id}</p>
        </div>
        <button 
          onClick={onDeselect}
          className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Contenido con scroll */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        
        {/* Acciones Rápidas */}
        <button
          onClick={() => onCenterMap(lot.id)}
          className="w-full py-2 px-3 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
        >
          🔍 Centrar en el Mapa
        </button>

        {/* Información Técnica */}
        <div className="bg-slate-50 p-3 rounded-lg border border-gray-100 space-y-2">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Detalles Físicos</h4>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
            <div>
              <p className="text-xs text-gray-400">Área Estimada</p>
              <p className="font-semibold">{lot.area_m2 ? `${lot.area_m2} m²` : 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Manzana</p>
              <p className="font-semibold">{lot.block_code || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Medidor / Registro</p>
              <p className="font-semibold text-blue-600 font-mono">{lot.water_meter_code || 'No registra'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Dirección</p>
              <p className="font-semibold text-xs truncate" title={lot.direccion_fisica}>{lot.direccion_fisica || 'No asignada'}</p>
            </div>
          </div>
        </div>

        {/* Datos de Campo del Censo (Si existen) */}
        {censusData ? (
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-3">
              <h4 className="text-sm font-bold text-gray-800">Información del Censo</h4>
              <p className="text-xs text-gray-500">Censado el {censusData.fechaCreacion}</p>
            </div>

            {/* Imagen de la Fachada */}
            {censusData.fotoFachada && (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-gray-400">Foto de Fachada</span>
                <div className="rounded-lg overflow-hidden border border-gray-200">
                  <img 
                    src={censusData.fotoFachada.split(';')[0]} // Toma la primera foto si hay varias separadas por punto y coma
                    alt="Fachada del predio"
                    className="w-full h-40 object-cover hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                  />
                </div>
              </div>
            )}

            {/* Grid de Respuestas del Censo */}
            <div className="grid grid-cols-2 gap-3 text-xs text-gray-700 bg-slate-50 p-3 rounded-lg border border-gray-100">
              <div>
                <p className="text-gray-400">Clase de Uso</p>
                <p className="font-semibold">{censusData.claseUso || 'No Especificado'}</p>
              </div>
              <div>
                <p className="text-gray-400">Estado del Predio</p>
                <p className="font-semibold">{censusData.estadoPredio}</p>
              </div>
              <div>
                <p className="text-gray-400">Habitantes / Familias</p>
                <p className="font-semibold">{censusData.habitantes || 0} Hab / {censusData.familias || 0} Fam</p>
              </div>
              <div>
                <p className="text-gray-400">Servicio de Agua</p>
                <p className={`font-semibold ${censusData.tieneAgua === 'Sí' ? 'text-green-600' : 'text-red-600'}`}>
                  {censusData.tieneAgua === 'Sí' ? `Sí (${censusData.horasAgua} hrs)` : 'No'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-400">Atendió Visita</p>
                <p className="font-semibold">{censusData.atendioNombre} ({censusData.atendioRol})</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-400">Inspector</p>
                <p className="font-semibold text-gray-600">{censusData.inspector}</p>
              </div>
            </div>

            {/* Observaciones */}
            {censusData.observaciones && (
              <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-100 text-xs">
                <p className="font-bold text-amber-800 mb-1">Observaciones de Campo</p>
                <p className="text-gray-600 italic leading-relaxed">"{censusData.observaciones}"</p>
              </div>
            )}

            {/* Firma Digital */}
            {censusData.firma && (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-gray-400">Firma Registrada</span>
                <div className="bg-white p-2 rounded-lg border border-gray-200 flex justify-center">
                  <img 
                    src={censusData.firma} 
                    alt="Firma del ciudadano"
                    className="h-16 object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
            <p className="text-xs text-amber-700 font-semibold">Predio sin censo asociado</p>
            <p className="text-[11px] text-amber-600 mt-1">Este predio aún no cuenta con respuestas del censo demográfico en la base de datos.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default LotSidePanel;