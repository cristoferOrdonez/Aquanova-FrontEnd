// src/components/Home/components/modals/SplitModal.jsx
import React, { useState, useEffect } from 'react';

/**
 * Modal de dos pasos para dividir un predio catastral.
 * Paso 1: Elegir dirección del corte (Lateral o en Profundidad).
 * Paso 2: Elegir número de partes.
 */
const SplitModal = ({ isOpen, onConfirm, onCancel, lotDisplayId }) => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(null); // 'depth' | 'width'
  const [parts, setParts] = useState(2);
  const [partsError, setPartsError] = useState('');

  // Resetear al abrir
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setDirection(null);
      setParts(2);
      setPartsError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDirectionSelect = (dir) => {
    setDirection(dir);
    setStep(2);
  };

  const handlePartsChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setParts(e.target.value);
    if (isNaN(val) || val < 2) {
      setPartsError('Debe ser un número entero mayor a 1.');
    } else if (val > 10) {
      setPartsError('Máximo 10 partes por operación.');
    } else {
      setPartsError('');
    }
  };

  const handleConfirm = () => {
    const val = parseInt(parts, 10);
    if (isNaN(val) || val < 2 || val > 10) return;
    onConfirm({ direction, parts: val });
  };

  const isConfirmDisabled = partsError || !parts || parseInt(parts, 10) < 2;

  return (
    // Overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        style={{ animation: 'modal-in 0.2s ease-out' }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12M8 12h7M8 17h4M4 6h.01M4 12h.01M4 18h.01" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">Dividir Predio</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lotDisplayId ? `Predio: ${lotDisplayId}` : ''}
                  {' '}· Paso {step} de 2
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Progress bar */}
          <div className="mt-4 flex gap-1.5">
            <div className="h-1 flex-1 rounded-full bg-purple-500 transition-all" />
            <div className={`h-1 flex-1 rounded-full transition-all ${step >= 2 ? 'bg-purple-500' : 'bg-slate-200'}`} />
          </div>
        </div>

        {/* PASO 1: Dirección */}
        {step === 1 && (
          <div className="px-6 py-5">
            <p className="text-sm text-slate-600 mb-4">
              Selecciona cómo quieres dividir el predio:
            </p>

            <div className="grid grid-cols-2 gap-3">
              {/* Opción: Corte Lateral */}
              <button
                onClick={() => handleDirectionSelect('depth')}
                className="group flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-slate-200 hover:border-purple-400 hover:bg-purple-50 transition-all text-left"
              >
                {/* Ilustración: predios lado a lado (cada uno con frente a calle) */}
                <div className="w-full h-20 rounded-lg bg-slate-100 group-hover:bg-purple-100 transition-colors relative overflow-hidden flex items-end">
                  <div className="absolute bottom-0 left-0 right-0 h-3 bg-slate-300 group-hover:bg-purple-200 transition-colors" />
                  <div className="absolute bottom-3 left-2 right-2 flex gap-0.5 h-12">
                    <div className="flex-1 bg-purple-400 rounded-t-sm opacity-80" />
                    <div className="flex-1 bg-purple-500 rounded-t-sm" />
                    <div className="flex-1 bg-purple-400 rounded-t-sm opacity-80" />
                  </div>
                  <span className="absolute bottom-0.5 left-0 right-0 text-center text-[8px] font-bold text-slate-500 group-hover:text-purple-700">
                    CALLE
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 group-hover:text-purple-700">Corte Lateral</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                    Cada parte tiene su propio frente a la calle. División como predios urbanos típicos.
                  </p>
                </div>
              </button>

              {/* Opción: Corte en Profundidad */}
              <button
                onClick={() => handleDirectionSelect('width')}
                className="group flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all text-left"
              >
                {/* Ilustración: predios apilados (solo el del frente da a la calle) */}
                <div className="w-full h-20 rounded-lg bg-slate-100 group-hover:bg-indigo-100 transition-colors relative overflow-hidden flex items-end">
                  <div className="absolute bottom-0 left-0 right-0 h-3 bg-slate-300 group-hover:bg-indigo-200 transition-colors" />
                  <div className="absolute bottom-3 left-2 right-12 flex flex-col gap-0.5 h-14">
                    <div className="flex-1 bg-indigo-300 rounded-sm" />
                    <div className="flex-1 bg-indigo-400 rounded-sm" />
                    <div className="flex-1 bg-indigo-500 rounded-sm" />
                  </div>
                  <span className="absolute bottom-0.5 left-0 right-0 text-center text-[8px] font-bold text-slate-500 group-hover:text-indigo-700">
                    CALLE
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 group-hover:text-indigo-700">Corte en Profundidad</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                    División de frente a fondo. Solo la primera parte tiene acceso directo a la calle.
                  </p>
                </div>
              </button>
            </div>

            <button
              onClick={onCancel}
              className="mt-4 w-full py-2 text-sm text-slate-400 hover:text-slate-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}

        {/* PASO 2: Número de partes */}
        {step === 2 && (
          <div className="px-6 py-5">
            <div className="flex items-center gap-2 mb-4">
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full ${direction === 'depth' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'}`}>
                {direction === 'depth' ? '↔ Corte Lateral' : '↕ Corte en Profundidad'}
              </span>
              <button
                onClick={() => setStep(1)}
                className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors"
              >
                Cambiar
              </button>
            </div>

            <label className="block text-sm font-semibold text-slate-700 mb-2">
              ¿En cuántas partes dividir?
            </label>

            {/* Selector visual rápido */}
            <div className="flex gap-2 mb-3">
              {[2, 3, 4].map(n => (
                <button
                  key={n}
                  onClick={() => { setParts(n); setPartsError(''); }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold border-2 transition-all ${
                    parseInt(parts) === n
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {n}
                </button>
              ))}
              <div className="flex-1 relative">
                <input
                  type="number"
                  min={2}
                  max={10}
                  value={parts}
                  onChange={handlePartsChange}
                  placeholder="Otro"
                  className={`w-full py-2.5 px-3 rounded-lg text-sm font-semibold border-2 text-center outline-none transition-all ${
                    partsError ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-200 focus:border-purple-400 text-slate-700'
                  }`}
                />
              </div>
            </div>

            {partsError && (
              <p className="text-xs text-red-500 mb-3">{partsError}</p>
            )}

            <p className="text-xs text-slate-400 mb-5">
              El área del predio ({lotDisplayId}) se distribuirá en partes iguales. Los resultados pueden ajustarse manualmente después.
            </p>

            <div className="flex gap-2">
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={!!isConfirmDisabled}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: isConfirmDisabled ? undefined : 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
              >
                Dividir en {parseInt(parts) > 0 ? parseInt(parts) : '?'} partes
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default SplitModal;
