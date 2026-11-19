import React, { memo } from 'react';
import { STYLES } from './utils/constants';

/**
 * Componente que muestra indicación visual cuando el snap está activo.
 *
 * @param {Object} props
 * @param {Object|null} props.snapTarget - Objetivo del snap ({ x, y, distance }) o null
 * @param {Object} [props.cursorPosition] - Posición actual del cursor ({ x, y })
 */
function SnapIndicator({ snapTarget, cursorPosition }) {
  if (!snapTarget) return null;

  const { x, y } = snapTarget;
  const crosshairSize = 10;
  const indicatorStyle = STYLES.snap.indicator;
  const crosshairStyle = STYLES.snap.crosshair;

  return (
    <g className="snap-indicator">
      {/* Línea punteada desde cursor al snap target */}
      {cursorPosition && (
        <line
          x1={cursorPosition.x}
          y1={cursorPosition.y}
          x2={x}
          y2={y}
          stroke={crosshairStyle.stroke}
          strokeWidth={crosshairStyle.strokeWidth}
          strokeDasharray={crosshairStyle.strokeDasharray}
          pointerEvents="none"
        />
      )}

      {/* Crosshair horizontal */}
      <line
        x1={x - crosshairSize}
        y1={y}
        x2={x + crosshairSize}
        y2={y}
        stroke={crosshairStyle.stroke}
        strokeWidth={crosshairStyle.strokeWidth}
        strokeDasharray={crosshairStyle.strokeDasharray}
        pointerEvents="none"
      />

      {/* Crosshair vertical */}
      <line
        x1={x}
        y1={y - crosshairSize}
        x2={x}
        y2={y + crosshairSize}
        stroke={crosshairStyle.stroke}
        strokeWidth={crosshairStyle.strokeWidth}
        strokeDasharray={crosshairStyle.strokeDasharray}
        pointerEvents="none"
      />

      {/* Círculo indicador con animación pulse */}
      <circle
        cx={x}
        cy={y}
        r={indicatorStyle.r}
        fill={indicatorStyle.fill}
        stroke={indicatorStyle.stroke}
        strokeWidth={indicatorStyle.strokeWidth}
        pointerEvents="none"
      >
        <animate
          attributeName="r"
          values={`${indicatorStyle.r};${indicatorStyle.r + 3};${indicatorStyle.r}`}
          dur="1.2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="1;0.5;1"
          dur="1.2s"
          repeatCount="indefinite"
        />
      </circle>
    </g>
  );
}

export default memo(SnapIndicator);
