import { useContext } from 'react';
import {
  QuestionListContext,
  EditingSectionContext,
  OptionsListContext,
  TypeSelectorContext,
  CreationControlsContext,
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

export default {
  useQuestionListContext,
  useEditingSectionContext,
  useOptionsListContext,
  useTypeSelectorContext,
  useCreationControlsContext,
};
