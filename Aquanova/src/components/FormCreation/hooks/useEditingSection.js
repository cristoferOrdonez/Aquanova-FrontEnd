import { useState } from 'react';
import FORM_CREATION_CONFIG from '../config/formCreationConfig';

export function useEditingSection() {
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [isEditingSectionOpen, setIsEditingSectionOpen] = useState(false);
  const [questionTitle, setQuestionTitle] = useState(FORM_CREATION_CONFIG.defaultQuestionTitle);
  const [isMandatoryOn, setIsMandatoryOn] = useState(false);
  const [isFastOutEditingFrame, setIsFastOutEditingFrame] = useState(false);

  const openForCreate = () => {
    setEditingQuestionId(null);
    setQuestionTitle(FORM_CREATION_CONFIG.defaultQuestionTitle);
    setIsMandatoryOn(false);
    setIsEditingSectionOpen(true);
  };

  const openForEdit = (question) => {
    setEditingQuestionId(question.id);
    setQuestionTitle(question.title || FORM_CREATION_CONFIG.defaultQuestionTitle);
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
    questionTitle,
    setQuestionTitle,
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
