import React from 'react';
import { DevicePhoneMobileIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';

export default function ViewToggle({ viewMode, setViewMode }) {
  return (
    <div className="absolute top-6 right-6 z-50 flex bg-white rounded-lg shadow-md p-1.5 border border-gray-200 gap-2">
      <button onClick={() => setViewMode('mobile')} className={`p-2 rounded-md transition-colors ${viewMode === 'mobile' ? 'bg-[var(--color-primary-soft)] text-[var(--blue-buttons)]' : 'text-gray-400 hover:text-gray-600'}`} title="Vista Móvil">
        <DevicePhoneMobileIcon className="w-6 h-6" />
      </button>
      <button onClick={() => setViewMode('desktop')} className={`p-2 rounded-md transition-colors ${viewMode === 'desktop' ? 'bg-[var(--color-primary-soft)] text-[var(--blue-buttons)]' : 'text-gray-400 hover:text-gray-600'}`} title="Vista Ordenador">
        <ComputerDesktopIcon className="w-6 h-6" />
      </button>
    </div>
  );
}
