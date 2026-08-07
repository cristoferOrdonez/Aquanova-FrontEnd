import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { validateAllPolygons } from '../utils/geometryValidation';

/**
 * Hook para validaciones en tiempo real de los polígonos del mapa.
 * Ejecuta validación automáticamente cuando los polígonos cambian (con debounce).
 *
 * @param {Array} polygons - Array de polígonos a validar
 * @returns {{
 *   validationResults: Array<{type: string, polygonId: string, message: string, severity: string}>,
 *   runValidation: (polygons: Array) => void,
 *   getPolygonErrors: (polygonId: string) => Array,
 *   hasErrors: boolean,
 *   hasWarnings: boolean,
 * }}
 */
export const useValidation = (polygons) => {
  const [validationResults, setValidationResults] = useState([]);
  const debounceRef = useRef(null);

  /**
   * Ejecuta la validación completa sobre un array de polígonos.
   * Transforma los resultados al formato uniforme del hook.
   *
   * @param {Array} polys - Lista de polígonos a validar
   */
  const runValidation = useCallback((polys) => {
    if (!polys || polys.length === 0) {
      setValidationResults([]);
      return;
    }

    const { results, overlaps } = validateAllPolygons(polys);
    const formatted = [];

    // Errores y warnings individuales por polígono
    for (const result of results) {
      for (const error of result.errors) {
        formatted.push({
          type: 'geometry',
          polygonId: result.id,
          message: error,
          severity: 'error',
        });
      }
      for (const warning of result.warnings) {
        formatted.push({
          type: 'geometry',
          polygonId: result.id,
          message: warning,
          severity: 'warning',
        });
      }
    }

    // Overlaps como warnings
    for (const overlap of overlaps) {
      formatted.push({
        type: 'overlap',
        polygonId: overlap.idA,
        message: `Solapamiento detectado con polígono ${overlap.idB}.`,
        severity: 'warning',
      });
      formatted.push({
        type: 'overlap',
        polygonId: overlap.idB,
        message: `Solapamiento detectado con polígono ${overlap.idA}.`,
        severity: 'warning',
      });
    }

    setValidationResults(formatted);
  }, []);

  /**
   * Filtra los errores/warnings de un polígono específico.
   *
   * @param {string} polygonId - ID del polígono
   * @returns {Array<{type: string, polygonId: string, message: string, severity: string}>}
   */
  const getPolygonErrors = useCallback((polygonId) => {
    return validationResults.filter((r) => r.polygonId === polygonId);
  }, [validationResults]);

  /** @type {boolean} true si hay al menos un error */
  const hasErrors = useMemo(
    () => validationResults.some((r) => r.severity === 'error'),
    [validationResults]
  );

  /** @type {boolean} true si hay al menos un warning */
  const hasWarnings = useMemo(
    () => validationResults.some((r) => r.severity === 'warning'),
    [validationResults]
  );

  // Auto-ejecutar validación cuando polygons cambian (con debounce de 500ms)
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      runValidation(polygons);
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [polygons, runValidation]);

  return {
    validationResults,
    runValidation,
    getPolygonErrors,
    hasErrors,
    hasWarnings,
  };
};
