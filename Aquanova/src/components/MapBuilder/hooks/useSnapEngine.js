import { useState, useCallback } from 'react';
import { MAP_BUILDER_CONFIG } from '../utils/constants';

/**
 * Hook para snap-to-vertex. Permite alinear el cursor automáticamente
 * al vértice más cercano dentro del radio de snap.
 *
 * @returns {{
 *   snapTarget: {x: number, y: number, polygonId: string, vertexIndex: number}|null,
 *   isSnapEnabled: boolean,
 *   toggleSnap: () => void,
 *   findSnap: (cursorPos: {x: number, y: number}, polygons: Array, excludeId?: string) => {x: number, y: number, polygonId: string, vertexIndex: number}|null,
 *   getSnappedPosition: (cursorPos: {x: number, y: number}, polygons: Array, excludeId?: string) => {x: number, y: number},
 * }}
 */
export const useSnapEngine = () => {
  const [snapTarget, setSnapTarget] = useState(null);
  const [isSnapEnabled, setIsSnapEnabled] = useState(true);

  /**
   * Alterna snap on/off.
   */
  const toggleSnap = useCallback(() => {
    setIsSnapEnabled((prev) => !prev);
    setSnapTarget(null);
  }, []);

  /**
   * Busca el vértice más cercano al cursor dentro del radio de snap.
   * También considera snap al primer punto de los drawingPoints para cierre.
   *
   * @param {{x: number, y: number}} cursorPos - Posición actual del cursor en SVG
   * @param {Array} polygons - Lista de polígonos con vertices
   * @param {string} [excludeId] - ID de polígono a excluir de la búsqueda
   * @param {Array} [drawingPoints] - Puntos del dibujo actual (para snap al primer punto)
   * @returns {{x: number, y: number, polygonId: string, vertexIndex: number}|null}
   */
  const findSnap = useCallback((cursorPos, polygons, excludeId = null, drawingPoints = []) => {
    if (!isSnapEnabled || !cursorPos) {
      setSnapTarget(null);
      return null;
    }

    const snapRadius = MAP_BUILDER_CONFIG.SNAP_RADIUS_PX;
    let closest = null;
    let minDist = snapRadius;

    // Snap al primer punto del polígono en dibujo (para cerrar)
    if (drawingPoints.length >= MAP_BUILDER_CONFIG.MIN_POLYGON_VERTICES) {
      const firstPoint = drawingPoints[0];
      const dist = Math.hypot(cursorPos.x - firstPoint.x, cursorPos.y - firstPoint.y);
      if (dist < minDist) {
        minDist = dist;
        closest = {
          x: firstPoint.x,
          y: firstPoint.y,
          polygonId: '__drawing__',
          vertexIndex: 0,
        };
      }
    }

    // Buscar en polígonos existentes
    for (const polygon of polygons) {
      if (polygon.id === excludeId) continue;
      if (!polygon.vertices) continue;

      for (let i = 0; i < polygon.vertices.length; i++) {
        const vertex = polygon.vertices[i];
        const dist = Math.hypot(cursorPos.x - vertex.x, cursorPos.y - vertex.y);
        if (dist < minDist) {
          minDist = dist;
          closest = {
            x: vertex.x,
            y: vertex.y,
            polygonId: polygon.id,
            vertexIndex: i,
          };
        }
      }
    }

    setSnapTarget(closest);
    return closest;
  }, [isSnapEnabled]);

  /**
   * Retorna la posición snapeada si hay un target activo, o la posición original del cursor.
   *
   * @param {{x: number, y: number}} cursorPos - Posición actual del cursor
   * @param {Array} polygons - Lista de polígonos
   * @param {string} [excludeId] - ID a excluir
   * @param {Array} [drawingPoints] - Puntos del dibujo actual
   * @returns {{x: number, y: number}} Posición final (snapeada o original)
   */
  const getSnappedPosition = useCallback((cursorPos, polygons, excludeId = null, drawingPoints = []) => {
    const snap = findSnap(cursorPos, polygons, excludeId, drawingPoints);
    if (snap) {
      return { x: snap.x, y: snap.y };
    }
    return cursorPos;
  }, [findSnap]);

  return {
    snapTarget,
    isSnapEnabled,
    toggleSnap,
    findSnap,
    getSnappedPosition,
  };
};
