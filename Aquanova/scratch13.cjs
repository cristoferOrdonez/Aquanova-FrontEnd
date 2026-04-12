const turf = require('@turf/turf');
const p1 = turf.polygon([[[0, 0], [5, 0], [10, 0], [10, 10], [0, 10], [0, 5], [0, 0]]]); // contains collinear vertices at (5,0) and (0,5)
const cleaned = turf.cleanCoords(p1);
console.log(cleaned.geometry.coordinates[0]);
// Let's also test simplify
const simplified = turf.simplify(p1, { tolerance: 1 });
console.log(simplified.geometry.coordinates[0]);
