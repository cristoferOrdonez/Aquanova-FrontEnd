/**
 * Configuración centralizada para FormCreation
 * Mantiene valores por defecto usados por los hooks y providers
 */
import typeQuestionOptions from '../constants/typeQuestionOptions.jsx';

export const DEFAULT_QUESTION_TITLE = 'Pregunta sin título';
export const DEFAULT_OPTION = { id: Date.now(), value: 'Opción sin título' };
export const DEFAULT_TYPE_OPTION = 'Sólo texto (sin respuestas)';

export const FORM_CREATION_CONFIG = {
  defaultQuestionTitle: DEFAULT_QUESTION_TITLE,
  defaultOption: DEFAULT_OPTION,
  defaultType: DEFAULT_TYPE_OPTION,
  typeOptions: typeQuestionOptions,
};

export default FORM_CREATION_CONFIG;
