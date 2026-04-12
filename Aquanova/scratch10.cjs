const turf = require('@turf/turf');
const p1 = turf.polygon([[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]]);
const bbox = turf.bbox(p1);
console.log(bbox);
