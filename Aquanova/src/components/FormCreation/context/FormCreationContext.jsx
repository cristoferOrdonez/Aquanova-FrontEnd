import { createContext } from 'react';

// Contexts separados para evitar un "god context" y permitir consumo selectivo
export const QuestionListContext = createContext(null);
export const EditingSectionContext = createContext(null);
export const OptionsListContext = createContext(null);
export const TypeSelectorContext = createContext(null);
export const CreationControlsContext = createContext(null);
