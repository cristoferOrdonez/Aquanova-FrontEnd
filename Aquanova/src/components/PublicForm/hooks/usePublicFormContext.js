// src/components/PublicForm/hooks/usePublicFormContext.js
import { useContext } from 'react';
import { PublicFormContext } from '../context/PublicFormContext';

/**
 * Custom hook to access PublicFormContext.
 *
 * @returns {import('../context/PublicFormContext').PublicFormContextType}
 * @throws {Error} If used outside of PublicFormProvider.
 */
export const usePublicFormContext = () => {
  const context = useContext(PublicFormContext);

  if (!context) {
    throw new Error('usePublicFormContext must be used within a PublicFormProvider');
  }

  return context;
};
