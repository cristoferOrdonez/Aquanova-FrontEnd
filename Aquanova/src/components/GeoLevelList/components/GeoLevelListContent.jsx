import React from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useGeoLevelListContext } from '../hooks/useGeoLevelListContext';
import GeoLevelCard from './GeoLevelCard';
import { GEOLEVEL_CONFIG } from '../config/geoLevelListConfig';
import SearchBar from '../../ui/SearchBar';

const FILTER_OPTIONS = ['Todos', 'Barrio', 'Localidad', 'Ciudad'];

const GeoLevelListContent = () => {
  const { neighborhoods, loading, error, handleSearch, activeFilter, handleFilter } = useGeoLevelListContext();

  const renderBody = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="animate-pulse bg-white border border-(--stroke-selectors-and-search-bars) rounded-2xl p-5 shadow-sm"
            >
              <div className="h-50 w-full rounded-xl bg-gray-200 mb-5" />
              <div className="flex justify-center">
                <div className="h-10 w-3/4 rounded-full bg-gray-200 mb-4"/>
              </div>
              <div className="flex justify-center gap-2 mb-4">
                <span className="h-6 w-20 rounded-full bg-gray-200" />
                <span className="h-6 w-24 rounded-full bg-gray-200" />
              </div>
              <div className="flex justify-center">
                <div className="h-4 w-2/3 rounded-full bg-gray-200 mb-3"/>
              </div>
              <div className="h-4 w-full rounded-full bg-gray-200 mb-2" />
              <div className="h-4 w-5/6 rounded-full bg-gray-200" />
            </div>
          ))}
        </div>
      );
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
      <div className="flex flex-row items-center gap-5 mb-4">
        <SearchBar onSearch={handleSearch} isLoading={loading} className="flex-1" />

        <Link
          to={GEOLEVEL_CONFIG.ROUTES.CREATE}
          className="flex flex-row gap-3 whitespace-nowrap bg-[var(--blue-buttons)] rounded-4xl font-work text-white justify-center items-center p-3 hover:bg-blue-600 transition-colors"
        >
          <PlusIcon className="h-6 w-6" />
          {GEOLEVEL_CONFIG.TEXT.NEW_LEVEL_BUTTON}
        </Link>
      </div>

      {/* Filtros cápsula */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTER_OPTIONS.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => handleFilter(filter)}
            className={`
              px-4 py-1.5 rounded-full text-sm font-medium border-2 transition-all duration-200
              ${
                activeFilter === filter
                  ? 'bg-[var(--blue-buttons)] border-[var(--blue-buttons)] text-white shadow-sm'
                  : 'bg-white border-[var(--stroke-selectors-and-search-bars)] text-gray-600 hover:border-[var(--blue-buttons)] hover:text-[var(--blue-buttons)]'
              }
            `}
          >
            {filter}
          </button>
        ))}
      </div>

      {renderBody()}
    </div>
  );
};

export default GeoLevelListContent;