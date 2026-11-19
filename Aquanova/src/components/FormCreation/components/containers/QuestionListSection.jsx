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

function QuestionListSection() {
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
        const question = questions.find(q => q.id === idToDelete);
        const questionTitle = question?.title || "esta pregunta";
        
        if (window.confirm(`¿Estás seguro de que deseas eliminar "${questionTitle}"? Esta acción no se puede deshacer.`)) {
            setExitingQuestionId(idToDelete);
            setTimeout(() => {
                deleteQuestion(idToDelete);
                setExitingQuestionId(null);
            }, FORM_CREATION_CONFIG.animationDelays.exit);
        }
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

    const handleMoveUp = (index) => {
        if (index > 0) {
            moveQuestion(index, index - 1);
        }
    };

    const handleMoveDown = (index) => {
        if (index < questions.length - 1) {
            moveQuestion(index, index + 1);
        }
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
        <section aria-label="question_frame" className="flex flex-col items-center justify-start gap-2 w-[100%] tablet:w-auto pt-4 tablet:pt-0">
            {/* Empty state cuando no hay preguntas */}
            {questions.length === 0 && !editingSection.isEditingSectionOpen && (
                <article className="tablet:w-[653px] w-[90%] border-[1.5px] border-dashed border-[var(--card-stroke)] rounded-[5px] px-6 py-10 flex flex-col items-center justify-center gap-3 text-center opacity-60">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-gray-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                    <p className="text-sm font-medium text-gray-500">Sin preguntas aún</p>
                    <p className="text-xs text-gray-400 max-w-[220px] leading-relaxed">
                        Pulsa el botón <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#10B981] text-white font-bold text-[10px]">+</span> en la esquina inferior derecha para agregar la primera pregunta
                    </p>
                    </article>
            )}
            {questions.map((q, idx) => {
                const isEditingThis = editingSection.editingQuestionId === q.id && editingSection.editingQuestionId !== -1;
                const isEditingAny = editingSection.editingQuestionId !== null && editingSection.editingQuestionId !== -1;
                const isJustUpdated = justUpdatedQuestionId === q.id && editingSection.editingQuestionId !== -1;
                const isDraggingThis = draggedQuestionId === q.id;

                // Construir clases condicionales una sola vez para evitar duplicación y re-evaluaciones
                const baseTransition = 'transition-all duration-700 ease-out';
                const exitClass = exitingQuestionId === q.id ? 'opacity-50 -translate-x-full max-h-0 scale-10 pointer-events-none' : 'max-h-[500px]';
                const dimClass = (isEditingAny && !isEditingThis) || creationControls.isCreationOn ? 'opacity-40 grayscale scale-95 pointer-events-none blur-[1px]' : '';
                const createdClass = justCreatedId === q.id ? 'animate-card-entry' : '';
                const draggingClass = isDraggingThis ? 'opacity-40 scale-95' : '';

                const isMobileHidden = (isEditingAny && !isEditingThis) || creationControls.isCreationOn;
                const mobileHideClass = isMobileHidden ? 'hidden tablet:flex' : 'flex';

                const outerClass = `${mobileHideClass} flex-col tablet:w-[653px] w-[90%] tablet:overflow-visible ${baseTransition} ${exitClass} ${dimClass} ${createdClass} ${draggingClass}`;
                const innerClass = `w-full relative tablet:overflow-visible ${baseTransition} ${exitClass} ${dimClass} ${createdClass} ${isEditingThis ? 'opacity-0 h-0 p-0 mb-0 invisible translate-y-9' : ''}`;

                return (
                    <div
                        key={q.id}
                        id={`question-card-${q.id}`}
                        onDragOver={(e) => handleDragOver(e, q.id)}
                        className={outerClass}
                    >
                        <div className={innerClass}>

                                <QuestionCard q={q} isJustUpdated={isJustUpdated} index={idx} />

                                <QuestionControl 
                                    q={q} 
                                    index={idx}
                                    totalQuestions={questions.length}
                                    isEditingThis={isEditingThis} 
                                    handleStartEditing={handleStartEditing} 
                                    handleDeleteQuestion={handleDeleteQuestion}
                                    handleDragStart={handleDragStart}
                                    handleDragEnd={handleDragEnd}
                                    handleMoveUp={handleMoveUp}
                                    handleMoveDown={handleMoveDown}
                                />
                            </div>
                            <EditingSection id={q.id} />
                        </div>
                    );
            })}
            </section>
    );
}

export default QuestionListSection;