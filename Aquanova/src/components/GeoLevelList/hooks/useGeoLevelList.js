import { useState, useEffect, useCallback } from 'react';
import { neighborhoodService } from '../../../services/neighborhoodService';

function getErrorMessage(err) {
  if (!err) return 'Error desconocido.';
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;
  return err?.message || 'Error desconocido.';
}

export const useGeoLevelList = () => {
  const [allNeighborhoods, setAllNeighborhoods] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNeighborhoods = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const list = await neighborhoodService.getFullList();
      const safeList = Array.isArray(list) ? list : [];
      setAllNeighborhoods(safeList);
      setNeighborhoods(safeList);

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

  const handleSearch = useCallback(
    (query) => {
      const normalized = String(query || '').trim().toLowerCase();

      if (!normalized) {
        setNeighborhoods(allNeighborhoods);
        return;
      }

      const filtered = allNeighborhoods.filter((item) => {
        const name = item?.name ?? '';
        const code = item?.code ?? '';
        const type = item?.metadata?.type ?? '';
        const description = item?.metadata?.description ?? '';

        return [name, code, type, description].some((value) =>
          String(value).toLowerCase().includes(normalized)
        );
      });

      setNeighborhoods(filtered);
    },
    [allNeighborhoods]
  );

  return { neighborhoods, loading, error, refetch: fetchNeighborhoods, handleSearch };
};
