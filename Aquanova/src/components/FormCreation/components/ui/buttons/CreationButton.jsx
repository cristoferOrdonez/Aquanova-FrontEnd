import {
    useCreationControlsContext,
    useEditingSectionContext,
    useTypeSelectorContext,
    useOptionsListContext,
} from './../../../hooks/useFormCreationContext.js';
import FORM_CREATION_CONFIG from '../../../config/formCreationConfig';

function CreationButton({
    mainContainerRef
}) {
    const creationControls = useCreationControlsContext();
    const editingSection = useEditingSectionContext();
    const typeSelector = useTypeSelectorContext();
    const optionsListCtx = useOptionsListContext();

    const handleCreation = () => {
        editingSection.setEditingQuestionId(-1);
        creationControls.setIsCreationOn(true);
        editingSection.setIsFastOutEditingFrame(false);
        creationControls.setRotation(prev => prev + 360);
        editingSection.setIsEditingSectionOpen(!editingSection.isEditingSectionOpen);

        // limpieza
        editingSection.setQuestionTitle(FORM_CREATION_CONFIG.defaultQuestionTitle);
        typeSelector.setSelectedTypeQuestionOption(FORM_CREATION_CONFIG.defaultType);
        optionsListCtx.setOptionsList([ FORM_CREATION_CONFIG.createDefaultOption() ]);
        editingSection.setIsMandatoryOn(false);

        setTimeout(() => {
            if (mainContainerRef.current) {
                mainContainerRef.current.scrollTo({ top: mainContainerRef.current.scrollHeight, behavior: 'smooth' });
            }
        }, FORM_CREATION_CONFIG.animationDelays.scroll);
    };

    return (
        <button
            onClick={() => {
                        // Solo permitimos el clic si NO está editando (doble seguridad)
                        if (!editingSection.isEditingSectionOpen) {
                                handleCreation();
                        }
            }}
                        disabled={editingSection.isEditingSectionOpen} 
            className={`
            tablet:w-[60px] w-[50px] tablet:h-[60px] h-[50px] rounded-full absolute tablet:bottom-[40px] bottom-[25px] tablet:right-[40px] right-[25px] z-10
            flex items-center justify-center shadow-lg
            transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
            
                        ${editingSection.isEditingSectionOpen 
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
                transform: `rotate(${creationControls.rotation}deg)`,
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
