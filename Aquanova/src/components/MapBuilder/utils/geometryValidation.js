import { calculateArea } from './areaCalculator';
import { MAP_BUILDER_CONFIG } from './constants';

/**
 * Calcula la intersección entre dos segmentos de línea.
 * Usa el método paramétrico para determinar si se cruzan.
 *
 * @param {{x: number, y: number}} p1 - Inicio del segmento A
 * @param {{x: number, y: number}} p2 - Fin del segmento A
 * @param {{x: number, y: number}} p3 - Inicio del segmento B
 * @param {{x: number, y: number}} p4 - Fin del segmento B
 * @returns {{x: number, y: number}|null} Punto de intersección o null si no se cruzan
 */
export function segmentIntersection(p1, p2, p3, p4) {
  const dx1 = p2.x - p1.x;
  const dy1 = p2.y - p1.y;
  const dx2 = p4.x - p3.x;
  const dy2 = p4.y - p3.y;

  const denom = dx1 * dy2 - dy1 * dx2;

  // Segmentos paralelos
  if (Math.abs(denom) < 1e-10) return null;

  const t = ((p3.x - p1.x) * dy2 - (p3.y - p1.y) * dx2) / denom;
  const u = ((p3.x - p1.x) * dy1 - (p3.y - p1.y) * dx1) / denom;

  // Verificar que la intersección está dentro de ambos segmentos (exclusivo en extremos)
  if (t > 0 && t < 1 && u > 0 && u < 1) {
    return {
      x: p1.x + t * dx1,
      y: p1.y + t * dy1,
    };
  }

  return null;
}

/**
 * Detecta auto-intersecciones en un polígono.
 * Compara cada par de aristas no adyacentes.
 *
 * @param {Array<{x: number, y: number}>} vertices - Vértices del polígono
 * @returns {{isValid: boolean, intersections: Array<{x: number, y: number}>}}
 */
export function detectSelfIntersection(vertices) {
  if (!vertices || vertices.length < 4) return { isValid: true, intersections: [] };

  const intersections = [];
  const n = vertices.length;

  for (let i = 0; i < n; i++) {
    const nextI = (i + 1) % n;

    for (let j = i + 2; j < n; j++) {
      // No comparar aristas adyacentes
      if (j === n - 1 && i === 0) continue;

      const nextJ = (j + 1) % n;
      const point = segmentIntersection(
        vertices[i], vertices[nextI],
        vertices[j], vertices[nextJ]
      );

      if (point) {
        intersections.push(point);
      }
    }
  }

  return {
    isValid: intersections.length === 0,
    intersections,
  };
}

/**
 * Determina si un punto está dentro de un polígono usando Ray Casting.
 *
 * @param {{x: number, y: number}} point - Punto a verificar
 * @param {Array<{x: number, y: number}>} vertices - Vértices del polígono
 * @returns {boolean} true si el punto está dentro del polígono
 */
export function isPointInPolygon(point, vertices) {
  if (!vertices || vertices.length < 3) return false;

  let inside = false;
  const n = vertices.length;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = vertices[i].x;
    const yi = vertices[i].y;
    const xj = vertices[j].x;
    const yj = vertices[j].y;

    const intersects =
      ((yi > point.y) !== (yj > point.y)) &&
      (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);

    if (intersects) inside = !inside;
  }

  return inside;
}

/**
 * Detecta si dos polígonos se solapan.
 * Usa una heurística: verifica si algún vértice de A está dentro de B o viceversa.
 *
 * @param {Array<{x: number, y: number}>} polygonA - Vértices del polígono A
 * @param {Array<{x: number, y: number}>} polygonB - Vértices del polígono B
 * @returns {{overlaps: boolean, verticesInside: Array<{x: number, y: number}>}}
 */
export function detectOverlap(polygonA, polygonB) {
  if (!polygonA || !polygonB || polygonA.length < 3 || polygonB.length < 3) {
    return { overlaps: false, verticesInside: [] };
  }

  const verticesInside = [];

  // Verificar vértices de A dentro de B
  for (const v of polygonA) {
    if (isPointInPolygon(v, polygonB)) {
      verticesInside.push(v);
    }
  }

  // Verificar vértices de B dentro de A
  for (const v of polygonB) {
    if (isPointInPolygon(v, polygonA)) {
      verticesInside.push(v);
    }
  }

  // También verificar intersección de aristas si no hay vértices dentro
  if (verticesInside.length === 0) {
    const nA = polygonA.length;
    const nB = polygonB.length;

    for (let i = 0; i < nA && verticesInside.length === 0; i++) {
      const nextI = (i + 1) % nA;
      for (let j = 0; j < nB; j++) {
        const nextJ = (j + 1) % nB;
        const pt = segmentIntersection(
          polygonA[i], polygonA[nextI],
          polygonB[j], polygonB[nextJ]
        );
        if (pt) {
          verticesInside.push(pt);
          break;
        }
      }
    }
  }

  return {
    overlaps: verticesInside.length > 0,
    verticesInside,
  };
}

