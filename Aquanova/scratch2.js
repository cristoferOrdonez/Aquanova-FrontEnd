import * as turf from '@turf/turf';
const p1 = turf.polygon([[[0,0],[10,0],[10,10],[0,10],[0,0]]]);
const p2 = turf.polygon([[[4, -5],[6, -5],[6, 15],[4,15],[4,-5]]]);
const p3 = turf.polygon([[[0, 4],[10, 4],[10, 6],[0,6],[0,4]]]);
let res = turf.difference(turf.featureCollection([p1, p2]));
res = turf.difference(turf.featureCollection([res, p3]));
console.log("Difference type:", res?.geometry.type);
console.log("Coordinates length (polygons inside):", res?.geometry.coordinates.length);
