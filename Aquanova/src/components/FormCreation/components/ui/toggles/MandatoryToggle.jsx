export default function MandatoryToggle({
  isMandatoryOn,
  handleToggle,
  selectedTypeQuestionOption
}) {
  return (
    <div
      onClick={() => {
        if (selectedTypeQuestionOption !== 'Sólo texto (sin respuestas)') handleToggle();
      }}
      className={`
        flex flex-row [@media(pointer:coarse)]:flex-col items-center gap-2 group select-none transition-all duration-300 ease-in-out
        ${selectedTypeQuestionOption === 'Sólo texto (sin respuestas)' ? 'opacity-0 invisible pointer-events-none translate-x-4' : 'opacity-100 visible translate-x-0 cursor-pointer'}
      `}
    >
      <div className={`
        w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ease-in-out ${isMandatoryOn ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300 hover:bg-gray-400'}
      `}>
        <div className={`bg-gray-100 w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${isMandatoryOn ? 'translate-x-6' : 'translate-x-0'}`} />
      </div>
      <span className="text-[var(--text)] tablet:text-sm text-[13px]">Obligatorio</span>
    </div>
  );
}
