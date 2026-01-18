export default function MultipleOptionsInput({
    optionsList, setOptionsList,
    selectedTypeQuestionOption,
    mainContainerRef
}) {

    const handleRemoveOption = (id) => {
        setTimeout(() => {
            if (optionsList.length > 1) {
                setOptionsList(prev => prev.filter(option => option.id !== id));
            }
        }, 125);
    };

    const handleOptionChange = (id, newValue) => {
        setOptionsList(prevOptions => 
            prevOptions.map(option => 
                option.id === id ? { ...option, value: newValue } : option
            )
        );
    };

    const handleAddOption = () => {
        setTimeout(() => {
            setOptionsList(prev => [
                ...prev, 
                { id: Date.now(), value: "Opción sin título" }
            ]);
        }, 125);
    };

    return (
        <div className="flex flex-col gap-2 mt-2 w-full">
            {optionsList.map((option, index) => (
            <div key={option.id} className="flex items-center gap-3 group ">
                <div className="text-[var(--text)] opacity-40">
                {selectedTypeQuestionOption === "Opción multiple" && (
                    <div className="w-4 h-4 rounded-full border-[2px] border-current"></div>
                )}
                {selectedTypeQuestionOption === "Casillas de verificación" && (
                    <div className="w-4 h-4 rounded-[2px] border-[2px] border-current"></div>
                )}
                {selectedTypeQuestionOption === "Lista desplegable" && (
                    <span className="text-xs font-semibold">{index + 1}.</span>
                )}
                </div>

                <textarea
                rows={1}
                value={option.value}
                onChange={(e) => {
                    handleOptionChange(option.id, e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onBlur={(e) => {
                    if(e.target.value.trim() === "") {
                        handleOptionChange(option.id, "Opción sin título"); 
                    }
                }}
                className="
                    flex-1 bg-transparent 
                    border-b-[1px] border-transparent 
                    hover:border-[var(--stroke-selectors-and-search-bars)] 
                    focus:border-[#2138C4] focus:outline-none
                    py-1 tablet:text-sm text-[13px] text-[var(--text)] opacity-90
                    transition-colors duration-200
                    resize-none overflow-hidden block
                "
                onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                />

                {optionsList.length > 1 && (
                <button 
                    onClick={() => handleRemoveOption(option.id)}
                    className="
                        opacity-0 group-hover:opacity-100 
                        p-1.5 rounded-full 
                        text-gray-400 
                        hover:bg-red-50 hover:text-red-600
                        [@media(pointer:coarse)]:opacity-100
                        [@media(pointer:coarse)]:active:bg-red-50
                        [@media(pointer:coarse)]:active:text-red-600
                        transition-all duration-200
                    "
                    title="Eliminar"
                >
                    <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={2.5} 
                    stroke="currentColor" 
                    className="w-5 h-5"
                    >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                )}
            </div>
            ))}

            <div className="flex items-center mt-2">
            <button 
                onClick={handleAddOption}
                className="
                    group flex items-center 
                    cursor-pointer 
                    transition-all duration-300 ease-in-out
                    outline-none
                "
            >
                <div className="
                    p-1.5 rounded-full 
                    text-[var(--text)] opacity-50 
                    group-hover:bg-[#E0EEFF] group-hover:text-[#2138C4] group-hover:opacity-100
                    transition-colors duration-300
                ">
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={2.5} 
                    stroke="currentColor" 
                    className="w-5 h-5"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                </div>

                <span className="
                    max-w-0 opacity-0 overflow-hidden whitespace-nowrap
                    group-hover:max-w-[150px] group-hover:opacity-100 group-hover:ml-2
                    tablet:text-sm text-[13px] font-medium text-[#2138C4]
                    transition-all duration-300 ease-out
                ">
                Agregar opción
                </span>
            </button>
            </div>
        </div>
    )
}
