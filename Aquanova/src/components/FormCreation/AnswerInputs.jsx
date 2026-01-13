export function MultipleOptionsInput({
    optionsList, setOptionsList,
    selectedTypeQuestionOption,
    mainContainerRef
}) {

    const handleRemoveOption = (id) => {
        // Evitamos borrar si solo queda una opción (opcional, buena UX)
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

        mainContainerRef.current.scrollTo({
            top: mainContainerRef.current.scrollHeight,
            behavior: "instant",
        });
        }, 125);

    };

    return (
        <div className="flex flex-col gap-2 mt-2 w-full">
            {optionsList.map((option, index) => (
            <div key={option.id} className="flex items-center gap-3 group ">
                {/* Icono indicador a la izquierda */}
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

                {/* Input de la opción */}
                <textarea
                rows={1}
                value={option.value}
                onChange={(e) => {
                    // 1. Actualiza el estado (tu lógica original)
                    handleOptionChange(option.id, e.target.value);
                    
                    // 2. Lógica de auto-resize:
                    // Reseteamos la altura para calcular correctamente si el texto se borró
                    e.target.style.height = 'auto'; 
                    // Ajustamos la altura al tamaño del contenido (scrollHeight)
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
                // Un pequeño ajuste para asegurar que si carga con texto largo, se ajuste (opcional)
                onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                />

                {/* Botón eliminar (X) - Solo aparece si hay más de 1 opción */}
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

            {/* Botón Agregar Opción (Icono + Animación) */}
            <div className="flex items-center mt-2">
            <button 
                onClick={handleAddOption}
                className="
                    group flex items-center 
                    cursor-pointer 
                    transition-all duration-300 ease-in-out
                    outline-none
                    [@media(pointer:coarse)]:duration-200
                    [@media(pointer:coarse)]:active:bg-[#E0EEFF]
                    [@media(pointer:coarse)]:rounded-full
                    [@media(pointer:coarse)]:pr-[8px]
                "
            >
                {/* 1. El Icono (Siempre visible) */}
                <div className="
                    p-1.5 rounded-full 
                    text-[var(--text)] opacity-50 
                    group-hover:bg-[#E0EEFF] group-hover:text-[#2138C4] group-hover:opacity-100
                    [@media(pointer:coarse)]:group-active:text-[#2138C4] [@media(pointer:coarse)]:group-active:opacity-100
                    transition-colors duration-300
                    [@media(pointer:coarse)]:duration-200
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

                {/* 2. El Texto (Oculto por defecto, aparece con hover) */}
                <span className="
                    max-w-0 opacity-0 overflow-hidden whitespace-nowrap
                    group-hover:max-w-[150px] group-hover:opacity-100 group-hover:ml-2
                    tablet:text-sm text-[13px] font-medium text-[#2138C4]
                    transition-all duration-300 ease-out
                    [@media(pointer:coarse)]:duration-200

                    [@media(pointer:coarse)]:opacity-50
                    [@media(pointer:coarse)]:text-[var(--text)]
                    [@media(pointer:coarse)]:max-w-[150px]
                    [@media(pointer:coarse)]:ml-2
                    [@media(pointer:coarse)]:group-active:opacity-100
                    [@media(pointer:coarse)]:group-active:text-[#2138C4]
                ">
                Agregar opción
                </span>
            </button>
            </div>
        </div>
    )
}

export function TextInput() {
    return (
        <div className="mt-4 px-1">
            <div className="bg-[#F1F5F9] rounded-[14px] w-full border-[1.5px] border-[#CBD5E1] px-2 py-2 tablet:text-sm text-[13px] text-[var(--text)] opacity-90 select-none">
                Texto de respuesta corta
            </div>
        </div>
    )
}

export function NumericInput() {
    return (
        <div className="mt-4 px-1">
            <div className="bg-[#F1F5F9] w-full rounded-[14px] border-[1.5px] border-[#CBD5E1] px-2 py-2 tablet:text-sm text-[13px] text-[var(--text)] opacity-90 select-none flex justify-between items-center">
                <span>Número</span>
                {/* Pequeños chevrons simulados para input type number */}
                <div className="flex flex-col -space-y-1">
                    <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                    <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </div>
            </div>
        </div>
    )
}

export function DateInput() {
    return (
        <div className="mt-4 px-1">
            <div className="bg-[#F1F5F9] w-full rounded-[14px] border-[1.5px] border-[#CBD5E1] px-2 py-2 tablet:text-sm text-[13px] text-[var(--text)] opacity-90 select-none flex justify-between items-center">
                <span>día/mes/año</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
            </div>
        </div>
    )
}