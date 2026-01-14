function CreationButton({
    setIsCreationOn,
    setIsFastOutEditingFrame,
    rotation, setRotation,
    isEditingSectionOpen, setIsEditingSectionOpen,
    setQuestionTitle,
    setSelectedTypeQuestionOption,
    setOptionsList,
    setIsMandatoryOn,
    mainContainerRef,
    setEditingQuestionId
}) {

    const handleCreation = () => {

        setEditingQuestionId(-1); // Asegura que no haya ninguna pregunta en edición

        setIsCreationOn(true);

        setIsFastOutEditingFrame(false);

        setRotation(prev => prev + 360);
        setIsEditingSectionOpen(!isEditingSectionOpen);

        // --- AQUÍ ESTÁ LA LIMPIEZA QUE NECESITAS ---
        setQuestionTitle("Pregunta sin título");
        setSelectedTypeQuestionOption("Sólo texto (sin respuestas)"); // Vuelve al default
        setOptionsList([{ id: Date.now(), value: "Opción sin título" }]); // Limpia opciones anteriores
        setIsMandatoryOn(false); // Apaga el obligatorio
        // -------------------------------------------

        // Usamos setTimeout para dar tiempo a que React renderice la nueva sección
        setTimeout(() => {
        if (mainContainerRef.current) {
            mainContainerRef.current.scrollTo({
            top: mainContainerRef.current.scrollHeight, // Altura total del contenido interno
            behavior: "smooth",
            });
        }
        }, 100); // 100ms de espera es imperceptible pero asegura que funcione
    };

  return (
        <button
            onClick={() => {
            // Solo permitimos el clic si NO está editando (doble seguridad)
            if (!isEditingSectionOpen) {
                handleCreation();
            }
            }}
            // Agregamos 'pointer-events-none' cuando está abierto para que no reciba clicks
            disabled={isEditingSectionOpen} 
            className={`
            tablet:w-[60px] w-[50px] tablet:h-[60px] h-[50px] rounded-full absolute tablet:bottom-[40px] bottom-[25px] tablet:right-[40px] right-[25px] z-10
            flex items-center justify-center shadow-lg
            transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
            
            ${isEditingSectionOpen 
                ? 'bg-gray-300 text-gray-400 scale-75 cursor-default' // Estado DESACTIVADO (Gris, pequeño)
                : 'bg-[#10B981] text-white hover:bg-[#0D9668] [@media(pointer:coarse)]:active:bg-[#0D9668] hover:text-gray-200 [@media(pointer:coarse)]:active:text-gray-200 active:scale-90 cursor-pointer' // Estado ACTIVO
            }
            `}
        >
            <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="3"
            stroke="currentColor"
            className="tablet:w-9 w-8 tablet:h-9 h-8 transition-transform"
            style={{ 
                // Mantenemos tu lógica de rotación
                transform: `rotate(${rotation}deg)`,
                transitionDuration: '1000ms',
                transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' 
            }}
            >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
        </button>
  )
}

export default CreationButton;