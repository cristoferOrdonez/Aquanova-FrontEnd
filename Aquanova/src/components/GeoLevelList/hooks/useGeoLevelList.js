import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Aplica búsqueda + filtro sobre la lista completa
  const applyFilters = useCallback(
    (list, query, filter) => {
      let result = list;

      // Filtro por tipo
      if (filter && filter !== 'Todos') {
        result = result.filter((item) => {
          const t = item?.type ?? (item?.parent_id ? 'Barrio' : 'Localidad');
          return String(t).toLowerCase() === filter.toLowerCase();
        });
      }

      // Filtro por búsqueda local
      if (query) {
        const lower = query.toLowerCase();
        result = result.filter((item) => {
          const fields = [
            item?.name ?? '',
            item?.code ?? '',
            item?.parent_name ?? '',
            item?.type ?? '',
            item?.metadata?.descripcion ?? '',
          ];
          return fields.some((v) => String(v).toLowerCase().includes(lower));
        });
      }

      return result;
    },
    []
  );

  const fetchNeighborhoods = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const list = await neighborhoodService.getFullList();
      const safeList = Array.isArray(list) ? list : [];
      setAllNeighborhoods(safeList);
      setNeighborhoods(applyFilters(safeList, searchQuery, activeFilter));

      if (!Array.isArray(list)) {
        throw new Error('API response is not in the expected format.');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [applyFilters, searchQuery, activeFilter]);

  useEffect(() => {
    fetchNeighborhoods();
  }, [fetchNeighborhoods]);

  const searchTimerRef = useRef(null);

  const handleSearch = useCallback(
    (query) => {
      const normalized = String(query || '').trim();
      setSearchQuery(normalized);

      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

      if (!normalized) {
        setNeighborhoods(applyFilters(allNeighborhoods, '', activeFilter));
        return;
      }

      searchTimerRef.current = setTimeout(async () => {
        try {
          const results = await neighborhoodService.search(normalized);
          const safe = Array.isArray(results) ? results : [];
          setNeighborhoods(applyFilters(safe, '', activeFilter));
        } catch {
          setNeighborhoods(applyFilters(allNeighborhoods, normalized, activeFilter));
        }
      }, 300);
    },
    [allNeighborhoods, activeFilter, applyFilters]
  );

  const handleFilter = useCallback(
    (filter) => {
      setActiveFilter(filter);
      setNeighborhoods(applyFilters(allNeighborhoods, searchQuery, filter));
    },
    [allNeighborhoods, searchQuery, applyFilters]
  );

  return { neighborhoods, loading, error, refetch: fetchNeighborhoods, handleSearch, activeFilter, handleFilter };
};
