import React, { memo, useMemo } from 'react';
import { STYLES, MAP_BUILDER_CONFIG } from './utils/constants';

/**
 * Componente SVG que renderiza la grilla de referencia del canvas.
 *
 * @param {Object} props
 * @param {string} props.viewBox - ViewBox actual del SVG (formato "x y w h")
 * @param {number} [props.gridSize=20] - Espaciado entre líneas de grilla (px)
 * @param {boolean} props.visible - Si la grilla es visible
 * @param {number} props.zoomLevel - Nivel de zoom actual (para adaptar densidad)
 */
function GridLayer({ viewBox, gridSize = MAP_BUILDER_CONFIG.DEFAULT_GRID_SIZE, visible, zoomLevel }) {
  const { minorLines, majorLines } = useMemo(() => {
    if (!viewBox || !visible) return { minorLines: [], majorLines: [] };

    const [vx, vy, vw, vh] = viewBox.split(' ').map(Number);
    const subdivisions = MAP_BUILDER_CONFIG.GRID_SUBDIVISIONS;

    // Calcular límites visibles con margen
    const startX = Math.floor(vx / gridSize) * gridSize;
    const endX = Math.ceil((vx + vw) / gridSize) * gridSize;
    const startY = Math.floor(vy / gridSize) * gridSize;
    const endY = Math.ceil((vy + vh) / gridSize) * gridSize;

    const minor = [];
    const major = [];
    const hideMinor = zoomLevel < 0.5;

    // Líneas verticales
    for (let x = startX; x <= endX; x += gridSize) {
      const gridIndex = Math.round(x / gridSize);
      const isMajor = gridIndex % subdivisions === 0;

      if (isMajor) {
        major.push(
          <line
            key={`v-major-${x}`}
            x1={x}
            y1={vy}
            x2={x}
            y2={vy + vh}
            stroke={STYLES.grid.major.stroke}
            strokeWidth={STYLES.grid.major.strokeWidth}
          />
        );
      } else if (!hideMinor) {
        minor.push(
          <line
            key={`v-minor-${x}`}
            x1={x}
            y1={vy}
            x2={x}
            y2={vy + vh}
            stroke={STYLES.grid.minor.stroke}
            strokeWidth={STYLES.grid.minor.strokeWidth}
          />
        );
      }
    }

    // Líneas horizontales
    for (let y = startY; y <= endY; y += gridSize) {
      const gridIndex = Math.round(y / gridSize);
      const isMajor = gridIndex % subdivisions === 0;

      if (isMajor) {
        major.push(
          <line
            key={`h-major-${y}`}
            x1={vx}
            y1={y}
            x2={vx + vw}
            y2={y}
            stroke={STYLES.grid.major.stroke}
            strokeWidth={STYLES.grid.major.strokeWidth}
          />
        );
      } else if (!hideMinor) {
        minor.push(
          <line
            key={`h-minor-${y}`}
            x1={vx}
            y1={y}
            x2={vx + vw}
            y2={y}
            stroke={STYLES.grid.minor.stroke}
            strokeWidth={STYLES.grid.minor.strokeWidth}
          />
        );
      }
    }

    return { minorLines: minor, majorLines: major };
  }, [viewBox, gridSize, visible, zoomLevel]);

  return (
    <g className="grid-layer" opacity={visible ? 0.5 : 0}>
      {/* Líneas menores */}
      {minorLines}
      {/* Líneas mayores */}
      {majorLines}
    </g>
  );
}

export default memo(GridLayer);
