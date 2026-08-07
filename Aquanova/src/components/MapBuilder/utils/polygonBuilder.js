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
