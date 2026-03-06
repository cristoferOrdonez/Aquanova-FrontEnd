import FORM_CREATION_CONFIG from './../../../config/formCreationConfig';

const TYPE_BADGE = {
  'Opción multiple':             { label: 'Opción múltiple',    cls: 'bg-violet-50 text-violet-600 border-violet-200' },
  'Casillas de verificación':    { label: 'Casillas',           cls: 'bg-blue-50 text-blue-600 border-blue-200' },
  'Lista desplegable':           { label: 'Desplegable',        cls: 'bg-cyan-50 text-cyan-600 border-cyan-200' },
  'Respuesta textual':           { label: 'Texto',              cls: 'bg-gray-100 text-gray-500 border-gray-200' },
  'Numérico':                    { label: 'Numérico',           cls: 'bg-orange-50 text-orange-600 border-orange-200' },
  'Fecha':                       { label: 'Fecha',              cls: 'bg-green-50 text-green-600 border-green-200' },
  'Cargar imagen':               { label: 'Imagen',             cls: 'bg-pink-50 text-pink-600 border-pink-200' },
};

export default function QuestionCard({
  q,
  isJustUpdated,
  index,
}) {
  const badge = TYPE_BADGE[q.type];
  return (
    <div className={`
      w-full border-[1.5px] rounded-[5px] p-5 flex flex-col gap-3 shadow-sm
      transition-all duration-500
      ${isJustUpdated ? 'bg-blue-50 border-[#2138C4] shadow-[0_0_15px_rgba(33,56,196,0.2)]' : 'bg-[var(--card-bg)] border-[var(--card-stroke)]'}
    `}>
      {/* Fila superior: número + badge de tipo */}
      <div className="flex items-center justify-between gap-2">
        {index !== undefined && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
            isJustUpdated ? 'bg-[#2138C4]/10 text-[#2138C4] border-[#2138C4]/20' : 'bg-[var(--bg-color-main)] text-gray-400 border-[var(--card-stroke)]'
          }`}>
            #{index + 1}
          </span>
        )}
        {badge && q.type !== FORM_CREATION_CONFIG.defaultType && (
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ml-auto ${
            isJustUpdated ? 'bg-[#2138C4]/10 text-[#2138C4] border-[#2138C4]/20' : badge.cls
          }`}>
            {badge.label}
          </span>
        )}
      </div>
      <h3 className="text-[var(--text)] tablet:text-base text-sm leading-snug">
        {q.title}
        {q.required && <span className="text-red-500 ml-1">*</span>}
      </h3>

      {(q.type !== FORM_CREATION_CONFIG.defaultType) && (
        <div className="mt-1">
          {(q.type === 'Respuesta textual' || q.type === 'Numérico') && (
            <div className="w-full h-10 bg-[#F1F5F9] border-[1.5px] border-[#CBD5E1] rounded-[8px] px-3 flex items-center text-gray-400 tablet:text-sm text-[13px]">
              {q.type === 'Numérico' ? 'Respuesta numérica' : 'Texto de respuesta corta'}
            </div>
          )}

          {q.type === 'Fecha' && (
            <div className="w-full h-10 bg-[#F1F5F9] border-[1.5px] border-[#CBD5E1] rounded-[8px] px-3 flex justify-between items-center text-gray-400 tablet:text-sm text-[13px]">
              <span>dd/mm/aaaa</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 opacity-50"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
            </div>
          )}

          {q.type === 'Cargar imagen' && (
            <div className="w-full h-24 bg-[#F1F5F9] border-[1.5px] border-dashed border-[#CBD5E1] rounded-[8px] flex flex-col justify-center items-center text-gray-400 gap-1">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 opacity-50">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
               </svg>
               <span className="text-xs">Subida de archivo (imagen)</span>
            </div>
          )}

          {q.type === FORM_CREATION_CONFIG.typeLabels.DROPDOWN && (
            <div className="flex flex-col gap-2 text-[var(--text)]">
              {q.options.map((opt, index) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <span className="text-xs font-semibold opacity-40">{index + 1}.</span>
                  <span className="tablet:text-sm text-[13px] opacity-90">{opt.value}</span>
                </div>
              ))}
            </div>
          )}

          {q.type === FORM_CREATION_CONFIG.typeLabels.MULTIPLE && (
            <div className="flex flex-col gap-2">
              {q.options.map((opt) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border-[2px] border-gray-400"></div>
                  <span className="tablet:text-sm text-[13px] text-[var(--text)]">{opt.value}</span>
                </div>
              ))}
            </div>
          )}

          {q.type === FORM_CREATION_CONFIG.typeLabels.CHECKBOX && (
            <div className="flex flex-col gap-2">
              {q.options.map((opt) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-[4px] border-[2px] border-gray-400"></div>
                  <span className="tablet:text-sm text-[13px] text-[var(--text)]">{opt.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
