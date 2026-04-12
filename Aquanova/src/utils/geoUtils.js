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

  // Buffer mínimo en espacio normalizado para cerrar micro-gaps de dibujo
  const BUFFER_VAL = 0.0001;
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

export const findFrontageLine = (targetLotGeoJSON, allLotsGeoJSON) => {
  const otherLines = allLotsGeoJSON.map(p => turf.polygonToLine(p));
  
  const coords = targetLotGeoJSON.geometry.coordinates[0];
  let maxLen = -1;
  let frontageSegment = null;

  for (let i = 0; i < coords.length - 1; i++) {
    const p1 = coords[i];
    const p2 = coords[i + 1];
    
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    const len = Math.sqrt(dx * dx + dy * dy);

    // Muestreo de puntos en la línea para verificar compartición
    const testPoints = [
      [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2],
      [p1[0] + dx * 0.25, p1[1] + dy * 0.25],
      [p1[0] + dx * 0.75, p1[1] + dy * 0.75]
    ];

    let isShared = false;
    for (const line of otherLines) {
       for (const pt of testPoints) {
         const lineCoords = line.geometry.type === 'LineString' ? line.geometry.coordinates : line.geometry.coordinates[0];
         const dist = pointToLineDistanceCartesian(pt, lineCoords);
         if (dist < 0.1) {
            isShared = true;
            break;
         }
       }
       if (isShared) break;
    }

    if (!isShared) {
      if (len > maxLen) {
        maxLen = len;
        frontageSegment = [p1, p2];
      }
    }
  }

  // Fallback si es el único lote en la manzana u ocurrió un overlap
  if (!frontageSegment) {
    for (let i = 0; i < coords.length - 1; i++) {
       const dx = coords[i+1][0] - coords[i][0];
       const dy = coords[i+1][1] - coords[i][1];
       const len = Math.sqrt(dx*dx + dy*dy);
       if (len > maxLen) {
         maxLen = len;
         frontageSegment = [coords[i], coords[i+1]];
       }
    }
  }

  return frontageSegment;
};

export const splitLot = (targetLot, parts, allLotsInBlock) => {
  // --- FASE 1: Detectar fachada en espacio de píxeles (findFrontageLine trabaja en pixel-space) ---
  const targetPoly = svgPathToGeoJSON(targetLot.path || targetLot.svg_path);
  const otherPolys = allLotsInBlock
    .filter(l => l.id !== targetLot.id)
    .map(l => svgPathToGeoJSON(l.path || l.svg_path))
    .filter(Boolean);

  const facade = findFrontageLine(targetPoly, otherPolys);
  if (!facade) return null;

  // --- FASE 2: Generar polígonos de corte en espacio normalizado ---
  // Escalar la fachada al espacio seguro de Turf (dividir por TURF_COORD_SCALE)
  const [p1raw, p2raw] = facade;
  const p1 = [p1raw[0] / TURF_COORD_SCALE, p1raw[1] / TURF_COORD_SCALE];
  const p2 = [p2raw[0] / TURF_COORD_SCALE, p2raw[1] / TURF_COORD_SCALE];

  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  const len = Math.sqrt(dx * dx + dy * dy);
  const nx = -dy / len;
  const ny = dx / len;

  const cutPoints = [];
  for (let i = 1; i < parts; i++) {
    const fraction = i / parts;
    cutPoints.push([p1[0] + dx * fraction, p1[1] + dy * fraction]);
  }

  // MAX_EXTENT = extensión perpendicular del corte en espacio normalizado
  // (equivale a 30,000,000px en espacio original, más que cualquier mapa SVG posible)
  const MAX_EXTENT = 30000;
  const THICKNESS = 0.005; // Grosor del corte en espacio normalizado

  const cutBufferPolys = [];
  for (const cp of cutPoints) {
    const pA = [cp[0] + nx * MAX_EXTENT, cp[1] + ny * MAX_EXTENT];
    const pB = [cp[0] - nx * MAX_EXTENT, cp[1] - ny * MAX_EXTENT];
    const tx = (dx / len) * THICKNESS;
    const ty = (dy / len) * THICKNESS;
    const c1 = [pA[0] + tx, pA[1] + ty];
    const c2 = [pB[0] + tx, pB[1] + ty];
    const c3 = [pB[0] - tx, pB[1] - ty];
    const c4 = [pA[0] - tx, pA[1] - ty];
    cutBufferPolys.push(turf.polygon([[c1, c2, c3, c4, c1]]));
  }

  // --- FASE 3: Operación booleana de diferencia en espacio normalizado ---
  const scaledTargetPoly = _downscaleGeoJSON(targetPoly);
  let diffResultGeoJSON = scaledTargetPoly;
  for (const cutPoly of cutBufferPolys) {
    diffResultGeoJSON = turf.difference(turf.featureCollection([diffResultGeoJSON, cutPoly]));
  }

  if (!diffResultGeoJSON) return null;

  let finalPolys = [];
  if (diffResultGeoJSON.geometry.type === 'Polygon') {
    finalPolys.push(diffResultGeoJSON);
  } else if (diffResultGeoJSON.geometry.type === 'MultiPolygon') {
    diffResultGeoJSON.geometry.coordinates.forEach(coords => {
      finalPolys.push(turf.polygon(coords));
    });
  }

  // --- FASE 4: Filtrar artefactos y generar resultado en coordenadas originales ---
  const cartesianArea = (coords) => {
    let area = 0;
    const pts = coords[0];
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      area += (pts[j][0] + pts[i][0]) * (pts[j][1] - pts[i][1]);
    }
    return Math.abs(area / 2);
  };

  // origArea y piezas están en el mismo espacio normalizado: la comparación es directa
  const origArea = cartesianArea(scaledTargetPoly.geometry.coordinates);
  const validPolygons = finalPolys.filter(p => cartesianArea(p.geometry.coordinates) > (origArea * 0.02));

  return validPolygons.map(p => {
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