/**
 * Validación completa de un polígono individual.
 * Verifica: mínimo de vértices, cierre, auto-intersección y área mínima.
 *
 * @param {Array<{x: number, y: number}>} vertices - Vértices del polígono
 * @returns {{isValid: boolean, errors: string[], warnings: string[]}}
 */
export function validatePolygon(vertices) {
  const errors = [];
  const warnings = [];

  if (!vertices || vertices.length === 0) {
    errors.push('El polígono no tiene vértices.');
    return { isValid: false, errors, warnings };
  }

  // Mínimo de vértices
  if (vertices.length < MAP_BUILDER_CONFIG.MIN_POLYGON_VERTICES) {
    errors.push(`Se requieren al menos ${MAP_BUILDER_CONFIG.MIN_POLYGON_VERTICES} vértices (tiene ${vertices.length}).`);
  }

  // Área mínima
  if (vertices.length >= 3) {
    const area = calculateArea(vertices);
    if (area < MAP_BUILDER_CONFIG.MIN_POLYGON_AREA) {
      errors.push(`El área del polígono (${area.toFixed(2)}) es menor al mínimo requerido (${MAP_BUILDER_CONFIG.MIN_POLYGON_AREA}).`);
    }
  }

  // Auto-intersección
  if (vertices.length >= 4) {
    const selfCheck = detectSelfIntersection(vertices);
    if (!selfCheck.isValid) {
      errors.push(`El polígono tiene ${selfCheck.intersections.length} auto-intersección(es).`);
    }
  }

  // Advertencia: polígono muy pequeño pero válido
  if (vertices.length >= 3 && errors.length === 0) {
    const area = calculateArea(vertices);
    if (area < MAP_BUILDER_CONFIG.MIN_POLYGON_AREA * 5) {
      warnings.push(`El polígono tiene un área muy pequeña (${area.toFixed(2)}).`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Valida todos los polígonos del mapa, incluyendo detección de overlaps entre pares.
 *
 * @param {Array<{id: string, vertices: Array<{x: number, y: number}>}>} polygons - Lista de polígonos
 * @returns {{isValid: boolean, results: Array<{id: string, isValid: boolean, errors: string[], warnings: string[]}>, overlaps: Array<{idA: string, idB: string}>}}
 */
export function validateAllPolygons(polygons) {
  if (!polygons || polygons.length === 0) {
    return { isValid: true, results: [], overlaps: [] };
  }

  const results = [];
  const overlaps = [];
  let allValid = true;

  // Validar cada polígono individualmente
  for (const polygon of polygons) {
    const result = validatePolygon(polygon.vertices);
    results.push({
      id: polygon.id,
      ...result,
    });
    if (!result.isValid) allValid = false;
  }

  // Detectar overlaps entre pares
  for (let i = 0; i < polygons.length; i++) {
    for (let j = i + 1; j < polygons.length; j++) {
      const a = polygons[i];
      const b = polygons[j];

      if (!a.vertices || !b.vertices || a.vertices.length < 3 || b.vertices.length < 3) {
        continue;
      }

      const overlapResult = detectOverlap(a.vertices, b.vertices);
      if (overlapResult.overlaps) {
        overlaps.push({ idA: a.id, idB: b.id });
        allValid = false;
      }
    }
  }

  return {
    isValid: allValid,
    results,
    overlaps,
  };
}

/**
 * Infiere la jerarquía manzana → predio de un conjunto de polígonos por
 * contención geométrica.
 *
 * Regla: un polígono cuyo centroide cae dentro de otro más grande es predio de
 * ese contenedor (el más ajustado, si hay varios anidados). Un polígono sin
 * contenedor solo puede ser manzana: `lots.block_id` es NOT NULL, así que un
 * predio sin padre no es representable en el modelo de datos.
 *
 * @param {Array} polygons - Polígonos del editor (con `vertices`, `centroid`, `area`)
 * @returns {{blocks: Array<string>, lots: Array<{id: string, parentId: string}>}}
 */
export function inferHierarchy(polygons) {
  const candidates = (polygons || []).filter(
    (p) => p && p.vertices && p.vertices.length >= 3
  );

  const areaOf = (p) => Math.abs(p.area ?? 0);
  const parentOf = new Map();

  for (const child of candidates) {
    const point = child.centroid || child.vertices[0];
    let container = null;

    for (const parent of candidates) {
      if (parent.id === child.id) continue;
      // El contenedor debe ser estrictamente mayor: evita que dos polígonos
      // casi idénticos se declaren padre el uno del otro.
      if (areaOf(parent) <= areaOf(child)) continue;
      if (!isPointInPolygon(point, parent.vertices)) continue;
      // Con polígonos anidados gana el más ajustado
      if (!container || areaOf(parent) < areaOf(container)) container = parent;
    }

    if (container) parentOf.set(child.id, container.id);
  }

  const blocks = [];
  const lots = [];

  for (const polygon of candidates) {
    if (parentOf.has(polygon.id)) {
      lots.push({ id: polygon.id, parentId: parentOf.get(polygon.id) });
    } else {
      blocks.push(polygon.id);
    }
  }

  return { blocks, lots };
}
