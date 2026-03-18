// src/components/PublicForm/components/FormFieldRenderer.jsx
import { usePublicFormContext } from '../hooks/usePublicFormContext';

const inputBase =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-[var(--blue-buttons)] focus:ring-2 focus:ring-[var(--blue-buttons)]/20';

const errorBorder = 'border-red-400 focus:border-red-400 focus:ring-red-200';

/**
 * Renderiza un único campo del schema del formulario.
 *
 * @param {{ field: import('../context/PublicFormContext').SchemaField }} props
 */
// Normaliza una opción que puede ser string u objeto { id, value }
const optStr = (opt) =>
  opt !== null && typeof opt === 'object' ? (opt.value ?? opt.label ?? '') : String(opt ?? '');
const optKey = (opt, i) =>
  opt !== null && typeof opt === 'object' ? (opt.id ?? opt.value ?? i) : (opt ?? i);

function FormFieldRenderer({ field }) {
  const { responses, setResponse, fieldErrors } = usePublicFormContext();
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
        <input
          type="date"
          className={`${inputBase} ${error ? errorBorder : ''}`}
          value={value || ''}
          onChange={(e) => setResponse(field.key, e.target.value)}
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
          {(field.options || []).map((opt, i) => (
            <option key={optKey(opt, i)} value={optStr(opt)}>
              {optStr(opt)}
            </option>
          ))}
        </select>
      )}

      {field.type === 'radio' && (
        <div className={`flex flex-col gap-2 ${error ? 'rounded-xl border border-red-400 p-3' : ''}`}>
          {(field.options || []).map((opt, i) => (
            <label key={optKey(opt, i)} className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-700">
              <input
                type="radio"
                name={field.key}
                value={optStr(opt)}
                checked={value === optStr(opt)}
                onChange={() => setResponse(field.key, optStr(opt))}
                className="accent-[var(--blue-buttons)]"
              />
              {optStr(opt)}
            </label>
          ))}
        </div>
      )}

      {field.type === 'checkbox' && (
        <div className={`flex flex-col gap-2 ${error ? 'rounded-xl border border-red-400 p-3' : ''}`}>
          {(field.options || []).map((opt, i) => (
            <label key={optKey(opt, i)} className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-700">
              <input
                type="checkbox"
                value={optStr(opt)}
                checked={Array.isArray(value) && value.includes(optStr(opt))}
                onChange={() => handleCheckbox(optStr(opt))}
                className="accent-[var(--blue-buttons)]"
              />
              {optStr(opt)}
            </label>
          ))}
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

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default FormFieldRenderer;
