import React, { memo, useMemo } from 'react';
import { STYLES } from './utils/constants';

/**
 * Componente para un handle de vértice draggable en el canvas SVG.
 *
 * @param {Object} props
 * @param {number} props.x - Posición X del vértice
 * @param {number} props.y - Posición Y del vértice
 * @param {number} props.index - Índice del vértice en el polígono
 * @param {boolean} props.isHovered - Si el handle tiene hover
 * @param {boolean} props.isDragging - Si el handle está siendo arrastrado
 * @param {Function} props.onMouseDown - Handler para iniciar drag
 * @param {Function} props.onDoubleClick - Handler para eliminar vértice
 */
function VertexHandle({ x, y, index, isHovered, isDragging, onMouseDown, onDoubleClick }) {
  const style = useMemo(() => {
    if (isDragging) return STYLES.vertex.dragging;
    if (isHovered) return STYLES.vertex.hover;
    return STYLES.vertex.normal;
  }, [isHovered, isDragging]);

  return (
    <circle
      cx={x}
      cy={y}
      r={style.r}
      fill={style.fill}
      stroke={style.stroke}
      strokeWidth={style.strokeWidth}
      style={{ cursor: 'move' }}
      data-index={index}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
    />
  );
}

export default memo(VertexHandle);
