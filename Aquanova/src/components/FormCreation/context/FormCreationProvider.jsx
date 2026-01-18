import React from 'react';
import {
  QuestionListContext,
  EditingSectionContext,
  OptionsListContext,
  TypeSelectorContext,
  CreationControlsContext,
} from './FormCreationContext';

import { useQuestionList } from '../hooks/useQuestionList';
import { useEditingSection } from '../hooks/useEditingSection';
import { useOptionsList } from '../hooks/useOptionsList';
import { useTypeSelector } from '../hooks/useTypeSelector';
import { useCreationControls } from '../hooks/useCreationControls';

/**
 * Provider que encapsula los múltiples contexts de FormCreation
 * Cada contexto proviene de un hook especializado (separación de responsabilidades)
 */
export function FormCreationProvider({ children }) {
  const questionList = useQuestionList();
  const editingSection = useEditingSection();
  const optionsList = useOptionsList();
  const typeSelector = useTypeSelector();
  const creationControls = useCreationControls();

  return (
    <QuestionListContext.Provider value={questionList}>
      <EditingSectionContext.Provider value={editingSection}>
        <OptionsListContext.Provider value={optionsList}>
          <TypeSelectorContext.Provider value={typeSelector}>
            <CreationControlsContext.Provider value={creationControls}>
              {children}
            </CreationControlsContext.Provider>
          </TypeSelectorContext.Provider>
        </OptionsListContext.Provider>
      </EditingSectionContext.Provider>
    </QuestionListContext.Provider>
  );
}

export default FormCreationProvider;
