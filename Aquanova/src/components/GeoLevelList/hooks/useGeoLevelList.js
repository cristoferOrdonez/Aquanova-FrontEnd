import { useState, useEffect, useCallback } from 'react';
import { neighborhoodService } from '../../../services/neighborhoodService';

function getErrorMessage(err) {
  if (!err) return 'Error desconocido.';
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;
  return err?.message || 'Error desconocido.';
}

export const useGeoLevelList = () => {
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNeighborhoods = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const list = await neighborhoodService.getFullList();
      setNeighborhoods(Array.isArray(list) ? list : []);

      if (!Array.isArray(list)) {
        throw new Error('API response is not in the expected format.');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNeighborhoods();
  }, [fetchNeighborhoods]);

  return { neighborhoods, loading, error, refetch: fetchNeighborhoods };
};
