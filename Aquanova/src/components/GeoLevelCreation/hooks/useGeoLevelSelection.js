import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { 
    GEO_LEVEL_TYPES, 
    GEOLEVEL_CONFIG,
    GEO_LEVEL_BACKGROUNDS, 
    GEO_LEVEL_OPTIONS 
} from '../config/geolevelConfig';
import { geoLevelSelectorIcons } from '../constants/geoLevelSelectorIcons.jsx';
import { neighborhoodService } from '../../../services/neighborhoodService';

/**
 * Hook para manejar la selección y configuración de niveles geográficos
 * Utiliza configuración centralizada para tipos, fondos y opciones
 * @returns {Object} Estado y funciones para la selección de niveles geográficos
 */
export function useGeoLevelSelection() {
    // Estado para la selección de nivel geográfico
    const [selectedGeoLevel, setSelectedGeoLevel] = useState(null);
    const [isGeoLevelMenuOpen, setIsGeoLevelMenuOpen] = useState(false);

    // Estado para selectores padre - serán poblados desde la API
    const [parentNeighborhoodOptions, setParentNeighborhoodOptions] = useState([]);
    const [selectedParentNeighborhoodOption, setSelectedParentNeighborhoodOption] = useState({ id: null, label: GEOLEVEL_CONFIG.DEFAULT_SELECTOR_TEXT });
    const [parentLocalityOptions, setParentLocalityOptions] = useState([]);
    const [selectedParentLocalityOption, setSelectedParentLocalityOption] = useState({ id: null, label: GEOLEVEL_CONFIG.DEFAULT_SELECTOR_TEXT });
    const [isGeoLevelParentSelectorOpen, setIsGeoLevelParentSelectorOpen] = useState(false);
    // Form state para creación (nombre y código)
    const [formCode, setFormCode] = useState('');
    const [formName, setFormName] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Lógica para saber si estamos en pantalla completa
    const isFullScreen = !selectedGeoLevel;

    const navigate = useNavigate();

    const handleGeoLevelSelect = (type) => {
        setSelectedGeoLevel(type);
        setIsGeoLevelMenuOpen(false); 
    };

    // Cargar barrios desde la API y poblar ambos selectores
    useEffect(() => {
        let mounted = true;

        const load = async () => {
            try {
                const names = await neighborhoodService.getAll();
                if (!mounted) return;
                if (Array.isArray(names) && names.length) {
                    // names ahora es un arreglo de objetos {id,label}
                    setParentNeighborhoodOptions(names);
                    setParentLocalityOptions(names);
                }
            } catch (err) {
                console.error('Error cargando barrios:', err);
            }
        };

        load();

        return () => { mounted = false; };
    }, []);

    // Crear un nuevo geo-level (predio, barrio, localidad)
    const createGeoLevel = async ({code = null, name = null, parent_id = null, metadata = null } = {}) => {
        setIsSubmitting(true);
        try {
            const payload = {
                code: code ?? formCode,
                name: name ?? formName,
                parent_id,
                // Merge provided metadata (images etc.) with description and type
                metadata: {
                    ...(metadata || {}),
                    description: (metadata && metadata.description) || formDescription || '',
                    type: selectedGeoLevel || undefined,
                },
            };

            const res = await neighborhoodService.create(payload);

            // Si la creación fue exitosa, recargar opciones
            try {
                const refreshed = await neighborhoodService.getAll();
                if (Array.isArray(refreshed) && refreshed.length) {
                    setParentNeighborhoodOptions(refreshed);
                    setParentLocalityOptions(refreshed);
                }
            } catch (e) {
                console.warn('Error reloading neighborhoods after create', e);
            }

            setFormCode('');
            setFormName('');
            setFormDescription('');

            return res;
        } catch (err) {
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    // Volver a la vista de lista inicial (lista de barrios/localidades)
    const exitToList = () => {
        setSelectedGeoLevel(null);
        setFormCode('');
        setFormName('');
        setSelectedParentNeighborhoodOption({ id: null, label: GEOLEVEL_CONFIG.DEFAULT_SELECTOR_TEXT });
        setSelectedParentLocalityOption({ id: null, label: GEOLEVEL_CONFIG.DEFAULT_SELECTOR_TEXT });
        setIsGeoLevelParentSelectorOpen(false);
        setFormDescription('');
        // Navegar a la lista de barrios
        try {
            navigate('/neighborhoods');
        } catch (e) {
            // Si por alguna razón la navegación falla (por ejemplo en tests), no romper la app
            console.warn('Navigation to /neighborhoods failed', e);
        }
    };

    return {
        // Constantes (desde configuración centralizada)
        ...GEO_LEVEL_TYPES,
        backgroundConfig: GEO_LEVEL_BACKGROUNDS,
        geoLevelSelectorIcons,
        geoLevelOptions: GEO_LEVEL_OPTIONS,

        // Estado de selección de nivel geográfico
        selectedGeoLevel,
        setSelectedGeoLevel,
        isGeoLevelMenuOpen,
        setIsGeoLevelMenuOpen,
        isFullScreen,

        // Estado de selectores padre (poblados desde la API)
        parentNeighborhoodOptions,
        selectedParentNeighborhoodOption,
        setSelectedParentNeighborhoodOption,
        formDescription,
        setFormDescription,
        formCode,
        setFormCode,
        formName,
        setFormName,
        parentLocalityOptions,
        selectedParentLocalityOption,
        setSelectedParentLocalityOption,
        isSubmitting,
        createGeoLevel,
        exitToList,
        isGeoLevelParentSelectorOpen,
        setIsGeoLevelParentSelectorOpen,

        // Funciones
        handleGeoLevelSelect,
    };
}
