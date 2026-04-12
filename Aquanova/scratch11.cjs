const turf = require('@turf/turf');

function renderRing(ring) {
  return ring.map((point, i) => {
    const cmd = i === 0 ? 'M' : 'L';
    return `${cmd} ${Number(point[0].toFixed(2))} ${Number(point[1].toFixed(2))}`;
  }).join(' ') + ' Z';
}

function geoJSONToSvgPath(geoJson) {
  if (!geoJson || !geoJson.geometry) return '';
  const { type, coordinates } = geoJson.geometry;
  if (type === 'Polygon') return coordinates.map(renderRing).join(' ').trim();
  if (type === 'MultiPolygon') return coordinates.map(polygon => polygon.map(renderRing).join(' ')).join(' ').trim();
  return '';
}

const targetPoly = turf.polygon([[[5, 0], [10, 10], [0, 10], [5, 0]]]);
const bbox = turf.bbox(targetPoly);
const [minX, minY, maxX, maxY] = bbox;

let facade = [[minX, minY], [maxX, minY]]; // Vertical direction
const [p1, p2] = facade;
const dx = p2[0] - p1[0];
const dy = p2[1] - p1[1];
const len = Math.sqrt(dx * dx + dy * dy);
const nx = -dy / len;
const ny = dx / len;

const parts = 2;
const MAX_EXTENT = 30000;
const THICKNESS = 0.05;

const cutBufferPolys = [];
for (let i = 1; i < parts; i++) {
  const fraction = i / parts;
  const cp = [p1[0] + dx * fraction, p1[1] + dy * fraction];
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

let diffResultGeoJSON = targetPoly;
for (const cutPoly of cutBufferPolys) {
  let cleanPoly = turf.simplify(diffResultGeoJSON, { tolerance: 0.0001, highQuality: true, mutate: false });
  diffResultGeoJSON = turf.difference(turf.featureCollection([cleanPoly, cutPoly]));
}

let finalPolys = [];
if (diffResultGeoJSON.geometry.type === 'Polygon') {
  finalPolys.push(diffResultGeoJSON);
} else if (diffResultGeoJSON.geometry.type === 'MultiPolygon') {
  diffResultGeoJSON.geometry.coordinates.forEach(coords => {
    finalPolys.push(turf.polygon(coords));
  });
}

console.log(finalPolys.map(p => geoJSONToSvgPath(p)));
