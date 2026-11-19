import React, { memo, useCallback, useRef, useState } from 'react';
import { POLYGON_TYPES, STYLES } from './utils/constants';

/**
 * Parsea un string de viewBox a un objeto con dimensiones.
 * @param {string} viewBox
 * @returns {{x: number, y: number, width: number, height: number}}
 */
function parseViewBox(viewBox) {
  if (!viewBox) return { x: 0, y: 0, width: 1000, height: 1000 };
  const parts = viewBox.split(/\s+/).map(Number);
  return {
    x: parts[0] || 0,
    y: parts[1] || 0,
    width: parts[2] || 1000,
    height: parts[3] || 1000,
  };
}

/**
 * Obtiene el color de fill según el tipo de polígono.
 * @param {string} type
 * @returns {string}
 */
function getFillColor(type) {
  switch (type) {
    case POLYGON_TYPES.BLOCK:
      return STYLES.block.normal.fill;
    case POLYGON_TYPES.LOT:
      return STYLES.lot.normal.fill;
    default:
      return STYLES.unassigned.normal.fill;
  }
}

/**
 * Vista miniatura para navegación rápida del canvas.
 *
 * @param {object} props
 * @param {Array} props.polygons - Todos los polígonos del mapa
 * @param {string} props.viewBox - ViewBox total del canvas (string)
 * @param {{x: number, y: number, width: number, height: number}} props.currentView - Rectángulo visible actual
 * @param {Function} props.onNavigate - Callback al hacer click/drag ({x, y})
 */
function MiniMap({ polygons, viewBox, currentView, onNavigate }) {
  const svgRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const MINIMAP_WIDTH = 200;
  const MINIMAP_HEIGHT = 150;

  const canvasBounds = parseViewBox(viewBox);

  /**
   * Convierte coordenadas de mouse en coordenadas del canvas.
   * @param {MouseEvent} e
   * @returns {{x: number, y: number}}
   */
  const getCanvasCoords = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };

    const rect = svg.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;

    return {
      x: canvasBounds.x + relX * canvasBounds.width,
      y: canvasBounds.y + relY * canvasBounds.height,
    };
  }, [canvasBounds]);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
    const coords = getCanvasCoords(e);
    onNavigate(coords);
  }, [getCanvasCoords, onNavigate]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const coords = getCanvasCoords(e);
    onNavigate(coords);
  }, [isDragging, getCanvasCoords, onNavigate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 shadow-lg overflow-hidden select-none">
      <svg
        ref={svgRef}
        width={MINIMAP_WIDTH}
        height={MINIMAP_HEIGHT}
        viewBox={viewBox || '0 0 1000 1000'}
        preserveAspectRatio="xMidYMid meet"
        className="cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Fondo */}
        <rect
          x={canvasBounds.x}
          y={canvasBounds.y}
          width={canvasBounds.width}
          height={canvasBounds.height}
          fill="#1f2937"
        />

        {/* Polígonos simplificados */}
        {polygons.map((polygon) => (
          polygon.svgPath ? (
            <path
              key={polygon.id}
              d={polygon.svgPath}
              fill={getFillColor(polygon.type)}
              fillOpacity={0.5}
              stroke={getFillColor(polygon.type)}
              strokeWidth={Math.max(1, canvasBounds.width / 500)}
              strokeOpacity={0.8}
            />
          ) : null
        ))}

        {/* Rectángulo de vista actual */}
        {currentView && (
          <rect
            x={currentView.x}
            y={currentView.y}
            width={currentView.width}
            height={currentView.height}
            fill="rgba(59, 130, 246, 0.15)"
            stroke="#3b82f6"
            strokeWidth={Math.max(1.5, canvasBounds.width / 400)}
            strokeDasharray={`${canvasBounds.width / 200} ${canvasBounds.width / 400}`}
          />
        )}
      </svg>
    </div>
  );
}

export default memo(MiniMap);
