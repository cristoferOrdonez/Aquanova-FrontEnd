import { useState, useEffect } from 'react';
import { prediosService } from '../../../services/prediosService';

const extractFirstNumber = (val) => {
  if (val === undefined || val === null) return null;
  const match = String(val).match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
};

/**
 * Construye dos índices para el cruce predio ↔ censo:
 *   - censoIndex:    lot_id (ya resuelto por el backend)  → record
 *   - censoByLegacy: predio_id_legado (UUID del sistema anterior) → record
 *
 * El backend devuelve los registros ordenados por fecha DESC, por lo que
 * el primero que aparece para cada key es el más reciente.
 */
const buildCensoIndexes = (censoRows = []) => {
  const censoIndex    = new Map();
  const censoByLegacy = new Map();

  for (const record of censoRows) {
    if (record.lot_id && !censoIndex.has(record.lot_id)) {
      censoIndex.set(record.lot_id, record);
    }
    if (record.predio_id_legado && !censoByLegacy.has(record.predio_id_legado)) {
      censoByLegacy.set(record.predio_id_legado, record);
    }
  }

  return { censoIndex, censoByLegacy };
};

/**
 * Calcula el status visual del predio con doble fallback:
 *   1. Cruce por lot.id (FK directa resuelta por el backend)
 *   2. Cruce por lot.external_id (UUID del sistema anterior)
 *   3. lot.status de la BD, o 'sin_informacion' si no hay nada
 */
const computeLotStatus = (lot, censoIndex, censoByLegacy) => {
  const censo = censoIndex.get(lot.id)
             || (lot.external_id ? censoByLegacy.get(lot.external_id) : undefined);

  if (!censo) return lot.status || 'sin_informacion';
  if (censo.registro && censo.registro.trim() !== '') return 'registrado';
  return 'censado';
};

/**
 * Mapea un registro de censo (snake_case del API) a la estructura censusData
 * (camelCase) que espera LotSidePanel.
 */
const mapCensoToCensusData = (censo) => ({
  idRespuesta:   censo.id_respuesta,
  fechaCreacion: censo.fecha_creacion,
  tipoPunto:     censo.tipo_punto,
  claseUso:      censo.clase_uso,
  estadoPredio:  censo.estado_predio,
  habitantes:    censo.numero_habitantes,
  familias:      censo.numero_familias,
  tieneAgua:     censo.tiene_agua,
  horasAgua:     censo.horas_agua,
  observaciones: censo.observaciones,
  atendioNombre: censo.atendio_nombre,
  atendioRol:    censo.atendio_rol,
  fotoFachada:   censo.foto_fachada,
  firma:         censo.firma_digital,
  inspector:     censo.inspector_nombre,
});

/**
 * Cruza la estructura geográfica del gemelo digital con los índices del censo.
 */
const applyTopologyDiscovery = (data, censoIndex, censoByLegacy) => {
  if (!data?.blocks?.length) return data;

  const processedBlocks = data.blocks.map((block) => {
    const blockLabel = block.code || `MZ-${block.id}`;

    const processedLots = (block.lots || []).map((lot) => {
      const lotNum = extractFirstNumber(lot.number || lot.id);
      const idNum  = lotNum !== null ? String(lotNum).padStart(2, '0') : lot.id.substring(0, 2);

      const censo = censoIndex.get(lot.id)
                 || (lot.external_id ? censoByLegacy.get(lot.external_id) : undefined);

      return {
        ...lot,
        display_id:        `${blockLabel}-${idNum}`,
        block_code:        blockLabel,
        block_id:          blockLabel,
        database_block_id: block.id,
        status:            computeLotStatus(lot, censoIndex, censoByLegacy),
        water_meter_code:  censo?.registro   || null,
        direccion_fisica:  censo?.direccion  || null,
        censusData:        censo ? mapCensoToCensusData(censo) : null,
      };
    });

    const sortedLots = [...processedLots].sort((a, b) => {
      const aNum = extractFirstNumber(a.display_id) || 0;
      const bNum = extractFirstNumber(b.display_id) || 0;
      return aNum - bNum;
    });

    return { ...block, lots: sortedLots };
  });

  return { ...data, blocks: processedBlocks };
};

export const useMapData = (neighborhoodId) => {
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMap = async () => {
      try {
        setLoading(true);

        const twinResponse = await prediosService.getDigitalTwinData(neighborhoodId);

        if (!twinResponse?.data) {
          setError('El formato de datos de topología recibido no es válido.');
          return;
        }

        const censusResponse = await prediosService.getCensusData(neighborhoodId).catch(() => null);
        const censoRows = censusResponse?.data || [];
        const { censoIndex, censoByLegacy } = buildCensoIndexes(censoRows);
        const processedData = applyTopologyDiscovery(twinResponse.data, censoIndex, censoByLegacy);
        setMapData(processedData);
      } catch (err) {
        setError(err.message || 'No se pudo cargar la información del plano digital.');
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
