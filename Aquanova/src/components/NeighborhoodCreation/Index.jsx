import { useState, useEffect, useRef } from "react";
import CircularGalery3D from "./components/CircularGalery3D.jsx";
import DataSection from "./components/DataSection.jsx";

const Index = () => {
    const [selectedType, setSelectedType] = useState(null);
    const [leftWidth, setLeftWidth] = useState(35);
    const sidebarRef = useRef(null);
    const isResizing = useRef(false);
    
    const MAX_WIDTH = 50;
    const MIN_WIDTH = 20;

    // Lógica para saber si estamos en pantalla completa
    const isFullScreen = !selectedType;

    const startResizing = () => {
        isResizing.current = true;
        document.body.style.cursor = 'col-resize';
    };

    const stopResizing = () => {
        isResizing.current = false;
        document.body.style.cursor = 'default';
    };

    const resize = (e) => {
        if (isResizing.current) {
            const newWidth = (e.clientX / window.innerWidth) * 100;
            if (newWidth > MIN_WIDTH && newWidth < MAX_WIDTH) {
                setLeftWidth(newWidth);
            }
        }
    };

    useEffect(() => {
        window.addEventListener("mousemove", resize);
        window.addEventListener("mouseup", stopResizing);
        return () => {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, []);

    return (
        <div className="w-screen h-screen flex flex-row font-work overflow-hidden select-none bg-black">
            
            {/* PANEL IZQUIERDO:
                - flex-shrink-0: Evita que se encoja más de lo que decimos.
                - transition-[width]: Anima solo el ancho.
            */}
            <div 
                ref={sidebarRef}
                className="h-full relative z-20 flex-shrink-0 transition-[width] duration-1000 ease-in-out"
                style={{ width: `${isFullScreen ? 100 : leftWidth}%` }}
            >
                <DataSection
                    selectedType={selectedType} setSelectedType={setSelectedType}
                />
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

            {/* PANEL DERECHO:
                - min-w-0: CRÍTICO. Permite que el flex item se encoja a 0.
                - overflow-hidden: CRÍTICO. Corta el contenido si intenta salirse.
                - opacity: Se desvanece si está en pantalla completa.
            */}
            <div className={`
                flex-1 h-full relative z-10 
                min-w-0 overflow-hidden
                transition-all duration-1000 ease-in-out
                ${isFullScreen ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'}
            `}>
                <CircularGalery3D 
                    selectedType={selectedType || "Inmueble"} 
                />
            </div>
        </div>
    );
};

export default Index;