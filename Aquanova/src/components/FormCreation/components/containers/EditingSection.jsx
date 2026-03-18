import MultipleOptionsInput from "./../ui/inputs/MultipleOptionsInput.jsx";
import TextInput from "./../ui/inputs/TextInput.jsx";
import NumericInput from "./../ui/inputs/NumericInput.jsx";
import DateInput from "./../ui/inputs/DateInput.jsx";
import FileUploadInput from "./../ui/inputs/FileUploadInput.jsx";
import TypeSelector from './../ui/selectors/TypeSelector.jsx';
import SaveCancelControl from './controls/SaveCancelControl.jsx';
import MandatoryToggle from './../ui/toggles/MandatoryToggle.jsx';

// Genera un slug único a partir del título de la pregunta
const generateKey = (title) => {
  return (title || 'pregunta')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    + '-' + Date.now().toString().slice(-4);
};
import {
    useQuestionListContext,
    useEditingSectionContext,
    useOptionsListContext,
    useTypeSelectorContext,
    useCreationControlsContext,
} from '../../hooks/useFormCreationContext';

// Componente separado para renderizar el input según tipo (evita crearlo durante render)
function RenderInputType({ selectedTypeQuestionOption, optionsList, setOptionsList }) {
    if (["Opción multiple", "Casillas de verificación", "Lista desplegable"].includes(selectedTypeQuestionOption)) {
        return (
            <MultipleOptionsInput
                optionsList={optionsList}
                setOptionsList={setOptionsList}
                selectedTypeQuestionOption={selectedTypeQuestionOption}
            />
        );
    }

    switch (selectedTypeQuestionOption) {
        case 'Respuesta textual':
            return <TextInput />;
        case 'Numérico':
            return <NumericInput />;
        case 'Fecha':
            return <DateInput />;
        case 'Cargar imagen':
            return <FileUploadInput />;
        default:
            return null;
    }
}

function EditingSection({ id }) {
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
            title: editingSection.questionLabel,
            label: editingSection.questionLabel,
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
            const newQuestion = { id: Date.now(), key: generateKey(editingSection.questionLabel), ...questionData };
            addQuestion(newQuestion);
            creationControls.setIsCreationOn(false);
        }

        // Resetear
        editingSection.setQuestionLabel("");
        optionsListCtx.resetOptions();
        typeSelector.setSelectedTypeQuestionOption("Sólo texto (sin respuestas)");
        editingSection.setIsMandatoryOn(false);
        editingSection.setIsEditingSectionOpen(false);
    };

    

    return (
        <section aria-label="editing_frame" className={`
            tablet:w-[653px] ${id == -1 ? 'w-[90%]' : 'w-[100%]'} bg-[var(--card-bg)] drop-shadow-md border-[1.5px] border-[var(--card-stroke)] rounded-[5px]
            flex flex-col justify-between gap-2 ${!editingSection.isEditingSectionOpen ? 'overflow-hidden' : 'overflow-visible'}

            
            transition-all ${editingSection.isFastOutEditingFrame ? 'duration-0' : 'duration-500'} ease-in-out
            ${editingSection.isEditingSectionOpen && editingSection.editingQuestionId === id ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible pointer-events-none'}
            ${editingSection.isEditingSectionOpen && editingSection.editingQuestionId === id ? 'h-auto px-6 py-4 mb-10' : 'h-0 p-0 mb-0'}
        `}>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wide px-1">
                Título de la pregunta
              </label>
              <div className="flex tablet:flex-row flex-col gap-2">
                        <textarea
                            value={editingSection.questionLabel === 'Pregunta sin título' ? '' : editingSection.questionLabel}
                            placeholder="Escribe el título de la pregunta…"
                            rows="1"
                            onChange={(e) => {
                                editingSection.setQuestionLabel(e.target.value);
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                            onBlur={(e) => {
                                if (e.target.value.trim() === "") {
                                    editingSection.setQuestionLabel("Pregunta sin título");
                                    e.target.style.height = 'auto';
                                    e.target.style.height = e.target.scrollHeight + 'px';
                                }
                            }}
                            className="
                                w-full resize-none overflow-hidden
                                p-2 tablet:text-sm text-[13px] text-[var(--text)]
                                border-[1.5px] border-[var(--card-stroke)]
                                rounded-[8px] outline-none
                                placeholder:text-gray-300
                                focus:border-[#2138C4] focus:bg-blue-50/30
                                transition-all duration-300 ease-in-out
                                "
                        />
                <TypeSelector />
              </div>
            </div>
            <div className="w-full">
                <RenderInputType
                    selectedTypeQuestionOption={typeSelector.selectedTypeQuestionOption}
                    optionsList={optionsListCtx.optionsList}
                    setOptionsList={optionsListCtx.setOptionsList}
                />
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
        </section>
    )
}

export default EditingSection;