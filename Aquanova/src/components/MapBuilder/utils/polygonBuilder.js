import { MAP_BUILDER_CONFIG } from './constants';

/**
 * Genera un identificador único para un polígono.
 * `crypto.randomUUID` sólo existe en contexto seguro (https/localhost),
 * por eso se incluye un fallback para pruebas por IP en LAN.
 *
 * @returns {string} ID único
 */
export function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `poly_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Convierte un array de vértices a un string SVG path.
 *
 * @param {Array<{x: number, y: number}>} vertices - Lista de vértices del polígono
 * @returns {string} String SVG path (ej: "M 10 20 L 30 40 L 50 60 Z")
 */
export function verticesToSvgPath(vertices) {
  if (!vertices || vertices.length === 0) return '';

  const parts = vertices.map((v, i) => {
    const command = i === 0 ? 'M' : 'L';
    return `${command} ${v.x} ${v.y}`;
  });

  parts.push('Z');
  return parts.join(' ');
}

/**
 * Extrae vértices de un string SVG path.
 * Soporta comandos M, L, H, V (absolutos y relativos) y cierre Z.
 *
 * @param {string} pathString - String SVG path (ej: "M 10 20 L 30 40 Z")
 * @returns {Array<{x: number, y: number}>} Lista de vértices extraídos
 */
export function svgPathToVertices(pathString) {
  if (!pathString || typeof pathString !== 'string') return [];

  const vertices = [];
  let currentX = 0;
  let currentY = 0;

  // Normalizar: insertar espacio antes de letras de comando
  const normalized = pathString
    .replace(/([MmLlHhVvZzCcSsQqTtAa])/g, ' $1 ')
    .replace(/,/g, ' ')
    .trim();

  const tokens = normalized.split(/\s+/).filter(Boolean);
  let i = 0;

  while (i < tokens.length) {
    const cmd = tokens[i];
    i++;

    switch (cmd) {
      case 'M':
        if (i + 1 < tokens.length) {
          currentX = parseFloat(tokens[i]);
          currentY = parseFloat(tokens[i + 1]);
          vertices.push({ x: currentX, y: currentY });
          i += 2;
          while (i + 1 < tokens.length && !isNaN(parseFloat(tokens[i]))) {
            currentX = parseFloat(tokens[i]);
            currentY = parseFloat(tokens[i + 1]);
            vertices.push({ x: currentX, y: currentY });
            i += 2;
          }
        }
        break;

      case 'm':
        if (i + 1 < tokens.length) {
          currentX += parseFloat(tokens[i]);
          currentY += parseFloat(tokens[i + 1]);
          vertices.push({ x: currentX, y: currentY });
          i += 2;
          while (i + 1 < tokens.length && !isNaN(parseFloat(tokens[i]))) {
            currentX += parseFloat(tokens[i]);
            currentY += parseFloat(tokens[i + 1]);
            vertices.push({ x: currentX, y: currentY });
            i += 2;
          }
        }
        break;

      case 'L':
        while (i + 1 < tokens.length && !isNaN(parseFloat(tokens[i]))) {
          currentX = parseFloat(tokens[i]);
          currentY = parseFloat(tokens[i + 1]);
          vertices.push({ x: currentX, y: currentY });
          i += 2;
        }
        break;

      case 'l':
        while (i + 1 < tokens.length && !isNaN(parseFloat(tokens[i]))) {
          currentX += parseFloat(tokens[i]);
          currentY += parseFloat(tokens[i + 1]);
          vertices.push({ x: currentX, y: currentY });
          i += 2;
        }
        break;

      case 'H':
        if (i < tokens.length) {
          currentX = parseFloat(tokens[i]);
          vertices.push({ x: currentX, y: currentY });
          i++;
        }
        break;

      case 'h':
        if (i < tokens.length) {
          currentX += parseFloat(tokens[i]);
          vertices.push({ x: currentX, y: currentY });
          i++;
        }
        break;

      case 'V':
        if (i < tokens.length) {
          currentY = parseFloat(tokens[i]);
          vertices.push({ x: currentX, y: currentY });
          i++;
        }
        break;

      case 'v':
        if (i < tokens.length) {
          currentY += parseFloat(tokens[i]);
          vertices.push({ x: currentX, y: currentY });
          i++;
        }
        break;

      case 'Z':
      case 'z':
        // Cierre del path — no agregamos vértice duplicado
        break;

      default:
        // Comandos de curva (C, S, Q, T, A) — se omiten;
        // para mapas se espera geometría lineal
        while (i < tokens.length && !isNaN(parseFloat(tokens[i]))) {
          i++;
        }
        break;
    }
  }

  return vertices;
}

/**
 * Cierra un polígono si el último vértice está suficientemente cerca del primero.
 * Retorna los vértices sin el último duplicado (se asume cierre implícito con Z).
 *
 * @param {Array<{x: number, y: number}>} vertices - Vértices del polígono
 * @param {number} [threshold] - Distancia máxima para considerar cerrado (px)
 * @returns {Array<{x: number, y: number}>} Vértices con cierre aplicado
 */
export function closePolygon(vertices, threshold = MAP_BUILDER_CONFIG.POLYGON_CLOSE_THRESHOLD) {
  if (!vertices || vertices.length < 2) return vertices;

  const first = vertices[0];
  const last = vertices[vertices.length - 1];
  const dist = Math.hypot(last.x - first.x, last.y - first.y);

  // Si el último punto está muy cerca del primero, lo eliminamos (cierre implícito)
  if (dist <= threshold) {
    return vertices.slice(0, -1);
  }

  return vertices;
}

/**
 * Verifica si un polígono está cerrado (último vértice ≈ primero).
 *
 * @param {Array<{x: number, y: number}>} vertices - Vértices del polígono
 * @param {number} [threshold] - Distancia máxima para considerar cerrado (px)
 * @returns {boolean} true si el polígono está cerrado
 */
export function isPolygonClosed(vertices, threshold = MAP_BUILDER_CONFIG.POLYGON_CLOSE_THRESHOLD) {
  if (!vertices || vertices.length < 3) return false;

  const first = vertices[0];
  const last = vertices[vertices.length - 1];
  const dist = Math.hypot(last.x - first.x, last.y - first.y);

  return dist <= threshold;
}

/**
 * Envolvente convexa de un conjunto de puntos (algoritmo de cadena monótona).
 *
 * @param {Array<{x: number, y: number}>} points - Puntos de entrada
 * @returns {Array<{x: number, y: number}>} Vértices de la envolvente en orden
 */
export function convexHull(points) {
  if (!points || points.length < 3) return points ? [...points] : [];

  // Deduplicar: los puntos repetidos degeneran el algoritmo
  const unique = [];
  const seen = new Set();
  for (const p of points) {
    if (!Number.isFinite(p?.x) || !Number.isFinite(p?.y)) continue;
    const key = `${p.x.toFixed(3)}|${p.y.toFixed(3)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(p);
  }

  if (unique.length < 3) return unique;

  const sorted = [...unique].sort((a, b) => (a.x - b.x) || (a.y - b.y));
  const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

  const buildChain = (pts) => {
    const chain = [];
    for (const p of pts) {
      while (chain.length >= 2 && cross(chain[chain.length - 2], chain[chain.length - 1], p) <= 0) {
        chain.pop();
      }
      chain.push(p);
    }
    chain.pop(); // el último punto lo aporta la otra cadena
    return chain;
  };

  const hull = [...buildChain(sorted), ...buildChain([...sorted].reverse())];

  // Si todos los puntos son colineales el hull degenera: devolver los originales
  return hull.length >= 3 ? hull : unique;
}

