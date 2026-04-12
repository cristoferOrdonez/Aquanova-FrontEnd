import * as turf from '@turf/turf';

let u = turf.union(turf.featureCollection([
  turf.buffer(turf.polygon([[[0,0],[0,10],[10,10],[10,0],[0,0]]]), 0.005, { units: 'degrees', steps: 8 }),
  turf.buffer(turf.polygon([[[10.003,0],[10.003,10],[20,10],[20,0],[10.003,0]]]), 0.005, { units: 'degrees', steps: 8 })
]));
let d = turf.buffer(u, -0.005, { units: 'degrees', steps: 8 });

console.log("Original points:", d.geometry.coordinates[0].length);

let sim = turf.simplify(d, { tolerance: 0.0001, mutate: false });
console.log("Simplified points (0.0001):", sim.geometry.coordinates[0].length);

let sim2 = turf.simplify(d, { tolerance: 0.005, mutate: false });
console.log("Simplified points (0.005):", sim2.geometry.coordinates[0].length);

let sim3 = turf.simplify(d, { tolerance: 0.001, mutate: false });
console.log("Simplified points (0.001):", sim3.geometry.coordinates[0].length);

