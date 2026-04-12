/**
 * Calcula el Bounding Box (AABB) de un conjunto de coordenadas.
 * @param {Array} coords - Array de pares [x, y]
 * @returns {Object} { minX, minY, maxX, maxY }
 */
export const getBBox = (coords) => {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of coords) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return { minX, minY, maxX, maxY };
};

/**
 * Verifica si dos BBoxes se intersectan considerando una tolerancia.
 */
export const doBBoxesIntersect = (a, b, epsilon = 0) => {
  return (
    a.minX <= b.maxX + epsilon &&
    a.maxX >= b.minX - epsilon &&
    a.minY <= b.maxY + epsilon &&
    a.maxY >= b.minY - epsilon
  );
};

/**
 * Calcula la distancia mínima de un punto P a un segmento definido por V y W.
 * Implementación puramente escalar para evitar dependencias geográficas.
 */
export const distPointToSegment = (p, v, w) => {
  const sqr = (x) => x * x;
  const dist2 = (v, w) => sqr(v[0] - w[0]) + sqr(v[1] - w[1]);
  
  const l2 = dist2(v, w);
  if (l2 === 0) return Math.sqrt(dist2(p, v));
  
  let t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2;
  t = Math.max(0, Math.min(1, t));
  
  return Math.sqrt(dist2(p, [
    v[0] + t * (w[0] - v[0]),
    v[1] + t * (w[1] - v[1])
  ]));
};

/**
 * Determina si dos polígonos son adyacentes dentro de una tolerancia epsilon.
 * @param {Array} polyA - Coordenadas del polígono A [[x,y], ...]
 * @param {Array} polyB - Coordenadas del polígono B [[x,y], ...]
 * @param {number} epsilon - Umbral de distancia (ej. 0.5 unidades SVG)
 * @returns {boolean}
 */
export const polygonsAreAdjacent = (polyA, polyB, epsilon = 0.5) => {
  const bboxA = getBBox(polyA);
  const bboxB = getBBox(polyB);

  // Filtro rápido: si los BBoxes no se tocan con margen epsilon, los polígonos tampoco
  if (!doBBoxesIntersect(bboxA, bboxB, epsilon)) {
    return false;
  }

  // Comprobar cada vértice de A contra cada segmento de B
  for (const pt of polyA) {
    for (let i = 0; i < polyB.length - 1; i++) {
        const d = distPointToSegment(pt, polyB[i], polyB[i+1]);
        if (d < epsilon) return true;
    }
  }

  // Y viceversa (vértices de B contra segmentos de A) para mayor seguridad
  for (const pt of polyB) {
    for (let i = 0; i < polyA.length - 1; i++) {
        const d = distPointToSegment(pt, polyA[i], polyA[i+1]);
        if (d < epsilon) return true;
    }
  }

  return false;
};
