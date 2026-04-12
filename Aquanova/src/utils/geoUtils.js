import * as turf from '@turf/turf';
import { distPointToSegment, polygonsAreAdjacent } from './GeometricCore';
import { groupLotsIntoBlocks } from './TopologyEngine';

/**
 * Factor de escala para normalizar coordenadas SVG al espacio válido de Turf.js.
 * Las coordenadas SVG (píxeles) pueden superar el rango válido de lat/lon (-180..180, -90..90).
 * Turf.js envuelve ("wraps") las coords fuera de rango, desplazando el polígono hasta el origen.
 * Con COORD_SCALE=1000, coords SVG de hasta 90,000px quedan dentro del rango seguro para Turf.
 */
const TURF_COORD_SCALE = 1000;

/** Escala hacia abajo un Feature GeoJSON para operar en el espacio seguro de Turf. */
const _downscaleGeoJSON = (feature) => {
  if (!feature?.geometry?.coordinates) return feature;
  const scaleRing = ring => ring.map(([x, y]) => [x / TURF_COORD_SCALE, y / TURF_COORD_SCALE]);
  const { type, coordinates } = feature.geometry;
  let newCoords;
  if (type === 'Polygon') newCoords = coordinates.map(scaleRing);
  else if (type === 'MultiPolygon') newCoords = coordinates.map(poly => poly.map(scaleRing));
  else return feature;
  return turf.feature({ type, coordinates: newCoords });
};

/** Escala hacia arriba un Feature GeoJSON para volver al espacio de píxeles SVG. */
const _upscaleGeoJSON = (feature) => {
  if (!feature?.geometry?.coordinates) return feature;
  const scaleRing = ring => ring.map(([x, y]) => [x * TURF_COORD_SCALE, y * TURF_COORD_SCALE]);
  const { type, coordinates } = feature.geometry;
  let newCoords;
  if (type === 'Polygon') newCoords = coordinates.map(scaleRing);
  else if (type === 'MultiPolygon') newCoords = coordinates.map(poly => poly.map(scaleRing));
  else return feature;
  return turf.feature({ type, coordinates: newCoords });
};


/**
 * Convierte un string de path SVG (M, L, Z) a un polígono GeoJSON válido de Turf.js.
 * Asume un polígono simple sin huecos.
 * @param {string} pathString - La ruta SVG (ej. "M 10 20 L 30 40 L 50 60 Z")
 * @returns {Feature<Polygon>|null} - Objeto GeoJSON de Turf o null si es inválido.
 */
export const svgPathToGeoJSON = (pathString) => {
  if (!pathString || typeof pathString !== 'string') return null;

  // Extraer comandos (M, L, Z) y números (coordenadas)
  const tokens = pathString.match(/[a-zA-Z]|[-+]?[0-9]*\.?[0-9]+/g);
  if (!tokens) return null;

  const coordinates = [];
  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i].toUpperCase();
    if (token === 'M' || token === 'L') {
      i++;
    } else if (token === 'Z') {
      i++;
      break;
    } else {
      // Es un número, asume un par x, y
      const x = parseFloat(tokens[i]);
      const y = parseFloat(tokens[i + 1]);
      if (!isNaN(x) && !isNaN(y)) {
        coordinates.push([x, y]);
      }
      i += 2;
    }
  }

  // Cerrar el polígono matemáticamente si no está cerrado
  if (coordinates.length >= 3) {
    const first = coordinates[0];
    const last = coordinates[coordinates.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      coordinates.push([...first]);
    }
  }

  // Un polígono lineal en GeoJSON requiere mínimo 4 puntos (3 vértices únicos + 1 de cierre)
  if (coordinates.length < 4) return null; 

  return turf.polygon([coordinates]);
};

/**
 * Convierte un polígono GeoJSON de Turf.js a un string de path SVG válido.
 * @param {Feature<Polygon>} geoJsonPolygon - Objeto GeoJSON de Turf
 * @returns {string} - Ruta SVG (ej. "M 10 20 L 30 40 Z")
 */
