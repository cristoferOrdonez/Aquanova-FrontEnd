/**
 * Configuración centralizada para GeoLevelCreation
 * Mantiene un único punto de verdad para valores constantes
 * 
 * NOTA: parentNeighborhoodOptions y parentLocalityOptions NO son constantes
 * Se obtienen de una API en el futuro, por lo que se dejan en el estado del hook
 */

import NeighborhoodBackground from '../../../assets/images/bg_neighborhood.jpg';
import LocalityBackground from '../../../assets/images/bg_locality.jpg'; 
import PropertyBackground from '../../../assets/images/bg_property.jpg';
import { geoLevelSelectorIcons } from '../constants/geoLevelSelectorIcons.jsx';

// --- OPCIONES DE NIVELES GEOGRÁFICOS ---
export const GEO_LEVEL_TYPES = {
    PROPERTY: 'predio',
    NEIGHBORHOOD: 'barrio',
    LOCALITY: 'localidad',
};

// --- CONFIGURACIÓN GENERAL ---
export const GEOLEVEL_CONFIG = {
    /**
     * Cantidad de slots en la galería de imágenes
     * Cambiar aquí afectará a toda la aplicación
     */
    GALLERY_SLOTS_QUANTITY: 5,

    /**
     * Texto por defecto para selectores sin selección
     */
    DEFAULT_SELECTOR_TEXT: 'Seleccione una opción',
};

// --- CONFIGURACIÓN DE FONDOS ---
export const GEO_LEVEL_BACKGROUNDS = [
    { 
        id: GEO_LEVEL_TYPES.PROPERTY, 
        src: PropertyBackground 
    },
    { 
        id: GEO_LEVEL_TYPES.NEIGHBORHOOD, 
        src: NeighborhoodBackground 
    },
    { 
        id: GEO_LEVEL_TYPES.LOCALITY, 
        src: LocalityBackground 
    }
];

// --- OPCIONES DE NIVELES GEOGRÁFICOS ---
export const GEO_LEVEL_OPTIONS = [
    { 
        id: GEO_LEVEL_TYPES.PROPERTY, 
        label: 'Predio', 
        icon: geoLevelSelectorIcons.property, 
        desc: 'Unidad inmobiliaria' 
    },
    { 
        id: GEO_LEVEL_TYPES.NEIGHBORHOOD, 
        label: 'Barrio', 
        icon: geoLevelSelectorIcons.neighborhood, 
        desc: 'Sector urbano' 
    },
    { 
        id: GEO_LEVEL_TYPES.LOCALITY, 
        label: 'Localidad', 
        icon: geoLevelSelectorIcons.locality, 
        desc: 'División admin.' 
    },
];

