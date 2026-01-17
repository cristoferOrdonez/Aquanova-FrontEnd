import { useState, useRef } from "react";
import { GEOLEVEL_CONFIG } from "../config/geolevelConfig";

/**
 * Hook para manejar la galería de imágenes con funcionalidad de carrusel y drag & drop
 * Utiliza la configuración centralizada para la cantidad de slots
 * @returns {Object} Estado y funciones de la galería
 */
export function useImageGallery() {
    const slotsQuantity = GEOLEVEL_CONFIG.GALLERY_SLOTS_QUANTITY;
    // Estado
    const [slots, setSlots] = useState(Array(slotsQuantity).fill(null));
    const [activeIndex, setActiveIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const inputRefs = useRef([]);

    // --- Lógica de Navegación Circular ---
    const handleNext = () => {
        setActiveIndex((prev) => (prev + 1) % slotsQuantity);
    };

    const handlePrev = () => {
        setActiveIndex((prev) => (prev - 1 + slotsQuantity) % slotsQuantity);
    };

    const goToSlide = (index) => {
        setActiveIndex(index);
    };

    // --- Manejo de Archivos ---
    const handleFile = (file, index) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newSlots = [...slots];
                newSlots[index] = reader.result;
                setSlots(newSlots);
                setActiveIndex(index);
                setIsDragging(false); 
            };
            reader.readAsDataURL(file);
        } else {
            alert("Formato no válido. Por favor sube una imagen (JPG, PNG).");
            setIsDragging(false);
        }
    };

    const handleInputChange = (e, index) => {
        const file = e.target.files[0];
        if (file) handleFile(file, index);
    };

    const triggerInput = (index) => {
        inputRefs.current[index]?.click();
    };

    // --- Drag & Drop ---
    const handleDrop = (e, index) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0], index);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDragging) setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.currentTarget.contains(e.relatedTarget)) return;
        setIsDragging(false);
    };

    // --- Acciones de Tarjeta ---
    const handleRemoveImage = (e, index) => {
        e.stopPropagation();
        const newSlots = [...slots];
        newSlots[index] = null;
        setSlots(newSlots);
        if (inputRefs.current[index]) inputRefs.current[index].value = "";
    };

    const handleOpenNewTab = (e, imgUrl) => {
        e.stopPropagation();
        if (imgUrl) {
            const newWindow = window.open();
            newWindow.document.writeln(
                `<body style="margin:0;display:flex;align-items:center;justify-content:center;background:#111;">
                <img src="${imgUrl}" style="max-width:100%;max-height:100vh;box-shadow:0 0 20px rgba(0,0,0,0.5);" />
                </body>`
            );
        }
    };

    // --- Exportar metadata para enviar al backend ---
    const buildMetadata = () => {
        const images = slots
            .map((s, idx) => ({ dataUrl: s, index: idx }))
            .filter((it) => it.dataUrl != null)
            .map((it) => {
                // Generar nombre simple y detectar mime si es data url
                const match = typeof it.dataUrl === 'string' && it.dataUrl.match(/^data:(image\/[^;]+);base64,(.*)$/);
                const mime = match ? match[1] : 'image/*';
                const data = match ? match[2] : it.dataUrl;
                const filename = `img_${Date.now()}_${it.index}`;
                return { filename, mime, dataUrl: it.dataUrl, data, index: it.index };
            });

        return { images };
    };

    return {
        // Estado
        slots,
        setSlots,
        activeIndex,
        setActiveIndex,
        isDragging,
        setIsDragging,
        inputRefs,

        // Navegación
        handleNext,
        handlePrev,
        goToSlide,

        // Manejo de archivos y drag & drop
        handleFile,
        handleInputChange,
        triggerInput,
        handleDrop,
        handleDragOver,
        handleDragLeave,

        // Acciones
        handleRemoveImage,
        handleOpenNewTab,
        // Export helpers
        buildMetadata,
    };
}
