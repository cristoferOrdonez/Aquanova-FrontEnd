import InitialGeoLevelSelectorGrid from '../ui/selectors/InicialGeoLevelSelectorGrid.jsx';
import CompactGeoLevelControl from '../ui/selectors/CompactGeoLevelSelector.jsx'
import ExitButton from '../ui/buttons/ExitButton.jsx';
import PropertyForm from './forms/PropertyForm.jsx';
import NeighborhoodForm from './forms/NeighborhoodForm.jsx';
import LocalityForm from './forms/LocalityForm.jsx';
import { useGeoLevelSelectionContext } from '../../hooks/useGeoLevelCreationContext.js';
import { GEO_LEVEL_TYPES } from './../../config/geolevelConfig.js';

/**
 * Componente DataSection - Sección de datos y formularios
 * Consume el contexto directamente, sin necesidad de props
 */
const DataSection = () => {
    const { selectedGeoLevel } = useGeoLevelSelectionContext();

    return (
        <div className="w-full h-full bg-gray-900 relative flex flex-col font-work overflow-hidden border-r border-white/5">
            
            {/* Contenido */}
            <div className="relative z-10 w-full h-full flex flex-col p-6 overflow-y-auto custom-scrollbar">
                
                {/* VISTA 1: Selección Inicial */}
                {!selectedGeoLevel && (
                    <InitialGeoLevelSelectorGrid />
                )}

                {/* VISTA 2: Contenido */}
                {selectedGeoLevel && (
                    <div className="flex flex-col w-full max-w-5xl mx-auto h-full">
                        <div className="flex w-full mb-6 flex-row justify-between items-center animate-fade-in-down">
                            <CompactGeoLevelControl />
                            <ExitButton />
                        </div>

                        <div className="flex-1 flex items-start justify-center pt-8">
                            {selectedGeoLevel === GEO_LEVEL_TYPES.PROPERTY && <PropertyForm />}
                            {selectedGeoLevel === GEO_LEVEL_TYPES.NEIGHBORHOOD && <NeighborhoodForm />}
                            {selectedGeoLevel === GEO_LEVEL_TYPES.LOCALITY && <LocalityForm />}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DataSection;