import { createContext } from "react";

/**
 * Context para compartir el estado de selección de niveles geográficos
 * Evita prop drilling y centraliza el estado relacionado con la selección de geo-niveles
 */
export const GeoLevelSelectionContext = createContext(null);

/**
 * Context para compartir el estado de la galería de imágenes
 * Maneja el carrusel, drag & drop y las imágenes cargadas
 */
export const ImageGalleryContext = createContext(null);

/**
 * Context para compartir el estado del panel redimensionable
 * Controla el ancho y comportamiento del panel lateral
 */
export const ResizablePanelContext = createContext(null);
