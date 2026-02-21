import FORM_CREATION_CONFIG from './../../../config/formCreationConfig';

export default function QuestionCard({
  q,
  isJustUpdated
}) {
  return (
    <div className={`
      w-full tablet:w-auto flex-1 border-[1.5px] rounded-[5px] p-6 flex flex-col gap-3 shadow-sm
      transition-all duration-500
      ${isJustUpdated ? 'bg-blue-50 border-[#2138C4] shadow-[0_0_15px_rgba(33,56,196,0.2)]' : 'bg-[var(--card-bg)] border-[var(--card-stroke)]'}
    `}>
      <h3 className="text-[var(--text)] tablet:text-base text-sm">
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
