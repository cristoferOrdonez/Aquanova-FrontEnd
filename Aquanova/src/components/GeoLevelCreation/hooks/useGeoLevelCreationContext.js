import { useContext } from "react";
import { 
    GeoLevelSelectionContext, 
    ImageGalleryContext, 
    ResizablePanelContext 
} from "../context/GeoLevelCreationContext";

/**
 * Hook para acceder al contexto de selección de niveles geográficos
 * @throws {Error} Si se usa fuera del GeoLevelCreationProvider
 * @returns {Object} Estado y funciones de selección de geo-niveles
 */
export function useGeoLevelSelectionContext() {
    const context = useContext(GeoLevelSelectionContext);
    
    if (!context) {
        throw new Error(
            "useGeoLevelSelectionContext debe usarse dentro de GeoLevelCreationProvider"
        );
    }
    
    return context;
}

/**
 * Hook para acceder al contexto de galería de imágenes
 * @throws {Error} Si se usa fuera del GeoLevelCreationProvider
 * @returns {Object} Estado y funciones de la galería de imágenes
 */
export function useImageGalleryContext() {
    const context = useContext(ImageGalleryContext);
    
    if (!context) {
        throw new Error(
            "useImageGalleryContext debe usarse dentro de GeoLevelCreationProvider"
        );
    }
    
    return context;
}

/**
 * Hook para acceder al contexto del panel redimensionable
 * @throws {Error} Si se usa fuera del GeoLevelCreationProvider
 * @returns {Object} Estado y funciones del panel redimensionable
 */
export function useResizablePanelContext() {
    const context = useContext(ResizablePanelContext);
    
    if (!context) {
        throw new Error(
            "useResizablePanelContext debe usarse dentro de GeoLevelCreationProvider"
        );
    }
    
    return context;
}
