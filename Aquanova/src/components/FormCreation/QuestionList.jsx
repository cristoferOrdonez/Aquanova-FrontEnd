import { useState } from "react";

function QuestionList({ 
    questions, setQuestions,
    justUpdatedQuestionId,
    justCreatedId,
    editingQuestionId, setEditingQuestionId,
    isCreationOn,
    setQuestionTitle,
    setSelectedTypeQuestionOption,
    setOptionsList,
    setIsMandatoryOn,
    setIsEditingSectionOpen,
    setIsFastOutEditingFrame,
    setRotation,
    mainContainerRef
 }) {

    const [exitingQuestionId, setExitingQuestionId] = useState(null);

    // Función para eliminar una pregunta por su ID
    const handleDeleteQuestion = (idToDelete) => {
        // 1. Iniciamos la animación marcando el ID
        setExitingQuestionId(idToDelete);

        // 2. Esperamos 500ms (lo que dura la animación CSS) antes de borrar los datos
        setTimeout(() => {
        setQuestions(prevQuestions => prevQuestions.filter(q => q.id !== idToDelete));
        setExitingQuestionId(null); // Limpiamos el estado
        }, 500); 
    };

    const handleStartEditing = (questionToEdit) => {

        // 1. Identificamos qué pregunta es
        setEditingQuestionId(questionToEdit.id);

        // 2. Cargamos sus datos en los estados del formulario "editing_frame"
        setQuestionTitle(questionToEdit.title);
        setSelectedTypeQuestionOption(questionToEdit.type);
        
        // Hacemos una copia profunda de las opciones para no mutar el original en tiempo real
        setOptionsList(questionToEdit.options.map(opt => ({...opt}))); 
        
        setIsMandatoryOn(questionToEdit.required);

        // 3. Abrimos el panel de edición (si no estaba abierto)
        setIsEditingSectionOpen(true);
        setIsFastOutEditingFrame(false);
        
        // Opcional: Rotar el botón verde para indicar que está activo
        setRotation(prev => prev + 360);

        // 4. Scroll suave hacia el editor
        setTimeout(() => {
        if (mainContainerRef.current) {
            mainContainerRef.current.scrollTo({
            top: mainContainerRef.current.scrollHeight,
            behavior: "smooth",
            });
        }
        }, 100);
    };

    const renderCreatedQuestions = () => {
        return questions.map((q) => {
        
        // VARIABLES DE ESTADO PARA ESTA TARJETA
        const isEditingThis = editingQuestionId === q.id;     // Es la que estoy editando
        const isEditingAny = editingQuestionId !== null;      // Hay alguna edición ocurriendo
        const isJustUpdated = justUpdatedQuestionId === q.id; // Acaba de ser guardada

        return (
            <div 
            key={q.id}
            id={`question-card-${q.id}`} // ID necesario para el scroll automático
            className={`
                relative tablet:w-[653px] w-[90%] flex tablet:flex-row flex-col gap-4 tablet:items-center justify-end
                transition-all duration-500 ease-in-out
                
                ${/* 1. Lógica de Salida (Eliminar) */ ''}
                ${exitingQuestionId === q.id ? 'opacity-50 -translate-x-full max-h-0 scale-10 pointer-events-none' : 'max-h-[500px]'}
                
                ${/* 2. Lógica de Bloqueo durante edición */ ''}
                ${(isEditingAny && !isEditingThis) || isCreationOn 
                ? 'opacity-40 grayscale scale-95 pointer-events-none blur-[1px]' // ESTADO BLOQUEADO
                : '' // ESTADO NORMAL
                }

                ${/* 3. CORRECCIÓN AQUÍ: Animación de entrada */ ''}
                ${/* Solo animamos si NO está saliendo y NO se acaba de actualizar (para no chocar con el destello) */ ''}
                ${justCreatedId === q.id ? 'animate-card-entry' : ''}
            `}
            >
            
            {/* TARJETA DE PREGUNTA */}
            <div className={`
                w-full tablet:w-auto flex-1 border-[1.5px] rounded-[5px] p-6 flex flex-col gap-3 shadow-sm
                transition-all duration-500
                
                ${/* CAMBIO DE COLOR AL TERMINAR DE EDITAR (Destello) */ ''}
                ${isJustUpdated 
                    ? 'bg-blue-50 border-[#2138C4] shadow-[0_0_15px_rgba(33,56,196,0.2)]' // Estilo "Titilar"
                    : 'bg-[var(--card-bg)] border-[var(--card-stroke)]' // Estilo Normal
                }
            `}>
                
                {/* Título y Asterisco */}
                <h3 className="text-[var(--text)] tablet:text-base text-sm">
                {q.title}
                {q.required && <span className="text-red-500 ml-1">*</span>}
                </h3>

                {/* Visualización según Tipo (Tu código original se mantiene aquí) */}
                {(q.type !== "Sólo texto (sin respuestas)") && (<div className="mt-1">
                {/* ... CONTENIDO INTERNO DE LA TARJETA (Mismo que tenías) ... */}
                {(q.type === "Respuesta textual" || q.type === "Numérico") && (
                    <div className="w-full h-10 bg-[#F1F5F9] border-[1.5px] border-[#CBD5E1] rounded-[8px] px-3 flex items-center text-gray-400 tablet:text-sm text-[13px]">
                        {q.type === "Numérico" ? "Respuesta numérica" : "Texto de respuesta corta"}
                    </div>
                    )}
                {/* ... Copia aquí el resto de tus condiciones (Fecha, Lista, Radio, Checkbox) ... */}
                {q.type === "Fecha" && (
                    <div className="w-full h-10 bg-[#F1F5F9] border-[1.5px] border-[#CBD5E1] rounded-[8px] px-3 flex justify-between items-center text-gray-400 tablet:text-sm text-[13px]">
                        <span>dd/mm/aaaa</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 opacity-50"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
                    </div>
                )}
                {q.type === "Lista desplegable" && (
                    <div className="flex flex-col gap-2 text-[var(--text)]">
                        {q.options.map((opt, index) => (
                        <div key={opt.id} className="flex items-center gap-2">
                            <span className="text-xs font-semibold opacity-40">{index + 1}.</span>
                            <span className="tablet:text-sm text-[13px] opacity-90">{opt.value}</span>
                        </div>
                        ))}
                    </div>
                    )}
                {q.type === "Opción multiple" && (
                    <div className="flex flex-col gap-2">
                        {q.options.map((opt) => (
                        <div key={opt.id} className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full border-[2px] border-gray-400"></div>
                            <span className="tablet:text-sm text-[13px] text-[var(--text)]">{opt.value}</span>
                        </div>
                        ))}
                    </div>
                    )}
                {q.type === "Casillas de verificación" && (
                    <div className="flex flex-col gap-2">
                        {q.options.map((opt) => (
                        <div key={opt.id} className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-[4px] border-[2px] border-gray-400"></div>
                            <span className="tablet:text-sm text-[13px] text-[var(--text)]">{opt.value}</span>
                        </div>
                        ))}
                    </div>
                    )}
                </div>)}
            </div>

            {/* BOTONES DE ACCIÓN (Editar / Eliminar) */}
            {/* Aquí la magia: Si es la tarjeta que edito, Oculto los botones */}
            <div className={`
                tablet:absolute tablet:z-40 flex tablet:pl-0 pl-2 
                ${q.type == 'Sólo texto (sin respuestas)'? 'flex-row': 'tablet:flex-col flex-row'} 
                gap-2 tablet:translate-x-full tablet:pl-[15px] mb-3 tablet:mb-0
                transition-all duration-300
                ${isEditingThis ? 'opacity-0 translate-x-0 pointer-events-none' : 'opacity-100'}
            `}>
                <button
                    onClick={() => handleStartEditing(q)}
                    className="
                    w-fit group flex h-10 items-center justify-center
                    rounded-full border border-[#2138C4] bg-blue-50 p-2
                    transition-all duration-300 ease-in-out
                    hover:bg-blue-100 hover:pr-4 cursor-pointer
                    [@media(pointer:coarse)]:active:bg-blue-100
                    [@media(pointer:coarse)]:pr-4
                    "
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[#2138C4] flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                    <span
                    className="
                        max-w-0 overflow-hidden whitespace-nowrap
                        tablet:text-sm text-[13px] font-medium text-[#2138C4] opacity-0
                        transition-all duration-300 ease-out
                        group-hover:ml-2 group-hover:max-w-[100px] group-hover:opacity-100
                        [@media(pointer:coarse)]:ml-2
                        [@media(pointer:coarse)]:max-w-[100px]
                        [@media(pointer:coarse)]:opacity-100
                    "
                    >
                    Editar
                    </span>
                </button>

                <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="
                    w-fit group flex h-10 items-center justify-center
                    rounded-full border border-red-600 bg-red-50 p-2
                    transition-all duration-300 ease-in-out
                    hover:bg-red-100 hover:pr-4 cursor-pointer
                    [@media(pointer:coarse)]:active:bg-red-100
                    [@media(pointer:coarse)]:pr-4
                    "
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-600 flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                    <span
                    className="
                        max-w-0 overflow-hidden whitespace-nowrap
                        tablet:text-sm text-[13px] font-medium text-red-600 opacity-0
                        transition-all duration-300 ease-out
                        group-hover:ml-2 group-hover:max-w-[100px] group-hover:opacity-100
                        [@media(pointer:coarse)]:ml-2
                        [@media(pointer:coarse)]:max-w-[100px]
                        [@media(pointer:coarse)]:opacity-100
                    "
                    >
                    Eliminar
                    </span>
                </button>
            </div>

            </div>
        );
        });
    };

    return (
        <div alt="question_frame" className="flex flex-col items-center justify-start gap-2 w-[100%] tablet:w-auto pt-4 tablet:pt-0">
            {renderCreatedQuestions()}
        </div>
    );
}

export default QuestionList;