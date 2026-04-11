// src/components/PublicForm/components/FormFieldRenderer.jsx
import { useRef } from 'react';
import { usePublicFormContext } from '../hooks/usePublicFormContext';
import LotSelectorField from './LotSelectorField';

const inputBase =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-[var(--blue-buttons)] focus:ring-2 focus:ring-[var(--blue-buttons)]/20';

const errorBorder = 'border-red-400 focus:border-red-400 focus:ring-red-200';

/**
 * Componente de input de fecha que fuerza la apertura del picker nativo.
 */
function DateInput({ value, onChange, error, inputBase, errorBorder }) {
  const inputRef = useRef(null);

  const openPicker = () => {
    if (inputRef.current?.showPicker) {
      try {
        inputRef.current.showPicker();
      } catch {
        // Fallback: focus en el input
        inputRef.current.focus();
      }
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="date"
        className={`${inputBase} cursor-pointer pr-10 ${error ? errorBorder : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={openPicker}
        style={{ colorScheme: 'light' }}
      />
      {/* Icono de calendario clickeable */}
      <button
        type="button"
        onClick={openPicker}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
          />
        </svg>
      </button>
    </div>
  );
}

/**
 * Renderiza un único campo del schema del formulario.
 *
 * @param {{ field: import('../context/PublicFormContext').SchemaField }} props
 */
// Normaliza una opción que puede ser string u objeto
const optStr = (opt) =>
  opt !== null && typeof opt === 'object' 
    ? (opt.value ?? opt.label ?? opt.text ?? opt.name ?? String(opt.id ?? '')) 
    : String(opt ?? '');
const optKey = (opt, i) =>
  opt !== null && typeof opt === 'object' ? (opt.id ?? opt.value ?? i) : (opt ?? i);

function FormFieldRenderer({ field }) {
  const { responses, setResponse, fieldErrors, formData } = usePublicFormContext();
  const value = responses[field.key];
  const error = fieldErrors[field.key];

  const handleCheckbox = (opt) => {
    const current = Array.isArray(value) ? value : [];
    const next = current.includes(opt)
      ? current.filter((v) => v !== opt)
      : [...current, opt];
    setResponse(field.key, next);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {field.type === 'text' && (
        <input
          type="text"
          className={`${inputBase} ${error ? errorBorder : ''}`}
          placeholder={field.placeholder || ''}
          value={value || ''}
          onChange={(e) => setResponse(field.key, e.target.value)}
        />
      )}

      {(field.type === 'email' || field.type === 'tel' || field.type === 'password') && (
        <input
          type={field.type}
          className={`${inputBase} ${error ? errorBorder : ''}`}
          placeholder={field.placeholder || ''}
          value={value || ''}
          onChange={(e) => setResponse(field.key, e.target.value)}
        />
      )}

      {field.type === 'textarea' && (
        <textarea
          className={`${inputBase} min-h-[90px] resize-y ${error ? errorBorder : ''}`}
          placeholder={field.placeholder || 'Escribe tu respuesta aquí…'}
          value={value || ''}
          onChange={(e) => setResponse(field.key, e.target.value)}
        />
      )}

      {field.type === 'number' && (
        <input
          type="number"
          className={`${inputBase} ${error ? errorBorder : ''}`}
          placeholder={field.placeholder || '0'}
          value={value || ''}
          onChange={(e) => setResponse(field.key, e.target.value)}
        />
      )}

      {field.type === 'date' && (
        <DateInput
          value={value || ''}
          onChange={(val) => setResponse(field.key, val)}
          error={error}
          inputBase={inputBase}
          errorBorder={errorBorder}
        />
      )}

      {field.type === 'file' && (
        <div className="flex flex-col gap-2">
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            className={`w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--blue-buttons)]/10 file:px-3 file:py-2 file:text-[var(--blue-buttons)] file:font-medium hover:file:bg-[var(--blue-buttons)]/20 cursor-pointer ${error ? 'rounded-xl border border-red-400 p-1' : ''}`}
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              // Si permite múltiples archivos, guardar array; si no, solo el primero
              setResponse(field.key, field.multiple !== false ? files : files[0] || null);
            }}
          />
          {/* Mostrar preview de archivos seleccionados */}
          {value && (
            <div className="flex flex-wrap gap-2 mt-1">
              {(Array.isArray(value) ? value : [value]).map((file, idx) => {
                if (!(file instanceof File)) return null;
                const isVideo = file.type.startsWith('video/');
                const isImage = file.type.startsWith('image/');
                const fileSize = (file.size / 1024).toFixed(1);
                const icon = isVideo ? '🎥' : isImage ? '🖼️' : '📄';

                return (
                  <div key={idx} className="flex items-center gap-1.5 text-xs text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                    <span className="text-base">{icon}</span>
                    <div className="flex flex-col">
                      <span className="font-medium">{file.name}</span>
                      <span className="text-gray-500">{fileSize} KB</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {field.type === 'info' && (
        // "Sólo texto (sin respuestas)": se muestra solo la etiqueta, sin campo de entrada
        null
      )}

      {field.type === 'select' && (
        <select
          className={`${inputBase} ${error ? errorBorder : ''}`}
          value={value || ''}
          onChange={(e) => setResponse(field.key, e.target.value)}
        >
          <option value="">Selecciona una opción</option>
          {(field.options || []).map((opt, i) => {
            const optionValue = optStr(opt);
            return (
              <option key={optKey(opt, i)} value={optionValue}>
                {optionValue}
              </option>
            );
          })}
        </select>
      )}

      {field.type === 'radio' && (
        <div className={`flex flex-col gap-2 ${error ? 'rounded-xl border border-red-400 p-3' : ''}`}>
          {(field.options || []).map((opt, i) => {
            const optionValue = optStr(opt);
            const radioId = `${field.key}_radio_${i}`;

            return (
              <label key={optKey(opt, i)} htmlFor={radioId} className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-700">
                <input
                  id={radioId}
                  type="radio"
                  name={field.key}
                  value={optionValue}
                  checked={String(value) === String(optionValue)}
                  onChange={() => setResponse(field.key, optionValue)}
                  className="accent-[var(--blue-buttons)]"
                />
                {optionValue}
              </label>
            );
          })}
        </div>
      )}

      {field.type === 'checkbox' && (
        <div className={`flex flex-col gap-2 ${error ? 'rounded-xl border border-red-400 p-3' : ''}`}>
          {(field.options || []).map((opt, i) => {
            const optionValue = optStr(opt);
            return (
              <label key={optKey(opt, i)} className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-700">
                <input
                  type="checkbox"
                  value={optionValue}
                  checked={Array.isArray(value) && value.includes(optionValue)}
                  onChange={() => handleCheckbox(optionValue)}
                  className="accent-[var(--blue-buttons)]"
                />
                {optionValue}
              </label>
            );
          })}
        </div>
      )}

      {field.type === 'range' && (
        <div className="flex flex-col gap-1">
          <input
            type="range"
            min={field.min ?? 0}
            max={field.max ?? 10}
            value={value ?? field.min ?? 0}
            onChange={(e) => setResponse(field.key, Number(e.target.value))}
            className="accent-[var(--blue-buttons)]"
          />
          <span className="text-center text-sm font-semibold text-[var(--blue-buttons)]">
            {value ?? field.min ?? 0}
          </span>
        </div>
      )}

      {field.type === 'lot_selector' && (
        <LotSelectorField
          neighborhoodId={formData?.neighborhood_id}
          value={value}
          onChange={(lotId) => setResponse(field.key, lotId)}
          error={error}
        />
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default FormFieldRenderer;
