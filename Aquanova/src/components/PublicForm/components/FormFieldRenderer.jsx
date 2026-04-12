// src/components/PublicForm/components/FormFieldRenderer.jsx
import { useRef, useState, useEffect } from 'react';
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
// Funciones utilitarias para opciones
const optStr = (opt) =>
  opt !== null && typeof opt === 'object' 
    ? (opt.value ?? opt.label ?? opt.text ?? opt.name ?? String(opt.id ?? '')) 
    : String(opt ?? '');
const optKey = (opt, i) =>
  opt !== null && typeof opt === 'object' ? (opt.id ?? opt.value ?? i) : (opt ?? i);

/**
 * Visor de cámara web para PC y dispositivos móviles para tomar una foto.
 */
function CameraModal({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    // Solicitar permiso a la cámara
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then((streamData) => {
        setStream(streamData);
        if (videoRef.current) {
          videoRef.current.srcObject = streamData;
        }
      })
      .catch((err) => {
        console.error("Error al acceder a la cámara:", err);
        alert("No se pudo acceder a la cámara. Revisa los permisos de tu navegador.");
        onClose();
      });

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return onClose();
      const file = new File([blob], `captura-${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      // Apagar cámara
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      onCapture(file);
    }, 'image/jpeg', 0.9);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90 p-4">
      <div className="flex justify-between items-center bg-black/50 p-2 text-white mb-4 rounded-xl">
        <span className="font-semibold px-2">Cámara</span>
        <button onClick={() => {
          if (stream) stream.getTracks().forEach((track) => track.stop());
          onClose();
        }} className="p-2 bg-white/20 rounded-full hover:bg-white/30">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 w-full bg-black flex items-center justify-center overflow-hidden rounded-2xl relative">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="max-h-full max-w-full object-contain"
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="mt-8 mb-6 flex justify-center">
        <button 
          onClick={takePhoto} 
          className="w-16 h-16 bg-white rounded-full border-4 border-[var(--blue-buttons)] flex items-center justify-center hover:scale-105 transition-transform"
        >
          <div className="w-12 h-12 bg-white border border-gray-300 rounded-full"></div>
        </button>
      </div>
    </div>
  );
}

function FormFieldRenderer({ field }) {
  const { responses, setResponse, fieldErrors, formData } = usePublicFormContext();
  const value = responses[field.key];
  const error = fieldErrors[field.key];
  const [showCameraModal, setShowCameraModal] = useState(false);

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
        <div className="flex flex-col gap-3 mt-1">
          <div className="flex gap-3">
            {/* Opción 1: Archivos (Galería) */}
            <label
              className={`flex flex-col items-center justify-center flex-1 cursor-pointer bg-[var(--blue-buttons)]/5 hover:bg-[var(--blue-buttons)]/10 text-[var(--blue-buttons)] rounded-xl py-4 border-2 border-dashed border-[var(--blue-buttons)]/30 transition-colors ${
                error ? 'border-red-400 bg-red-50 text-red-500' : ''
              }`}
            >
              <svg className="h-6 w-6 mb-1.5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span className="text-sm font-medium">Subir archivos</span>
              <input
                type="file"
                accept="image/*,video/*"
                multiple={field.multiple !== false}
                className="hidden"
                onChange={(e) => {
                  const newFiles = Array.from(e.target.files || []);
                  if (field.multiple !== false) {
                    const currentFiles = Array.isArray(value) ? value : [];
                    setResponse(field.key, [...currentFiles, ...newFiles]);
                  } else {
                    setResponse(field.key, newFiles[0] || null);
                  }
                  e.target.value = '';
                }}
              />
            </label>

            {/* Opción 2: Abrir Cámara (Soporta Móvil o Web nativa vía Modal) */}
            <button
              type="button"
              onClick={() => {
                // Comprobamos si el dispositivo es touch para usar la app cámara del SO,
                // de lo contrario abrimos nuestro Modal de Cámara Web para escritorio
                const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
                if (!isTouchDevice) {
                  setShowCameraModal(true);
                } else {
                  // En móviles disparamos un evento de clic en el input de captura nativa
                  document.getElementById(`camera-upload-${field.key}`).click();
                }
              }}
              className={`flex flex-col items-center justify-center flex-1 cursor-pointer bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl py-4 border-2 border-dashed border-slate-300 transition-colors ${
                error ? 'border-red-400 bg-red-50 text-red-500' : ''
              }`}
            >
              <svg className="h-6 w-6 mb-1.5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium">Tomar foto</span>
              {/* Input oculto solo para móviles */}
              <input
                id={`camera-upload-${field.key}`}
                type="file"
                accept="image/*"
                capture="environment"
                multiple={field.multiple !== false}
                className="hidden"
                onChange={(e) => {
                  const newFiles = Array.from(e.target.files || []);
                  if (field.multiple !== false) {
                    const currentFiles = Array.isArray(value) ? value : [];
                    setResponse(field.key, [...currentFiles, ...newFiles]);
                  } else {
                    setResponse(field.key, newFiles[0] || null);
                  }
                  e.target.value = '';
                }}
              />
            </button>
          </div>

          {/* Modal de cámara para escritorio */}
          {showCameraModal && (
            <CameraModal 
              onClose={() => setShowCameraModal(false)}
              onCapture={(newFile) => {
                setShowCameraModal(false);
                if (field.multiple !== false) {
                  const currentFiles = Array.isArray(value) ? value : [];
                  setResponse(field.key, [...currentFiles, newFile]);
                } else {
                  setResponse(field.key, newFile);
                }
              }}
            />
          )}

          {/* Mostrar preview de archivos seleccionados */}
          {value && (
            <div className="flex flex-col gap-2 mt-2">
              {(Array.isArray(value) ? value : [value]).map((file, idx) => {
                if (!(file instanceof File)) return null;
                const isVideo = file.type.startsWith('video/');
                const isImage = file.type.startsWith('image/');
                const fileSize = (file.size / 1024).toFixed(1);
                const icon = isVideo ? '🎥' : isImage ? '🖼️' : '📄';

                return (
                  <div key={idx} className="flex items-center justify-between text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="text-lg flex-shrink-0">{icon}</span>
                      <div className="flex flex-col truncate">
                        <span className="font-medium truncate">{file.name}</span>
                        <span className="text-xs text-gray-500">{fileSize} KB</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="ml-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      title="Eliminar archivo"
                      onClick={() => {
                        if (Array.isArray(value)) {
                          const newArray = [...value];
                          newArray.splice(idx, 1);
                          setResponse(field.key, newArray.length > 0 ? newArray : null);
                        } else {
                          setResponse(field.key, null);
                        }
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
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
          formResponses={responses}
        />
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default FormFieldRenderer;
