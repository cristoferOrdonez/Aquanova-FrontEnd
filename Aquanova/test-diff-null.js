import * as turf from '@turf/turf';

let cutPoly = turf.polygon([[[0,0], [0,10], [10,10], [10,0], [0,0]]]);

try {
  let fc = turf.featureCollection([null, cutPoly]);
  console.log("Feature collection passed");
  turf.difference(fc);
  console.log("Difference passed");
} catch(e) {
  console.error("Crash!", e.message);
}
