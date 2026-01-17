import Gallery from "./Gallery.jsx";
import DataSection from "./DataSection.jsx";
import { 
    useGeoLevelSelectionContext, 
    useResizablePanelContext 
} from "../hooks/useGeoLevelCreationContext.js";

/**
 * Componente GeoLevelCreationContent - Contenido principal que consume contextos
 * Mantiene la UI separada del contenedor (Provider) para mayor claridad
 */
const GeoLevelCreationContent = () => {
    const { isFullScreen } = useGeoLevelSelectionContext();
    const { leftWidth, sidebarRef, startResizing } = useResizablePanelContext();

    return (
        <div className="w-screen h-screen flex flex-row font-work overflow-hidden select-none bg-black">
            
        {/* PANEL IZQUIERDO */}
            <div 
                ref={sidebarRef}
                className="h-full relative z-20 flex-shrink-0 transition-[width] duration-1000 ease-in-out"
                style={{ width: `${isFullScreen ? 100 : leftWidth}%` }}
            >
                <DataSection />
            </div>

            {/* SUJETADOR (Resizer) */}
            {!isFullScreen && (
                <div
                    className="
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
                flex-1 h-full relative z-10 
                min-w-0 overflow-hidden
                transition-all duration-1000 ease-in-out
                ${isFullScreen ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'}
            `}>
                <Gallery />
            </div>
        </div>
    );
};

export default GeoLevelCreationContent;
