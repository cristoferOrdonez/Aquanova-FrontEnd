import Gallery from "./GallerySection.jsx";
import DataSection from "./DataSection.jsx";
import { 
    useGeoLevelSelectionContext, 
    useResizablePanelContext 
} from "../../hooks/useGeoLevelCreationContext.js";

/**
 * Componente GeoLevelCreationContent - Contenido principal que consume contextos
 * Mantiene la UI separada del contenedor (Provider) para mayor claridad
 */
const GeoLevelCreationContent = () => {
    const { isFullScreen } = useGeoLevelSelectionContext();
    const { leftWidth, sidebarRef, startResizing } = useResizablePanelContext();

    return (
        <div className="w-full min-h-screen md:w-screen md:h-screen flex flex-col md:flex-row font-work overflow-x-hidden md:overflow-hidden select-none bg-black">
            
        {/* PANEL IZQUIERDO */}
            <div 
                ref={sidebarRef}
                className="relative z-20 flex-shrink-0 transition-[width] duration-1000 ease-in-out w-full md:w-[var(--panel-width)] min-h-screen md:min-h-0 md:h-full flex flex-col"
                style={{ '--panel-width': `${isFullScreen ? 100 : leftWidth}%` }}
            >
                <DataSection />
            </div>

            {/* SUJETADOR (Resizer) - Oculto en móviles */}
            {!isFullScreen && (
                <div
                    className="
                        hidden md:block
                        w-1 h-full 
                        hover:bg-blue-500/30 
                        cursor-col-resize 
                        transition-colors duration-300 
                        z-30 absolute
                        animate-fade-in
                    "
                    style={{ left: `${leftWidth}%` }} 
                    onMouseDown={startResizing}
                />
            )}

            {/* PANEL DERECHO */}
            <div className={`
                flex-1 w-full md:w-auto min-h-screen md:min-h-0 md:h-full relative z-10 
                min-w-0 overflow-hidden
                transition-all duration-1000 ease-in-out
                ${isFullScreen ? 'hidden md:block md:opacity-0 md:translate-x-10' : 'opacity-100 translate-x-0'}
            `}>
                <Gallery />
            </div>
        </div>
    );
};

export default GeoLevelCreationContent;
