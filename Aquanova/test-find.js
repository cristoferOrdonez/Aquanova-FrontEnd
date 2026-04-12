import * as turf from '@turf/turf';
import { findFrontageLine } from './src/utils/geoUtils.js';

let mp = turf.multiPolygon([
  [[[0,0],[0,10],[10,10],[10,0],[0,0]]],
  [[[10,0],[10,10],[20,10],[20,0],[10,0]]]
]);

try {
  let f = findFrontageLine(mp, []);
  console.log("Facade:", f);
} catch(e) {
  console.error("Error:", e);
}
