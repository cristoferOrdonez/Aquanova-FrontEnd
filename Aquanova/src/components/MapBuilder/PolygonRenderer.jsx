import React, { memo, useMemo } from 'react';
import { STYLES } from './utils/constants';
import { calculateCentroid } from './utils/areaCalculator';
import { svgPathToVertices } from './utils/polygonBuilder';

/**
 * Componente que renderiza un polígono individual en el canvas SVG.
 *
 * @param {Object} props
 * @param {Object} props.polygon - Datos del polígono
 * @param {string} [props.polygon.id] - ID persistido del polígono
 * @param {string} [props.polygon.tempId] - ID temporal del polígono
 * @param {Array<{x: number, y: number}>} [props.polygon.vertices] - Vértices
 * @param {string} props.polygon.svgPath - Path SVG del polígono
 * @param {string} props.polygon.type - Tipo de polígono (block, lot, unassigned)
 * @param {Object} [props.polygon.metadata] - Metadata del polígono
 * @param {boolean} props.isSelected - Si el polígono está seleccionado
 * @param {boolean} props.isHovered - Si el polígono tiene hover
 * @param {Array} [props.validationErrors] - Errores de validación del polígono
 * @param {Function} props.onClick - Handler de clic
 * @param {Function} props.onMouseEnter - Handler de mouse enter
 * @param {Function} props.onMouseLeave - Handler de mouse leave
 * @param {boolean} [props.showLabel=true] - Si se muestra la etiqueta
 */
function PolygonRenderer({
  polygon,
  isSelected,
  isHovered,
  validationErrors,
  onClick,
  onMouseEnter,
  onMouseLeave,
  showLabel = true,
}) {
  const { type, svgPath, vertices } = polygon;

  // Determinar estilo según tipo y estado
  const style = useMemo(() => {
    const typeStyles = STYLES[type] || STYLES.unassigned;
    if (isSelected) return typeStyles.selected;
    if (isHovered) return typeStyles.hover;
    return typeStyles.normal;
  }, [type, isSelected, isHovered]);

  // Calcular centroide para el label
  const centroid = useMemo(() => {
    const verts = vertices || svgPathToVertices(svgPath);
    if (!verts || verts.length < 3) return null;
    return calculateCentroid(verts);
  }, [vertices, svgPath]);

  // Determinar el texto del label (código de manzana o número de predio)
  const label = useMemo(
    () => polygon.code || polygon.number || '',
    [polygon.code, polygon.number]
  );

  const hasErrors = validationErrors && validationErrors.length > 0;
  const polygonId = polygon.id;

  return (
    <g
      className="polygon-renderer"
      data-id={polygonId}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ cursor: 'pointer' }}
    >
      {/* Path principal del polígono */}
      <path
        d={svgPath}
        fill={style.fill}
        fillOpacity={style.fillOpacity}
        stroke={style.stroke}
        strokeWidth={style.strokeWidth}
      />

      {/* Overlay de error de validación */}
      {hasErrors && (
        <path
          d={svgPath}
          fill={STYLES.validation.error.fill}
          fillOpacity={STYLES.validation.error.fillOpacity}
          stroke={STYLES.validation.error.stroke}
          strokeWidth={STYLES.validation.error.strokeWidth}
          pointerEvents="none"
        />
      )}

      {/* Label en el centroide */}
      {showLabel && centroid && label && (
        <text
          x={centroid.x}
          y={centroid.y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="10"
          fontWeight="600"
          fill="#1f2937"
          pointerEvents="none"
        >
          {label}
        </text>
      )}
    </g>
  );
}

// Comparación personalizada para evitar re-renders innecesarios
function arePropsEqual(prevProps, nextProps) {
  return (
    prevProps.polygon === nextProps.polygon &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isHovered === nextProps.isHovered &&
    prevProps.showLabel === nextProps.showLabel &&
    prevProps.validationErrors === nextProps.validationErrors
  );
}

export default memo(PolygonRenderer, arePropsEqual);
