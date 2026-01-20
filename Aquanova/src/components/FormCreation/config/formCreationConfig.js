/**
 * Configuración centralizada para FormCreation
 * Mantiene valores por defecto usados por los hooks y providers
 */
import typeQuestionOptions from '../constants/typeQuestionOptions.jsx';

export const DEFAULT_QUESTION_TITLE = 'Pregunta sin título';
export const DEFAULT_FORM_TITLE = 'Formulario sin nombre';
export const DEFAULT_OPTION_LABEL = 'Opción sin título';
export const DEFAULT_TYPE_OPTION = 'Sólo texto (sin respuestas)';
export const DEFAULT_NEIGHBORHOOD_PLACEHOLDER = 'Seleccione un barrio';
export const IMAGE_INVALID_ALERT = 'Por favor suba un archivo de imagen válido.';
export const JUST_CREATED_TIMEOUT = 500;
export const JUST_UPDATED_TIMEOUT = 1000;
export const SMALL_ANIMATION_DELAY = 125;
export const EXIT_ANIMATION_DELAY = 500;
export const SCROLL_DELAY = 100;

export const TYPE_LABELS = {
  MULTIPLE: 'Opción multiple',
  CHECKBOX: 'Casillas de verificación',
  DROPDOWN: 'Lista desplegable',
};

export const createDefaultOption = () => ({ id: Date.now(), value: DEFAULT_OPTION_LABEL });

export const FORM_CREATION_CONFIG = {
  defaultQuestionTitle: DEFAULT_QUESTION_TITLE,
  defaultFormTitle: DEFAULT_FORM_TITLE,
  defaultOptionLabel: DEFAULT_OPTION_LABEL,
  createDefaultOption,
  defaultType: DEFAULT_TYPE_OPTION,
  typeOptions: typeQuestionOptions,
  neighborhoodPlaceholder: DEFAULT_NEIGHBORHOOD_PLACEHOLDER,
  imageInvalidAlert: IMAGE_INVALID_ALERT,
  timeouts: {
    justCreated: JUST_CREATED_TIMEOUT,
    justUpdated: JUST_UPDATED_TIMEOUT,
  },
  animationDelays: {
    small: SMALL_ANIMATION_DELAY,
    exit: EXIT_ANIMATION_DELAY,
    scroll: SCROLL_DELAY,
  },
  typeLabels: TYPE_LABELS,
};

export default FORM_CREATION_CONFIG;
