const fs = require('fs');

const code = fs.readFileSync('src/utils/geoUtils.js', 'utf8');
const lines = code.split('\n');

const testScript = lines.join('\n').replace(/import.*?from.*/g, '');

const runner = `
const turf = require('@turf/turf');
const pointToLineDistanceCartesian = () => 0;
${testScript.replace(/export /g, '')}

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
