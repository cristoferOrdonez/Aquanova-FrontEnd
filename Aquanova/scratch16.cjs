const turf = require('@turf/turf');
const p1 = turf.polygon([[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]]);
const p2 = turf.polygon([[[10.1, 0], [20, 0], [20, 10], [10.1, 10], [10.1, 0]]]);
// small gap bridge:
let p1buf = turf.buffer(p1, 0.2, { steps: 1 });
let p2buf = turf.buffer(p2, 0.2, { steps: 1 });
let u = turf.union(turf.featureCollection([p1buf, p2buf]));
let deflated = turf.buffer(u, -0.2, { steps: 1 });
console.log('Result type:', deflated.geometry.type);
console.log('Result pts:', JSON.stringify(deflated.geometry.coordinates));