export const geoJSONToSvgPath = (geoJson) => {
  if (!geoJson || !geoJson.geometry) return '';
  
  const { type, coordinates } = geoJson.geometry;

  const renderRing = (ring) => {
    return ring.map((point, i) => {
      const cmd = i === 0 ? 'M' : 'L';
      return `${cmd} ${Number(point[0].toFixed(2))} ${Number(point[1].toFixed(2))}`;
    }).join(' ') + ' Z';
  };

  if (type === 'Polygon') {
    return coordinates.map(renderRing).join(' ').trim();
  } 
  
  if (type === 'MultiPolygon') {
    return coordinates.map(polygon => 
      polygon.map(renderRing).join(' ')
    ).join(' ').trim();
  }

  return '';
};

/**
 * Fusiona iterativamente un array de predios usando turf.union.
 * IMPORTANTE: Las coordenadas del SVG son píxeles (cartesianas), NO grados WGS84.
 * Turf.js trata todas las coordenadas como grados lat/lon. Si x > 180 o y > 90, Turf
 * "envuelve" las coordenadas (wrap), desplazando el polígono resultante al origen.
 * Solución: normalizar con TURF_COORD_SCALE antes de any operación Turf y revertir al final.
 *
 * @param {Array} lotsArray - Array local de predios (cada uno con .path o .svg_path en SVG)
 * @returns {Object|null} - { svg_path, centroid } del nuevo polígono o null
 */
export const mergeLots = (lotsArray) => {
  if (!lotsArray || lotsArray.length < 2) return null;

  // Buffer mínimo en espacio normalizado para cerrar micro-gaps de dibujo (1.5 px)
  const BUFFER_VAL = 0.0015;
  let mergedPolygon = null;

  for (const lot of lotsArray) {
    // Soportar tanto 'path' (propiedad local) como 'svg_path' (del backend)
    const pathData = lot.path || lot.svg_path;
    let poly = svgPathToGeoJSON(pathData);
    if (!poly) {
      console.warn('[mergeLots] No se pudo parsear el path del lote:', lot.id);
      continue;
    }

    // 1. Normalizar al espacio seguro de Turf (div por TURF_COORD_SCALE)
    poly = _downscaleGeoJSON(poly);

    // 2. Micro-buffer para cerrar gaps de dibujo entre bordes adyacentes
    try {
      poly = turf.buffer(poly, BUFFER_VAL, { units: 'degrees' });
    } catch (bufErr) {
      console.warn('[mergeLots] Buffer falló para lote', lot.id, ':', bufErr.message);
    }

    if (!mergedPolygon) {
      mergedPolygon = poly;
    } else {
      try {
        const unified = turf.union(turf.featureCollection([mergedPolygon, poly]));
        if (unified) mergedPolygon = unified;
      } catch (unionErr) {
        console.error('[mergeLots] turf.union falló:', unionErr.message);
        return null;
      }
    }
  }

  if (!mergedPolygon) return null;

  // 3. Desinflado: revertir micro-buffer
  try {
    const deflated = turf.buffer(mergedPolygon, -BUFFER_VAL, { units: 'degrees' });
    if (deflated) mergedPolygon = deflated;
  } catch (deflateErr) {
    console.warn('[mergeLots] Desinflado falló:', deflateErr.message);
  }

  // 3.5 Eliminar huecos internos (para que quede solo el contorno exterior de la unión, sin bordes independientes)
  try {
    if (mergedPolygon.geometry.type === 'Polygon') {
      // Un Polygon tiene arreglo de anillos: [anilloExterior, hueco1, hueco2...] -> dejamos solo el exterior
      mergedPolygon.geometry.coordinates = [mergedPolygon.geometry.coordinates[0]];
    } else if (mergedPolygon.geometry.type === 'MultiPolygon') {
      // Un MultiPolygon tiene una lista de Polygon: [ [exterior, hueco1], [exterior2, hueco2] ]
      mergedPolygon.geometry.coordinates = mergedPolygon.geometry.coordinates.map(polygonData => {
        return [polygonData[0]]; // conservar solo el anillo exterior de cada componente
      });
    }
  } catch (stripErr) {
    console.warn('[mergeLots] Error al eliminar huecos:', stripErr.message);
  }

  // 4. Centroide en espacio normalizado → reescalar a píxeles SVG
  const center = turf.centerOfMass(mergedPolygon);
  const centroid = {
    x: center.geometry.coordinates[0] * TURF_COORD_SCALE,
    y: center.geometry.coordinates[1] * TURF_COORD_SCALE
  };

  // 5. Revertir escala y generar SVG path en píxeles originales
  const upscaled = _upscaleGeoJSON(mergedPolygon);
  const newPath = geoJSONToSvgPath(upscaled);

  if (!newPath) {
    console.error('[mergeLots] geoJSONToSvgPath devolvió path vacío. GeoJSON:', JSON.stringify(upscaled?.geometry));
    return null;
  }

  return {
    svg_path: newPath,
    centroid
  };
};

