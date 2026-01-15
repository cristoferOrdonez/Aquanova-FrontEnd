import { useState, useEffect, useRef } from "react";
import CircularGalery3D from "./components/CircularGalery3D.jsx";
import DataSection from "./components/DataSection.jsx";

const Index = () => {

    // Estado para guardar la opción seleccionada (predio, barrio, localidad)
    const [selectedType, setSelectedType] = useState(null);

    // 1. Estado para el ancho del panel izquierdo (inicializado en 30%)
    const [leftWidth, setLeftWidth] = useState(35);
    const sidebarRef = useRef(null);
    const isResizing = useRef(false);
    const MAX_WIDTH = 50;
    const MIN_WIDTH = 10;

    // 2. Funciones para manejar el arrastre
    const startResizing = () => {
        isResizing.current = true;
    };

    const stopResizing = () => {
        isResizing.current = false;
    };

    const resize = (e) => {
        if (isResizing.current) {
            // Calculamos el nuevo porcentaje basado en la posición X del mouse
            // en relación al ancho total de la ventana
            const newWidth = (e.clientX / window.innerWidth) * 100;
            
            // Límites opcionales (min 10%, max 55%) para que no desaparezca
            if (newWidth > MIN_WIDTH && newWidth < MAX_WIDTH) {
                setLeftWidth(newWidth);
            }
        }
    };

    // 3. useEffect para añadir los listeners globales
    useEffect(() => {
        window.addEventListener("mousemove", resize);
        window.addEventListener("mouseup", stopResizing);

        return () => {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, []);

    return (
        // Agregamos select-none para evitar que el texto se seleccione al arrastrar
        <div className="w-screen h-screen flex flex-row font-work overflow-hidden select-none">
            
            {/* Panel Izquierdo: El ancho es dinámico basado en el estado */}
            <div 
                ref={sidebarRef}
                className="h-full"
                style={{ width: `${leftWidth}%` }}
            >
                <DataSection
                    selectedType={selectedType} setSelectedType={setSelectedType}
                />
            </div>

            {/* SUJETADOR / RESIZER */}
            {/* Es una barra delgada que cambia el cursor y activa el evento onMouseDown */}
            <div
                className="w-0.5 bg-gray-300 hover:bg-blue-500 cursor-col-resize transition-colors h-full flex items-center justify-center z-10"
                onMouseDown={startResizing}
            >

            </div>

            {/* Panel Derecho: Usa flex-1 para ocupar el espacio restante automáticamente */}
            <div className="flex-1 bg-gray-100 h-full">
                <CircularGalery3D 
                    selectedType={selectedType}
                />
            </div>
        </div>
    );
};

export default Index;