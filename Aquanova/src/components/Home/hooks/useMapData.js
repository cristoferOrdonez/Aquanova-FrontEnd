import { useState, useEffect } from 'react';
import { prediosService } from '../../../services/prediosService'; 

// Importamos el archivo local con las respuestas
import { CENSOS_MOCK_DATA } from './censosMockData';

/**
 * Utilidad para extraer el primer número que aparezca en cualquier texto o valor.
 */
const extractFirstNumber = (val) => {
  if (val === undefined || val === null) return null;
  const match = String(val).match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
};

/**
 * Extrae numéricamente la Manzana y el Lote desde un registro de censo.
 */
const getCensoManzanaLote = (censo) => {
  const recolectado = censo["Recolectado Por"] || "";
  const match = recolectado.match(/MZ\s*(\d+)\s*ID\s*(\d+)/i);
  if (match) {
    return {
      manzana: parseInt(match[1], 10),
      lote: parseInt(match[2], 10)
    };
  }

  // Fallback: usar las columnas directas
  const censoManzana = extractFirstNumber(censo["Manzana"]);
  let censoLote = null;
  
  if (censoManzana !== null) {
    const idUsuarioStr = String(censo["ID Usuario"] || "").trim();
    const mzStr = String(censoManzana);
    if (idUsuarioStr.startsWith(mzStr) && idUsuarioStr.length > mzStr.length) {
      censoLote = parseInt(idUsuarioStr.substring(mzStr.length), 10);
    } else {
      censoLote = extractFirstNumber(idUsuarioStr);
    }
  }
  return { manzana: censoManzana, lote: censoLote };
};

/**
 * Extrae numéricamente la Manzana y el Lote originales de la base de datos del predio.
 */
const getDbLotOriginalManzanaLote = (lot, blockLabel) => {
  const dbManzana = extractFirstNumber(blockLabel);
  const dbLote = extractFirstNumber(lot.number);
  return { manzana: dbManzana, lote: dbLote };
};

/**
 * Mapea y alinea las manzanas de la Base de Datos con los datos del Censo.
 * Esta versión respeta la estructura de manzanas de la base de datos para evitar que colapsen en una sola.
 */
const applyTopologyDiscovery = (data, submissions = []) => {
  if (!data?.blocks?.length) return data;

  // Creamos un mapa rápido para acelerar la asociación de los censos
  const submissionsByMap = new Map();
  submissions.forEach(sub => {
    const cGeom = getCensoManzanaLote(sub);
    if (cGeom.manzana !== null && cGeom.lote !== null) {
      const key = `${cGeom.manzana}-${cGeom.lote}`;
      submissionsByMap.set(key, sub);
    }
  });

  // Iteramos sobre las manzanas estructuradas por la base de datos
  const processedBlocks = data.blocks.map((block) => {
    // block.code tiene el nombre real de la manzana (ej: "M-01", "M-02", "M-03", "M-04")
    const blockLabel = block.code || `MZ-${block.id}`;
    const blockNum = extractFirstNumber(blockLabel);

    const sortedLots = (block.lots || []).map((lot) => {
      const lotNum = extractFirstNumber(lot.number || lot.id);

      // El ID de pantalla se genera con el código de su manzana original (ej: "M-01-26")
      const idNum = lotNum !== null ? String(lotNum).padStart(2, '0') : lot.id.substring(0, 2);
      const displayId = `${blockLabel}-${idNum}`;

      // --- ASOCIACIÓN DEL CENSO ---
      // 1. Intentamos por ID estricto (UUID) — SIN tocar el ID del lote
      let censo = submissions.find(sub => sub["Selecciona el predio"] === lot.id);

      // 2. Fallback por coordenadas de Manzana y Lote
      if (!censo && blockNum !== null && lotNum !== null) {
        const key = `${blockNum}-${lotNum}`;
        censo = submissionsByMap.get(key);
      }

      const enrichedLot = {
        ...lot, // <--- No tocamos el ID único (lot.id) ni sus propiedades de dibujo
        display_id: displayId,
        block_code: blockLabel,
        block_id: blockLabel, // Para agrupar lógicamente en el estado
        database_block_id: block.id,
        topology_mismatch: false, // Al respetar la DB, no hay inconsistencias
      };

      if (censo) {
        enrichedLot.water_meter_code = censo["Registro"] || null;
        enrichedLot.cadastral_id = censo["Plano"] || null;
        enrichedLot.direccion_fisica = censo["Dirección 1"] || null;

        // Si tiene medidor registrado -> verde ('registrado'), si no -> azul ('censado')
        const hasMeter = !!enrichedLot.water_meter_code;
        enrichedLot.status = hasMeter ? "registrado" : "censado";

        enrichedLot.censusData = {
          idRespuesta: censo["ID Respuesta"],
          fechaCreacion: censo["Fecha Creación"],
          tipoPunto: censo["Tipo de Punto"],
          claseUso: censo["Clase de Uso"],
          estadoPredio: censo["Estado del Predio"],
          habitantes: censo["Número de Habitantes"],
          familias: censo["Número de Familias"],
          tieneAgua: censo["¿Tiene agua?"],
          horasAgua: censo["¿Cuántas horas del día le llega agua?"],
          observaciones: censo["Observaciones"],
          atendioNombre: censo["Atendió Visita - Nombre"],
          atendioRol: censo["Atendió Visita - Rol"],
          fotoFachada: censo["Foto de la fachada del predio"],
          firma: censo["Firma Digital"],
          inspector: censo["Nombre del inspector o funcionario que censó"]
        };
      } else {
        enrichedLot.status = "sin_informacion";
        enrichedLot.censusData = null;
      }

      return enrichedLot;
    });

    // Ordenamos numéricamente los lotes dentro de cada manzana para consistencia visual
    const sortedLotsByNumber = [...sortedLots].sort((a, b) => {
      const aNum = extractFirstNumber(a.display_id) || 0;
      const bNum = extractFirstNumber(b.display_id) || 0;
      return aNum - bNum;
    });

    return {
      ...block,
      lots: sortedLotsByNumber
    };
  });

  return {
    ...data,
    blocks: processedBlocks
  };
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
          // Procesamos el mapa inyectando y alineando con los datos locales
          const processedData = applyTopologyDiscovery(response.data, CENSOS_MOCK_DATA);
          setMapData(processedData);
        } else {
          setError('El formato de datos de topología recibido no es válido.');
        }
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