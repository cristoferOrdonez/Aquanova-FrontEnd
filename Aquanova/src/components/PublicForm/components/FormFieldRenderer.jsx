// src/components/PublicForm/components/FormFieldRenderer.jsx
import { useRef, useState } from 'react';
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

function PublicFileFieldRenderer({ field, value, setResponse, error }) {
  const filesArray = Array.isArray(value) ? value : (value ? [value] : []);
  const [activeMenuIndex, setActiveMenuIndex] = useState(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    let validFiles = [];
    let overSize = false;

    selectedFiles.forEach(file => {
      const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        overSize = true;
      } else {
        validFiles.push(file);
      }
    });

    if (overSize) {
      alert(`Algunos archivos son demasiado grandes y fueron omitidos. Máximo 50MB para videos, 10MB para imágenes.`);
    }

    if (validFiles.length === 0) return;
    
    setResponse(field.key, field.multiple !== false ? [...filesArray, ...validFiles] : validFiles[0] || null);
  };

  const removeFile = (indexToRemove) => {
    const newFiles = filesArray.filter((_, idx) => idx !== indexToRemove);
    setResponse(field.key, newFiles.length > 0 ? newFiles : null);
    setActiveMenuIndex(null);
  };

  const openOptions = (idx) => {
    setActiveMenuIndex(activeMenuIndex === idx ? null : idx);
  };

  const openInNewTab = (url, isVideo) => {
    if (url) {
      if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
        window.open(url, '_blank');
      } else {
        const newTab = window.open();
        if (newTab) {
          newTab.document.write(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Archivo Adjunto</title>
              <style>
                body { margin: 0; background-color: #000; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
                img, video { max-width: 100%; max-height: 100%; object-fit: contain; }
              </style>
            </head>
            <body>
              ${isVideo ? `<video src="${url}" controls autoplay></video>` : `<img src="${url}" alt="Vista completa" />`}
            </body>
            </html>
          `);
          newTab.document.close();
        } else {
          alert('Por favor, permite las ventanas emergentes (pop-ups) en tu navegador para ver la imagen.');
        }
      }
    }
    setActiveMenuIndex(null);
  };

  return (
    <div className="flex flex-col gap-2 w-full mt-1">
      {filesArray.length === 0 ? (
        <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed ${error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'} rounded-xl cursor-pointer transition-all`}>
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg aria-hidden="true" className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
            <p className="mb-2 text-gray-500 text-center text-sm"><span className="font-semibold">Haz clic para subir archivos</span></p>
            <p className="text-gray-400 text-center px-4 text-xs">Puedes seleccionar uno o varios archivos a la vez. <br />PNG, JPG, MP4, MOV (Imágenes: 10MB, Videos: 50MB)</p>
          </div>
          <input
            type="file"
            accept="image/*,video/*"
            multiple={field.multiple !== false}
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      ) : (
        <div className="w-full">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {filesArray.map((fileObj, idx) => {
              const isNative = fileObj instanceof File;
              const previewUrl = isNative ? URL.createObjectURL(fileObj) : (typeof fileObj === 'string' ? fileObj : null);
              const isVideo = isNative ? fileObj.type.startsWith('video/') : (typeof fileObj === 'string' && (fileObj.includes('.mp4') || fileObj.includes('.mov')));
              const isStringUrl = typeof fileObj === 'string';

              return (
                <div key={idx} className="relative aspect-square border border-gray-200 rounded-lg overflow-hidden group shadow-sm cursor-pointer" onClick={() => openOptions(idx)}>
                  {previewUrl ? (
                    isVideo ? (
                      <video src={previewUrl} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <img src={previewUrl} alt={`Vista previa ${idx}`} loading="lazy" className="absolute inset-0 w-full h-full object-cover bg-gray-100" />
                    )
                  ) : isStringUrl ? (
                    <div className="absolute inset-0 flex items-center justify-center p-2 bg-gray-50">
                      <span className="text-gray-600 truncate break-all text-xs text-center">{fileObj}</span>
                    </div>
                  ) : null}
                  
                  {activeMenuIndex === idx && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-1 md:p-1.5 gap-1 md:gap-1.5 z-20 backdrop-blur-sm overflow-hidden text-center">
                      <button
                        type="button"
                        className="w-full flex-1 max-h-6 bg-white text-gray-800 text-[9px] sm:text-[10px] rounded shadow-sm hover:bg-gray-100 transition-colors font-medium flex items-center justify-center leading-none"
                        onClick={(e) => { e.stopPropagation(); openInNewTab(previewUrl || fileObj, isVideo || false); }}
                      >
                        Ver
                      </button>
                      <button
                        type="button"
                        className="w-full flex-1 max-h-6 bg-red-500 text-white text-[9px] sm:text-[10px] rounded shadow-sm hover:bg-red-600 transition-colors font-medium flex items-center justify-center leading-none"
                        onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                      >
                        Borrar
                      </button>
                      <button
                        type="button"
                        className="w-full flex-1 max-h-6 bg-gray-500 text-white text-[9px] sm:text-[10px] rounded shadow-sm hover:bg-gray-600 transition-colors font-medium flex items-center justify-center leading-none"
                        onClick={(e) => { e.stopPropagation(); setActiveMenuIndex(null); }}
                      >
                        Cerrar
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {field.multiple !== false && (
              <label className="relative aspect-square border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-all flex flex-col items-center justify-center text-center shadow-sm">
                <svg aria-hidden="true" className="w-6 h-6 mb-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                <span className="text-gray-500 font-medium text-xs">Añadir más</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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
        <PublicFileFieldRenderer
          field={field}
          value={value}
          setResponse={setResponse}
          error={error}
        />
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
