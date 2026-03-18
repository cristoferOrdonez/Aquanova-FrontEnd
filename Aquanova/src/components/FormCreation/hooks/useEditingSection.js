import { useState } from 'react';
import { DEFAULT_QUESTION_LABEL } from '../config/formCreationConfig';

export function useEditingSection() {
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [isEditingSectionOpen, setIsEditingSectionOpen] = useState(false);
  const [questionLabel, setQuestionLabel] = useState(DEFAULT_QUESTION_LABEL || "Pregunta sin título");
  const [isMandatoryOn, setIsMandatoryOn] = useState(false);
  const [isFastOutEditingFrame, setIsFastOutEditingFrame] = useState(false);

  const openForCreate = () => {
    setEditingQuestionId(null);
    setQuestionLabel(DEFAULT_QUESTION_LABEL || "Pregunta sin título");
    setIsMandatoryOn(false);
    setIsEditingSectionOpen(true);
  };

  const openForEdit = (question) => {
    setEditingQuestionId(question.id);
    setQuestionLabel(question.label || question.title || DEFAULT_QUESTION_LABEL || "Pregunta sin título");
    setIsMandatoryOn(!!question.required);
    setIsEditingSectionOpen(true);
  };

  const close = () => {
    setIsEditingSectionOpen(false);
    setEditingQuestionId(null);
  };

  return {
    editingQuestionId,
    setEditingQuestionId,
    isEditingSectionOpen,
    setIsEditingSectionOpen,
    questionLabel,
    setQuestionLabel,
    isMandatoryOn,
    setIsMandatoryOn,
    isFastOutEditingFrame,
    setIsFastOutEditingFrame,
    openForCreate,
    openForEdit,
    close,
  };
}

export default useEditingSection;
