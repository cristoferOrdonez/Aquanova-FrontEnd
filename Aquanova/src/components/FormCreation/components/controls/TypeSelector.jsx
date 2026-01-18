import { useTypeSelectorContext } from '../../hooks/useFormCreationContext';

export default function TypeSelector() {
  const {
    isTypeQuestionSelectorOpen,
    setIsTypeQuestionSelectorOpen,
    selectedTypeQuestionOption,
    setSelectedTypeQuestionOption,
    typeOptions,
  } = useTypeSelectorContext();
  return (
    <div className="tablet:w-[400px] w-auto relative">
      <div
        onClick={() => setIsTypeQuestionSelectorOpen(!isTypeQuestionSelectorOpen)}
        className="
          w-full 
          border-[1.5px] border-[var(--stroke-selectors-and-search-bars)] 
          rounded-[14px] px-2.5 py-1.5 flex items-center justify-between cursor-pointer hover:bg-[var(--stroke-selectors-and-search-bars)] transition-colors
        "
      >
        <div className="flex items-center gap-2 w-full">
          <span className="text-[var(--text)] opacity-90">
            {typeOptions.find(opt => opt.label === selectedTypeQuestionOption)?.icon}
          </span>
          <span className="tablet:text-sm text-[13px] text-[var(--text)] opacity-90 truncate">
            {selectedTypeQuestionOption}
          </span>
        </div>

        <svg
          className={`w-3 h-3 text-[#000000] opacity-30 transition-transform duration-300 ${isTypeQuestionSelectorOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 18L4 6H20L12 18Z" />
        </svg>
      </div>

      <div className={`
        absolute z-20 tablet:w-[121%] w-[100%] -mt-1.5 bg-white border-[1.5px] border-[var(--card-stroke)] rounded-[14px] tablet:translate-x-4 shadow-lg overflow-hidden
        transition-all duration-300 ease-out origin-top
        ${isTypeQuestionSelectorOpen ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 -translate-y-2 invisible pointer-events-none'}
      `}>
        {typeOptions.map((option, index) => (
          <div
            key={index}
            onClick={() => {
              setSelectedTypeQuestionOption(option.label);
              setIsTypeQuestionSelectorOpen(false);
            }}
            className="px-4 py-2 flex items-center gap-3 tablet:text-sm text-[13px] text-[var(--text)] opacity-90 hover:bg-[var(--stroke-selectors-and-search-bars)] cursor-pointer transition-colors"
          >
            <span className="text-[var(--text)] opacity-90">{option.icon}</span>
            <span>{option.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
