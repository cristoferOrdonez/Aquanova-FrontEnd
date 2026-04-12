const turf = require('@turf/turf');

const poly = turf.polygon([[
	[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]
]]);

const bbox = turf.bbox(poly);
console.log('bbox:', bbox);

const [minX, minY, maxX, maxY] = bbox;
console.log('vertical facade:', [[minX, minY], [maxX, minY]]);
console.log('len:', Math.sqrt((maxX - minX)**2));