/**
 * Valida si un set de lotes colindan (forman una pieza única al inflarse con coordinate snapping).
 * @param {Array} lotsArray 
 * @returns {boolean}
 */
export const areLotsContiguous = (lotsArray) => {
  if (!lotsArray || lotsArray.length < 2) return true;
  try {
    // Usamos el motor de topología para ver si forman un solo componente conexo
    // Epsilon de 1.0 para absorber gaps de dibujo
    const blocks = groupLotsIntoBlocks(lotsArray, 1.0);
    return blocks.length === 1;
  } catch (e) {
    console.error("Error en validación de contigüidad:", e);
    return false;
  }
};

/**
 * Genera el identificador visual de la unión de lotes.
 * Ej: MZ01ID01 y MZ01ID02 -> MZ01ID01-02
 * @param {Array} selectedLots - Lotes a unir
 * @returns {string} ID formateado
 */
export const generateMergedId = (selectedLots) => {
  if (!selectedLots || selectedLots.length === 0) return '';
  
  // Intentar obtener el ID visual de display_id o number
  const firstLot = selectedLots[0];
  const firstId = firstLot.display_id || firstLot.number || '';
  if (!firstId) return `Fusion-${Date.now()}`;

  // Caso 1: Formato MZxxIDxx
  const baseMzMatch = firstId.match(/^MZ(\d+)/);
  if (baseMzMatch) {
    const baseMz = baseMzMatch[1];
    const ids = [];
    for (const lot of selectedLots) {
      const lid = lot.display_id || lot.number || '';
      const match = lid.match(/^MZ(\d+)ID(\d+(?:-\d+)*)$/);
      if (match && match[1] === baseMz) {
        const subIds = match[2].split('-').map(String);
        ids.push(...subIds);
      }
    }
    
    if (ids.length > 0) {
      const uniqueSortedIds = [...new Set(ids)].sort((a, b) => {
        const na = parseInt(a, 10);
        const nb = parseInt(b, 10);
        return (isNaN(na) || isNaN(nb)) ? a.localeCompare(b) : na - nb;
      });
      // Asegurar padding de 2 para sub-IDs si son numéricos puros
      const formattedSubIds = uniqueSortedIds.map(id => {
        return /^\d+$/.test(id) ? id.padStart(2, '0') : id;
      }).join('-');
      
      return `MZ${baseMz}ID${formattedSubIds}`;
    }
  }

  // Caso 2: Fallback para formatos simples (ej: "1", "2" o "Lote-1")
  const simpleIds = selectedLots.map(lot => {
    const lid = lot.display_id || lot.number || '';
    return lid.replace(/^Lote-/, '');
  });

  const uniqueSortedSimple = [...new Set(simpleIds)].sort((a, b) => {
    const na = parseInt(a, 10);
    const nb = parseInt(b, 10);
    return (isNaN(na) || isNaN(nb)) ? a.localeCompare(b) : na - nb;
  });

  const prefix = firstId.startsWith('Lote-') ? 'Lote-' : '';
  return `${prefix}${uniqueSortedSimple.join('-')}`;
};

// ======================== FASE 3: SPLIT ======================== //

// Funciones de utilidad movidas a GeometricCore.js

// Distancia Cartesiana para evitar distorsión de proyección esférica con turf.js
const pointToLineDistanceCartesian = (p, lineCoords) => {
  let minDist = Infinity;
  for (let i = 0; i < lineCoords.length - 1; i++) {
    const d = distPointToSegment(p, lineCoords[i], lineCoords[i+1]);
    if (d < minDist) minDist = d;
  }
  return minDist;
};

