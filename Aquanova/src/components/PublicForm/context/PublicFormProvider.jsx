// src/components/PublicForm/context/PublicFormProvider.jsx
import React from 'react';
import { PublicFormContext } from './PublicFormContext';
import { usePublicForm } from '../hooks/usePublicForm';

/**
 * @param {{children: React.ReactNode}} props
 */
export const PublicFormProvider = ({ children }) => {
  const value = usePublicForm();

  return (
    <PublicFormContext.Provider value={value}>
      {children}
    </PublicFormContext.Provider>
  );
};
