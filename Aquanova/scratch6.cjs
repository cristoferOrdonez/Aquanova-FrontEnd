const turf = require('@turf/turf');
const p1 = turf.polygon([[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]]);
const p2 = turf.polygon([[[0,-1], [10,-1], [10, 11], [0, 11], [0,-1]]]); // Complely covers p1
const res1 = turf.difference(turf.featureCollection([p1, p2]));
console.log('Result 1:', res1);
if (!res1) {
	try {
		turf.difference(turf.featureCollection([res1, p2]));
	} catch (e) {
		console.log('Error 1:', e.message);
	}
}
