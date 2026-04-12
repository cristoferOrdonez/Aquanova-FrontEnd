const turf = require('@turf/turf');

const p1 = turf.polygon([[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]]);

// Clockwise
const cutCw = turf.polygon([[[5.1, 20], [5.1, -10], [4.9, -10], [4.9, 20], [5.1, 20]]]);
// CCW
const cutCcw = turf.polygon([[[5.1, 20], [4.9, 20], [4.9, -10], [5.1, -10], [5.1, 20]]]);

const resCw = turf.difference(turf.featureCollection([p1, cutCw]));
const resCcw = turf.difference(turf.featureCollection([p1, cutCcw]));

console.log('Result CW:', resCw ? resCw.geometry.type : null);
console.log('Result CCW:', resCcw ? resCcw.geometry.type : null);

console.log('CW coordinates:', JSON.stringify(resCw ? resCw.geometry.coordinates : null));
