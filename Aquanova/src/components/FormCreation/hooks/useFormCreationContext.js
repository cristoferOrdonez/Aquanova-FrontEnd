import { useContext } from 'react';
import {
  QuestionListContext,
  EditingSectionContext,
  OptionsListContext,
  TypeSelectorContext,
  CreationControlsContext,
  HeaderContext,
  NeighborhoodSelectorContext,
  EditModeContext,
} from '../context/FormCreationContext';

function assertContext(ctx, name) {
  if (!ctx) throw new Error(`${name} debe usarse dentro de FormCreationProvider`);
  return ctx;
}

export function useQuestionListContext() {
  return assertContext(useContext(QuestionListContext), 'useQuestionListContext');
}

export function useEditingSectionContext() {
  return assertContext(useContext(EditingSectionContext), 'useEditingSectionContext');
}

export function useOptionsListContext() {
  return assertContext(useContext(OptionsListContext), 'useOptionsListContext');
}

export function useTypeSelectorContext() {
  return assertContext(useContext(TypeSelectorContext), 'useTypeSelectorContext');
}

export function useCreationControlsContext() {
  return assertContext(useContext(CreationControlsContext), 'useCreationControlsContext');
}

export function useHeaderContext() {
  return assertContext(useContext(HeaderContext), 'useHeaderContext');
}

export function useNeighborhoodSelectorContext() {
  return assertContext(useContext(NeighborhoodSelectorContext), 'useNeighborhoodSelectorContext');
}

/**
 * Hook para acceder al contexto de modo edición
 * @returns {{ isEditMode: boolean, editFormId: string|null, isLoadingEdit: boolean, editLoadError: string|null, exitToList: Function }}
 */
export function useEditModeContext() {
  return assertContext(useContext(EditModeContext), 'useEditModeContext');
}

export default {
  useQuestionListContext,
  useEditingSectionContext,
  useOptionsListContext,
  useTypeSelectorContext,
  useCreationControlsContext,
  useHeaderContext,
  useNeighborhoodSelectorContext,
  useEditModeContext,
};
