// src/components/FormList/context/FormListContext.jsx
import { createContext } from 'react';

/**
 * @typedef {object} Form
 * @property {string} id - El ID único del formulario.
 * @property {string} [_id] - El ID único del formulario (alternativo).
 * @property {string} title - El título del formulario.
 * @property {string} [description] - La descripción del formulario.
 * @property {string} [imageUrl] - La URL de la imagen de portada.
 * @property {number} is_active - Estado de actividad (1 para activo, 0 para inactivo).
 * @property {Array<{name: string}>} [neighborhoods] - Lista de barrios asociados.
 */

/**
 * @typedef {object} FormListContextType
 * @property {Form[]} forms - La lista de formularios.
 * @property {boolean} loading - Indica si los formularios están cargando.
 * @property {string|null} error - El mensaje de error, si existe.
 * @property {(query: string) => Promise<void>} handleSearch - Función para buscar formularios.
 * @property {() => void} reload - Función para recargar la lista.
 * @property {(id: string) => Promise<void>} handleDelete - Función para eliminar un formulario.
 * @property {(formId: string, format: 'json'|'csv'|'xlsx', formTitle: string) => Promise<void>} handleExport - Función para exportar respuestas.
 */

/**
 * Context for the form list feature.
 *
 * @type {import('react').Context<FormListContextType|undefined>}
 */
export const FormListContext = createContext(undefined);