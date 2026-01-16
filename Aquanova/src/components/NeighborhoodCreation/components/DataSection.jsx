import React, { useState } from 'react';
import { PROPERTY_OPTION, NEIGHBORHOOD_OPTION, LOCALITY_OPTION, InitialLevelGrid, CompactLevelControl } from './GeoLevelSelector';
import LocalityForm from './LocalityForm';
import NeighborhoodForm from './NeighborhoodForm';
import PropertyForm from './PropertyForm';
import ExitButton from './ExitButton';

const renderGeoLevelForm = (type) => {
    switch(type) {
        case PROPERTY_OPTION: return <PropertyForm />;
        case NEIGHBORHOOD_OPTION: return <NeighborhoodForm />;
        case LOCALITY_OPTION: return <LocalityForm />;
        default: return null;
    }
};

const DataSection = ({ selectedType, setSelectedType }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleSelect = (type) => {
        setSelectedType(type);
        setIsMenuOpen(false); 
    };

    return (
        // Fondo limpio, hereda del padre o usa gray-900 directo.
        <div className="w-full h-full bg-gray-900 relative flex flex-col font-work overflow-hidden border-r border-white/5">
            
            {/* Contenido */}
            <div className="relative z-10 w-full h-full flex flex-col p-6 overflow-y-auto custom-scrollbar">
                
                {/* VISTA 1: Selección Inicial */}
                {!selectedType && (
                    // Al estar en pantalla completa, este grid tendrá mucho espacio y se verá muy bien centrado
                    <InitialLevelGrid handleSelect={handleSelect} />
                )}

                {/* VISTA 2: Contenido */}
                {selectedType && (
                    <div className="flex flex-col w-full max-w-5xl mx-auto h-full">
                        <div className="flex w-full mb-6 flex-row justify-between items-center animate-fade-in-down">
                            <CompactLevelControl
                                selectedType={selectedType}
                                isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen}
                                handleSelect={handleSelect}
                            />
                            <ExitButton />
                        </div>

                        <div className="flex-1 flex items-start justify-center pt-8">
                            {renderGeoLevelForm(selectedType)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DataSection;