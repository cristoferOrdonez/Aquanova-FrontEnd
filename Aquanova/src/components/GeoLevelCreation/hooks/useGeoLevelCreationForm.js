import { useGeoLevelSelection } from "./useGeoLevelSelection";
import { useImageGallery } from "./useImageGallery";
import { useResizablePanel } from "./useResizablePanel";
import { GEOLEVEL_CONFIG } from "../config/geolevelConfig";

/**
 * Hook principal que orquesta todos los hooks relacionados con la creación de niveles geográficos
 * Este hook sigue el principio de composición para mantener una clara separación de responsabilidades
 * @returns {Object} Estado y funciones consolidadas de todos los hooks
 */
export function useGeoLevelCreationForm() {
    const slotsQuantity = GEOLEVEL_CONFIG.GALLERY_SLOTS_QUANTITY;

    // Hook para manejo de la selección de niveles geográficos
    const geoLevelSelection = useGeoLevelSelection();

    // Hook para manejo de la galería de imágenes
    const imageGallery = useImageGallery(slotsQuantity);

    // Hook para manejo del panel redimensionable
    const resizablePanel = useResizablePanel();

    // Retornar todos los valores de forma consolidada
    return {
        // Constants / options
        slotsQuantity,
        ...geoLevelSelection,
        
        // Image gallery
        ...imageGallery,

        // Resizable panel
        ...resizablePanel,
    };
}