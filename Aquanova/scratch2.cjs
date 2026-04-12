const turf = require('@turf/turf');

const targetPoly = turf.polygon([[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]]);
const direction = 'vertical';
const parts = 2;
const TURF_COORD_SCALE = 1;

let facade = null;
const bbox = turf.bbox(targetPoly);
const [minX, minY, maxX, maxY] = bbox;
if (direction === 'vertical') {
    // Cortes verticales -> distribuimos puntos horizontalmente
    facade = [[minX, minY], [maxX, minY]];
}
console.log('bbox:', bbox, 'facade:', facade);

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
console.log('cutPoints:', cutPoints, 'nx:', nx, 'ny:', ny);

const MAX_EXTENT = 30000;
const THICKNESS = 0.0001; 

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

let diffResultGeoJSON = targetPoly;
for (const cutPoly of cutBufferPolys) {
diffResultGeoJSON = turf.difference({
    type: 'FeatureCollection',
    features: [diffResultGeoJSON, cutPoly]
});
}

console.log('Final length:', diffResultGeoJSON ? (diffResultGeoJSON.geometry.type === 'MultiPolygon' ? diffResultGeoJSON.geometry.coordinates.length : 1) : 0);

