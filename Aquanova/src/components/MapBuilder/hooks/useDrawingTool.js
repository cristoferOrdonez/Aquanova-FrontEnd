import { useState, useCallback } from 'react';
import { MAP_BUILDER_CONFIG, TOOLS, POLYGON_TYPES } from '../utils/constants';
import { verticesToSvgPath, createRectangleVertices, generateId } from '../utils/polygonBuilder';
import { calculateArea, calculateCentroid } from '../utils/areaCalculator';
import { isPointInPolygon } from '../utils/geometryValidation';

/**
 * Hook para la herramienta de dibujo activa.
 * Gestiona el ciclo de vida del dibujo de polígonos, rectángulos y selección.
 *
 * @param {{
 *   activeTool: string,
 *   polygons: Array,
 *   snapEngine: object
 * }} options
 * @returns {{
 *   drawingPoints: Array,
 *   isDrawing: boolean,
 *   previewPoint: {x: number, y: number}|null,
 *   handleCanvasClick: (svgPoint: {x: number, y: number}) => object|null,
 *   handleMouseMove: (svgPoint: {x: number, y: number}) => void,
 *   handleKeyDown: (key: string) => object|null,
 *   cancelDrawing: () => void,
 *   completePolygon: () => object|null,
 *   isNearFirstPoint: (point: {x: number, y: number}) => boolean,
 * }}
 */
