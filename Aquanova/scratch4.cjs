const turf = require('@turf/turf');
const parts = 2;
const MAX_EXTENT = 30000;
const THICKNESS = 0.0001; 

function performSplit(direction) {
	const targetPoly = turf.polygon([[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]]);
	const bbox = turf.bbox(targetPoly);
	const [minX, minY, maxX, maxY] = bbox;
	let facade;
	if (direction === 'vertical') {
		facade = [[minX, minY], [maxX, minY]];
	} else if (direction === 'horizontal') {
		facade = [[minX, minY], [minX, maxY]];
	}

	const [p1, p2] = facade;
	const dx = p2[0] - p1[0];
	const dy = p2[1] - p1[1];
	const len = Math.sqrt(dx * dx + dy * dy);
	const nx = -dy / len;
	const ny = dx / len;

	const cutPoints = [];
	for (let i = 1; i < parts; i++) {
		const fraction = i / parts;
		cutPoints.push([p1[0] + dx * fraction, p1[1] + dy * fraction]);
	}

	const cutBufferPolys = [];
	for (const cp of cutPoints) {
		const pA = [cp[0] + nx * MAX_EXTENT, cp[1] + ny * MAX_EXTENT];
		const pB = [cp[0] - nx * MAX_EXTENT, cp[1] - ny * MAX_EXTENT];
		const tx = (dx / len) * THICKNESS;
		const ty = (dy / len) * THICKNESS;
		const c1 = [pA[0] + tx, pA[1] + ty];
		const c2 = [pB[0] + tx, pB[1] + ty];
		const c3 = [pB[0] - tx, pB[1] - ty];
		const c4 = [pA[0] - tx, pA[1] - ty];
		cutBufferPolys.push(turf.polygon([[c1, c2, c3, c4, c1]]));
	}

	let diffResultGeoJSON = targetPoly;
	for (const cutPoly of cutBufferPolys) {
		diffResultGeoJSON = turf.difference(turf.featureCollection([diffResultGeoJSON, cutPoly]));
	}
	
	let lenPoly = diffResultGeoJSON ? (diffResultGeoJSON.geometry.type === 'MultiPolygon' ? diffResultGeoJSON.geometry.coordinates.length : 1) : 0;
	console.log(`Direction: ${direction}, Length: ${lenPoly}`);
}

performSplit('vertical');
performSplit('horizontal');

