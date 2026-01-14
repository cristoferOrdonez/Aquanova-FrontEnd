import { MultipleOptionsInput, NumericInput, TextInput, DateInput } from "./AnswerInputs";

function EditingSection({
    optionsList, setOptionsList,
    mainContainerRef,
    isMandatoryOn, setIsMandatoryOn,
    isFastOutEditingFrame, setIsFastOutEditingFrame,
    setRotation,
    questionTitle, setQuestionTitle,
    selectedTypeQuestionOption, setSelectedTypeQuestionOption,
    editingQuestionId, setEditingQuestionId,
    questions, setQuestions,
    setJustUpdatedQuestionId,
    setJustCreatedId,
    setIsCreationOn,
    isEditingSectionOpen, setIsEditingSectionOpen,
    isTypeQuestionSelectorOpen, setIsTypeQuestionSelectorOpen,
    id
}) {

    const typeQuestionOptions = [
        {
        label: "Opción multiple",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            <circle cx="12" cy="12" r="5" fill="currentColor" stroke="none" />
            </svg>
        )
        },
        {
        label: "Casillas de verificación",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9A2.25 2.25 0 0 1 18.75 7.5v9A2.25 2.25 0 0 1 16.5 18.75h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75" />
            </svg>
        )
        },
        {
        label: "Lista desplegable",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 10.5 3.75 3.75 3.75-3.75" />
            </svg>
        )
        },
        {
        label: "Respuesta textual",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h9" />
            </svg>
        )
        },
        {
        label: "Numérico",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5v15m0-15l-5.25 4.5" />
            </svg>  
        )
        },
        {
        label: "Fecha",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
        )
        },
        {
        label: "Sólo texto (sin respuestas)",
        icon: null
        }
    ];

    const handleMandatoryToggle = () => {
        const newState = !isMandatoryOn;
        setIsMandatoryOn(newState);

    };

    const handleSaveQuestion = () => {

        setIsFastOutEditingFrame(true);
        setRotation(prev => prev - 360);

        const questionData = {
            title: questionTitle,
            type: selectedTypeQuestionOption,
            options: [...optionsList],
            required: selectedTypeQuestionOption == "Sólo texto (sin respuestas)" ? false : isMandatoryOn
        };

        if (editingQuestionId !== null && editingQuestionId !== -1) {
            // --- MODO EDICIÓN ---
            const currentId = editingQuestionId; // Guardamos el ID antes de limpiarlo

            setQuestions(prevQuestions => 
            prevQuestions.map(q => 
                q.id === currentId 
                ? { ...q, ...questionData } 
                : q
            )
            );
            
            // 1. Activamos el estado de "Recién actualizado"
            setJustUpdatedQuestionId(currentId);

            // 2. Limpiamos el ID de edición actual
            setEditingQuestionId(null);
            
            // 3. Lógica de Scroll y Limpieza de animación
            setTimeout(() => {
            // Buscar el elemento en el DOM y hacer scroll hacia él
            const element = document.getElementById(`question-card-${currentId}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            // Quitar el brillo después de 1 segundo
            setTimeout(() => {
                setJustUpdatedQuestionId(null);
            }, 1000);
            }, 300); // Pequeño delay para asegurar que el DOM se pintó

        } else {
            // --- MODO CREACIÓN (Código existente) ---
            const newQuestion = {
            id: Date.now(),
            ...questionData
            };
            setQuestions([...questions, newQuestion]);
            setJustCreatedId(newQuestion.id);
            setIsCreationOn(false);
            setTimeout(() => {
            setJustCreatedId(null);
            }, 500);
        }

        // Resetear el formulario y cerrar
        setQuestionTitle("");
        setOptionsList([{ id: Date.now(), value: "Opción sin título" }]);
        setSelectedTypeQuestionOption("Sólo texto (sin respuestas)");
        setIsMandatoryOn(false);
        setIsEditingSectionOpen(false);

    };

    const renderAnswerInput = () => {
        switch (selectedTypeQuestionOption) {
        
        // CASO 1, 2 y 3: Opciones Múltiples / Casillas / Lista (Misma lógica, diferente icono)
        case "Opción multiple":
        case "Casillas de verificación":
        case "Lista desplegable":
            return (
                <MultipleOptionsInput 
                    optionsList={optionsList} setOptionsList={setOptionsList}
                    selectedTypeQuestionOption={selectedTypeQuestionOption}
                    mainContainerRef={mainContainerRef}
                />
            );

        // CASO 4: Respuesta Textual (Visualización pasiva)
        case "Respuesta textual":
            return (
                <TextInput />
            );

        // CASO 5: Numérico
        case "Numérico":
            return (
                <NumericInput />
            );

        // CASO 6: Fecha
        case "Fecha":
            return (
                <DateInput />
            );

        // CASO DEFAULT: Sólo texto
        default:
            return null;
        }
    };

    return (
        <div alt="editing_frame" className={`
            tablet:w-[653px] ${id == -1 ? 'w-[90%]' : 'w-[100%]'} bg-[var(--card-bg)] drop-shadow-md border-[1.5px] border-[var(--card-stroke)] rounded-[5px]
            flex flex-col justify-between gap-2 ${!isEditingSectionOpen ? 'overflow-hidden' : 'overflow-visible'}

            
            transition-all ${isFastOutEditingFrame ? 'duration-0' : 'duration-500'} ease-in-out
            ${isEditingSectionOpen && editingQuestionId === id ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible pointer-events-none'}
            ${isEditingSectionOpen && editingQuestionId === id ? 'h-auto px-6 py-4 mb-10' : 'h-0 p-0 mb-0'}
        `}>
            <div className="flex tablet:flex-row flex-col gap-2">
            <textarea 
                defaultValue={questionTitle}
                rows="1"
                onInput={(e) => {
                setQuestionTitle(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
                }}
                onBlur={(e) => {
                if (e.target.value.trim() === "") {

                    e.target.value = "Pregunta sin título";

                    setQuestionTitle(e.target.value);

                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                }
                }}
                className="
                w-full resize-none overflow-hidden
                p-1 tablet:text-sm text-[13px] text-[var(--text)]
                border-[1.5px] border-transparent
                rounded-[5px] outline-none
                focus:border-[#2138C4]
                transition-all duration-500 ease-in-out
                "
            />
            <div className="tablet:w-[400px] w-auto relative">
                <div 
                onClick={() => setIsTypeQuestionSelectorOpen(!isTypeQuestionSelectorOpen)}
                className="
                    w-full 
                    border-[1.5px] border-[var(--stroke-selectors-and-search-bars)] 
                    rounded-[14px] 
                    px-2.5
                    py-1.5 
                    flex items-center justify-between 
                    cursor-pointer 
                    hover:bg-[var(--stroke-selectors-and-search-bars)]
                    [@media(pointer:coarse)]:active:bg-[var(--stroke-selectors-and-search-bars)] 
                    transition-colors
                "
                >
                <div className="flex items-center gap-2 w-full">
                    <span className="text-[var(--text)] opacity-90">
                        {/* Buscamos el ícono correspondiente al label seleccionado */}
                        {typeQuestionOptions.find(opt => opt.label === selectedTypeQuestionOption)?.icon}
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
                    <path d="M12 18L4 6H20L12 18Z"/>
                </svg>
                </div>

                <div className={`
                absolute z-20 tablet:w-[121%] w-[100%] -mt-1.5
                bg-white 
                border-[1.5px] border-[var(--card-stroke)] 
                rounded-[14px] 
                tablet:translate-x-4
                shadow-lg 
                overflow-hidden
                
                transition-all duration-300 ease-out origin-top
                ${isTypeQuestionSelectorOpen 
                    ? 'opacity-100 scale-100 translate-y-0 visible' 
                    : 'opacity-0 scale-95 -translate-y-2 invisible pointer-events-none'}
                `}>
                {typeQuestionOptions.map((option, index) => (
                    <div 
                    key={index}
                    onClick={() => {
                        setSelectedTypeQuestionOption(option.label);
                        setIsTypeQuestionSelectorOpen(false);
                    }}
                    className="
                        px-4 py-2 
                        flex items-center gap-3  
                        tablet:text-sm text-[13px] text-[var(--text)] opacity-90 
                        hover:bg-[var(--stroke-selectors-and-search-bars)]
                        [@media(pointer:coarse)]:active:bg-[var(--stroke-selectors-and-search-bars)]
                        cursor-pointer 
                        transition-colors"
                    >
                    <span className="text-[var(--text)] opacity-90">
                        {option.icon}
                    </span>
                    <span>
                        {option.label}
                    </span>
                    </div>
                ))}
                </div>
            </div>
            </div>
            <div className="w-full">
                {renderAnswerInput()}
            </div>
            <div className="border-[1px] my-3 border-[var(--card-stroke)]"/>
            <div className="flex flex-row justify-between gap-4">
            <div className="gap-2 flex flex-row [@media(pointer:coarse)]:flex-col items-center justify-center">

                {/* Botón de Aceptar (Verde - Aceptar) */}
                <button 
                onClick={handleSaveQuestion}
                className="
                    group flex h-8 items-center justify-center 
                    rounded-full border border-emerald-500 bg-emerald-50 
                    p-1.5 
                    transition-all duration-300 ease-in-out 
                    hover:bg-emerald-100 hover:pr-3
                    [@media(pointer:coarse)]:active:bg-emerald-100
                    [@media(pointer:coarse)]:pr-3
                    cursor-pointer
                "
                >
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 text-emerald-500 flex-shrink-0" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                >
                    <polyline points="20 6 9 17 4 12" />
                </svg>
                
                <span className="
                    max-w-0 overflow-hidden whitespace-nowrap 
                    tablet:text-sm text-[13px] font-medium text-emerald-600 
                    opacity-0 
                    transition-all duration-300 ease-out 
                    group-hover:ml-2 group-hover:max-w-[100px] group-hover:opacity-100
                    [@media(pointer:coarse)]:ml-2 [@media(pointer:coarse)]:max-w-[100px] [@media(pointer:coarse)]:opacity-100
                ">
                    Aceptar
                </span>
                </button>

                {/* Botón de Cancelar (Rojo - Cancelar) */}
                <button 

                onClick={() => {
                    // 1. Cerramos la sección de edición
                    setIsEditingSectionOpen(false);
                    setEditingQuestionId(null); // <--- IMPORTANTE: Resetear modo edición
                    // 2. Opcional: Si quieres que el botón verde gire de vuelta, puedes descomentar esto:
                    setRotation(prev => prev - 360); 
                    setIsCreationOn(false);
                }}

                className="
                    group flex h-8 items-center justify-center 
                    rounded-full border border-red-800/30 bg-red-50 
                    p-1.5 
                    transition-all duration-300 ease-in-out 
                    hover:bg-red-100 hover:pr-3
                    [@media(pointer:coarse)]:active:bg-red-100
                    [@media(pointer:coarse)]:pr-3
                    cursor-pointer
                "
                >
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 text-red-900 flex-shrink-0" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>

                <span className="
                    max-w-0 overflow-hidden whitespace-nowrap 
                    tablet:text-sm text-[13px] font-medium text-red-900 
                    opacity-0 
                    transition-all duration-300 ease-out 
                    group-hover:ml-2 group-hover:max-w-[100px] group-hover:opacity-100
                    [@media(pointer:coarse)]:ml-2 [@media(pointer:coarse)]:max-w-[100px] [@media(pointer:coarse)]:opacity-100
                ">
                    Cancelar
                </span>
                </button>

            </div>

            <div 
                onClick={() => {
                // Evitamos que se pueda clicar mientras está desapareciendo
                if (selectedTypeQuestionOption !== "Sólo texto (sin respuestas)") {
                    handleMandatoryToggle();
                }
                }}
                className={`
                flex flex-row [@media(pointer:coarse)]:flex-col items-center gap-2 group select-none
                transition-all duration-300 ease-in-out
                ${selectedTypeQuestionOption === "Sólo texto (sin respuestas)"
                    ? 'opacity-0 invisible pointer-events-none translate-x-4' // Estado Oculto
                    : 'opacity-100 visible translate-x-0 cursor-pointer'}    // Estado Visible
                `}
            >
                {/* 1. El Óvalo (Pista) */}
                <div 
                className={`
                    w-12 h-6 
                    flex items-center 
                    rounded-full 
                    p-1 
                    transition-colors duration-300 ease-in-out
                    ${isMandatoryOn ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300 hover:bg-gray-400'}
                `}
                >
                {/* 2. El Círculo (Knob) */}
                <div 
                    className={`
                    bg-gray-100 
                    w-4 h-4 
                    rounded-full 
                    shadow-md 
                    transform transition-transform duration-300 ease-in-out
                    ${isMandatoryOn ? 'translate-x-6' : 'translate-x-0'}
                    `}
                />
                </div>

                {/* 3. El Texto descriptivo */}
                <span className="text-[var(--text)] tablet:text-sm text-[13px]">
                Obligatorio
                </span>
            </div>

            </div>
        </div>
    )
}

export default EditingSection;