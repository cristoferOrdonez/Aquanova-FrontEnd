import { svgPathToVertices } from './polygonBuilder';
import { calculateArea, calculateCentroid } from './areaCalculator';
import { MAP_BUILDER_CONFIG } from './constants';

/**
 * Genera un ID temporal único para polígonos importados.
 *
 * @returns {string} ID único con prefijo 'imp_'
 */
function generateTempId() {
  return `imp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Parsea un string SVG completo usando DOMParser del browser.
 * Extrae viewBox, paths y grupos con transforms.
 *
 * @param {string} svgString - Contenido SVG como string
 * @returns {{viewBox: string|null, paths: Array<{d: string, id: string|null, group: string|null, transform: string|null}>}}
 */
export function parseSvgString(svgString) {
  if (!svgString || typeof svgString !== 'string') {
    return { viewBox: null, paths: [] };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');

  // Verificar errores de parsing
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    console.warn('[svgImporter] Error parsing SVG:', parseError.textContent);
    return { viewBox: null, paths: [] };
  }

  const svgEl = doc.querySelector('svg');
  if (!svgEl) {
    return { viewBox: null, paths: [] };
  }

  // Extraer viewBox
  const viewBox = svgEl.getAttribute('viewBox') || null;

  // Extraer todos los <path>
  const pathElements = doc.querySelectorAll('path');
  const paths = [];

  pathElements.forEach((pathEl) => {
    const d = pathEl.getAttribute('d');
    if (!d) return;

    const id = pathEl.getAttribute('id') || null;

    // Buscar grupo padre con transform
    let group = null;
    let transform = null;
    const parentG = pathEl.closest('g');
    if (parentG) {
      group = parentG.getAttribute('id') || parentG.getAttribute('class') || null;
      transform = parentG.getAttribute('transform') || null;
    }

    paths.push({ d, id, group, transform });
  });

  return { viewBox, paths };
}

/**
 * Extrae polígonos válidos de una lista de paths SVG.
 * Para cada path: extrae vértices, calcula métricas y genera ID temporal.
 *
 * @param {Array<{d: string, id: string|null, group: string|null, transform: string|null}>} paths - Paths extraídos del SVG
 * @returns {Array<{tempId: string, vertices: Array<{x: number, y: number}>, svgPath: string, area: number, centroid: {x: number, y: number}, isClosed: boolean, vertexCount: number}>}
 */
export function extractPolygonsFromPaths(paths) {
  if (!paths || paths.length === 0) return [];

  const polygons = [];

  for (const path of paths) {
    const d = path.d;
    if (!d) continue;

    // Determinar si el path está cerrado
    const trimmed = d.trim();
    const isClosed = /[Zz]\s*$/.test(trimmed);

    // Extraer vértices
    const vertices = svgPathToVertices(d);
    if (vertices.length < 2) continue;

    // Calcular métricas
    const area = vertices.length >= 3 ? calculateArea(vertices) : 0;
    const centroid = vertices.length >= 3
      ? calculateCentroid(vertices)
      : { x: vertices[0].x, y: vertices[0].y };

    polygons.push({
      tempId: generateTempId(),
      vertices,
      svgPath: d,
      area,
      centroid,
      isClosed,
      vertexCount: vertices.length,
    });
  }

  return polygons;
}

/**
 * Lee un archivo SVG (File object) y lo parsea.
 *
 * @param {File} file - Archivo SVG seleccionado por el usuario
 * @returns {Promise<{viewBox: string|null, paths: Array, polygons: Array}>}
 */
export async function parseSvgFile(file) {
  if (!file) {
    throw new Error('No se proporcionó un archivo.');
  }

  const text = await file.text();
  const { viewBox, paths } = parseSvgString(text);
  const polygons = extractPolygonsFromPaths(paths);

  return { viewBox, paths, polygons };
}

/**
 * Filtra polígonos válidos: deben estar cerrados y tener área mínima.
 *
 * @param {Array<{isClosed: boolean, area: number, vertexCount: number}>} polygons - Lista de polígonos extraídos
 * @param {number} [minArea] - Área mínima requerida
 * @returns {Array} Polígonos que cumplen los criterios
 */
export function filterValidPolygons(polygons, minArea = MAP_BUILDER_CONFIG.MIN_POLYGON_AREA) {
  if (!polygons || polygons.length === 0) return [];

  return polygons.filter((polygon) => {
    // Debe estar cerrado
    if (!polygon.isClosed) return false;

    // Debe tener al menos 3 vértices
    if (polygon.vertexCount < MAP_BUILDER_CONFIG.MIN_POLYGON_VERTICES) return false;

    // Debe cumplir el área mínima
    if (polygon.area < minArea) return false;

    return true;
  });
}
