// src/components/FormList/hooks/useFormListContext.js
import { useContext } from 'react';
import { FormListContext } from '../context/FormListContext';

/**
 * Custom hook to access the FormListContext.
 *
 * @returns {import('../context/FormListContext').FormListContextType} The form list context.
 * @throws {Error} If used outside of a FormListProvider.
 */
export const useFormListContext = () => {
  const context = useContext(FormListContext);
  
  if (!context) {
    throw new Error('useFormListContext must be used within a FormListProvider');
  }
  
  return context;
};