import React, { useState } from 'react';
import { PROPERTY_OPTION, NEIGHBORHOOD_OPTION, LOCALITY_OPTION, InitialLevelGrid, CompactLevelControl } from './GeoLevelSelector';
import LocalityForm from './LocalityForm';
import NeighborhoodForm from './NeighborhoodForm';
import PropertyForm from './PropertyForm';
import ExitButton from '../../ui/ExitButton';

const renderGeoLevelForm = (type) => {
    switch(type) {
        case PROPERTY_OPTION:
            return <PropertyForm />;
        case NEIGHBORHOOD_OPTION:
            return <NeighborhoodForm />;
        case LOCALITY_OPTION:
            return <LocalityForm />;
        default:
            return null;
    }
};

const DataSection = ({
    selectedType, setSelectedType
}) => {

    // Estado para controlar si el menú desplegable superior está abierto
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleSelect = (type) => {
        setSelectedType(type);
        setIsMenuOpen(false); // Cerrar menú al seleccionar
    };

    return (
        <div className="w-full h-full bg-[var(--bg-color-main)] p-12 flex flex-col relative items-center text-gray-800 overflow-auto">
            
            {/* VISTA 1: Selección Inicial (Se muestra solo si no hay nada seleccionado) */}
            {!selectedType && (
                <InitialLevelGrid
                    handleSelect={handleSelect}
                />
            )}

            {/* VISTA 2: Contenido con Barra Superior (Se muestra si hay selección) */}
            {selectedType && (
                <>
                    <div className = "flex w-full h-wrap mb-12 flex-row justify-between items-center">
                        {/* Barra Superior Izquierda */}
                        <CompactLevelControl
                            selectedType={selectedType}
                            isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen}
                            handleSelect={handleSelect}
                        />
                        <ExitButton />
                    </div>

                        {renderGeoLevelForm(selectedType)}
                </>
            )}
        </div>
    );
}

export default DataSection;