import { useState } from "react";
import FORM_CREATION_CONFIG from '../../config/formCreationConfig';
import EditingSection from "./EditingSection.jsx";
import QuestionCard from './cards/QuestionCard.jsx';
import QuestionControl from './controls/QuestionControl.jsx';
import {
    useQuestionListContext,
    useEditingSectionContext,
    useOptionsListContext,
    useTypeSelectorContext,
    useCreationControlsContext,
} from './../../hooks/useFormCreationContext.js';

function QuestionListSection({ mainContainerRef }) {
    const [exitingQuestionId, setExitingQuestionId] = useState(null);
    const [draggedQuestionId, setDraggedQuestionId] = useState(null);

    const {
        questions,
        deleteQuestion,
        justUpdatedQuestionId,
        justCreatedId,
        moveQuestion
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
        }, FORM_CREATION_CONFIG.animationDelays.exit);
    };

    const handleStartEditing = (questionToEdit) => {
        // Cargar datos en los hooks/contextos especializados
        editingSection.openForEdit(questionToEdit);
        typeSelector.setSelectedTypeQuestionOption(questionToEdit.type);
        optionsListCtx.setOptionsList(questionToEdit.options.map(opt => ({ ...opt })));
        creationControls.setRotation(prev => prev + 360);
        editingSection.setIsFastOutEditingFrame(false);
    };

    const handleDragStart = (e, id) => {
        setDraggedQuestionId(id);
        e.dataTransfer.effectAllowed = 'move';
        // e.dataTransfer.setData('text/plain', id); // For Firefox compatibility
    };

    const handleDragEnd = () => {
        setDraggedQuestionId(null);
    };

    const handleDragOver = (e, targetId) => {
        e.preventDefault();
        
        if (!draggedQuestionId || draggedQuestionId === targetId) return;

        const fromIndex = questions.findIndex(q => q.id === draggedQuestionId);
        const toIndex = questions.findIndex(q => q.id === targetId);

        if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
            moveQuestion(fromIndex, toIndex);
        }
    };

    return (
        <div alt="question_frame" className="flex flex-col items-center justify-start gap-2 w-[100%] tablet:w-auto pt-4 tablet:pt-0">
            {questions.map((q) => {
                const isEditingThis = editingSection.editingQuestionId === q.id && editingSection.editingQuestionId !== -1;
                const isEditingAny = editingSection.editingQuestionId !== null && editingSection.editingQuestionId !== -1;
                const isJustUpdated = justUpdatedQuestionId === q.id && editingSection.editingQuestionId !== -1;
                const isDraggingThis = draggedQuestionId === q.id;

                return (
                    <div
                        key={q.id}
                        id={`question-card-${q.id}`}
                        onDragOver={(e) => handleDragOver(e, q.id)}
                        className={`
                            flex flex-col tablet:w-[653px] w-[90%]
                            transition-all duration-500 ease-in-out
                            ${exitingQuestionId === q.id ? 'opacity-50 -translate-x-full max-h-0 scale-10 pointer-events-none' : 'max-h-[500px]'}
                            ${(isEditingAny && !isEditingThis) || creationControls.isCreationOn ? 'opacity-40 grayscale scale-95 pointer-events-none blur-[1px]' : ''}
                            ${justCreatedId === q.id ? 'animate-card-entry' : ''}
                            ${isDraggingThis ? 'opacity-40 scale-95' : ''}
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

                            <QuestionControl 
                                q={q} 
                                isEditingThis={isEditingThis} 
                                handleStartEditing={handleStartEditing} 
                                handleDeleteQuestion={handleDeleteQuestion}
                                handleDragStart={handleDragStart}
                                handleDragEnd={handleDragEnd}
                            />
                        </div>
                        <EditingSection mainContainerRef={mainContainerRef} id={q.id} />
                    </div>
                );
            })}
        </div>
    );
}

export default QuestionListSection;