/**
 * Calcula el área de un polígono usando la fórmula del Shoelace (Gauss).
 * Retorna el valor absoluto del área (siempre positivo).
 *
 * @param {Array<{x: number, y: number}>} vertices - Vértices del polígono (ordenados)
 * @returns {number} Área del polígono en unidades cuadradas
 */
export function calculateArea(vertices) {
  if (!vertices || vertices.length < 3) return 0;

  const n = vertices.length;
  let area = 0;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += vertices[i].x * vertices[j].y;
    area -= vertices[j].x * vertices[i].y;
  }

  return Math.abs(area) / 2;
}

/**
 * Calcula el centroide (centro de masa) de un polígono.
 * Usa la fórmula basada en el área signada.
 *
 * @param {Array<{x: number, y: number}>} vertices - Vértices del polígono (ordenados)
 * @returns {{x: number, y: number}} Coordenadas del centroide
 */
export function calculateCentroid(vertices) {
  if (!vertices || vertices.length === 0) return { x: 0, y: 0 };
  if (vertices.length === 1) return { x: vertices[0].x, y: vertices[0].y };
  if (vertices.length === 2) {
    return {
      x: (vertices[0].x + vertices[1].x) / 2,
      y: (vertices[0].y + vertices[1].y) / 2,
    };
  }

  const n = vertices.length;
  let signedArea = 0;
  let cx = 0;
  let cy = 0;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const cross = vertices[i].x * vertices[j].y - vertices[j].x * vertices[i].y;
    signedArea += cross;
    cx += (vertices[i].x + vertices[j].x) * cross;
    cy += (vertices[i].y + vertices[j].y) * cross;
  }

  signedArea /= 2;

  // Evitar división por cero en polígonos degenerados
  if (Math.abs(signedArea) < 1e-10) {
    const avgX = vertices.reduce((sum, v) => sum + v.x, 0) / n;
    const avgY = vertices.reduce((sum, v) => sum + v.y, 0) / n;
    return { x: avgX, y: avgY };
  }

  const factor = 1 / (6 * signedArea);
  cx *= factor;
  cy *= factor;

  return { x: cx, y: cy };
}

/**
 * Calcula el bounding box (caja envolvente) de un polígono.
 *
 * @param {Array<{x: number, y: number}>} vertices - Vértices del polígono
 * @returns {{minX: number, minY: number, maxX: number, maxY: number, width: number, height: number}}
 */
export function calculateBoundingBox(vertices) {
  if (!vertices || vertices.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const v of vertices) {
    if (v.x < minX) minX = v.x;
    if (v.y < minY) minY = v.y;
    if (v.x > maxX) maxX = v.x;
    if (v.y > maxY) maxY = v.y;
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Calcula el perímetro total de un polígono.
 *
 * @param {Array<{x: number, y: number}>} vertices - Vértices del polígono (ordenados)
 * @returns {number} Perímetro total en unidades lineales
 */
export function calculatePerimeter(vertices) {
  if (!vertices || vertices.length < 2) return 0;

  const n = vertices.length;
  let perimeter = 0;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    perimeter += Math.hypot(
      vertices[j].x - vertices[i].x,
      vertices[j].y - vertices[i].y
    );
  }

  return perimeter;
}
