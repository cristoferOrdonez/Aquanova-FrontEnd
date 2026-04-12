import { useState, useEffect } from 'react';
import { prediosService } from '../../../services/prediosService'; 
import { groupLotsIntoBlocks } from '../../../utils/TopologyEngine';

/**
 * Calcula el centroide promedio de un grupo de lotes.
 * Usa el campo `centroid` ya calculado por el backend.
 */
const getClusterCentroid = (lots) => {
  let sumX = 0, sumY = 0, count = 0;
  for (const lot of lots) {
    const c = lot.centroid;
    if (!c) continue;
    const x = typeof c === 'object' && !Array.isArray(c) ? (c.x ?? 0) : (c[0] ?? 0);
    const y = typeof c === 'object' && !Array.isArray(c) ? (c.y ?? 0) : (c[1] ?? 0);
    sumX += x; sumY += y; count++;
  }
  return count > 0 ? { x: sumX / count, y: sumY / count } : { x: 0, y: 0 };
};

/**
 * Motor de Descubrimiento de Manzanas.
 * Agrupa todos los lotes del sector por colindancia geométrica real y
 * reconstruye el array de bloques de forma determinística.
 * Los lotes donde el block_id de la DB difiere con el clúster geométrico
 * son marcados con `topology_mismatch: true`.
 *
 * @param {Object} data - Datos del backend { viewBox, blocks }
 * @returns {Object} - Mismos datos pero con bloques reordenados por geometría
 */
const applyTopologyDiscovery = (data) => {
  if (!data?.blocks?.length) return data;

  // 1. Aplanar todos los lotes y DEDUPLICAR por ID para evitar errores de duplicidad de llaves en React
  const rawLots = data.blocks.flatMap(block =>
    (block.lots || []).map(lot => ({
      ...lot,
      _db_block_id: lot.block_id || block.id,
    }))
  );

  const lotMap = new Map();
  rawLots.forEach(lot => {
    if (lotMap.has(lot.id)) {
      console.warn(`[TopologyDiscovery] Se detectó un predio duplicado en la DB: ID ${lot.id}. Omitiendo duplicado.`);
    } else {
      lotMap.set(lot.id, lot);
    }
  });
  const allLots = Array.from(lotMap.values());

  if (allLots.length === 0) return data;

  // 2. Agrupar por colindancia física (epsilon = 2px para tolerar gaps de dibujo)
  const geometricClusters = groupLotsIntoBlocks(allLots, 2.0);

  // 3. Ordenar clústeres de Noroeste a Sureste para numeración determinística
  geometricClusters.sort((clusterA, clusterB) => {
    const cA = getClusterCentroid(clusterA);
    const cB = getClusterCentroid(clusterB);
    // Primero por eje Y (arriba antes que abajo), luego por X (izquierda antes que derecha)
    if (Math.abs(cA.y - cB.y) > 30) return cA.y - cB.y;
    return cA.x - cB.x;
  });

  // Construir mapa de bloques originales para recuperar metadata (geom_path, label_position, etc.)
  const originalBlocksById = new Map(data.blocks.map(b => [b.id, b]));

  // 4. Reconstruir bloques a partir de clústeres geométricos
  const geometricBlocks = geometricClusters.map((clusterLots, mzIndex) => {
    const mzNum = String(mzIndex + 1).padStart(2, '0');

    // Determinar el block_id canónico: el más frecuente en el clúster según la DB
    const blockIdCounts = {};
    clusterLots.forEach(lot => {
      const bid = lot._db_block_id;
      blockIdCounts[bid] = (blockIdCounts[bid] || 0) + 1;
    });
    const canonicalBlockId = Object.keys(blockIdCounts)
      .sort((a, b) => blockIdCounts[b] - blockIdCounts[a])[0];

    // Recuperar metadatos del bloque original (geom_path, label_position, code)
    const originalBlock = originalBlocksById.get(canonicalBlockId) || {};

    // Ordenar lotes dentro del clúster para IDs consecutivos consistentes
    const sortedLots = [...clusterLots].sort((a, b) =>
      String(a.number || a.id).localeCompare(String(b.number || b.id))
    );

    // Asignar display_id y marcar discrepancias
    const uniqueBlockId = `MZ${mzNum}`;
    const blockLabel = originalBlock.code || uniqueBlockId;

    sortedLots.forEach((lot, lotIndex) => {
      const idNum = String(lotIndex + 1).padStart(2, '0');
      // El display_id ahora refleja el nombre real de la manzana (ej: "55-01" en vez de "MZ01ID01")
      lot.display_id = `${blockLabel}-${idNum}`;
      lot.block_id = uniqueBlockId; 
      lot.database_block_id = canonicalBlockId;
      lot.block_code = blockLabel; 
      lot.topology_mismatch = lot._db_block_id !== canonicalBlockId;
      delete lot._db_block_id;
    });

    return {
      id: uniqueBlockId, // ID único para React Keys (MZ01, MZ02...)
      database_block_id: canonicalBlockId,
      code: originalBlock.code || uniqueBlockId,
      geom_path: originalBlock.geom_path,
      label_position: originalBlock.label_position,
      lots: sortedLots,
    };
  });

  return { ...data, blocks: geometricBlocks };
};

export const useMapData = (neighborhoodId) => {
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMap = async () => {
      try {
        setLoading(true);
        const response = await prediosService.getDigitalTwinData(neighborhoodId);
        if (response && response.data) {
          // 1. Aplicar descubrimiento topológico (reagrupación por colindancia)
          const processedData = applyTopologyDiscovery(response.data);

          // 2. Contar y loguear discrepancias encontradas (para auditoría)
          const mismatched = processedData.blocks
            .flatMap(b => b.lots)
            .filter(l => l.topology_mismatch);
          if (mismatched.length > 0) {
            console.warn(
              `[TopologyAudit] ${mismatched.length} predios con discrepancia de manzana:`,
              mismatched.map(l => `${l.display_id} (ID: ${l.id})`)
            );
          }

          setMapData(processedData);
        } else {
          setError('El formato de datos recibido no es válido.');
        }
      } catch (err) {
        setError(err.message || 'No se pudo cargar el plano digital.');
      } finally {
        setLoading(false);
      }
    };

    if (neighborhoodId) {
      fetchMap();
    }
  }, [neighborhoodId]);

  return { mapData, setMapData, loading, error };
};