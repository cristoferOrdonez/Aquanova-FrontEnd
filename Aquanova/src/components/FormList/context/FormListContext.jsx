import { createContext } from 'react';

/**
 * @typedef {object} Form
 * @property {string} id - El ID único del formulario.
 * @property {string} _id - El ID único del formulario (alternativo).
 * @property {string} title - El título del formulario.
 * @property {string} [description] - La descripción del formulario.
 * @property {string} [imageUrl] - La URL de la imagen de portada.
 * @property {number} is_active - Estado de actividad (1 para activo, 0 para inactivo).
 * @property {Array<{name: string}>} [neighborhoods] - Lista de barrios asociados.
 */

/**
 * @typedef {object} FormListContextType
 * @property {Form[]} forms - The list of forms.
 * @property {boolean} loading - Indicates if the forms are being loaded.
 * @property {string|null} error - The error message, if any.
 * @property {(query: string) => Promise<void>} handleSearch - Function to handle search.
 * @property {() => void} reload - Function to reload the forms.
 * @property {(id: string) => Promise<void>} handleDelete - Function to delete a form.
 */

/**
 * Context for the form list feature.
 *
 * @type {import('react').Context<FormListContextType|undefined>}
 */
export const FormListContext = createContext(undefined);
