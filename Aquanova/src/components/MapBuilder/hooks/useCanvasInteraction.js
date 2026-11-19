import { useState, useCallback, useMemo, useRef } from 'react';
import { MAP_BUILDER_CONFIG } from '../utils/constants';
import { calculateBoundingBox } from '../utils/areaCalculator';

/**
 * Parsea un viewBox "x y w h" a objeto, con defaults seguros.
 *
 * @param {string} viewBox
 * @returns {{x: number, y: number, width: number, height: number}}
 */
function parseViewBox(viewBox) {
  const parts = String(viewBox || MAP_BUILDER_CONFIG.DEFAULT_VIEWBOX)
    .trim()
    .split(/\s+/)
    .map(Number);

  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n)) || !parts[2] || !parts[3]) {
    return { x: 0, y: 0, width: 1000, height: 1000 };
  }

  return { x: parts[0], y: parts[1], width: parts[2], height: parts[3] };
}

const clampZoom = (zoom) =>
  Math.min(MAP_BUILDER_CONFIG.MAX_ZOOM, Math.max(MAP_BUILDER_CONFIG.MIN_ZOOM, zoom));

/**
 * Hook que gestiona zoom, pan y conversión de coordenadas del canvas SVG.
 *
 * Es la ÚNICA fuente de verdad de la vista: el reducer NO guarda zoom ni pan.
 * `panOffset` se expresa en unidades SVG y desplaza el origen del viewBox, de
 * modo que el rectángulo visible siempre es:
 *   x = base.x + panOffset.x   w = base.width  / zoom
 *   y = base.y + panOffset.y   h = base.height / zoom
 *
 * @param {string} baseViewBox - ViewBox base del mapa (ej: "0 0 1000 1000")
 * @returns {{
 *   zoomLevel: number,
 *   panOffset: {x: number, y: number},
 *   isPanning: boolean,
 *   viewRect: {x: number, y: number, width: number, height: number},
 *   transformedViewBox: string,
 *   handleWheel: (e: WheelEvent) => void,
 *   zoomTo: (nextZoom: number, anchor?: {x: number, y: number}) => void,
 *   zoomIn: () => void,
 *   zoomOut: () => void,
 *   handlePanStart: (e: MouseEvent) => void,
 *   handlePanMove: (e: MouseEvent) => void,
 *   handlePanEnd: () => void,
 *   centerOn: (point: {x: number, y: number}) => void,
 *   fitToContent: (polygons: Array) => void,
 *   resetView: () => void,
 *   screenToSvg: (event: MouseEvent, svgElement?: SVGSVGElement) => {x: number, y: number}|null,
 * }}
 */
