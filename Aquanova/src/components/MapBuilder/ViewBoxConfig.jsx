import React, { memo, useState, useCallback } from 'react';

/**
 * Presets disponibles de viewBox.
 */
const VIEWBOX_PRESETS = [
  { label: '800 × 600', width: 800, height: 600 },
  { label: '1000 × 1000', width: 1000, height: 1000 },
  { label: '1200 × 800', width: 1200, height: 800 },
  { label: '1500 × 1000', width: 1500, height: 1000 },
  { label: '2000 × 1500', width: 2000, height: 1500 },
];

/**
 * Parsea un string de viewBox "x y width height" a objeto.
 * @param {string} viewBox
 * @returns {{x: number, y: number, width: number, height: number}}
 */
function parseViewBox(viewBox) {
  if (!viewBox) return { x: 0, y: 0, width: 1000, height: 1000 };
  const parts = viewBox.split(/\s+/).map(Number);
  return {
    x: parts[0] || 0,
    y: parts[1] || 0,
    width: parts[2] || 1000,
    height: parts[3] || 1000,
  };
}

/**
 * Contenido interno del modal. Se monta solo cuando isOpen=true,
 * así que useState se inicializa correctamente desde viewBox cada vez.
 */
function ViewBoxConfigContent({ viewBox, onChange, onClose }) {
  const parsed = parseViewBox(viewBox);
  const [width, setWidth] = useState(parsed.width);
  const [height, setHeight] = useState(parsed.height);

  const handleApply = useCallback(() => {
    const w = Math.max(100, Math.min(10000, width));
    const h = Math.max(100, Math.min(10000, height));
    onChange(`0 0 ${w} ${h}`);
    onClose();
  }, [width, height, onChange, onClose]);

  const handlePreset = useCallback((preset) => {
    setWidth(preset.width);
    setHeight(preset.height);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter') handleApply();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onKeyDown={handleKeyDown}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Content */}
      <div className="relative bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-4 w-72">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-200">Dimensiones del Canvas</h4>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Inputs */}
        <div className="flex gap-2 mb-3">
          <div className="flex-1">
            <label className="text-xs text-gray-400 block mb-1">Ancho</label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              min={100}
              max={10000}
              className="w-full bg-gray-900 text-white text-sm px-2 py-1.5 rounded border border-gray-600 outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-400 block mb-1">Alto</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              min={100}
              max={10000}
              className="w-full bg-gray-900 text-white text-sm px-2 py-1.5 rounded border border-gray-600 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Presets */}
        <div className="mb-3">
          <label className="text-xs text-gray-400 block mb-1">Presets</label>
          <div className="flex flex-wrap gap-1">
            {VIEWBOX_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handlePreset(preset)}
                className={`
                  text-xs px-2 py-1 rounded transition-colors
                  ${width === preset.width && height === preset.height
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
                `}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="text-sm px-3 py-1.5 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleApply}
            className="text-sm px-3 py-1.5 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Modal/dropdown para configurar las dimensiones del viewBox del canvas.
 * Wrapper que controla el montaje del contenido.
 *
 * @param {object} props
 * @param {string} props.viewBox - ViewBox actual como string
 * @param {Function} props.onChange - Callback al aplicar nuevo viewBox (recibe string)
 * @param {boolean} props.isOpen - Si el configurador está abierto
 * @param {Function} props.onClose - Cerrar configurador
 */
function ViewBoxConfig({ viewBox, onChange, isOpen, onClose }) {
  if (!isOpen) return null;
  return <ViewBoxConfigContent viewBox={viewBox} onChange={onChange} onClose={onClose} />;
}

export default memo(ViewBoxConfig);
