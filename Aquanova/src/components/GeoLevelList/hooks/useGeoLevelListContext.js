
import { useContext } from 'react';
import { GeoLevelListContext } from './../context/GeoLevelListContext';

export const useGeoLevelListContext = () => {
  const context = useContext(GeoLevelListContext);
  if (!context) {
    throw new Error('useGeoLevelListContext debe ser usado dentro de un GeoLevelListProvider');
  }
  return context;
};