export const useCanvasInteraction = (baseViewBox) => {
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0, scaleX: 1, scaleY: 1 });
  const panOriginRef = useRef({ x: 0, y: 0 });

  const base = useMemo(() => parseViewBox(baseViewBox), [baseViewBox]);

  /** Rectángulo visible actual, en unidades SVG. */
  const viewRect = useMemo(() => ({
    x: base.x + panOffset.x,
    y: base.y + panOffset.y,
    width: base.width / zoomLevel,
    height: base.height / zoomLevel,
  }), [base, panOffset, zoomLevel]);

  /** ViewBox transformado, listo para el atributo del <svg>. */
  const transformedViewBox = useMemo(
    () => `${viewRect.x} ${viewRect.y} ${viewRect.width} ${viewRect.height}`,
    [viewRect]
  );

  /**
   * Convierte coordenadas de pantalla a coordenadas SVG usando la matriz CTM.
   *
   * @param {MouseEvent|{clientX: number, clientY: number}} event
   * @param {SVGSVGElement} [svgElement] - SVG explícito (por defecto event.currentTarget)
   * @returns {{x: number, y: number}|null}
   */
  const screenToSvg = useCallback((event, svgElement) => {
    const svg = svgElement || event?.currentTarget || event?.target?.closest?.('svg');
    if (!svg || !svg.createSVGPoint) return null;

    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;

    const ctm = svg.getScreenCTM();
    if (!ctm) return null;

    const svgPoint = point.matrixTransform(ctm.inverse());
    return { x: svgPoint.x, y: svgPoint.y };
  }, []);

  /** Resetea la vista a zoom 1.0 y sin desplazamiento. */
  const resetView = useCallback(() => {
    setZoomLevel(1.0);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  /**
   * Aplica un nuevo nivel de zoom manteniendo fijo un punto de anclaje.
   * Sin ancla, el zoom se centra en el centro de la vista.
   *
   * @param {number} nextZoom - Zoom deseado (se recorta a [MIN_ZOOM, MAX_ZOOM])
   * @param {{x: number, y: number}} [anchor] - Punto SVG que debe permanecer fijo
   */
  const zoomTo = useCallback((nextZoom, anchor = null) => {
    const next = clampZoom(nextZoom);
    if (next === zoomLevel) return;

    // Relación entre el ancho nuevo y el actual
    const ratio = zoomLevel / next;
    const width = base.width / zoomLevel;
    const height = base.height / zoomLevel;

    setPanOffset((prev) => {
      const viewX = base.x + prev.x;
      const viewY = base.y + prev.y;
      const anchorX = anchor ? anchor.x : viewX + width / 2;
      const anchorY = anchor ? anchor.y : viewY + height / 2;

      return {
        x: anchorX - (anchorX - viewX) * ratio - base.x,
        y: anchorY - (anchorY - viewY) * ratio - base.y,
      };
    });
    setZoomLevel(next);
  }, [zoomLevel, base]);

  /**
   * Zoom con la rueda del mouse, anclado al punto bajo el cursor.
   * `preventDefault` se hace en el listener nativo (non-passive) del CanvasEngine.
   *
   * @param {WheelEvent} e
   */
  const handleWheel = useCallback((e) => {
    const anchor = screenToSvg(e);
    const factor = Math.exp(-e.deltaY * MAP_BUILDER_CONFIG.ZOOM_WHEEL_FACTOR);
    zoomTo(zoomLevel * factor, anchor);
  }, [screenToSvg, zoomTo, zoomLevel]);

  const zoomIn = useCallback(
    () => zoomTo(zoomLevel + MAP_BUILDER_CONFIG.ZOOM_STEP),
    [zoomTo, zoomLevel]
  );

  const zoomOut = useCallback(
    () => zoomTo(zoomLevel - MAP_BUILDER_CONFIG.ZOOM_STEP),
    [zoomTo, zoomLevel]
  );

  /**
   * Inicia el pan (botón central del mouse, o `e.isPanTrigger` desde otro origen).
   * Guarda la escala px→unidades SVG del momento para que el arrastre sea 1:1.
   *
   * @param {MouseEvent} e
   */
  const handlePanStart = useCallback((e) => {
    if (e.button !== 1 && !e.isPanTrigger) return;
    e.preventDefault();

    const svg = typeof e.currentTarget?.getScreenCTM === 'function' ? e.currentTarget : null;
    const ctm = svg?.getScreenCTM?.();

    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      scaleX: ctm && ctm.a ? 1 / ctm.a : 1,
      scaleY: ctm && ctm.d ? 1 / ctm.d : 1,
    };
    panOriginRef.current = { ...panOffset };
    setIsPanning(true);
  }, [panOffset]);

  /**
   * Desplaza la vista durante el arrastre.
   * @param {MouseEvent} e
   */
  const handlePanMove = useCallback((e) => {
    if (!isPanning) return;

    const { x, y, scaleX, scaleY } = panStartRef.current;
    setPanOffset({
      x: panOriginRef.current.x - (e.clientX - x) * scaleX,
      y: panOriginRef.current.y - (e.clientY - y) * scaleY,
    });
  }, [isPanning]);

  /** Termina el pan. */
  const handlePanEnd = useCallback(() => {
    setIsPanning((prev) => (prev ? false : prev));
  }, []);

  /**
   * Centra la vista en un punto del mapa (usado por el MiniMap).
   * @param {{x: number, y: number}} point
   */
  const centerOn = useCallback((point) => {
    if (!point) return;
    setPanOffset({
      x: point.x - base.width / zoomLevel / 2 - base.x,
      y: point.y - base.height / zoomLevel / 2 - base.y,
    });
  }, [base, zoomLevel]);

  /**
   * Ajusta zoom y pan para encuadrar todos los polígonos con un 10% de margen.
   * @param {Array} polygons - Polígonos con `vertices`
   */
  const fitToContent = useCallback((polygons) => {
    const vertices = (Array.isArray(polygons) ? polygons : []).flatMap((p) => p?.vertices || []);
    if (vertices.length === 0) {
      resetView();
      return;
    }

    const bbox = calculateBoundingBox(vertices);
    const padding = Math.max(bbox.width, bbox.height, 1) * 0.1;
    const fitWidth = Math.max(bbox.width + padding * 2, 1);
    const fitHeight = Math.max(bbox.height + padding * 2, 1);

    const nextZoom = clampZoom(Math.min(base.width / fitWidth, base.height / fitHeight));
    const centerX = bbox.minX + bbox.width / 2;
    const centerY = bbox.minY + bbox.height / 2;

    setZoomLevel(nextZoom);
    setPanOffset({
      x: centerX - base.width / nextZoom / 2 - base.x,
      y: centerY - base.height / nextZoom / 2 - base.y,
    });
  }, [base, resetView]);

  return {
    zoomLevel,
    panOffset,
    isPanning,
    viewRect,
    transformedViewBox,
    handleWheel,
    zoomTo,
    zoomIn,
    zoomOut,
    handlePanStart,
    handlePanMove,
    handlePanEnd,
    centerOn,
    fitToContent,
    resetView,
    screenToSvg,
  };
};