/**
 * Detecta las aristas libres (no compartidas con otros lotes) de un polígono.
 * Devuelve un array de { segment: [p1, p2], len } filtrados y clasificados.
 * 
 * @param {Feature<Polygon>} targetLotGeoJSON - Polígono del lote objetivo (en pixel-space)
 * @param {Feature<Polygon>[]} allLotsGeoJSON - Todos los demás lotes de la manzana
 * @param {number} shareTolerance - Distancia máxima para considerar un borde como "compartido"
 * @returns {{ segment, len }[]} - Bordes libres ordenados por longitud desc
 */
const findFreeEdges = (targetLotGeoJSON, allLotsGeoJSON, shareTolerance = 2.0) => {
  const otherLines = allLotsGeoJSON.map(p => turf.polygonToLine(p));
  const coords = targetLotGeoJSON.geometry.coordinates[0];
  const freeEdges = [];

  for (let i = 0; i < coords.length - 1; i++) {
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    const len = Math.sqrt(dx * dx + dy * dy);

    // Muestrear 5 puntos a lo largo del segmento para un chequeo más robusto
    const testPoints = [0.1, 0.3, 0.5, 0.7, 0.9].map(t => [
      p1[0] + dx * t, p1[1] + dy * t
    ]);

    let isShared = false;
    for (const line of otherLines) {
      const lineCoords = line.geometry.type === 'LineString'
        ? line.geometry.coordinates
        : line.geometry.coordinates[0];

      // Un borde se considera "compartido" si la MAYORÍA de sus puntos de muestreo
      // están muy cerca de otro lote (tolerancia aumentada a 2.0 para absorber micro-gaps SVG)
      let sharedCount = 0;
      for (const pt of testPoints) {
        if (pointToLineDistanceCartesian(pt, lineCoords) < shareTolerance) {
          sharedCount++;
        }
      }
      if (sharedCount >= 3) { // al menos 3/5 muestras tocando = borde compartido
        isShared = true;
        break;
      }
    }

    if (!isShared && len > 1) {
      freeEdges.push({ segment: [p1, p2], len });
    }
  }

  // Ordenar de mayor a menor longitud
  return freeEdges.sort((a, b) => b.len - a.len);
};

/**
 * Detecta la línea de fachada "principal" de un lote.
 * Por defecto, devuelve el borde libre MÁS LARGO (tipicamente la fachada de calle).
 * 
 * @param {Feature<Polygon>} targetLotGeoJSON 
 * @param {Feature<Polygon>[]} allLotsGeoJSON 
 * @param {'depth'|'width'} [orientation='depth'] - 'depth' = corte perpendicular a la calle (default, divide el ancho); 'width' = corte paralelo a la calle (divide la profundidad)
 * @returns {[number,number][]} - Par de puntos [p1, p2]
 */
export const findFrontageLine = (targetLotGeoJSON, allLotsGeoJSON, orientation = 'depth') => {
  const coords = targetLotGeoJSON.geometry.coordinates[0];
  const freeEdges = findFreeEdges(targetLotGeoJSON, allLotsGeoJSON);

  if (freeEdges.length === 0) {
    // Fallback: si está completamente rodeado, usar el borde más largo del polígono
    let maxLen = -1;
    let fallback = null;
    for (let i = 0; i < coords.length - 1; i++) {
      const dx = coords[i+1][0] - coords[i][0];
      const dy = coords[i+1][1] - coords[i][1];
      const len = Math.sqrt(dx*dx + dy*dy);
      if (len > maxLen) { maxLen = len; fallback = [coords[i], coords[i+1]]; }
    }
    return fallback;
  }

  // 'depth' = dividir por el ancho del lote → la línea de corte es PARALELA al borde libre más largo
  //   → para esto usamos el borde libre MÁS LARGO como guía de dirección de corte
  // 'width' = dividir por la profundidad → línea de corte PERPENDICULAR al frente
  //   → para esto usamos el borde libre más CORTO disponible
  if (orientation === 'depth') {
    // Corte estándar catastral: se parte a lo ancho → línea de corte va perp. a la calle
    // → necesitamos el frente más largo
    return freeEdges[0].segment;
  } else {
    // 'width': se parte a lo largo → línea de corte va paralela a la calle
    // → necesitamos el borde perpendicular al frente, que es el más corto de los libres
    const sorted = [...freeEdges].sort((a, b) => a.len - b.len);
    return sorted[0].segment;
  }
};

