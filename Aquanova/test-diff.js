import * as turf from '@turf/turf';

let p = turf.multiPolygon([
  [[[0,0],[0,10],[10,10],[10,0],[0,0]]],
  [[[10,0],[10,10],[20,10],[20,0],[10,0]]]
]);
let c = turf.polygon([[[-1,5],[30,5],[30,6],[-1,6],[-1,5]]]);

try {
  let res = turf.difference(turf.featureCollection([p, c]));
  console.log(res);
} catch(e) {
  console.error("DIFFERENCE ERROR!", e);
}
