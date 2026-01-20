import React from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useGeoLevelListContext } from '../hooks/useGeoLevelListContext';
import GeoLevelCard from './GeoLevelCard';
import { GEOLEVEL_CONFIG } from '../config/geoLevelListConfig';

const GeoLevelListContent = () => {
  const { neighborhoods, loading, error } = useGeoLevelListContext();

  const renderBody = () => {
    if (loading) {
      return <div className="text-center p-8">{GEOLEVEL_CONFIG.TEXT.LOADING}</div>;
    }

    if (error) {
      return (
        <div className="text-center p-8 text-red-500">
          {GEOLEVEL_CONFIG.TEXT.ERROR_PREFIX}
          {error}
        </div>
      );
    }

    if (!neighborhoods || neighborhoods.length === 0) {
      return <div className="text-center p-8">{GEOLEVEL_CONFIG.TEXT.NO_LEVELS}</div>;
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {neighborhoods.map((neighborhood) => (
          <GeoLevelCard key={neighborhood.id} neighborhood={neighborhood} />
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-end mb-6">
        <Link
          to={GEOLEVEL_CONFIG.ROUTES.CREATE}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 font-work text-white shadow-sm transition-colors"
          style={{ backgroundColor: 'var(--blue-buttons)' }}
        >
          <PlusIcon className="h-5 w-5" />
          {GEOLEVEL_CONFIG.TEXT.NEW_LEVEL_BUTTON}
        </Link>
      </div>

      {renderBody()}
    </div>
  );
};

export default GeoLevelListContent;