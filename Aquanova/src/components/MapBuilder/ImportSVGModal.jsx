import React, { memo, useState, useCallback, useRef } from 'react';
import { parseSvgFile, filterValidPolygons } from './utils/svgImporter';

/**
 * Modal para importar archivos SVG al Map Builder.
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Si el modal está visible
 * @param {Function} props.onClose - Cerrar modal
 * @param {Function} props.onImport - Callback con polígonos importados (polygons, viewBox)
 */
function ImportSVGModal({ isOpen, onClose, onImport }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseResult, setParseResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const resetState = useCallback(() => {
    setIsDragging(false);
    setIsProcessing(false);
    setParseResult(null);
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  const processFile = useCallback(async (file) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.svg')) {
      setError('El archivo debe ser un SVG (.svg)');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const result = await parseSvgFile(file);
      const validPolygons = filterValidPolygons(result.polygons);
      const invalidCount = result.polygons.length - validPolygons.length;
      const totalArea = validPolygons.reduce((sum, p) => sum + (p.area || 0), 0);

      setParseResult({
        fileName: file.name,
        viewBox: result.viewBox,
        totalPaths: result.paths.length,
        validPolygons,
        invalidCount,
        totalArea,
      });
    } catch (err) {
      setError(`Error al procesar el archivo: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleImport = useCallback(() => {
    if (!parseResult) return;
    onImport(parseResult.validPolygons, parseResult.viewBox);
    handleClose();
  }, [parseResult, onImport, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-6 w-96 max-w-[90vw]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-100">Importar SVG</h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-300 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Drop zone (solo si no hay resultado) */}
        {!parseResult && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragging
                ? 'border-blue-400 bg-blue-500/10'
                : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/30'}
            `}
          >
            {isProcessing ? (
              <div className="flex flex-col items-center gap-2">
                <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 019.17 6" strokeLinecap="round" />
                </svg>
                <span className="text-sm text-gray-400">Procesando...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-500">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17,8 12,3 7,8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span className="text-sm text-gray-400">
                  Arrastra un archivo SVG aquí
                </span>
                <span className="text-xs text-gray-500">
                  o haz click para seleccionar
                </span>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".svg"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-3 p-2 bg-red-900/30 border border-red-700 rounded text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Preview de resultados */}
        {parseResult && (
          <div className="space-y-3">
            <div className="bg-gray-900 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                </svg>
                <span className="truncate">{parseResult.fileName}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex flex-col">
                  <span className="text-gray-500">Polígonos válidos</span>
                  <span className="text-green-400 font-medium">
                    {parseResult.validPolygons.length}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Paths inválidos</span>
                  <span className="text-yellow-400 font-medium">
                    {parseResult.invalidCount}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">ViewBox</span>
                  <span className="text-gray-300 font-mono">
                    {parseResult.viewBox || 'No detectado'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Área total</span>
                  <span className="text-gray-300">
                    {parseResult.totalArea.toFixed(1)} u²
                  </span>
                </div>
              </div>
            </div>

            {parseResult.validPolygons.length === 0 && (
              <div className="text-sm text-yellow-400 text-center">
                No se encontraron polígonos válidos para importar.
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={handleClose}
            className="text-sm px-4 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
          {parseResult && (
            <button
              onClick={handleImport}
              disabled={parseResult.validPolygons.length === 0}
              className={`
                text-sm px-4 py-2 rounded-lg transition-colors
                ${parseResult.validPolygons.length > 0
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'}
              `}
            >
              Importar ({parseResult.validPolygons.length})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(ImportSVGModal);
