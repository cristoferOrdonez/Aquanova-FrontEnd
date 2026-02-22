// src/components/FormList/context/FormListProvider.jsx
import React from 'react';
import { FormListContext } from './FormListContext';
import { useForms } from '../hooks/useForms';

/**
 * Provider for the FormList feature.
 *
 * @param {{children: React.ReactNode}} props
 */
export const FormListProvider = ({ children }) => {
  const { forms, loading, error, reload, handleSearch, handleDelete } = useForms();

  const contextValue = {
    forms,
    loading,
    error,
    handleSearch,
    reload,
    handleDelete,
  };

  return (
    <FormListContext.Provider value={contextValue}>
      {children}
    </FormListContext.Provider>
  );
};
