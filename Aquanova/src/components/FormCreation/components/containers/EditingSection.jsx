import MultipleOptionsInput from "./../ui/inputs/MultipleOptionsInput.jsx";
import TextInput from "./../ui/inputs/TextInput.jsx";
import NumericInput from "./../ui/inputs/NumericInput.jsx";
import DateInput from "./../ui/inputs/DateInput.jsx";
import TypeSelector from './../ui/selectors/TypeSelector.jsx';
import SaveCancelControl from './controls/SaveCancelControl.jsx';
import MandatoryToggle from './../ui/toggles/MandatoryToggle.jsx';
import {
    useQuestionListContext,
    useEditingSectionContext,
    useOptionsListContext,
    useTypeSelectorContext,
    useCreationControlsContext,
} from '../../hooks/useFormCreationContext';

function EditingSection({ mainContainerRef, id }) {
    const {
        addQuestion,
        updateQuestion,
    } = useQuestionListContext();

    const editingSection = useEditingSectionContext();
    const optionsListCtx = useOptionsListContext();
    const typeSelector = useTypeSelectorContext();
    const creationControls = useCreationControlsContext();

    const handleMandatoryToggle = () => {
        editingSection.setIsMandatoryOn(!editingSection.isMandatoryOn);
    };

    const handleSaveQuestion = () => {
        editingSection.setIsFastOutEditingFrame(true);
        creationControls.setRotation(prev => prev - 360);

        const questionData = {
            title: editingSection.questionTitle,
            type: typeSelector.selectedTypeQuestionOption,
            options: [...optionsListCtx.optionsList],
            required: typeSelector.selectedTypeQuestionOption == "Sólo texto (sin respuestas)" ? false : editingSection.isMandatoryOn,
        };

        if (editingSection.editingQuestionId !== null && editingSection.editingQuestionId !== -1) {
            const currentId = editingSection.editingQuestionId;
            updateQuestion(currentId, questionData);

            editingSection.setEditingQuestionId(null);

            setTimeout(() => {
                const element = document.getElementById(`question-card-${currentId}`);
                if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        } else {
            const newQuestion = { id: Date.now(), ...questionData };
            addQuestion(newQuestion);
            creationControls.setIsCreationOn(false);
        }

        // Resetear
        editingSection.setQuestionTitle("");
        optionsListCtx.resetOptions();
        typeSelector.setSelectedTypeQuestionOption("Sólo texto (sin respuestas)");
        editingSection.setIsMandatoryOn(false);
        editingSection.setIsEditingSectionOpen(false);
    };

    return (
        <div alt="editing_frame" className={`
            tablet:w-[653px] ${id == -1 ? 'w-[90%]' : 'w-[100%]'} bg-[var(--card-bg)] drop-shadow-md border-[1.5px] border-[var(--card-stroke)] rounded-[5px]
            flex flex-col justify-between gap-2 ${!editingSection.isEditingSectionOpen ? 'overflow-hidden' : 'overflow-visible'}

            
            transition-all ${editingSection.isFastOutEditingFrame ? 'duration-0' : 'duration-500'} ease-in-out
            ${editingSection.isEditingSectionOpen && editingSection.editingQuestionId === id ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible pointer-events-none'}
            ${editingSection.isEditingSectionOpen && editingSection.editingQuestionId === id ? 'h-auto px-6 py-4 mb-10' : 'h-0 p-0 mb-0'}
        `}>
            <div className="flex tablet:flex-row flex-col gap-2">
                        <textarea
                            value={editingSection.questionTitle}
                            rows="1"
                            onChange={(e) => {
                                editingSection.setQuestionTitle(e.target.value);
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                            onBlur={(e) => {
                                if (e.target.value.trim() === "") {
                                    e.target.value = "Pregunta sin título";
                                    editingSection.setQuestionTitle(e.target.value);
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
            <TypeSelector />
            </div>
            <div className="w-full">
                {(() => {
                    switch (typeSelector.selectedTypeQuestionOption) {
                        case "Opción multiple":
                        case "Casillas de verificación":
                        case "Lista desplegable":
                            return (
                                <MultipleOptionsInput 
                                    optionsList={optionsListCtx.optionsList} setOptionsList={optionsListCtx.setOptionsList}
                                    selectedTypeQuestionOption={typeSelector.selectedTypeQuestionOption}
                                    mainContainerRef={mainContainerRef}
                                />
                            );
                        case "Respuesta textual":
                            return <TextInput />;
                        case "Numérico":
                            return <NumericInput />;
                        case "Fecha":
                            return <DateInput />;
                        default:
                            return null;
                    }
                })()}
            </div>
            <div className="border-[1px] my-3 border-[var(--card-stroke)]"/>
            <div className="flex flex-row justify-between gap-4">
              <SaveCancelControl
                onSave={handleSaveQuestion}
                onCancel={() => {
                  editingSection.setIsEditingSectionOpen(false);
                  editingSection.setEditingQuestionId(null);
                  creationControls.setRotation(prev => prev - 360);
                  creationControls.setIsCreationOn(false);
                }}
              />

              <MandatoryToggle
                isMandatoryOn={editingSection.isMandatoryOn}
                handleToggle={handleMandatoryToggle}
                selectedTypeQuestionOption={typeSelector.selectedTypeQuestionOption}
              />
            </div>
        </div>
    )
}

export default EditingSection;