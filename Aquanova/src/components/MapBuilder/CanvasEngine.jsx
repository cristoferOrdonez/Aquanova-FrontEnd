import React, { memo, useMemo, useEffect, useRef } from 'react';
import { STYLES, TOOLS, POLYGON_TYPES } from './utils/constants';
import { verticesToSvgPath } from './utils/polygonBuilder';
import GridLayer from './GridLayer';
import PolygonRenderer from './PolygonRenderer';
import VertexHandle from './VertexHandle';
import SnapIndicator from './SnapIndicator';

/**
 * Componente principal del canvas SVG interactivo del Map Builder.
 * Compone todas las capas: grilla, polígonos, preview de dibujo,
 * vertex handles y snap indicator.
 *
 * El viewBox llega ya transformado (zoom + pan) desde useCanvasInteraction:
 * este componente no calcula la vista, sólo la pinta.
 *
 * @param {Object} props
 * @param {Object} props.state - Estado del useMapBuilder (polygons, showGrid, gridSize…)
 * @param {string} props.activeTool - Herramienta activa
 * @param {string} props.viewBox - ViewBox transformado ("x y w h")
 * @param {number} props.zoomLevel - Nivel de zoom actual (densidad de grilla)
 * @param {boolean} props.isPanning - Si el usuario está desplazando el canvas
 * @param {Array<{x: number, y: number}>} props.drawingPoints - Puntos del polígono en dibujo
 * @param {Object|null} props.previewPoint - Posición actual del cursor ({ x, y })
 * @param {Object|null} props.snapTarget - Objetivo del snap o null
 * @param {Array<string>} props.selectedIds - IDs de polígonos seleccionados
 * @param {Array} props.validationResults - Resultados de validación (planos)
 * @param {{polygonId: string, vertexIndex: number}|null} props.draggingVertex - Vértice en arrastre
 * @param {Function} props.onCanvasClick - Handler de clic en canvas
 * @param {Function} props.onCanvasMouseMove - Handler de movimiento del mouse
 * @param {Function} props.onCanvasMouseDown - Handler de mouse down
 * @param {Function} props.onCanvasMouseUp - Handler de mouse up
 * @param {Function} props.onCanvasMouseLeave - Handler de salida del cursor
 * @param {Function} props.onWheel - Handler de scroll/zoom
 * @param {Function} props.onContextMenu - Handler de menú contextual
 * @param {Function} props.onPolygonClick - Handler de clic en polígono
 * @param {Function} props.onVertexMouseDown - Inicia arrastre de vértice (e, polygonId, index)
 * @param {Function} props.onVertexDoubleClick - Elimina vértice (e, polygonId, index)
 * @param {Object} props.svgRef - React ref para el elemento SVG
 */
