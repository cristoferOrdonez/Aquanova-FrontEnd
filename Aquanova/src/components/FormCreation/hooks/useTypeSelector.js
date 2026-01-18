import { useState } from 'react';
import FORM_CREATION_CONFIG from '../config/formCreationConfig';

export function useTypeSelector() {
  const [isTypeQuestionSelectorOpen, setIsTypeQuestionSelectorOpen] = useState(false);
  const [selectedTypeQuestionOption, setSelectedTypeQuestionOption] = useState(FORM_CREATION_CONFIG.defaultType);

  const toggleSelector = () => setIsTypeQuestionSelectorOpen(prev => !prev);

  return {
    isTypeQuestionSelectorOpen,
    setIsTypeQuestionSelectorOpen,
    selectedTypeQuestionOption,
    setSelectedTypeQuestionOption,
    toggleSelector,
    typeOptions: FORM_CREATION_CONFIG.typeOptions,
  };
}

export default useTypeSelector;
