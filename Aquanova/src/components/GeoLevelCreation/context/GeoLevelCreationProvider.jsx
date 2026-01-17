import { 
    GeoLevelSelectionContext, 
    ImageGalleryContext, 
    ResizablePanelContext 
} from "./GeoLevelCreationContext";
import { useGeoLevelSelection } from "../hooks/useGeoLevelSelection";
import { useImageGallery } from "../hooks/useImageGallery";
import { useResizablePanel } from "../hooks/useResizablePanel";
import { GEOLEVEL_CONFIG } from "../config/geolevelConfig";

/**
 * Provider que encapsula todos los contextos de GeoLevelCreation
 * Proporciona acceso centralizado al estado sin prop drilling
 * 
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Componentes hijos que consumirán el contexto
 */
export function GeoLevelCreationProvider({ children }) {
    const slotsQuantity = GEOLEVEL_CONFIG.GALLERY_SLOTS_QUANTITY;
    // Inicializar hooks
    const geoLevelSelection = useGeoLevelSelection();
    const imageGallery = useImageGallery(slotsQuantity);
    const resizablePanel = useResizablePanel();

    return (
        <GeoLevelSelectionContext.Provider value={geoLevelSelection}>
            <ImageGalleryContext.Provider value={imageGallery}>
                <ResizablePanelContext.Provider value={resizablePanel}>
                    {children}
                </ResizablePanelContext.Provider>
            </ImageGalleryContext.Provider>
        </GeoLevelSelectionContext.Provider>
    );
}
