import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'react-router-dom';
import { formService } from '../../services/formService';
import { DevicePhoneMobileIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline'; // Icons for toggle

// Mapping types to strings used in the backend/schema
const FIELD_TYPES = {
  TEXT_ONLY: "Sólo texto (sin respuestas)",
  MULTIPLE: "Opción multiple",
  CHECKBOX: "Casillas de verificación",
  DROPDOWN: "Lista desplegable",
  TEXT_RESPONSE: "Respuesta textual",
  NUMBER: "Numérico",
  DATE: "Fecha",
  FILE_UPLOAD: "Cargar imagen"
};

const FormPreview = () => {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [viewMode, setViewMode] = useState('mobile'); // 'mobile' | 'desktop'

  // Handlers for header image actions to match FormCreation behavior
  const handleHeaderRemove = (e) => {
    e && e.stopPropagation && e.stopPropagation();
    setForm(prev => ({ ...(prev || {}), imageUrl: null }));
  };

  const handleHeaderReplace = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm(prev => ({ ...(prev || {}), imageUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await formService.getById(id);
        
        // Manejo flexible de la respuesta para soportar diferentes formatos
        if ((response.success || response.ok) && response.data) {
          setForm(response.data);
        } else if (response.data && response.data.id) {
           // Caso: response.data existe aunque falte flag de éxito explícito (como en la captura)
           setForm(response.data);
        } else if (response.id && (response.title || response.fields || response.questions)) {
          // Caso: Devuelve el objeto formulario directamente
          setForm(response);
        } else if (response.form) {
           // Caso: Devuelve { form: ... }
           setForm(response.form);
        } else {
          console.warn('Respuesta inesperada al obtener formulario:', response);
          setError('Error al obtener el formulario: Formato de respuesta no reconocido');
        }
      } catch (err) {
        console.error(err);
        setError('Error de conexión o formulario no encontrado');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchForm();
    }
  }, [id]);

  const handleInputChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleCheckboxChange = (questionId, optionId, checked) => {
    setAnswers(prev => {
      const currentValues = prev[questionId] || [];
      if (checked) {
        return { ...prev, [questionId]: [...currentValues, optionId] };
      } else {
        return { ...prev, [questionId]: currentValues.filter(id => id !== optionId) };
      }
    });
  };

  if (loading) return <div className="p-10 text-center font-work">Cargando vista previa...</div>;
  if (error) return <div className="p-10 text-center text-red-500 font-work">{error}</div>;
  if (!form) return <div className="p-10 text-center font-work">Formulario no encontrado</div>;

  // Intentar obtener las preguntas de varios campos posibles (schema, questions, fields)
  // También maneja el caso de que venga como string JSON stringificado
  let fields = form.schema || form.questions || form.fields || [];
  
  if (typeof fields === 'string') {
    try {
      fields = JSON.parse(fields);
    } catch (e) {
      console.error('Error parsing form fields:', e);
      fields = [];
    }
  }

  // Asegurar que sea array
  if (!Array.isArray(fields)) {
     fields = [];
  }

  const renderFormContent = (isMobile) => {
    const cardPadding = 'p-6';
    const rounded = 'rounded-[5px]';
    const titleSize = isMobile ? 'text-[15px]' : 'tablet:text-lg text-[15px]';
    const descSize = isMobile ? 'text-sm' : 'text-base';
    const labelSize = isMobile ? 'text-xs' : 'tablet:text-base text-sm';
    const buttonPadding = isMobile ? 'px-8 py-2.5' : 'px-10 py-3';
    const buttonTextSize = isMobile ? 'text-xs' : 'text-base';
    const gap = isMobile ? 'gap-3' : 'gap-6';
    const inputSizeClass = isMobile ? 'text-xs' : 'text-base';

    return (
        <div className={`flex flex-col ${gap} ${isMobile ? '' : 'w-full max-w-[770px] mx-auto'}`}>
            {/* Header Card */}
            <div className={`w-full bg-[var(--card-bg)] border-[1.5px] border-[var(--card-stroke)] ${rounded} ${cardPadding} shadow-sm border-t-[8px] border-t-[var(--blue-buttons)] shrink-0`}>
                { form.imageUrl && (
                    <div className={`mb-4 overflow-hidden w-full h-auto ${isMobile ? 'max-h-[200px]' : 'max-h-[400px]'}`}>
                        <div className="relative w-full h-full group">
                          <img src={form.imageUrl} alt="Form cover" className="w-full h-full object-cover rounded-[12px] transition-transform duration-500 group-hover:scale-[1.01]" />

                          {/* Overlay actions (match FormCreation) */}
                          <div className="absolute inset-0 z-10 rounded-[12px] bg-[#E0EEFF]/0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out">
                            <button onClick={handleHeaderRemove} className="p-2 bg-white rounded-full shadow-sm hover:bg-red-50 hover:text-red-500 text-gray-600 transition-colors transform hover:scale-110">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                            </button>
                            <label className="p-2 bg-white rounded-full shadow-sm hover:bg-blue-50 hover:text-blue-600 text-gray-600 transition-colors transform hover:scale-110 cursor-pointer">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files[0]; if (file) handleHeaderReplace(file); }} />
                            </label>
                          </div>
                        </div>
                    </div>
                )}
                <h1 className={`${titleSize} font-bold text-[var(--text)] mb-2 break-words leading-tight`}>{form.title}</h1>
                {form.description && (
                <p className={`${descSize} text-gray-600 whitespace-pre-wrap break-words mt-2`}>{form.description}</p>
                )}
            </div>

            {/* Question Cards */}
            <div className={`w-full flex flex-col ${gap}`}>
                {fields.map(field => (
                  <div key={field.id} className={`w-full bg-[var(--card-bg)] border-[1.5px] border-[var(--card-stroke)] ${rounded} ${cardPadding} shadow-sm transition-all duration-500 transform-gpu hover:shadow-md hover:scale-[1.01]`}> 
                  <div className="mb-2">
                    <label className={`block ${labelSize} font-medium text-[var(--text)] mb-1 break-words leading-snug`}>
                      {field.title || field.label || "Sin título"}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                  </div>
                    
                  <div className="mt-1">
                    {renderFieldInput(field, answers, handleInputChange, handleCheckboxChange, inputSizeClass)}
                  </div>
                  </div>
                ))}
            </div>

            <div className="w-full flex justify-between items-center mt-2 pb-6 px-1">
                    <button className={`bg-[var(--blue-buttons)] text-white ${buttonPadding} rounded-[5px] font-semibold ${buttonTextSize} hover:brightness-110 transition shadow-sm w-full`}>
                    Enviar
                    </button>
            </div>
            
            <div className="h-10 text-center text-[10px] text-gray-400">
                Vista previa de Aquanova
            </div>
        </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-100 flex items-center justify-center font-work overflow-hidden">
      
      {/* View Toggle - Top Right */}
      <div className="absolute top-6 right-6 z-50 flex bg-white rounded-lg shadow-md p-1.5 border border-gray-200 gap-2">
        <button 
            onClick={() => setViewMode('mobile')} 
            className={`p-2 rounded-md transition-colors ${viewMode === 'mobile' ? 'bg-blue-50 text-[var(--blue-buttons)]' : 'text-gray-400 hover:text-gray-600'}`}
            title="Vista Móvil"
        >
            <DevicePhoneMobileIcon className="w-6 h-6" />
        </button>
        <button 
            onClick={() => setViewMode('desktop')} 
            className={`p-2 rounded-md transition-colors ${viewMode === 'desktop' ? 'bg-blue-50 text-[var(--blue-buttons)]' : 'text-gray-400 hover:text-gray-600'}`}
            title="Vista Ordenador"
        >
            <ComputerDesktopIcon className="w-6 h-6" />
        </button>
      </div>

      {viewMode === 'mobile' ? (
        /* Phone Frame Wrapper */
        <div className="relative border-gray-900 bg-gray-900 border-[10px] sm:border-[14px] rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-start z-10 transition-all duration-300 h-[92vh] max-h-[850px] aspect-[9/19.5] max-w-full m-4">
            {/* Side Buttons Mockup */}
            <div className="h-[32px] w-[3px] bg-gray-800 absolute -start-[13px] sm:-start-[17px] top-[72px] rounded-s-lg"></div>
            <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[13px] sm:-start-[17px] top-[124px] rounded-s-lg"></div>
            <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[13px] sm:-start-[17px] top-[178px] rounded-s-lg"></div>
            <div className="h-[64px] w-[3px] bg-gray-800 absolute -end-[13px] sm:-end-[17px] top-[142px] rounded-e-lg"></div>
            
            {/* Internal Screen */}
            <div className="rounded-[2rem] overflow-hidden w-full h-full bg-[var(--bg-color-main)] relative flex flex-col">
                
                {/* Dynamic Island / Notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[30%] min-w-[100px] h-[30px] bg-gray-900 rounded-b-[1rem] z-50 flex justify-center items-center">
                    <div className="w-[50%] h-4 bg-gray-800 rounded-full opacity-50"></div>
                </div>

                {/* Status Bar */}
                <div className="w-full h-12 bg-[var(--bg-color-main)] flex justify-between items-center px-6 pt-3 shrink-0 z-40 select-none">
                    <span className="text-xs font-semibold text-gray-900">9:41</span>
                    <div className="flex gap-1.5 items-center">
                        <svg className="w-3.5 h-3.5 text-gray-900" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"></path></svg>
                        <svg className="w-4 h-4 text-gray-900" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.414-1.414 5 5 0 017.072 0 1 1 0 01-1.414 1.414zM9 16a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>
                        <div className="w-5 h-2.5 border border-gray-400 rounded-[2px] relative ml-1">
                            <div className="absolute inset-0.5 bg-gray-800 rounded-[1px] w-[80%]"></div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-4 pb-10 pt-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                  {renderFormContent(true)}
                </div>

                {/* Home Indicator */}
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-[130px] h-[5px] bg-gray-900 rounded-full z-50"></div>
            </div>
        </div>
      ) : (
        /* Desktop View */
        <div className="w-full h-full overflow-y-auto bg-[#F0EBf8] bg-[var(--bg-color-main)]">
             <div className="w-full min-h-full py-10 px-4 flex justify-center">
                 {renderFormContent(false)}
             </div>
        </div>
      )}

    </div>
  );
};

