import { useState, useEffect, useCallback } from 'react';
import { formService } from '../../../services/formService';

export function useForms() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadForms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await formService.getAll();
      setForms(data.forms || []);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los formularios.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  const handleSearch = async (query) => {
    setLoading(true);
    setError(null);
    try {
      if (query) {
        const results = await formService.search(query);
        setForms(results.forms);
      } else {
        loadForms();
      }
    } catch (err) {
      console.error(err);
      setError('Error al buscar formularios.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este formulario?")) return;

    try {
      await formService.delete(id);
      setForms((prevForms) => prevForms.filter((f) => f.id !== id));
    } catch (err) {
      alert("Error al eliminar el formulario");
    }
  };

  return {
    forms,
    loading,
    error,
    reload: loadForms,
    handleSearch,
    handleDelete
  };
}
