import React from 'react';
import {
  QuestionListContext,
  EditingSectionContext,
  OptionsListContext,
  TypeSelectorContext,
  CreationControlsContext,
  HeaderContext,
  NeighborhoodSelectorContext,
} from './FormCreationContext';

import { useQuestionList } from '../hooks/useQuestionList';
import { useEditingSection } from '../hooks/useEditingSection';
import { useOptionsList } from '../hooks/useOptionsList';
import { useTypeSelector } from '../hooks/useTypeSelector';
import { useCreationControls } from '../hooks/useCreationControls';
import { useHeaderControls } from '../hooks/useHeaderControls';
import { useNeighborhoodSelector } from '../hooks/useNeighborhoodSelector';
import { formService } from '../../../services/formService';
import FORM_CREATION_CONFIG from '../config/formCreationConfig';

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
  const headerControls = useHeaderControls();
  const neighborhoodSelector = useNeighborhoodSelector();

  // Función que arma el payload conforme a la especificación del backend y llama al servicio
  const createForm = async () => {
    const title = headerControls.title || FORM_CREATION_CONFIG.defaultFormTitle;
    const description = headerControls.description || undefined;
    const neighborhood_id = neighborhoodSelector.selectedOption && neighborhoodSelector.selectedOption.id;

    if (!neighborhood_id) {
      throw new Error('Debe seleccionar un barrio antes de crear el formulario');
    }

    // Construir schema: primero la imagen (si existe), luego las preguntas
    const schema = [];
    if (headerControls.imagePreview) {
      schema.push({
        id: `img-${Date.now()}`,
        type: 'image',
        data: headerControls.imagePreview,
      });
    }

    const questions = questionList.questions || [];
    for (const q of questions) {
      schema.push({
        id: q.id,
        title: q.title,
        type: q.type,
        required: !!q.required,
        options: Array.isArray(q.options) ? q.options.map(o => ({ id: o.id, value: o.value })) : [],
      });
    }

    const payload = { title, schema, neighborhood_id };
    if (description) payload.description = description;

    const res = await formService.create(payload);
    return res;
  };

  return (
    <QuestionListContext.Provider value={questionList}>
      <EditingSectionContext.Provider value={editingSection}>
        <OptionsListContext.Provider value={optionsList}>
          <TypeSelectorContext.Provider value={typeSelector}>
            <CreationControlsContext.Provider value={creationControls}>
              <HeaderContext.Provider value={{ ...headerControls, createForm }}>
                <NeighborhoodSelectorContext.Provider value={neighborhoodSelector}>
                  {children}
                </NeighborhoodSelectorContext.Provider>
              </HeaderContext.Provider>
            </CreationControlsContext.Provider>
          </TypeSelectorContext.Provider>
        </OptionsListContext.Provider>
      </EditingSectionContext.Provider>
    </QuestionListContext.Provider>
  );
}

export default FormCreationProvider;
