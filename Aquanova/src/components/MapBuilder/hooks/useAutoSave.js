import { useState, useEffect, useCallback, useRef } from 'react';
import { MAP_BUILDER_CONFIG } from '../utils/constants';
import { mapBuilderService } from '../../../services/mapBuilderService';

/**
 * Hook para auto-guardado de borradores del Map Builder.
 * Guarda automáticamente cada AUTOSAVE_INTERVAL_MS cuando el estado está dirty.
 *
 * @param {{
 *   state: object,
 *   neighborhoodId: string
 * }} options - Estado del map builder y ID del barrio
 * @returns {{
 *   lastSavedAt: string|null,
 *   isSaving: boolean,
 *   error: string|null,
 *   saveNow: () => Promise<void>,
 *   loadDraft: (neighborhoodId: string) => Promise<object|null>,
 *   deleteDraft: (neighborhoodId: string) => Promise<void>,
 * }}
 */
export const useAutoSave = ({ state, neighborhoodId }) => {
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const stateRef = useRef(state);

  // Mantener referencia actualizada al estado
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  /**
   * Guarda el borrador actual en el servidor.
   * @returns {Promise<void>}
   */
  const saveDraft = useCallback(async () => {
    if (!neighborhoodId || !stateRef.current.isDirty) return;

    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        neighborhoodId,
        polygons: stateRef.current.polygons,
        viewBox: stateRef.current.viewBox,
        gridSize: stateRef.current.gridSize,
        showGrid: stateRef.current.showGrid,
        savedAt: new Date().toISOString(),
      };

      await mapBuilderService.saveDraft(payload);
      setLastSavedAt(new Date().toISOString());
    } catch (err) {
      setError(err.message || 'Error al guardar borrador automáticamente.');
    } finally {
      setIsSaving(false);
    }
  }, [neighborhoodId]);

  /**
   * Fuerza guardado inmediato del borrador.
   * @returns {Promise<void>}
   */
  const saveNow = useCallback(async () => {
    await saveDraft();
  }, [saveDraft]);

  /**
   * Carga un borrador del servidor para un barrio específico.
   * @param {string} nId - ID del barrio
   * @returns {Promise<object|null>} Datos del borrador o null si no existe
   */
  const loadDraft = useCallback(async (nId) => {
    try {
      setError(null);
      const response = await mapBuilderService.getDraft(nId);
      return response?.data || response || null;
    } catch (err) {
      // 404 = no hay borrador, no es error
      if (err.status === 404 || err.message?.includes('404')) {
        return null;
      }
      setError(err.message || 'Error al cargar borrador.');
      return null;
    }
  }, []);

  /**
   * Elimina el borrador de un barrio en el servidor.
   * @param {string} nId - ID del barrio
   * @returns {Promise<void>}
   */
  const deleteDraft = useCallback(async (nId) => {
    try {
      setError(null);
      await mapBuilderService.deleteDraft(nId);
    } catch (err) {
      setError(err.message || 'Error al eliminar borrador.');
    }
  }, []);

  // Auto-save interval
  useEffect(() => {
    if (!neighborhoodId) return;

    intervalRef.current = setInterval(() => {
      if (stateRef.current.isDirty) {
        saveDraft();
      }
    }, MAP_BUILDER_CONFIG.AUTOSAVE_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [neighborhoodId, saveDraft]);

  return {
    lastSavedAt,
    isSaving,
    error,
    saveNow,
    loadDraft,
    deleteDraft,
  };
};
