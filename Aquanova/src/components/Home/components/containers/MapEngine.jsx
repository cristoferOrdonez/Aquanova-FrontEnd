// src/components/DigitalTwinMap/MapEngine.jsx
import React from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

// Colores oficiales según la guía de integración frontend
const STATUS_COLORS = {
  sin_informacion: '#9E9E9E',
  censado:         '#2196F3',
  registrado:      '#4CAF50',
};

// Colores según el estado físico u ocupacional del predio
const PROPERTY_STATE_COLORS = {
  // Estados originales
  'Predio Demolido': '#EF4444',        // Rojo
  'Predio Solo (Habitado)': '#8B5CF6', // Morado
  'Predio Desocupado': '#F59E0B',      // Ambar
  'Predio en Obra': '#06B6D4',         // Cyan
  // Nuevos estados añadidos
  'Predio solo': '#1E3A8A',                                // Azul oscuro
  'Predio para vincular': '#EC4899',                       // Rosado
  'Predio sin construir (solo)': '#10B981',                // Verde
  'Lote en construcción o en obras': '#F97316',            // Naranja
  'Lote con cuenta contrato - vinculado': '#EAB308',       // Amarillo
};

function getColor(lot) {
  if (lot.property_state && PROPERTY_STATE_COLORS[lot.property_state]) {
    return PROPERTY_STATE_COLORS[lot.property_state];
  }
  return STATUS_COLORS[lot.status] ?? STATUS_COLORS.sin_informacion;
}

const LotPolygon = React.memo(({ lot, isSelected, onClick }) => {
  // Soportar tanto 'path' (propiedad local del frontend) como 'svg_path' (del backend)
  const svgPath = lot.path || lot.svg_path;

  // Si no hay path válido, no renderizar este lote (evita huecos o errores SVG)
  if (!svgPath) return null;

  // Estilo de auditoría topológica: lotes mal asignados tienen borde naranja punteado
  const hasMismatch = lot.topology_mismatch === true;
  const strokeColor = hasMismatch ? '#F97316' : (isSelected ? '#FBBF24' : '#ffffff');
  const strokeW = (hasMismatch || isSelected) ? 2 : 0.3;
  const strokeDash = hasMismatch ? '3,2' : undefined;

  return (
    <>
      <path
        d={svgPath}
        fill={getColor(lot)}
        stroke={strokeColor}
        strokeWidth={strokeW}
        strokeDasharray={strokeDash}
        opacity={isSelected ? 0.75 : 1}
        style={{ cursor: 'pointer', transition: 'all 0.15s' }}
        onClick={() => onClick(lot)}
      />
      {lot.centroid && typeof lot.centroid.x === 'number' && typeof lot.centroid.y === 'number' && (
        <text
          x={lot.centroid.x}
          y={lot.centroid.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="4px"
          fill="#ffffff"
          style={{ pointerEvents: 'none', userSelect: 'none', fontWeight: 'bold' }}
        >
          {lot.display_id || lot.number?.replace('Lote-', '')}{hasMismatch ? ' ⚠' : ''}
        </text>
      )}
    </>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.isSelected === nextProps.isSelected &&
    (prevProps.lot.path || prevProps.lot.svg_path) === (nextProps.lot.path || nextProps.lot.svg_path) &&
    prevProps.lot.status === nextProps.lot.status &&
    prevProps.lot.property_state === nextProps.lot.property_state &&
    prevProps.lot.display_id === nextProps.lot.display_id &&
    prevProps.lot.topology_mismatch === nextProps.lot.topology_mismatch
  );
});

const MapEngine = ({ data, onSelectLot, selectedLots = [] }) => {
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
        maxScale={20}
        limitToBounds={false}
        wheel={{ step: 0.1 }}
        doubleClick={{ disabled: true }}
        disablePadding={true}
        centerZoomedOut={false}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Controles de Zoom Flotantes */}
            <div className="absolute top-4 right-4 z-10 hidden sm:flex flex-col gap-1 bg-white p-1.5 rounded-lg shadow-md border border-gray-200">
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
                    {block.lots.map((lot) => {
                      const isSelected = selectedLots.some(l => l.id === lot.id);
                      return (
                        <LotPolygon
                          key={lot.id}
                          lot={lot}
                          isSelected={isSelected}
                          onClick={onSelectLot}
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