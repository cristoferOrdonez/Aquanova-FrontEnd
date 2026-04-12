const turf = require('@turf/turf');
const p1 = turf.polygon([[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]]);
const p2 = turf.polygon([[[4, -1], [6, -1], [6, 11], [4, 11], [4, -1]]]);
const res1 = turf.difference({type:'FeatureCollection', features: [p1, p2]});
console.log('Result 1:', res1);
const res2 = turf.difference(p1, p2);
console.log('Result 2:', res2 ? res2.geometry.type : null);
