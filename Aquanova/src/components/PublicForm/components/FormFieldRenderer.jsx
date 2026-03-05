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
          placeholder={field.placeholder || ''}
          value={value || ''}
          onChange={(e) => setResponse(field.key, e.target.value)}
        />
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
