
import React from 'react';
import { GeoLevelListContext } from './GeoLevelListContext';
import { useGeoLevelList } from '../hooks/useGeoLevelList';

export const GeoLevelListProvider = ({ children }) => {
  const { neighborhoods, loading, error, handleSearch, activeFilter, handleFilter } = useGeoLevelList();

  const contextValue = {
    neighborhoods,
    loading,
    error,
    handleSearch,
    activeFilter,
    handleFilter,
  };

  return (
    <GeoLevelListContext.Provider value={contextValue}>
      {children}
    </GeoLevelListContext.Provider>
  );
};
