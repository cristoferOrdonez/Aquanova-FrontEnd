import { useState, useEffect } from 'react';
import { prediosService } from '../../../services/prediosService'; 

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
          const processedData = { ...response.data };
          
          if (processedData.blocks && Array.isArray(processedData.blocks)) {
            // Ordenar manzanas para garantizar que MZ01, MZ02 sea determinístico por ID
            processedData.blocks.sort((a, b) => String(a.id).localeCompare(String(b.id)));

            // Asignar IDs lógicos MZ##ID## 
            processedData.blocks.forEach((block, mzIndex) => {
              // Iteramos desde 1 para las manzanas (MZ01, MZ02...)
              const mzNum = String(mzIndex + 1).padStart(2, '0');
              
              if (block.lots && Array.isArray(block.lots)) {
                // Ordenar lotes dentro de la manzana para consistencia
                block.lots.sort((a, b) => String(a.number).localeCompare(String(b.number)));

                block.lots.forEach((lot, lotIndex) => {
                  // Iteramos desde 00 para los predios dentro de cada manzana
                  const idNum = String(lotIndex).padStart(2, '0');
                  lot.display_id = `MZ${mzNum}ID${idNum}`;
                  lot.block_id = block.id; // Herencia del ID de la manzana para validaciones
                });
              }
            });
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