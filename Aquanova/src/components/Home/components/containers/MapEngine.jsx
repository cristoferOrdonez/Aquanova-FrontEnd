// src/components/DigitalTwinMap/MapEngine.jsx
import React from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

// Colores oficiales según la guía de integración frontend
const STATUS_COLORS = {
  sin_informacion: '#9E9E9E',
  censado:         '#2196F3',
  registrado:      '#4CAF50',
};

function getColor(status) {
  return STATUS_COLORS[status] ?? STATUS_COLORS.sin_informacion;
}

const MapEngine = ({ data, onSelectLot, selectedLotId }) => {
  if (!data || !data.blocks || data.blocks.length === 0) {
    return <div className="p-4 text-gray-500">Esperando datos del mapa...</div>;
  }

  // Usar siempre el viewBox devuelto por el endpoint — nunca hardcodearlo
  const viewBox = data.viewBox;

  return (
    <div className="w-full h-full bg-slate-50 relative overflow-hidden">
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={8}
        limitToBounds={false}
        wheel={{ step: 0.1 }}
        doubleClick={{ disabled: true }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Controles de Zoom Flotantes */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-1 bg-white p-1.5 rounded-lg shadow-md border border-gray-200">
              <button
                onClick={() => zoomIn()}
                className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-200 rounded text-gray-700 text-xl font-medium transition-colors"
                title="Acercar"
              >+</button>
              <button
                onClick={() => zoomOut()}
                className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-200 rounded text-gray-700 text-xl font-medium transition-colors"
                title="Alejar"
              >-</button>
              <div className="w-full h-px bg-gray-200 my-1" />
              <button
                onClick={() => resetTransform()}
                className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-200 rounded text-gray-700 text-lg transition-colors"
                title="Restaurar vista"
              >↺</button>
            </div>

            <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full">
              <svg
                viewBox={viewBox}
                width="100%"
                height="100%"
                className="cursor-grab active:cursor-grabbing"
                style={{ display: 'block', background: '#f0f0f0' }}
              >
                {data.blocks.map((block) => (
                  <g key={block.id}>
                    {/* Predios del bloque */}
                    {block.lots.map((lot) => {
                      const isSelected = selectedLotId === lot.id;
                      return (
                        <path
                          key={lot.id}
                          d={lot.path}
                          fill={getColor(lot.status)}
                          stroke={isSelected ? '#1565C0' : '#ffffff'}
                          strokeWidth={isSelected ? 0.8 : 0.3}
                          opacity={isSelected ? 0.75 : 1}
                          style={{ cursor: 'pointer', transition: 'opacity 0.15s' }}
                          onClick={() => onSelectLot(lot)}
                        />
                      );
                    })}

                    {/* Número del lote en el centroide — fontSize en unidades SVG */}
                    {block.lots.map((lot) =>
                      lot.centroid ? (
                        <text
                          key={`label-${lot.id}`}
                          x={lot.centroid.x}
                          y={lot.centroid.y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="1.5"
                          fill="#ffffff"
                          style={{ pointerEvents: 'none', userSelect: 'none' }}
                        >
                          {lot.number.replace('Lote-', '')}
                        </text>
                      ) : null
                    )}
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