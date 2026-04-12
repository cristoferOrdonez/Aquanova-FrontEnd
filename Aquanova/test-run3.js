import * as turf from '@turf/turf';

let u = turf.union(turf.featureCollection([
  turf.buffer(turf.polygon([[[0,0],[0,10],[10,10],[10,0],[0,0]]]), 2, { units: 'degrees' }),
  turf.buffer(turf.polygon([[[11,0],[11,10],[21,10],[21,0],[11,0]]]), 2, { units: 'degrees' })
]));
let d = turf.buffer(u, -2, { units: 'degrees' });

// We simulate splitLot on "d"
// 1. _downscaleGeoJSON
const d_scale = turf.feature({ type: d.geometry.type, coordinates: d.geometry.coordinates });
// 2. difference it
try {
  let cut = turf.polygon([[[-5, 5], [30, 5], [30, 6], [-5, 6], [-5, 5]]]);
  let result = turf.difference(turf.featureCollection([d_scale, cut]));
  console.log(result.geometry.type);
} catch(e) {
  console.error("DIFFERENCE:", e);
}