function renderFieldInput(field, answers, onTextChange, onCheckboxChange, sizeClass) {
  const value = answers[field.id];
  const commonClasses = `w-full border-b border-[#00000033] bg-transparent py-2 px-1 focus:border-[var(--blue-buttons)] focus:border-b-2 outline-none transition-colors placeholder-gray-400 ${sizeClass}`;

  switch (field.type) {
    case FIELD_TYPES.TEXT_ONLY:
      return null;

    case FIELD_TYPES.TEXT_RESPONSE:
      return (
        <div className="mt-2 px-1">
          <div className="bg-[#F1F5F9] w-full rounded-[14px] border-[1.5px] border-[#CBD5E1] px-3 py-2 tablet:text-sm text-[13px] text-[var(--text)] opacity-90 select-none">
            <input
              type="text"
              placeholder="Tu respuesta"
              value={value || ''}
              onChange={(e) => onTextChange(field.id, e.target.value)}
              className="w-full bg-transparent outline-none text-[inherit]"
            />
          </div>
        </div>
      );

    case FIELD_TYPES.NUMBER:
        return (
          <div className="mt-2 px-1">
            <div className="bg-[#F1F5F9] w-full rounded-[14px] border-[1.5px] border-[#CBD5E1] px-2 py-1 tablet:text-sm text-[13px] text-[var(--text)] opacity-90 select-none flex items-center justify-between">
              <input
                type="number"
                placeholder="Introduce un número"
                value={value || ''}
                onChange={(e) => onTextChange(field.id, e.target.value)}
                className="bg-transparent outline-none w-full pr-2 text-[inherit]"
              />
              <div className="flex flex-col -space-y-1 ml-2">
                <button type="button" onClick={() => {
                  const n = parseFloat(value) || 0; onTextChange(field.id, String(n + 1));
                }} className="p-1 hover:text-gray-700">
                  <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                </button>
                <button type="button" onClick={() => {
                  const n = parseFloat(value) || 0; onTextChange(field.id, String(n - 1));
                }} className="p-1 hover:text-gray-700">
                  <svg className="w-3 h-3 rotate-180" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                </button>
              </div>
            </div>
          </div>
        );

    case FIELD_TYPES.DATE:
        return (
          <div className="mt-2 px-1">
            <div className="bg-[#F1F5F9] w-full rounded-[14px] border-[1.5px] border-[#CBD5E1] px-3 py-2 tablet:text-sm text-[13px] text-[var(--text)] opacity-90 select-none flex items-center justify-between">
              <input
                type="date"
                value={value || ''}
                onChange={(e) => onTextChange(field.id, e.target.value)}
                className="bg-transparent outline-none w-full text-[inherit]"
                id={`date-field-${field.id}`}
              />
              <button type="button" onClick={() => {
                const el = document.getElementById(`date-field-${field.id}`); if (el) el.showPicker ? el.showPicker() : el.focus();
              }} className="ml-2 text-gray-500 p-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
              </button>
            </div>
          </div>
        );

    case FIELD_TYPES.DROPDOWN:
      // Custom dropdown rendered into a portal to avoid clipping by parent overflow
      function CustomDropdown({ field, value, onChange, sizeClass }) {
        const [open, setOpen] = useState(false);
        const triggerRef = useRef(null);
        const dropdownRef = useRef(null);
        const [rect, setRect] = useState(null);
        const [dropdownTop, setDropdownTop] = useState(null);

        useEffect(() => {
          function onDocClick(e) {
            if (triggerRef.current && !triggerRef.current.contains(e.target) && dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
          }
          if (open) document.addEventListener('mousedown', onDocClick);
          return () => document.removeEventListener('mousedown', onDocClick);
        }, [open]);

        useEffect(() => {
          if (!open || !triggerRef.current) return;
          const updatePos = () => {
            const r = triggerRef.current.getBoundingClientRect();
            setRect(r);
            // compute preferred top; default below
            const preferredTop = r.bottom + 8;
            setDropdownTop(preferredTop);
          };

          updatePos();
          window.addEventListener('scroll', updatePos, true);
          window.addEventListener('resize', updatePos);
          return () => {
            window.removeEventListener('scroll', updatePos, true);
            window.removeEventListener('resize', updatePos);
          };
        }, [open]);

        // measure dropdown height and flip if needed
        useEffect(() => {
          if (!open || !rect) return;
          const adjust = () => {
            if (!dropdownRef.current) return;
            const dh = dropdownRef.current.offsetHeight;
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            if (spaceBelow < dh + 16 && spaceAbove > spaceBelow) {
              // open upwards
              setDropdownTop(rect.top - dh - 8);
            } else {
              setDropdownTop(rect.bottom + 8);
            }
          };
          // wait a frame to ensure dropdownRef is rendered
          requestAnimationFrame(adjust);
        }, [rect, open]);

        const toggle = () => {
          if (!open && triggerRef.current) {
            const r = triggerRef.current.getBoundingClientRect();
            setRect(r);
            setOpen(true);
          } else setOpen(false);
        };

        return (
          <div className="px-1">
            <div ref={triggerRef} onClick={toggle} className={`flex items-center justify-between w-full border border-[var(--input-border)] bg-[var(--input-bg)] rounded-[14px] p-2 cursor-pointer select-none ${sizeClass}`}>
              <span className={`truncate ${sizeClass}`}>{ value || "Selecciona una opción" }</span>
              <svg className={`w-4 h-4 text-gray-700 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>

            {open && rect && dropdownTop != null && createPortal(
              <div style={{ position: 'fixed', top: dropdownTop, left: rect.left, width: rect.width, zIndex: 9999 }}>
                <div ref={dropdownRef} className="bg-[var(--card-bg)] border border-[var(--card-stroke)] rounded-[14px] shadow-lg overflow-hidden">
                  {field.options && field.options.map((opt, idx) => {
                    const val = typeof opt === 'object' ? opt.value : opt;
                    const key = typeof opt === 'object' ? opt.id : idx;
                    return (
                      <div
                        key={key}
                        onClick={() => { onChange(field.id, val); setOpen(false); }}
                        className="px-4 py-2 text-[13px] text-[var(--text)] hover:bg-[var(--stroke-selectors-and-search-bars)] cursor-pointer"
                      >
                        {val}
                      </div>
                    );
                  })}
                </div>
              </div>, document.body)
            }
          </div>
        );
      }

      return <CustomDropdown field={field} value={value} onChange={onTextChange} sizeClass={sizeClass} />;
    
    case FIELD_TYPES.MULTIPLE: // Radio buttons
      return (
        <div className="space-y-2 mt-1">
            {field.options && field.options.map((opt, idx) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const key = typeof opt === 'object' ? opt.id : idx;
          const idToStore = typeof opt === 'object' ? opt.id : val;
          const isChecked = value === idToStore || value === val;

          return (
          <label key={key} className="flex items-center space-x-2 cursor-pointer group">
          <div className="relative flex items-center">
            <input
              type="radio"
              name={`field-${field.id}`}
              value={idToStore}
              checked={isChecked}
              onChange={() => onTextChange(field.id, idToStore)}
              className={`peer appearance-none w-4 h-4 rounded-full border-2 border-gray-300 checked:border-blue-600 transition-all ${sizeClass}`}
            />
            <div className="absolute w-2 h-2 bg-blue-600 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 scale-0 peer-checked:scale-100 transition-transform"></div>
          </div>
          <span className={`text-gray-700 group-hover:text-gray-900 ${sizeClass}`}>{val}</span>
          </label>
        )})}
        </div>
      );

    case FIELD_TYPES.FILE_UPLOAD: {
      const previewUrl = value && typeof value === 'object' ? value.previewUrl : null;

      return (
        <div className="mt-2">
            <label className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors overflow-hidden ${sizeClass}`}>
                {previewUrl ? (
                  <img src={previewUrl} alt="Vista previa" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg aria-hidden="true" className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                      <p className={`mb-2 text-gray-500 text-center ${sizeClass === 'text-xs' ? 'text-[10px]' : 'text-sm'}`}><span className="font-semibold">Click para subir</span></p>
                      <p className={`text-gray-500 text-center ${sizeClass === 'text-xs' ? 'text-[8px]' : 'text-xs'}`}>PNG, JPG (MAX. 10MB)</p>
                  </div>
                )}
                <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                       const file = e.target.files[0];
                       if (!file) return;

                       const reader = new FileReader();
                       reader.onload = () => {
                         onTextChange(field.id, { name: file.name, previewUrl: reader.result });
                       };
                       reader.readAsDataURL(file);
                    }}
                />
            </label>
            {previewUrl && (
              <div className="flex gap-2 mt-2">
                <label className={`inline-flex items-center justify-center px-3 py-1.5 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer transition ${sizeClass === 'text-xs' ? 'text-[10px]' : 'text-sm'}`}>
                  Cambiar imagen
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;

                      const reader = new FileReader();
                      reader.onload = () => {
                        onTextChange(field.id, { name: file.name, previewUrl: reader.result });
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
                <button
                  type="button"
                  className={`inline-flex items-center justify-center px-3 py-1.5 rounded-md border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition ${sizeClass === 'text-xs' ? 'text-[10px]' : 'text-sm'}`}
                  onClick={() => onTextChange(field.id, null)}
                >
                  Quitar imagen
                </button>
              </div>
            )}
            {!previewUrl && value && typeof value === 'string' && (
              <div className={`text-gray-600 mt-1 truncate ${sizeClass === 'text-xs' ? 'text-[10px]' : 'text-sm'}`}>Archivo: {value}</div>
            )}
        </div>
      );
    }

    case FIELD_TYPES.CHECKBOX:
      return (
        <div className="space-y-2 mt-1">
          {field.options && field.options.map((opt, idx) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const key = typeof opt === 'object' ? opt.id : idx;
            
            const idToStore = typeof opt === 'object' ? opt.id : opt;
            const isCheckedRobust = (value || []).includes(idToStore);

            return (
              <label key={key} className="flex items-center space-x-2 cursor-pointer group">
                 <div className="relative flex items-center">
                    <input
                        type="checkbox"
                        checked={isCheckedRobust}
                        onChange={(e) => onCheckboxChange(field.id, idToStore, e.target.checked)}
                        className={`peer appearance-none w-4 h-4 rounded border-2 border-gray-300 checked:bg-blue-600 checked:border-blue-600 transition-all ${sizeClass}`}
                    />
                     <svg className="absolute w-3 h-3 text-white top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 scale-0 peer-checked:scale-100 transition-transform pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                 </div>
                <span className={`text-gray-700 group-hover:text-gray-900 ${sizeClass}`}>{val}</span>
              </label>
            )
          })}
        </div>
      );

    default:
      return <div className={`text-red-500 py-1 px-2 bg-red-50 rounded ${sizeClass}`}>Campo no soportado: {field.type}</div>;
  }
}

export default FormPreview;
