import React from 'react';
import useFormSubmissionContext from '../../hooks/useFormSubmissionContext';
import { DevicePhoneMobileIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { FIELD_TYPES, DEFAULT_TEXTS } from '../../../FormPreview/config/formPrevioConfig';
import Dropdown from '../../../FormPreview/components/ui/fields/Dropdown';
import FileUploadField from '../../../FormPreview/components/ui/fields/FileUploadField';
import RadioGroup from '../../../FormPreview/components/ui/fields/RadioGroup';
import CheckboxGroup from '../../../FormPreview/components/ui/fields/CheckboxGroup';

function renderField(field, answers, setAnswer) {
  const key = field.id || field._id || field.key || field.label || `field_${field?.index}`;
  const value = answers[key];
  const sizeClass = 'text-base';

  switch (field.type) {
    case FIELD_TYPES.TEXT_ONLY:
      return null;

    case FIELD_TYPES.TEXT_RESPONSE:
      return (
        <div className="mt-2 px-1">
          <div className="bg-[#F1F5F9] w-full rounded-[14px] border-[1.5px] border-[#CBD5E1] px-3 py-2 tablet:text-sm text-[13px] text-[var(--text)] opacity-90 select-none">
            <input type="text" placeholder={field.placeholder || 'Tu respuesta'} value={value || ''} onChange={(e) => setAnswer(key, e.target.value)} className="w-full bg-transparent outline-none text-[inherit]" />
          </div>
        </div>
      );

    case FIELD_TYPES.NUMBER:
      return (
        <div className="mt-2 px-1">
          <div className="bg-[#F1F5F9] w-full rounded-[14px] border-[1.5px] border-[#CBD5E1] px-2 py-1 tablet:text-sm text-[13px] text-[var(--text)] opacity-90 select-none flex items-center justify-between">
            <input type="number" placeholder="Introduce un número" value={value || ''} onChange={(e) => setAnswer(key, e.target.value)} className="bg-transparent outline-none w-full pr-2 text-[inherit]" />
            <div className="flex flex-col -space-y-1 ml-2">
              <button type="button" onClick={() => { const n = parseFloat(value) || 0; setAnswer(key, String(n + 1)); }} className="p-1 hover:text-gray-700">
                <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
              </button>
              <button type="button" onClick={() => { const n = parseFloat(value) || 0; setAnswer(key, String(n - 1)); }} className="p-1 hover:text-gray-700">
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
            <input type="date" value={value || ''} onChange={(e) => setAnswer(key, e.target.value)} className="bg-transparent outline-none w-full text-[inherit]" id={`date-field-${key}`} />
            <button type="button" onClick={() => { const el = document.getElementById(`date-field-${key}`); if (el) el.showPicker ? el.showPicker() : el.focus(); }} className="ml-2 text-gray-500 p-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
            </button>
          </div>
        </div>
      );

    case FIELD_TYPES.DROPDOWN:
      return <Dropdown field={field} value={value} onChange={(qid, v) => setAnswer(key, v)} sizeClass={sizeClass} onSelect={(val) => setAnswer(key, val)} />;

    case FIELD_TYPES.MULTIPLE:
      return <RadioGroup field={field} value={value} onChange={(qid, v) => setAnswer(key, v)} sizeClass={sizeClass} />;

    case FIELD_TYPES.FILE_UPLOAD:
      return <FileUploadField field={field} value={value} onChange={(fid, v) => setAnswer(key, v)} sizeClass={sizeClass} />;

    case FIELD_TYPES.CHECKBOX:
      return (
        <CheckboxGroup
          field={field}
          value={value}
          onCheckboxChange={(fid, optionId, checked) => {
            const prev = Array.isArray(answers[key]) ? answers[key] : [];
            if (checked) setAnswer(key, [...prev, optionId]);
            else setAnswer(key, prev.filter((v) => v !== optionId));
          }}
          sizeClass={sizeClass}
        />
      );

    default:
      return (
        <input
          value={value || ''}
          onChange={(e) => setAnswer(key, e.target.value)}
          className="w-full bg-[#F1F5F9] rounded-[14px] border-[1.5px] border-[#CBD5E1] px-3 py-2"
        />
      );
  }
}

export default function FormSubmissionContent() {
  const { form, loading, error, answers, setAnswer, submit, isSubmitting } = useFormSubmissionContext();

  if (loading) return <div className="p-10 text-center font-work">{DEFAULT_TEXTS.LOADING}</div>;
  if (error) return <div className="p-10 text-center text-red-500 font-work">{error}</div>;
  if (!form) return <div className="p-10 text-center font-work">{DEFAULT_TEXTS.NOT_FOUND}</div>;

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

    let fields = form.schema || form.questions || form.fields || [];
    if (typeof fields === 'string') {
      try { fields = JSON.parse(fields); } catch (e) { fields = []; }
    }
    if (!Array.isArray(fields)) fields = [];

    return (
      <div className={`flex flex-col ${gap} ${isMobile ? '' : 'w-full max-w-[770px] mx-auto'}`}>
        <div className={`w-full bg-[var(--card-bg)] border-[1.5px] border-[var(--card-stroke)] ${rounded} ${cardPadding} shadow-sm border-t-[8px] border-t-[var(--blue-buttons)] shrink-0`}>
          { form.imageUrl && (
            <div className={`mb-4 overflow-hidden w-full h-auto ${isMobile ? 'max-h-[200px]' : 'max-h-[400px]'}`}>
              <div className="relative w-full h-full group">
                <img src={form.imageUrl} alt="Form cover" className="w-full h-full object-cover rounded-[12px] transition-transform duration-500 group-hover:scale-[1.01]" />
              </div>
            </div>
          )}
          <h1 className={`${titleSize} font-bold text-[var(--text)] mb-2 break-words leading-tight`}>{form.title}</h1>
          {form.description && (<p className={`${descSize} text-gray-600 whitespace-pre-wrap break-words mt-2`}>{form.description}</p>)}
        </div>

        <div className={`w-full flex flex-col ${gap}`}>
          {fields.map((field, idx) => (
            <div key={field.id || field._id || idx} className={`w-full bg-[var(--card-bg)] border-[1.5px] border-[var(--card-stroke)] ${rounded} ${cardPadding} shadow-sm transition-all duration-500 transform-gpu hover:shadow-md hover:scale-[1.01]`}>
              <div className="mb-2">
                <label className={`block ${labelSize} font-medium text-[var(--text)] mb-1 break-words leading-snug`}>
                  {field.title || field.label || "Sin título"}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
              </div>
              <div className="mt-1">
                {renderField(field, answers, setAnswer, idx)}
              </div>
            </div>
          ))}
        </div>

        <div className="w-full flex justify-between items-center mt-2 pb-6 px-1">
          <button
            className={`bg-[var(--blue-buttons)] text-white ${buttonPadding} rounded-[5px] font-semibold ${buttonTextSize} hover:brightness-110 transition shadow-sm w-full`}
            onClick={async () => {
              try {
                await submit();
                // simple feedback for now
                alert('Respuestas enviadas correctamente');
              } catch (err) {
                console.error(err);
                alert('Error al enviar respuestas: ' + (err.message || err));
              }
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar'}
          </button>
        </div>

        <div className="h-10 text-center text-[10px] text-gray-400">Vista envío de Aquanova</div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-100 flex items-center justify-center font-work overflow-hidden">
      <div className="w-full h-full overflow-y-auto bg-[#F0EBf8] bg-[var(--bg-color-main)]">
        <div className="w-full min-h-full py-10 px-4 flex justify-center">{renderFormContent(false)}</div>
      </div>
    </div>
  );
}
