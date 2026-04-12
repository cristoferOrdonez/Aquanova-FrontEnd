const fs = require('fs');
const code = fs.readFileSync('src/utils/geoUtils.js', 'utf8');

const testScript = code.replace(/import.*?from.*/g, '').replace(/export /g, '');

const runner = `
import * as turf from '@turf/turf';
const distPointToSegment = () => 0;

${testScript}

const p = turf.multiPolygon([
  [[[0,0],[0,10],[10,10],[10,0],[0,0]]],
  [[[10,0],[10,10],[20,10],[20,0],[10,0]]]
]);

try {
  let f = findFrontageLine(p, []);
  console.log("Facade:", f);
} catch(e) {
  console.error("Error:", e);
}
`;

fs.writeFileSync('test-run.js', runner);
