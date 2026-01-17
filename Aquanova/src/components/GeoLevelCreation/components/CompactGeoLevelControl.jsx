import React from 'react';
import GeoLevelCompactButton from './GeoLevelCompactButton.jsx';
import { useGeoLevelSelectionContext } from '../hooks/useGeoLevelCreationContext.js';

/**
 * Componente CompactGeoLevelControl - Control compacto de selección de nivel geográfico
 * Consume el contexto directamente
 */
export const CompactGeoLevelControl = () => {
    const {
        selectedGeoLevel,
        isGeoLevelMenuOpen,
        setIsGeoLevelMenuOpen,
        geoLevelSelectorIcons,
        geoLevelOptions,
        handleGeoLevelSelect,
    } = useGeoLevelSelectionContext();
    return (
        <div className="relative z-50">
            <button 
                onClick={() => setIsGeoLevelMenuOpen(!isGeoLevelMenuOpen)}
                className={`
                    flex items-center gap-2.5 px-4 py-2 
                    bg-gray-800/50 hover:bg-gray-800
                    border border-white/5 hover:border-gray-600
                    rounded-lg
                    transition-all duration-200
                    text-gray-200
                    ${isGeoLevelMenuOpen ? 'bg-gray-800 border-gray-600' : ''}
                `}
            >
                <span className="text-gray-400 group-hover:text-blue-400">
                    {(() => {
                        const found = geoLevelOptions?.find(o => o.id === selectedGeoLevel);
                        if (found?.icon) return React.cloneElement(found.icon, { width: 16, height: 16 });
                        return (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        );
                    })()}
                </span>
                <span className="font-medium text-xs uppercase tracking-wide">{selectedGeoLevel}</span>
                <span className={`text-gray-500 w-3 h-3 transition-transform duration-200 ${isGeoLevelMenuOpen ? 'rotate-180' : ''}`}>
                    {geoLevelSelectorIcons.chevronDown}
                </span>
            </button>

            {isGeoLevelMenuOpen && (
                <div className="
                    absolute top-full left-0 mt-1 w-48 
                    bg-gray-800 border border-gray-700
                    rounded-lg shadow-xl
                    overflow-hidden flex flex-col 
                    animate-in fade-in zoom-in-95 duration-100
                ">
                    {(geoLevelOptions ?? []).map((opt) => (
                        <GeoLevelCompactButton 
                            key={opt.id}
                            opt={opt}
                            handleGeoLevelSelect={handleGeoLevelSelect}
                            selectedGeoLevel={selectedGeoLevel}
                        />
                    ))}
                </div>
            )}
            
            {isGeoLevelMenuOpen && <div className="fixed inset-0 z-[-1]" onClick={() => setIsGeoLevelMenuOpen(false)}></div>}
        </div>
    )
}

export default CompactGeoLevelControl;