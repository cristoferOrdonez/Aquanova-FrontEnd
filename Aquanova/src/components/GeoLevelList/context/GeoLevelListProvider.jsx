
import React from 'react';
import { GeoLevelListContext } from './GeoLevelListContext';
import { useGeoLevelList } from '../hooks/useGeoLevelList';

export const GeoLevelListProvider = ({ children }) => {
  const { neighborhoods, loading, error } = useGeoLevelList();

  const contextValue = {
    neighborhoods,
    loading,
    error,
  };

  return (
    <GeoLevelListContext.Provider value={contextValue}>
      {children}
    </GeoLevelListContext.Provider>
  );
};