/**
 * Divide un lote en N partes utilizando el algoritmo de intersección de semiplanos.
 * Este enfoque garantiza CERO GAP entre las piezas resultantes porque cada pieza
 * se calcula como la intersección del polígono original con un semiplano distinto.
 * 
 * @param {Object} targetLot - Lote a dividir (con .path o .svg_path)
 * @param {number} parts - Número de partes
 * @param {Object[]} allLotsInBlock - Todos los lotes de la manzana para detectar fachada
 * @param {'depth'|'width'} [splitDirection='depth'] - Dirección del corte
 * @returns {{ svg_path: string, centroid: { x, y } }[] | null}
 */
export const splitLot = (targetLot, parts, allLotsInBlock, splitDirection = 'depth') => {
  // --- FASE 1: Detectar fachada en espacio de píxeles ---
  const targetPoly = svgPathToGeoJSON(targetLot.path || targetLot.svg_path);
  if (!targetPoly) return null;

  const otherPolys = allLotsInBlock
    .filter(l => l.id !== targetLot.id)
    .map(l => svgPathToGeoJSON(l.path || l.svg_path))
    .filter(Boolean);

  const facade = findFrontageLine(targetPoly, otherPolys, splitDirection);
  if (!facade) return null;

  // --- FASE 2: Calcular puntos de corte sobre la fachada en espacio normalizado ---
  const [p1raw, p2raw] = facade;
  const p1 = [p1raw[0] / TURF_COORD_SCALE, p1raw[1] / TURF_COORD_SCALE];
  const p2 = [p2raw[0] / TURF_COORD_SCALE, p2raw[1] / TURF_COORD_SCALE];

  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return null;

  // Vector normal a la fachada (perpendicular al corte)
  const nx = -dy / len;
  const ny = dx / len;

  // Puntos de división equidistante sobre la fachada
  const cutPoints = [];
  for (let i = 1; i < parts; i++) {
    const fraction = i / parts;
    cutPoints.push([p1[0] + dx * fraction, p1[1] + dy * fraction]);
  }

  // MAX_EXTENT: extensión del semiplano (equivale a ~30 000 000 px en espacio original)
  const MAX_EXTENT = 30000;

  // --- FASE 3: Algoritmo de Intersección de Semiplanos (ZERO GAP) ---
  // En vez de restar una "línea gruesa", calculamos cada pieza como la INTERSECCIÓN
  // del polígono original con un semiplano definido exactamente en la línea de corte.
  // Esto garantiza que los bordes de piezas adyacentes sean idénticos → 0 gap.
  const scaledTarget = _downscaleGeoJSON(targetPoly);
  const resultPolys = [];

  // Las líneas de corte dividen el polígono en (parts) regiones.
  // Para cada región k, la intersectamos con:
  //   - Semiplano "derecho" del corte k-1 (si existe)
  //   - Semiplano "izquierdo" del corte k (si existe)
  const buildHalfPlane = (cp, side) => {
    // side = 1 → semiplano a la "derecha" de la normal (nx,ny)
    // side = -1 → semiplano a la "izquierda"
    const s = side;
    // Cuatro esquinas de un rectángulo enorme en un lado de la línea
    const pA = [cp[0] + dx * MAX_EXTENT, cp[1] + dy * MAX_EXTENT];
    const pB = [cp[0] - dx * MAX_EXTENT, cp[1] - dy * MAX_EXTENT];
    const pC = [pB[0] + s * nx * MAX_EXTENT, pB[1] + s * ny * MAX_EXTENT];
    const pD = [pA[0] + s * nx * MAX_EXTENT, pA[1] + s * ny * MAX_EXTENT];
    return turf.polygon([[pA, pB, pC, pD, pA]]);
  };

  for (let k = 0; k < parts; k++) {
    try {
      let piece = scaledTarget;

      // Intersectar con semiplano izquierdo del corte k (si k < parts-1)
      if (k < parts - 1) {
        const hp = buildHalfPlane(cutPoints[k], -1);
        const inter = turf.intersect(turf.featureCollection([piece, hp]));
        if (!inter) continue;
        piece = inter;
      }

      // Intersectar con semiplano derecho del corte k-1 (si k > 0)
      if (k > 0) {
        const hp = buildHalfPlane(cutPoints[k - 1], 1);
        const inter = turf.intersect(turf.featureCollection([piece, hp]));
        if (!inter) continue;
        piece = inter;
      }

      resultPolys.push(piece);
    } catch (e) {
      console.warn(`[splitLot] Error al calcular pieza ${k}:`, e.message);
    }
  }

  // --- FASE 4: Filtrar artefactos, reescalar y generar SVG paths ---
  const cartesianArea = (coords) => {
    let area = 0;
    const pts = coords[0];
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      area += (pts[j][0] + pts[i][0]) * (pts[j][1] - pts[i][1]);
    }
    return Math.abs(area / 2);
  };

  const origArea = cartesianArea(scaledTarget.geometry.coordinates);
  const minArea = origArea * 0.02; // descartar artefactos < 2% del área original

  const validResults = [];
  for (const piece of resultPolys) {
    // Manejar tanto Polygon como MultiPolygon resultante
    const geomType = piece.geometry.type;
    const subPolys = geomType === 'MultiPolygon'
      ? piece.geometry.coordinates.map(c => turf.polygon(c))
      : [piece];

    for (const sp of subPolys) {
      if (cartesianArea(sp.geometry.coordinates) < minArea) continue;
      const center = turf.centerOfMass(sp);
      const upscaled = _upscaleGeoJSON(sp);
      validResults.push({
        svg_path: geoJSONToSvgPath(upscaled),
        centroid: {
          x: center.geometry.coordinates[0] * TURF_COORD_SCALE,
          y: center.geometry.coordinates[1] * TURF_COORD_SCALE
        }
      });
    }
  }

  // Si el algoritmo de semiplanos no produjo resultados (geometría muy irregular),
  // caer de vuelta al método antiguo de sustracción con grosor mínimo
  if (validResults.length < 2) {
    console.warn('[splitLot] Semiplanos fallaron, usando método de sustracción de respaldo.');
    const THICKNESS = 0.0001;
    let diffResult = scaledTarget;
    for (const cp of cutPoints) {
      const pA = [cp[0] + nx * MAX_EXTENT, cp[1] + ny * MAX_EXTENT];
      const pB = [cp[0] - nx * MAX_EXTENT, cp[1] - ny * MAX_EXTENT];
      const tx = (dx / len) * THICKNESS;
      const ty = (dy / len) * THICKNESS;
      const cutPoly = turf.polygon([[
        [pA[0] + tx, pA[1] + ty],
        [pB[0] + tx, pB[1] + ty],
        [pB[0] - tx, pB[1] - ty],
        [pA[0] - tx, pA[1] - ty],
        [pA[0] + tx, pA[1] + ty]
      ]]);
      try {
        const d = turf.difference(turf.featureCollection([diffResult, cutPoly]));
        if (d) diffResult = d;
      } catch(e) { /* ignorar */ }
    }

    let fallbackPolys = [];
    if (diffResult.geometry.type === 'Polygon') fallbackPolys.push(diffResult);
    else if (diffResult.geometry.type === 'MultiPolygon') {
      diffResult.geometry.coordinates.forEach(c => fallbackPolys.push(turf.polygon(c)));
    }
    fallbackPolys = fallbackPolys.filter(p => cartesianArea(p.geometry.coordinates) > minArea);

    return fallbackPolys.map(p => {
      const center = turf.centerOfMass(p);
      const upscaled = _upscaleGeoJSON(p);
      return {
        svg_path: geoJSONToSvgPath(upscaled),
        centroid: {
          x: center.geometry.coordinates[0] * TURF_COORD_SCALE,
          y: center.geometry.coordinates[1] * TURF_COORD_SCALE
        }
      };
    });
  }

  return validResults;
};

export const generateSplitIds = (baseId, parts) => {
  const ids = [];
  for (let i = 0; i < parts; i++) {
    // 65 = 'A'
    const suffix = String.fromCharCode(65 + i); 
    ids.push(`${baseId}-${suffix}`);
  }
  return ids;
};
