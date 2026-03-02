import { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
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
    const { id } = useParams();
    const isEditMode = Boolean(id);

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
    const [isLoadingEdit, setIsLoadingEdit] = useState(false);
    const [editLoadError, setEditLoadError] = useState(null);
    const [editingParentName, setEditingParentName] = useState('');
    // URL de imagen existente en Cloudinary (modo edición)
    const [existingImageUrl, setExistingImageUrl] = useState(null);

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
                const all = await neighborhoodService.getAll();
                if (!mounted) return;
                if (Array.isArray(all) && all.length) {
                    // Localidades: registros raíz (sin padre)
                    const localities = all.filter((n) => !n.parent_id);
                    // Barrios: registros con localidad padre
                    const neighborhoods = all.filter((n) => !!n.parent_id);
                    setParentLocalityOptions(localities);
                    setParentNeighborhoodOptions(neighborhoods);
                }
            } catch (err) {
                console.error('Error cargando barrios:', err);
            }
        };

        load();

        return () => { mounted = false; };
    }, []);

    // Cargar datos para edición si existe ID en la ruta
    useEffect(() => {
        let mounted = true;

        const loadEditData = async () => {
            if (!isEditMode || !id) return;
            setIsLoadingEdit(true);
            setEditLoadError(null);

            try {
                // getById ya retorna el nodo normalizado con jerarquía
                const normalized = await neighborhoodService.getById(id);

                if (!normalized?.id) {
                    throw new Error('El servidor no retornó datos válidos para este geonivel.');
                }

                // `type` es campo top-level: "Barrio" | "Localidad" | "Ciudad"
                const resolvedType = normalized.type
                    ? String(normalized.type).toLowerCase()
                    : null;

                if (resolvedType) {
                    setSelectedGeoLevel(resolvedType);
                } else {
                    throw new Error('Los datos del nivel geográfico no contienen un tipo válido.');
                }

                setFormCode(normalized.code ?? '');
                setFormName(normalized.name ?? '');
                // metadata.descripcion es el campo correcto (metadata.description como fallback)
                setFormDescription(
                    normalized.metadata?.descripcion ??
                    normalized.metadata?.description ??
                    ''
                );

                // Imagen existente de Cloudinary para mostrar en la galería
                setExistingImageUrl(normalized.metadata?.imagen ?? null);

                // `parent` es el objeto padre inmediato (Localidad o Barrio según el nivel)
                const parent = normalized.parent;
                setEditingParentName(parent?.name ?? '');

                if (resolvedType === GEO_LEVEL_TYPES.NEIGHBORHOOD && parent) {
                    setSelectedParentLocalityOption({ id: parent.id ?? null, label: parent.name ?? GEOLEVEL_CONFIG.DEFAULT_SELECTOR_TEXT });
                }

                if (resolvedType === GEO_LEVEL_TYPES.PROPERTY && parent) {
                    setSelectedParentNeighborhoodOption({ id: parent.id ?? null, label: parent.name ?? GEOLEVEL_CONFIG.DEFAULT_SELECTOR_TEXT });
                }

                setIsGeoLevelMenuOpen(false);
            } catch (err) {
                console.error('Error cargando detalle de geolevel:', err);
                setEditLoadError('No se pudo cargar la información del geonivel.');
            } finally {
                if (mounted) setIsLoadingEdit(false);
            }
        };

        loadEditData();

        return () => { mounted = false; };
    }, [id, isEditMode]);

    // Crear un nuevo geo-level (predio, barrio, localidad)
    // metadata puede incluir un `imageFile` (File) para subir a Cloudinary
    const createGeoLevel = async ({code = null, name = null, parent_id = null, metadata = null } = {}) => {
        setIsSubmitting(true);
        try {
            // Extraer imageFile del metadata si existe (proviene de buildMetadata)
            const imageFile = metadata?.imageFile ?? null;

            const payload = {
                code: code ?? formCode,
                name: name ?? formName,
                parent_id,
                // Merge provided metadata (images etc.) with descripcion and type
                metadata: {
                    ...(metadata || {}),
                    descripcion: (metadata && (metadata.descripcion ?? metadata.description)) || formDescription || '',
                    type: selectedGeoLevel || undefined,
                },
            };

            // Limpiar campos internos del metadata (no deben enviarse al backend)
            delete payload.metadata.imageFile;
            delete payload.metadata.images;

            const res = await neighborhoodService.create(payload, imageFile);

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

    // Actualizar un geo-level existente (predio, barrio, localidad)
    const updateGeoLevel = async ({ name = null, parent_id = undefined, metadata = null } = {}) => {
        if (!id) throw new Error('No se puede actualizar sin un ID válido.');
        setIsSubmitting(true);
        try {
            // Extraer imageFile del metadata si existe (proviene de buildMetadata)
            const imageFile = metadata?.imageFile ?? null;

            // Construir metadata limpia: solo campos que el backend espera
            const cleanMetadata = {
                descripcion: (metadata && (metadata.descripcion ?? metadata.description)) || formDescription || '',
            };

            // No enviar 'code' en update: el campo es readonly en edición
            // y el backend puede rechazar el mismo código por constraint de unicidad
            const payload = {
                name: name ?? formName,
                metadata: cleanMetadata,
            };

            // Solo incluir parent_id si tiene un valor UUID válido (no null, no undefined)
            if (parent_id) {
                payload.parent_id = parent_id;
            }

            console.log('[updateGeoLevel] id:', id, 'payload:', JSON.stringify(payload), 'imageFile:', imageFile);

            const res = await neighborhoodService.update(id, payload, imageFile);

            // Si la actualización fue exitosa, recargar opciones
            try {
                const refreshed = await neighborhoodService.getAll();
                if (Array.isArray(refreshed) && refreshed.length) {
                    setParentNeighborhoodOptions(refreshed);
                    setParentLocalityOptions(refreshed);
                }
            } catch (e) {
                console.warn('Error reloading neighborhoods after update', e);
            }

            return res;
        } catch (err) {
            console.error('[updateGeoLevel] Error completo:', err);
            console.error('[updateGeoLevel] err.data:', err?.data);
            console.error('[updateGeoLevel] err.status:', err?.status);
            console.error('[updateGeoLevel] err.message:', err?.message);
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
        setEditingParentName('');
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
        updateGeoLevel,
        exitToList,
        isGeoLevelParentSelectorOpen,
        setIsGeoLevelParentSelectorOpen,
        isEditMode,
        isLoadingEdit,
        editLoadError,
        editingParentName,
        existingImageUrl,

        // Funciones
        handleGeoLevelSelect,
    };
}
