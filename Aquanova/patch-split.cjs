const fs = require('fs');
const code = fs.readFileSync('src/utils/geoUtils.js', 'utf8');

const regex = /for \(const cutPoly of cutBufferPolys\) \{\n      diffResultGeoJSON = turf\.difference\(turf\.featureCollection\(\[diffResultGeoJSON, cutPoly\]\)\);\n    \}/g;
const replacement = `for (const cutPoly of cutBufferPolys) {
      if (!diffResultGeoJSON) break;
      try {
        const diff = turf.difference(turf.featureCollection([diffResultGeoJSON, cutPoly]));
        diffResultGeoJSON = diff;
      } catch (err) {
        console.error('[splitLot] Error durante recorte de diferencia:', err);
        return null;
      }
    }`;

fs.writeFileSync('src/utils/geoUtils.js', code.replace(regex, replacement));
console.log("Patched splitLot");
