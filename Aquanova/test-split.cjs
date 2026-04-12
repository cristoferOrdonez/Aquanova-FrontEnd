const turf = require('@turf/turf');

try {
  let mp = turf.multiPolygon([
    [[[0,0], [0,10], [10,10], [10,0], [0,0]]],
    [[[10,0], [10,10], [20,10], [20,0], [10,0]]]
  ]);
  let cut = turf.polygon([[[-5, 5], [30, 5], [30, 6], [-5, 6], [-5, 5]]]);

  let res = turf.difference(turf.featureCollection([mp, cut]));
  console.log(res.geometry.type);
} catch(e) {
  console.error("DIFFERENCE ERROR!", e);
}
