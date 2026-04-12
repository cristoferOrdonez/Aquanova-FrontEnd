import { polygonsAreAdjacent } from './GeometricCore';
import { svgPathToGeoJSON } from './geoUtils';

/**
 * Construye un grafo de adyacencia (lista de adyacencia) para un set de lotes.
 * @param {Array} lots - Array de objetos { id, path }
 * @param {number} epsilon - Tolerancia de colindancia
 * @returns {Map} Mapa de ID -> Array de IDs colindantes
 */
export const buildAdjacencyGraph = (lots, epsilon = 0.5) => {
  const graph = new Map();
  const polygonData = lots.map(lot => ({
    id: lot.id,
    coords: svgPathToGeoJSON(lot.path)?.geometry?.coordinates[0] || []
  })).filter(d => d.coords.length > 0);

  // Inicializar grafo
  polygonData.forEach(d => graph.set(d.id, []));

  // O(N^2) para encontrar colindancias (podría optimizarse con R-Tree si N > 100)
  for (let i = 0; i < polygonData.length; i++) {
    for (let j = i + 1; j < polygonData.length; j++) {
      if (polygonsAreAdjacent(polygonData[i].coords, polygonData[j].coords, epsilon)) {
        graph.get(polygonData[i].id).push(polygonData[j].id);
        graph.get(polygonData[j].id).push(polygonData[i].id);
      }
    }
  }

  return graph;
};

/**
 * Encuentra los componentes conexos de un grafo usando DFS.
 */
export const findConnectedComponents = (graph) => {
  const visited = new Set();
  const components = [];

  for (const nodeId of graph.keys()) {
    if (!visited.has(nodeId)) {
      const component = [];
      const stack = [nodeId];
      visited.add(nodeId);

      while (stack.length > 0) {
        const current = stack.pop();
        component.push(current);

        const neighbors = graph.get(current) || [];
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            stack.push(neighbor);
          }
        }
      }
      components.push(component);
    }
  }

  return components;
};

/**
 * Agrupa una lista de lotes en "Manzanas" basadas en su geometría real.
 * @param {Array} lots - Array de lotes
 * @param {number} epsilon - Tolerancia
 * @returns {Array} Array de arrays de lotes [[Lote1, Lote2], [Lote3...]]
 */
export const groupLotsIntoBlocks = (lots, epsilon = 0.5) => {
  if (!lots || lots.length === 0) return [];
  
  const graph = buildAdjacencyGraph(lots, epsilon);
  const components = findConnectedComponents(graph);

  // Mapear IDs de vuelta a los objetos originales
  const lotMap = new Map(lots.map(l => [l.id, l]));
  
  return components.map(ids => 
    ids.map(id => lotMap.get(id)).filter(Boolean)
  );
};