/**
 * Deriva la geometría de una manzana a partir de los paths de sus predios.
 *
 * Se usa cuando la manzana llega sin geometría real (el placeholder `M0,0 Z`
 * que sembró el proceso legado). Sin esto la manzana no existe como polígono
 * en el editor, sus predios quedan huérfanos y se descartan al guardar.
 *
 * @param {Array<string>} lotPaths - Paths SVG de los predios de la manzana
 * @returns {Array<{x: number, y: number}>} Vértices de la manzana derivada
 */
export function deriveBlockVerticesFromLots(lotPaths) {
  if (!lotPaths || lotPaths.length === 0) return [];

  const points = [];
  for (const path of lotPaths) {
    if (path) points.push(...svgPathToVertices(path));
  }

  if (points.length < 3) return [];

  return convexHull(points);
}

/**
 * Crea 4 vértices de un rectángulo a partir de dos esquinas opuestas.
 * Los vértices se generan en sentido horario desde la esquina superior-izquierda.
 *
 * @param {{x: number, y: number}} startPoint - Primera esquina (clic inicial)
 * @param {{x: number, y: number}} endPoint - Esquina opuesta (posición actual del mouse)
 * @returns {Array<{x: number, y: number}>} 4 vértices del rectángulo
 */
export function createRectangleVertices(startPoint, endPoint) {
  const minX = Math.min(startPoint.x, endPoint.x);
  const minY = Math.min(startPoint.y, endPoint.y);
  const maxX = Math.max(startPoint.x, endPoint.x);
  const maxY = Math.max(startPoint.y, endPoint.y);

  return [
    { x: minX, y: minY }, // Superior-izquierda
    { x: maxX, y: minY }, // Superior-derecha
    { x: maxX, y: maxY }, // Inferior-derecha
    { x: minX, y: maxY }, // Inferior-izquierda
  ];
}
