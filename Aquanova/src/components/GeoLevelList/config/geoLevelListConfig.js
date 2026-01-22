/**
 * Configuración para el módulo GeoLevelList
 */
export const GEOLEVEL_CONFIG = {
  ROUTES: {
    LIST: '/geolevels',
    CREATE: '/geolevel_creation',
    EDIT: (id) => `/geolevel_creation/${id}`,
  },
  TEXT: {
    LOADING: 'Cargando niveles geográficos...',
    ERROR_PREFIX: 'Error: ',
    NO_LEVELS: 'No se encontraron niveles geográficos.',
    NEW_LEVEL_BUTTON: 'Nuevo Nivel',
  },
};
