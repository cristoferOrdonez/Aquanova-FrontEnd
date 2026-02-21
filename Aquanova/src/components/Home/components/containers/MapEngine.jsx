// src/components/DigitalTwinMap/MapEngine.jsx
import React from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

const MapEngine = ({ data, onSelectLot, selectedLotId }) => {
  if (!data || !data.blocks || data.blocks.length === 0) {
    return <div className="p-4 text-gray-500">Esperando datos del mapa...</div>;
  }

  // Usamos el viewBox que viene de la BD
  const viewBox = data.viewBox || "0 0 2000 1500";

  return (
    <div className="w-full h-full bg-slate-50 relative overflow-hidden">
      <TransformWrapper
        initialScale={1}
        minScale={1} // REGLA 1: No permite hacer zoom out más allá del tamaño original (1x)
        maxScale={3} // REGLA 2: Límite de zoom in hasta 3x
        limitToBounds={true} // Evita que el usuario arrastre el mapa fuera del recuadro
        wheel={{ step: 0.1 }} // Suavidad de la rueda del ratón
        doubleClick={{ disabled: true }} // Desactivamos el doble clic para evitar conflictos al seleccionar lotes
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Controles de Zoom Flotantes */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-1 bg-white p-1.5 rounded-lg shadow-md border border-gray-200">
              <button 
                onClick={() => zoomIn()} 
                className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-200 rounded text-gray-700 text-xl font-medium transition-colors"
                title="Acercar"
              >
                +
              </button>
              <button 
                onClick={() => zoomOut()} 
                className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-200 rounded text-gray-700 text-xl font-medium transition-colors"
                title="Alejar"
              >
                -
              </button>
              <div className="w-full h-px bg-gray-200 my-1"></div>
              <button 
                onClick={() => resetTransform()} 
                className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-200 rounded text-gray-700 text-lg transition-colors"
                title="Restaurar vista"
              >
                ↺
              </button>
            </div>

            {/* Componente que envuelve al SVG para darle la física de zoom/paneo */}
            <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full">
              <svg
                viewBox={viewBox}
                className="w-full h-full cursor-grab active:cursor-grabbing"
                style={{ display: 'block' }}
              >
                {data.blocks.map((block) => (
                  <g key={block.id} className="block-group">
                    {block.lots.map((lot) => {
                      const isSelected = selectedLotId === lot.id;
                      
                      // Colores según el estado del Acueducto
                      let fillColor = '#cbd5e1'; // Gris: sin_informacion
                      if (lot.status === 'censado') fillColor = '#fde047'; // Amarillo
                      if (lot.status === 'registrado') fillColor = '#86efac'; // Verde

                      return (
                        <path
                          key={lot.id}
                          // IMPORTANTE: Asegúrate de usar la propiedad correcta que envía tu backend (path o svg_path)
                          d={lot.path || lot.svg_path} 
                          fill={fillColor}
                          stroke={isSelected ? '#2563eb' : '#64748b'} // Borde azul si está seleccionado
                          strokeWidth={isSelected ? "3" : "1"}
                          className="cursor-pointer hover:opacity-75 transition-all duration-200 outline-none"
                          onClick={() => onSelectLot(lot)}
                        />
                      );
                    })}
                  </g>
                ))}
              </svg>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
};

export default MapEngine;