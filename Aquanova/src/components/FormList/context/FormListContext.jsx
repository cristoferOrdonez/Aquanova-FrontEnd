// src/components/FormList/context/FormListContext.jsx
import { createContext } from 'react';

/**
 * @typedef {object} FormMetadata
 * @property {string} imagen - URL pública de la imagen de portada en Cloudinary.
 * @property {string} imagen_public_id - ID interno de Cloudinary.
 */

/**
 * @typedef {object} FormNeighborhood
 * @property {string} id - UUID del barrio.
 * @property {string} name - Nombre del barrio.
 * @property {string} code - Código del barrio.
 * @property {string|null} parent_id - ID del barrio padre (si es sub-barrio).
 */

/**
 * @typedef {object} Form
 * @property {string} id - UUID del formulario.
 * @property {string} key - Slug único generado al crear.
 * @property {string} title - El título del formulario.
 * @property {string} [description] - La descripción del formulario.
 * @property {FormMetadata|null} metadata - Imagen de portada en Cloudinary. null si no se subió imagen.
 * @property {boolean} is_active - true si activo, false si desactivado.
 * @property {string} created_by - Nombre del administrador que lo creó.
 * @property {string} created_at - Fecha de creación (ISO 8601).
 * @property {FormNeighborhood[]} neighborhoods - Barrios con publicación activa. [] si ninguno.
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