export const useDrawingTool = ({ activeTool, polygons, snapEngine }) => {
  const [drawingPoints, setDrawingPoints] = useState([]);
  const [previewPoint, setPreviewPoint] = useState(null);
  const [rectStart, setRectStart] = useState(null);

  const isDrawing = drawingPoints.length > 0 || rectStart !== null;

  /**
   * Verifica si un punto está dentro del threshold de cierre del primer punto.
   * @param {{x: number, y: number}} point - Punto a verificar
   * @returns {boolean} true si está lo suficientemente cerca del primer punto
   */
  const isNearFirstPoint = useCallback((point) => {
    if (drawingPoints.length < MAP_BUILDER_CONFIG.MIN_POLYGON_VERTICES) return false;
    const first = drawingPoints[0];
    const dist = Math.hypot(point.x - first.x, point.y - first.y);
    return dist <= MAP_BUILDER_CONFIG.POLYGON_CLOSE_THRESHOLD;
  }, [drawingPoints]);

  /**
   * Crea un objeto polígono completo a partir de los puntos de dibujo actuales.
   * @param {Array} [vertices] - Vértices opcionales (si no se provee usa drawingPoints)
   * @returns {object|null} Polígono listo para agregar o null si inválido
   */
  const buildPolygonObject = useCallback((vertices = null) => {
    const verts = vertices || drawingPoints;
    if (verts.length < MAP_BUILDER_CONFIG.MIN_POLYGON_VERTICES) return null;

    const svgPath = verticesToSvgPath(verts);
    const centroid = calculateCentroid(verts);
    const area = calculateArea(verts);

    return {
      id: generateId(),
      vertices: verts,
      svgPath,
      centroid,
      area,
      type: POLYGON_TYPES.UNASSIGNED,
      parentId: null,
      code: null,
      number: null,
      metadata: {},
      createdAt: new Date().toISOString(),
    };
  }, [drawingPoints]);

  /**
   * Cierra el polígono actual, retorna el objeto polygon completo y limpia estado.
   * @returns {object|null} Polígono completado o null si insuficientes puntos
   */
  const completePolygon = useCallback(() => {
    const polygon = buildPolygonObject();
    if (polygon) {
      setDrawingPoints([]);
      setPreviewPoint(null);
    }
    return polygon;
  }, [buildPolygonObject]);

  /**
   * Limpia los puntos de dibujo y cancela la operación actual.
   */
  const cancelDrawing = useCallback(() => {
    setDrawingPoints([]);
    setPreviewPoint(null);
    setRectStart(null);
  }, []);

  /**
   * Maneja el click en el canvas según la herramienta activa.
   * @param {{x: number, y: number}} svgPoint - Punto en coordenadas SVG
   * @returns {object|null} Resultado de la acción (polígono, selección, etc.)
   */
  const handleCanvasClick = useCallback((svgPoint) => {
    // Obtener posición snapeada si el motor está disponible
    const point = snapEngine
      ? snapEngine.getSnappedPosition(svgPoint, polygons, null, drawingPoints)
      : svgPoint;

    switch (activeTool) {
      case TOOLS.DRAW_POLYGON: {
        // Si estamos cerca del primer punto y tenemos suficientes puntos, cerrar
        if (isNearFirstPoint(point)) {
          return completePolygon();
        }
        // Agregar punto al dibujo
        setDrawingPoints((prev) => [...prev, point]);
        return null;
      }

      case TOOLS.DRAW_RECTANGLE: {
        if (!rectStart) {
          // Primer click: guardar inicio
          setRectStart(point);
          setDrawingPoints([point]);
          return null;
        }
        // Segundo click: generar rectángulo
        const vertices = createRectangleVertices(rectStart, point);
        const polygon = buildPolygonObject(vertices);
        setRectStart(null);
        setDrawingPoints([]);
        setPreviewPoint(null);
        return polygon;
      }

      case TOOLS.SELECT: {
        // Buscar polígono bajo el cursor
        for (const polygon of polygons) {
          if (polygon.vertices && isPointInPolygon(point, polygon.vertices)) {
            return { action: 'select', polygonId: polygon.id };
          }
        }
        // Click en vacío = deseleccionar
        return { action: 'deselect' };
      }

      case TOOLS.EDIT_VERTICES: {
        // Buscar vértice más cercano
        let closestVertex = null;
        let minDist = MAP_BUILDER_CONFIG.VERTEX_HANDLE_RADIUS * 2;

        for (const polygon of polygons) {
          if (!polygon.vertices) continue;
          for (let i = 0; i < polygon.vertices.length; i++) {
            const v = polygon.vertices[i];
            const dist = Math.hypot(point.x - v.x, point.y - v.y);
            if (dist < minDist) {
              minDist = dist;
              closestVertex = { polygonId: polygon.id, vertexIndex: i, position: v };
            }
          }
        }

        if (closestVertex) {
          return { action: 'select-vertex', ...closestVertex };
        }
        return null;
      }

      default:
        return null;
    }
  }, [activeTool, polygons, snapEngine, drawingPoints, isNearFirstPoint, completePolygon, buildPolygonObject, rectStart]);

  /**
   * Maneja movimiento del mouse para preview y snap.
   * @param {{x: number, y: number}} svgPoint - Punto en coordenadas SVG
   */
  const handleMouseMove = useCallback((svgPoint) => {
    // Buscar snap
    const point = snapEngine
      ? snapEngine.getSnappedPosition(svgPoint, polygons, null, drawingPoints)
      : svgPoint;

    setPreviewPoint(point);
  }, [snapEngine, polygons, drawingPoints]);

  /**
   * Maneja teclas especiales durante el dibujo.
   * @param {string} key - Tecla presionada
   * @returns {object|null} Resultado de la acción
   */
  const handleKeyDown = useCallback((key) => {
    switch (key) {
      case 'Enter': {
        // Cerrar polígono si hay suficientes puntos
        if (drawingPoints.length >= MAP_BUILDER_CONFIG.MIN_POLYGON_VERTICES) {
          return completePolygon();
        }
        return null;
      }
      case 'Escape': {
        cancelDrawing();
        return { action: 'cancel' };
      }
      default:
        return null;
    }
  }, [drawingPoints, completePolygon, cancelDrawing]);

  return {
    drawingPoints,
    isDrawing,
    previewPoint,
    handleCanvasClick,
    handleMouseMove,
    handleKeyDown,
    cancelDrawing,
    completePolygon,
    isNearFirstPoint,
  };
};
