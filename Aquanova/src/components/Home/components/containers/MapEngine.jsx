// src/components/DigitalTwinMap/MapEngine.jsx
import React from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

// Colores oficiales según la guía de integración frontend
const STATUS_COLORS = {
  sin_informacion: '#9E9E9E',
  censado:         '#4CAF50',
  registrado:      '#2196F3',
};

// Manzanas sembradas por el proceso legado que no tienen geometría real
const PLACEHOLDER_BLOCK_PATH = 'M0,0 Z';

function getColor(status) {
  return STATUS_COLORS[status] ?? STATUS_COLORS.sin_informacion;
}

/** Una manzana solo se dibuja si trae geometría real (no el placeholder del seed). */
function hasBlockGeometry(block) {
  const path = block?.geom_path;
  return Boolean(path) && path.trim() !== PLACEHOLDER_BLOCK_PATH;
}

function hasLotGeometry(lot) {
  return Boolean(lot?.path || lot?.svg_path);
}

/**
 * Los grosores y tamaños de fuente están en unidades del viewBox, no en píxeles:
 * un mapa de 3507 de ancho y otro de 1000 necesitan valores muy distintos para
 * verse igual. Se derivan del ancho del viewBox para que cualquier mapa creado
 * en el Map Builder se renderice con la misma proporción visual.
 */
function getScaleFromViewBox(viewBox) {
  const width = Number(String(viewBox).trim().split(/[\s,]+/)[2]);
  const safeWidth = Number.isFinite(width) && width > 0 ? width : 1000;

  return {
    blockStroke:   safeWidth / 2300,
    blockFontSize: safeWidth / 250,
  };
}

/** Contorno de la manzana. No captura clics: los predios van encima. */
const BlockOutline = React.memo(({ block, strokeWidth }) => {
  if (!hasBlockGeometry(block)) return null;

  return (
    <path
      id={`block-${block.id}`}
      d={block.geom_path}
      fill="none"
      stroke="#334155"
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
      style={{ pointerEvents: 'none' }}
    />
  );
});

/** Código de la manzana, dibujado encima de los predios para que sea legible. */
const BlockLabel = React.memo(({ block, fontSize }) => {
  const position = block?.label_position;
  const isValid = position && typeof position.x === 'number' && typeof position.y === 'number';

  if (!isValid || !block.code) return null;

  return (
    <text
      x={position.x}
      y={position.y}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={`${fontSize}px`}
      fill="#1e293b"
      stroke="#ffffff"
      strokeWidth={fontSize / 6}
      paintOrder="stroke"
      style={{ pointerEvents: 'none', userSelect: 'none', fontWeight: 'bold' }}
    >
      {block.code}
    </text>
  );
});

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
        id={`lot-${lot.id}`}
        d={svgPath}
        fill={getColor(lot.status)}
        stroke={strokeColor}
        strokeWidth={strokeW}
        strokeDasharray={strokeDash}
        className={`transition-all duration-200 ease-in-out cursor-pointer hover:brightness-110 drop-shadow-sm ${isSelected ? 'opacity-80' : 'opacity-100 hover:opacity-90'}`}
        onClick={() => onClick(lot)}
      >
        <title>{lot.display_id || lot.number || `Predio ID: ${lot.id}`}</title>
      </path>
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
    prevProps.lot.display_id === nextProps.lot.display_id &&
    prevProps.lot.topology_mismatch === nextProps.lot.topology_mismatch
  );
});

const MapEngine = ({ data, onSelectLot, selectedLots = [], transformRef }) => {
  // Home ya gestiona la carga y el error por separado: si llegamos aquí sin
  // geometría es que el barrio no tiene mapa, no que esté cargando. El mensaje
  // anterior ("Esperando datos del mapa...") hacía pasar por lentitud lo que en
  // realidad era un barrio sin manzanas guardadas.
  const blocks = data?.blocks || [];
  const hasRenderableGeometry = blocks.some(
    (block) => hasBlockGeometry(block) || (block.lots || []).some(hasLotGeometry)
  );

  if (!hasRenderableGeometry) {
    return (
      <div className="p-4 text-gray-500">
        Este barrio todavía no tiene un mapa dibujado. Créalo en el Map Builder y guárdalo.
      </div>
    );
  }

  // Usar el viewBox devuelto por el endpoint. Si no existe, calcular un default
  // basado en los paths de los lotes, o usar un viewBox seguro genérico.
  const viewBox = data.viewBox || '0 0 1000 1000';
  const { blockStroke, blockFontSize } = getScaleFromViewBox(viewBox);

  return (
    <div className="w-full h-full bg-slate-50 relative overflow-hidden">
      <TransformWrapper
        ref={transformRef}
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
                {/* Capa 1 — contornos de manzana, debajo de los predios */}
                <g>
                  {blocks.map((block) => (
                    <BlockOutline key={`block-${block.id}`} block={block} strokeWidth={blockStroke} />
                  ))}
                </g>

                {/* Capa 2 — predios */}
                <g>
                  {blocks.map((block) => (
                    <g key={block.id}>
                      {(block.lots || []).map((lot) => {
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
                </g>

                {/* Capa 3 — códigos de manzana, encima de todo */}
                <g>
                  {blocks.map((block) => (
                    <BlockLabel key={`label-${block.id}`} block={block} fontSize={blockFontSize} />
                  ))}
                </g>
              </svg>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
};

export default MapEngine;
