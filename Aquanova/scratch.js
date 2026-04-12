import * as turf from '@turf/turf';
console.log(typeof turf.difference);
const p1 = turf.polygon([[[0,0],[10,0],[10,10],[0,10],[0,0]]]);
const p2 = turf.polygon([[[2, -5],[8, -5],[8, 15],[2,15],[2,-5]]]);
const res = turf.difference(turf.featureCollection([p1, p2]));
console.log("Difference type:", res?.geometry.type);
