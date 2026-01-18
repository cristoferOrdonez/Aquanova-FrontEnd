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

      {(q.type !== 'Sólo texto (sin respuestas)') && (
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

          {q.type === 'Lista desplegable' && (
            <div className="flex flex-col gap-2 text-[var(--text)]">
              {q.options.map((opt, index) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <span className="text-xs font-semibold opacity-40">{index + 1}.</span>
                  <span className="tablet:text-sm text-[13px] opacity-90">{opt.value}</span>
                </div>
              ))}
            </div>
          )}

          {q.type === 'Opción multiple' && (
            <div className="flex flex-col gap-2">
              {q.options.map((opt) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border-[2px] border-gray-400"></div>
                  <span className="tablet:text-sm text-[13px] text-[var(--text)]">{opt.value}</span>
                </div>
              ))}
            </div>
          )}

          {q.type === 'Casillas de verificación' && (
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
