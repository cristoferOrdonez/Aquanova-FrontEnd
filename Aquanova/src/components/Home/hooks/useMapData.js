// src/DigitalTwinMap/hooks/useMapData.js
import { useState, useEffect } from 'react';
import { prediosService } from '../../../services/prediosService'; // Ajusta la ruta según tu proyecto

export const useMapData = (neighborhoodId) => {
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMap = async () => {
      try {
        setLoading(true);
        // Aquí pasamos el ID del barrio para traer un mapa diferente
        const response = await prediosService.getDigitalTwinData(neighborhoodId);
        if (response && response.data) {
          setMapData(response.data);
        } else {
          setError('El formato de datos recibido no es válido.');
        }
      } catch (err) {
        setError(err.message || 'No se pudo cargar el plano digital.');
      } finally {
        setLoading(false);
      }
    };

    // Solo busca si hay un ID seleccionado
    if (neighborhoodId) {
      fetchMap();
    }
  }, [neighborhoodId]); // Se vuelve a ejecutar si cambias de mapa

  return { mapData, setMapData, loading, error };
};