import React, { memo, useState, useMemo } from 'react';

/**
 * Overlay de validación que muestra errores y warnings sobre el canvas.
 *
 * @param {object} props
 * @param {Array<{type: string, polygonId: string, message: string, severity: string}>} props.validationResults - Resultados de validación
 * @param {Array} props.polygons - Polígonos para referencia de posición
 * @param {Function} props.onSelectError - Callback al hacer click en un error (recibe polygonId)
 */
function ValidationOverlay({ validationResults, onSelectError }) {
  const [expanded, setExpanded] = useState(false);

  const { errors, warnings } = useMemo(() => {
    if (!validationResults || validationResults.length === 0) {
      return { errors: [], warnings: [] };
    }
    return {
      errors: validationResults.filter((r) => r.severity === 'error'),
      warnings: validationResults.filter((r) => r.severity === 'warning'),
    };
  }, [validationResults]);

  const totalIssues = errors.length + warnings.length;

  if (totalIssues === 0) return null;

  return (
    <div className="absolute top-3 right-3 z-30">
      {/* Badge flotante */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-lg shadow-lg text-sm font-medium
          transition-colors cursor-pointer
          ${errors.length > 0 ? 'bg-red-600 text-white' : 'bg-yellow-500 text-gray-900'}
        `}
        title="Ver problemas de validación"
      >
        {/* Icono de alerta */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 9v4M12 17h.01" />
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>

        {errors.length > 0 && (
          <span>{errors.length} error{errors.length !== 1 ? 'es' : ''}</span>
        )}
        {warnings.length > 0 && (
          <span>{warnings.length} aviso{warnings.length !== 1 ? 's' : ''}</span>
        )}

        {/* Flecha expandir */}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
        >
          <polyline points="6,9 12,15 18,9" />
        </svg>
      </button>

      {/* Panel expandible */}
      {expanded && (
        <div className="mt-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden max-w-xs w-72">
          <div className="px-3 py-2 bg-gray-900/50 border-b border-gray-700 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-300">Problemas de Validación</span>
            <button
              onClick={() => setExpanded(false)}
              className="text-gray-500 hover:text-gray-300"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto divide-y divide-gray-700">
            {/* Errores */}
            {errors.map((error, i) => (
              <button
                key={`error-${i}`}
                onClick={() => onSelectError && onSelectError(error.polygonId)}
                className="w-full text-left px-3 py-2 hover:bg-gray-700/50 transition-colors flex items-start gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-red-300 truncate">{error.type}</span>
                  <span className="text-xs text-gray-400 truncate">{error.message}</span>
                </div>
              </button>
            ))}

            {/* Warnings */}
            {warnings.map((warning, i) => (
              <button
                key={`warn-${i}`}
                onClick={() => onSelectError && onSelectError(warning.polygonId)}
                className="w-full text-left px-3 py-2 hover:bg-gray-700/50 transition-colors flex items-start gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-yellow-300 truncate">{warning.type}</span>
                  <span className="text-xs text-gray-400 truncate">{warning.message}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(ValidationOverlay);
