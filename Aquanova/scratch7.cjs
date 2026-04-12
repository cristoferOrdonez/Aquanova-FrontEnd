const turf = require('@turf/turf');
const p1 = turf.multiPolygon([[[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]]]);
const p2 = turf.polygon([[[4, -1], [6, -1], [6, 11], [4, 11], [4, -1]]]);
try {
	const res1 = turf.difference(turf.featureCollection([p1, p2]));
	console.log('Result 1:', res1.geometry.type);
} catch (e) {
	console.log('Error 1:', e.message);
}
