import ExitButton from './ExitButton';
import GeoLevelButton from './GeoLevelButton'
import { useGeoLevelSelectionContext } from '../hooks/useGeoLevelCreationContext.js';

/**
 * Componente InitialGeoLevelSelectorGrid - Grid de selección inicial
 * Consume el contexto directamente
 */
export const InitialGeoLevelSelectorGrid = () => {
    const { geoLevelOptions, handleGeoLevelSelect } = useGeoLevelSelectionContext();
    return ( 
        <div className="flex-1 flex flex-col items-center justify-center w-full h-full animate-fade-in">
            <div className="absolute top-6 right-6">
                <ExitButton />
            </div>

            <div className="flex flex-col items-center justify-center gap-8 w-full px-4">
                <div className="text-center space-y-1 mb-4">
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        Tipo de Registro
                    </h1>
                    <p className="text-gray-500 text-sm">Selecciona el nivel geográfico para continuar.</p>
                </div>

                <div className="flex flex-wrap gap-4 justify-center w-full max-w-4xl">
                    {(geoLevelOptions ?? []).map((opt, index) => (
                        <GeoLevelButton 
                            key={opt.id ?? `${opt.label ?? 'opt'}-${index}`}
                            opt={opt} 
                            handleGeoLevelSelect={handleGeoLevelSelect} 
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default InitialGeoLevelSelectorGrid;