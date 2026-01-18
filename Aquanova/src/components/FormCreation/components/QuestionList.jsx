import { useState } from "react";
import EditingSection from "./EditingSection";
import QuestionCard from './cards/QuestionCard';
import QuestionActions from './cards/QuestionActions';
import {
    useQuestionListContext,
    useEditingSectionContext,
    useOptionsListContext,
    useTypeSelectorContext,
    useCreationControlsContext,
} from '../hooks/useFormCreationContext';

function QuestionList({ mainContainerRef }) {
    const [exitingQuestionId, setExitingQuestionId] = useState(null);

    const {
        questions,
        deleteQuestion,
        justUpdatedQuestionId,
        justCreatedId,
    } = useQuestionListContext();

    const editingSection = useEditingSectionContext();
    const optionsListCtx = useOptionsListContext();
    const typeSelector = useTypeSelectorContext();
    const creationControls = useCreationControlsContext();

    // Función para eliminar una pregunta por su ID (preserva animación)
    const handleDeleteQuestion = (idToDelete) => {
        setExitingQuestionId(idToDelete);
        setTimeout(() => {
            deleteQuestion(idToDelete);
            setExitingQuestionId(null);
        }, 500);
    };

    const handleStartEditing = (questionToEdit) => {
        // Cargar datos en los hooks/contextos especializados
        editingSection.openForEdit(questionToEdit);
        typeSelector.setSelectedTypeQuestionOption(questionToEdit.type);
        optionsListCtx.setOptionsList(questionToEdit.options.map(opt => ({ ...opt })));
        creationControls.setRotation(prev => prev + 360);
        editingSection.setIsFastOutEditingFrame(false);
    };

    

    return (
        <div alt="question_frame" className="flex flex-col items-center justify-start gap-2 w-[100%] tablet:w-auto pt-4 tablet:pt-0">
            {questions.map((q) => {
                const isEditingThis = editingSection.editingQuestionId === q.id && editingSection.editingQuestionId !== -1;
                const isEditingAny = editingSection.editingQuestionId !== null && editingSection.editingQuestionId !== -1;
                const isJustUpdated = justUpdatedQuestionId === q.id && editingSection.editingQuestionId !== -1;
                return (
                    <div
                        key={q.id}
                        id={`question-card-${q.id}`}
                        className={`
                            flex flex-col tablet:w-[653px] w-[90%]
                            transition-all duration-500 ease-in-out
                            ${exitingQuestionId === q.id ? 'opacity-50 -translate-x-full max-h-0 scale-10 pointer-events-none' : 'max-h-[500px]'}
                            ${(isEditingAny && !isEditingThis) || creationControls.isCreationOn ? 'opacity-40 grayscale scale-95 pointer-events-none blur-[1px]' : ''}
                            ${justCreatedId === q.id ? 'animate-card-entry' : ''}
                        `}
                    >
                        <div className={`
                            relative tablet:w-[653px] w-[100%] flex tablet:flex-row flex-col gap-4 tablet:items-center justify-end
                            transition-all duration-500 ease-in-out
                            ${exitingQuestionId === q.id ? 'opacity-50 -translate-x-full max-h-0 scale-10 pointer-events-none' : 'max-h-[500px]'}
                            ${(isEditingAny && !isEditingThis) || creationControls.isCreationOn ? 'opacity-40 grayscale scale-95 pointer-events-none blur-[1px]' : ''}
                            ${justCreatedId === q.id ? 'animate-card-entry' : ''}
                            ${isEditingThis ? 'opacity-0 h-0 p-0 mb-0 invisible translate-y-9' : ''}
                        `}>

                            <QuestionCard q={q} isJustUpdated={isJustUpdated} />

                            <QuestionActions q={q} isEditingThis={isEditingThis} handleStartEditing={handleStartEditing} handleDeleteQuestion={handleDeleteQuestion} />
                        </div>
                        <EditingSection mainContainerRef={mainContainerRef} id={q.id} />
                    </div>
                );
            })}
        </div>
    );
}

export default QuestionList;