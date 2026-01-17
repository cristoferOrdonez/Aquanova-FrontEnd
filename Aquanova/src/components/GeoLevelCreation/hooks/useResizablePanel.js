import { useState, useRef, useEffect, useCallback } from "react";

/**
 * Hook para manejar un panel redimensionable
 * @param {number} initialWidth - Ancho inicial del panel en porcentaje
 * @param {number} minWidth - Ancho mínimo del panel en porcentaje
 * @param {number} maxWidth - Ancho máximo del panel en porcentaje
 * @returns {Object} Estado y funciones para el panel redimensionable
 */
export function useResizablePanel(initialWidth = 35, minWidth = 20, maxWidth = 50) {
    const [leftWidth, setLeftWidth] = useState(initialWidth);
    const sidebarRef = useRef(null);
    const isResizing = useRef(false);

    const startResizing = useCallback(() => {
        isResizing.current = true;
        document.body.style.cursor = 'col-resize';
    }, []);

    const stopResizing = useCallback(() => {
        isResizing.current = false;
        document.body.style.cursor = 'default';
    }, []);

    const resize = useCallback((e) => {
        if (isResizing.current) {
            const newWidth = (e.clientX / window.innerWidth) * 100;
            if (newWidth > minWidth && newWidth < maxWidth) {
                setLeftWidth(newWidth);
            }
        }
    }, [minWidth, maxWidth]);

    useEffect(() => {
        window.addEventListener("mousemove", resize);
        window.addEventListener("mouseup", stopResizing);
        return () => {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [resize, stopResizing]);

    return {
        leftWidth,
        setLeftWidth,
        sidebarRef,
        isResizing,
        startResizing,
        stopResizing,
        resize,
        MIN_WIDTH: minWidth,
        MAX_WIDTH: maxWidth,
    };
}