function CanvasEngine({
  state,
  activeTool,
  viewBox,
  zoomLevel,
  isPanning,
  drawingPoints,
  previewPoint,
  snapTarget,
  selectedIds,
  validationResults,
  draggingVertex,
  onCanvasClick,
  onCanvasMouseMove,
  onCanvasMouseDown,
  onCanvasMouseUp,
  onCanvasMouseLeave,
  onWheel,
  onContextMenu,
  onPolygonClick,
  onVertexMouseDown,
  onVertexDoubleClick,
  svgRef,
}) {
  // Cursor según herramienta activa
  const cursor = useMemo(() => {
    if (isPanning) return 'grabbing';

    switch (activeTool) {
      case TOOLS.DRAW_POLYGON:
      case TOOLS.DRAW_RECTANGLE:
        return 'crosshair';
      case TOOLS.EDIT_VERTICES:
        return 'move';
      case TOOLS.SELECT:
      default:
        return 'default';
    }
  }, [activeTool, isPanning]);

  // Separar polígonos por tipo
  const { blocks, lots, unassigned } = useMemo(() => {
    const polygons = state.polygons || [];
    return {
      blocks: polygons.filter((p) => p.type === POLYGON_TYPES.BLOCK),
      lots: polygons.filter((p) => p.type === POLYGON_TYPES.LOT),
      unassigned: polygons.filter((p) => p.type === POLYGON_TYPES.UNASSIGNED),
    };
  }, [state.polygons]);

  // Errores de validación indexados por polígono (referencia estable por render)
  const errorsByPolygon = useMemo(() => {
    const map = new Map();
    for (const result of validationResults || []) {
      if (result.severity !== 'error') continue;
      const list = map.get(result.polygonId) || [];
      list.push(result);
      map.set(result.polygonId, list);
    }
    return map;
  }, [validationResults]);

  // Polígono seleccionado para edición de vértices
  const selectedPolygon = useMemo(() => {
    if (activeTool !== TOOLS.EDIT_VERTICES || !selectedIds || selectedIds.length === 0) {
      return null;
    }
    const polygons = state.polygons || [];
    return polygons.find((p) => p.id === selectedIds[0]) || null;
  }, [activeTool, selectedIds, state.polygons]);

  // Path de preview del dibujo en progreso
  const previewPath = useMemo(() => {
    if (!drawingPoints || drawingPoints.length === 0) return '';
    const points = [...drawingPoints];
    if (previewPoint) {
      points.push(previewPoint);
    }
    return verticesToSvgPath(points).replace(' Z', '');
  }, [drawingPoints, previewPoint]);

  // Verificar si un polígono está seleccionado
  const isSelected = (polygon) => {
    if (!selectedIds) return false;
    return selectedIds.includes(polygon.id);
  };

  // Registrar wheel listener nativo (non-passive) para poder hacer preventDefault.
  // El handler vive en un ref para no re-suscribir el listener en cada render.
  const wheelHandlerRef = useRef(onWheel);
  useEffect(() => {
    wheelHandlerRef.current = onWheel;
  }, [onWheel]);

  useEffect(() => {
    const svgEl = svgRef?.current;
    if (!svgEl) return;

    const nativeWheelHandler = (e) => {
      e.preventDefault();
      wheelHandlerRef.current?.(e);
    };

    svgEl.addEventListener('wheel', nativeWheelHandler, { passive: false });
    return () => svgEl.removeEventListener('wheel', nativeWheelHandler);
  }, [svgRef]);

  return (
    <svg
      ref={svgRef}
      viewBox={viewBox}
      className="w-full h-full"
      style={{ cursor }}
      onClick={onCanvasClick}
      onMouseMove={onCanvasMouseMove}
      onMouseDown={onCanvasMouseDown}
      onMouseUp={onCanvasMouseUp}
      onMouseLeave={onCanvasMouseLeave}
      /* onWheel se maneja con listener nativo non-passive en useEffect */
      onContextMenu={onContextMenu}
    >
      {/* Capa 1: Grilla */}
      <GridLayer
        viewBox={viewBox}
        gridSize={state.gridSize || 20}
        visible={state.showGrid !== false}
        zoomLevel={zoomLevel || 1}
      />

      {/* Capa 2: Polígonos de manzanas */}
      {blocks.map((poly) => (
        <PolygonRenderer
          key={poly.id}
          polygon={poly}
          isSelected={isSelected(poly)}
          isHovered={false}
          validationErrors={errorsByPolygon.get(poly.id) || null}
          onClick={(e) => onPolygonClick?.(poly, e)}
          onMouseEnter={() => {}}
          onMouseLeave={() => {}}
          showLabel={true}
        />
      ))}

      {/* Capa 3: Polígonos de predios */}
      {lots.map((poly) => (
        <PolygonRenderer
          key={poly.id}
          polygon={poly}
          isSelected={isSelected(poly)}
          isHovered={false}
          validationErrors={errorsByPolygon.get(poly.id) || null}
          onClick={(e) => onPolygonClick?.(poly, e)}
          onMouseEnter={() => {}}
          onMouseLeave={() => {}}
          showLabel={true}
        />
      ))}

      {/* Capa 4: Sin asignar */}
      {unassigned.map((poly) => (
        <PolygonRenderer
          key={poly.id}
          polygon={poly}
          isSelected={isSelected(poly)}
          isHovered={false}
          validationErrors={errorsByPolygon.get(poly.id) || null}
          onClick={(e) => onPolygonClick?.(poly, e)}
          onMouseEnter={() => {}}
          onMouseLeave={() => {}}
          showLabel={true}
        />
      ))}

      {/* Capa 5: Preview de dibujo */}
      {drawingPoints && drawingPoints.length > 0 && (
        <g className="drawing-preview">
          {/* Path de preview */}
          <path
            d={previewPath}
            fill={STYLES.drawing.preview.fill}
            fillOpacity={STYLES.drawing.preview.fillOpacity}
            stroke={STYLES.drawing.preview.stroke}
            strokeWidth={STYLES.drawing.preview.strokeWidth}
            strokeDasharray={STYLES.drawing.preview.strokeDasharray}
            pointerEvents="none"
          />

          {/* Puntos de dibujo */}
          {drawingPoints.map((p, i) => (
            <circle
              key={`draw-point-${i}`}
              cx={p.x}
              cy={p.y}
              r={i === 0 ? STYLES.drawing.firstPoint.r : STYLES.drawing.point.r}
              fill={i === 0 ? STYLES.drawing.firstPoint.fill : STYLES.drawing.point.fill}
              stroke={i === 0 ? STYLES.drawing.firstPoint.stroke : STYLES.drawing.point.stroke}
              strokeWidth={
                i === 0 ? STYLES.drawing.firstPoint.strokeWidth : STYLES.drawing.point.strokeWidth
              }
              pointerEvents="none"
            />
          ))}

          {/* Línea desde último punto al cursor */}
          {previewPoint && drawingPoints.length > 0 && (
            <line
              x1={drawingPoints[drawingPoints.length - 1].x}
              y1={drawingPoints[drawingPoints.length - 1].y}
              x2={previewPoint.x}
              y2={previewPoint.y}
              stroke={STYLES.drawing.preview.stroke}
              strokeWidth={STYLES.drawing.preview.strokeWidth}
              strokeDasharray={STYLES.drawing.preview.strokeDasharray}
              pointerEvents="none"
            />
          )}
        </g>
      )}

      {/* Capa 6: Vertex handles (modo edición) */}
      {activeTool === TOOLS.EDIT_VERTICES && selectedPolygon && selectedPolygon.vertices && (
        <g className="vertex-handles">
          {selectedPolygon.vertices.map((v, i) => (
            <VertexHandle
              key={`vertex-${i}`}
              x={v.x}
              y={v.y}
              index={i}
              isHovered={false}
              isDragging={
                draggingVertex?.polygonId === selectedPolygon.id &&
                draggingVertex?.vertexIndex === i
              }
              onMouseDown={(e) => onVertexMouseDown?.(e, selectedPolygon.id, i)}
              onDoubleClick={(e) => onVertexDoubleClick?.(e, selectedPolygon.id, i)}
            />
          ))}
        </g>
      )}

      {/* Capa 7: Snap indicator */}
      <SnapIndicator snapTarget={snapTarget} cursorPosition={previewPoint} />
    </svg>
  );
}

export default memo(CanvasEngine);
