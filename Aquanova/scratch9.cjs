const turf = require('@turf/turf');
const geom = { type: 'Polygon', coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]] };
const feat = turf.feature(geom);
console.log('Feat:', JSON.stringify(feat));
