import React, { useState, useRef } from 'react';
import NeighborhoodBackground from './../../../assets/images/bg_neighborhood.jpg';

const ZeroGGyroGallery = ({ selectedType = "Inmueble" }) => {
  // --- LÓGICA ORIGINAL ---
  const SLOTS_QUANTITY = 5;
  const ANGLE_PER_SLOT = 360 / SLOTS_QUANTITY;

  const [slots, setSlots] = useState(Array(SLOTS_QUANTITY).fill(null));
  const [currentDeg, setCurrentDeg] = useState(0);
  const [dragActiveIndex, setDragActiveIndex] = useState(null);
  const inputRefs = useRef([]);

  const rotate = (direction) => {
    setCurrentDeg((prev) => (direction === 'next' ? prev - ANGLE_PER_SLOT : prev + ANGLE_PER_SLOT));
  };

  const getActiveIndex = () => {
    const steps = Math.round(currentDeg / ANGLE_PER_SLOT);
    const activeIndex = ((-steps % SLOTS_QUANTITY) + SLOTS_QUANTITY) % SLOTS_QUANTITY;
    return activeIndex;
  };
  const activeIndex = getActiveIndex();

  const handleFile = (file, index) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newSlots = [...slots];
        newSlots[index] = reader.result;
        setSlots(newSlots);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Archivo no válido.");
    }
  };

  const handleInputChange = (e, index) => {
    if (e.target.files && e.target.files[0]) handleFile(e.target.files[0], index);
  };

  const triggerInput = (index) => inputRefs.current[index]?.click();

  const handleDragEnter = (e, index) => {
    e.preventDefault(); e.stopPropagation();
    setDragActiveIndex(index);
  };
  const handleDragLeave = (e, index) => {
    e.preventDefault(); e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setDragActiveIndex(null);
  };
  const handleDragOver = (e) => e.preventDefault();
  
  const handleDrop = (e, index) => {
    e.preventDefault(); e.stopPropagation();
    setDragActiveIndex(null);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0], index);
  };

  const handleRemoveImage = (e, index) => {
    e.stopPropagation();
    const newSlots = [...slots];
    newSlots[index] = null;
    setSlots(newSlots);
    if (inputRefs.current[index]) inputRefs.current[index].value = "";
  };

  const handleOpenNewTab = (e, imgUrl) => {
    e.stopPropagation();
    if (imgUrl) window.open(imgUrl, '_blank');
  };

  const filledCount = slots.filter(Boolean).length;

  // --- LÓGICA DE ÓRBITA FLOTANTE ---
  const getOrbitalStyle = (index) => {
    // Calculamos el ángulo absoluto actual de este slot
    const angle = (index * ANGLE_PER_SLOT) + currentDeg;
    // Normalizamos el ángulo para cálculos de distancia (0 a 360)
    const normalizedAngle = ((angle % 360) + 360) % 360;
    
    // Distancia al frente (0 grados es frente)
    let distFromFront = Math.abs(normalizedAngle);
    if (distFromFront > 180) distFromFront = 360 - distFromFront;
    
    const isFront = distFromFront < 30; // Tolerancia para considerar "frente"
    
    // OSCILACIÓN VERTICAL (WAVE)
    // Usamos seno para que suban y bajen suavemente mientras giran
    const verticalOffset = Math.sin((angle * Math.PI) / 180) * 80; 

    // Radio de la órbita
    const radius = 350;

    return {
      // La transformación combina rotación en Y con oscilación en Y
      transform: `rotateY(${angle}deg) translateZ(${radius}px) translateY(${verticalOffset}px) rotateY(${-angle}deg)`, 
      // El último rotateY(-angle) es el truco de "Billboard": deshace la rotación para mirar al frente
      
      zIndex: 1000 - Math.floor(distFromFront),
      opacity: isFront ? 1 : 0.5 - (distFromFront * 0.001),
      filter: isFront ? 'none' : `blur(${distFromFront * 0.04}px) brightness(60%)`,
      scale: isFront ? 1.1 : 0.8,
      pointerEvents: isFront ? 'auto' : 'none',
    };
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0a0a0a] font-sans flex flex-col items-center justify-center selection:bg-purple-500/30">
      
      {/* --- BACKGROUND CÓSMICO --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src={NeighborhoodBackground} 
          alt="Atmosphere"
          className="w-full h-full object-cover opacity-20 filter blur-xl contrast-150 saturate-0" 
        />
        {/* Viñeta radial para dar profundidad infinita */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#0a0a0a]/90 to-[#0a0a0a]"></div>
        {/* Partículas estáticas (estrellas) */}
        <div className="absolute inset-0 bg-[radial-gradient(white_1px,transparent_1px)] [background-size:50px_50px] opacity-10"></div>
      </div>

      {/* --- HEADER FLOTANTE --- */}
      <div className="absolute top-10 z-30 text-center mix-blend-screen">
        <h1 className="text-5xl md:text-6xl font-thin tracking-tighter text-white/90">
          O R B I T <span className="text-purple-400 font-bold">.</span> {selectedType}
        </h1>
        <div className="flex items-center justify-center gap-2 mt-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
            <span className="text-xs text-purple-200/50 tracking-[0.5em] uppercase">
                Sincronización: {Math.round((filledCount / SLOTS_QUANTITY) * 100)}%
            </span>
        </div>
      </div>

      {/* --- GYROSCOPE STAGE (ESCENARIO 3D) --- */}
      <div className="relative w-full h-[600px] flex items-center justify-center perspective-container z-20">
        
        {/* Anillos Decorativos del Giroscopio (Fijos o rotando lento) */}
        <div className="absolute w-[700px] h-[700px] border border-white/5 rounded-full animate-[spin_60s_linear_infinite] pointer-events-none transform-style-3d rotate-x-60"></div>
        <div className="absolute w-[600px] h-[600px] border border-dashed border-purple-500/10 rounded-full animate-[spin_40s_linear_infinite_reverse] pointer-events-none transform-style-3d rotate-x-60"></div>
        <div className="absolute w-[200px] h-[200px] bg-purple-900/10 blur-3xl rounded-full animate-pulse pointer-events-none"></div>

        {/* CONTENEDOR DE CARTAS (Inclinado para efecto orbital) */}
        <div className="relative w-0 h-0 transform-style-3d" style={{ transform: 'rotateX(-10deg)' }}> {/* Leve inclinación de cámara */}
            
            {slots.map((imagePreview, index) => {
                const style = getOrbitalStyle(index);
                const isActive = activeIndex === index;
                const isDragging = dragActiveIndex === index;
                const hasImage = !!imagePreview;

                return (
                    <div
                        key={index}
                        // Aplicamos el estilo calculado + transición suave
                        style={{ ...style, transition: 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), z-index 0s' }} 
                        className={`
                            absolute top-[-220px] left-[-150px] /* Centrar elemento de 300x440 */
                            w-[300px] h-[440px] rounded-3xl
                            /* Estilo Vidrio Espacial */
                            bg-gradient-to-br from-white/10 to-transparent backdrop-blur-md
                            border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]
                            flex flex-col overflow-hidden group
                            ${isActive && isDragging ? 'ring-2 ring-purple-400 bg-purple-900/20' : ''}
                        `}
                        onDragEnter={(e) => isActive && handleDragEnter(e, index)}
                        onDragLeave={(e) => isActive && handleDragLeave(e, index)}
                        onDragOver={(e) => isActive && e.preventDefault()}
                        onDrop={(e) => isActive && handleDrop(e, index)}
                        onClick={() => isActive && !hasImage && triggerInput(index)}
                    >
                        <input type="file" ref={(el) => (inputRefs.current[index] = el)} onChange={(e) => handleInputChange(e, index)} accept="image/*" className="hidden" />

                        {/* Brillo en el borde superior (luz ambiental) */}
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>

                        {hasImage ? (
                            // CON IMAGEN
                            <div className="relative w-full h-full">
                                <img src={imagePreview} alt="Orbital Item" className="w-full h-full object-cover opacity-90 transition-opacity group-hover:opacity-100" />
                                
                                {isActive && (
                                    <div className="absolute top-4 right-4 flex flex-col gap-2 z-30 translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                        <button onClick={(e) => handleOpenNewTab(e, imagePreview)} className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-purple-600 hover:border-purple-400 transition-colors">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                                        </button>
                                        <button onClick={(e) => handleRemoveImage(e, index)} className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-red-400 flex items-center justify-center hover:bg-red-600 hover:text-white hover:border-red-400 transition-colors">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                )}
                                
                                {/* Info Overlay Bottom */}
                                <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    <p className="text-white text-sm font-medium">Archivo cargado</p>
                                    <p className="text-white/40 text-xs font-mono mt-1">ID: IMG-{index}X8</p>
                                </div>
                            </div>
                        ) : (
                            // VACÍO (ESTRUCTURA DE ALAMBRE)
                            <div className={`w-full h-full flex flex-col items-center justify-center relative ${isActive ? 'cursor-pointer' : ''}`}>
                                <div className="absolute inset-4 border border-dashed border-white/10 rounded-2xl"></div>
                                
                                {/* Círculo central animado */}
                                <div className="relative w-24 h-24 flex items-center justify-center mb-6">
                                    <div className={`absolute inset-0 border border-purple-500/30 rounded-full ${isActive ? 'animate-ping' : ''}`} style={{animationDuration: '3s'}}></div>
                                    <div className="absolute inset-2 border border-white/10 rounded-full"></div>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className={`w-8 h-8 text-white/50 ${isDragging && isActive ? 'text-purple-400 scale-125' : ''} transition-all`}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                </div>

                                {isActive ? (
                                    <div className="text-center z-10">
                                        <p className="text-purple-300 text-xs font-bold tracking-widest uppercase mb-1">
                                            {isDragging ? 'Soltar Enlace' : 'Inicializar'}
                                        </p>
                                        <p className="text-white/30 text-[10px]">Click para explorar archivos</p>
                                    </div>
                                ) : (
                                    <span className="text-white/10 font-mono text-4xl font-bold">0{index + 1}</span>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
      </div>

      {/* --- CONTROLES DE NAVEGACIÓN --- */}
      <div className="absolute bottom-12 z-30 flex items-center justify-center w-full gap-20">
            {/* Botón Orbita Izquierda */}
            <button 
                onClick={() => rotate('prev')}
                className="group relative w-16 h-16 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-purple-500/50 transition-all active:scale-95 flex items-center justify-center"
            >
                <div className="absolute inset-0 rounded-full border-t border-purple-500/50 opacity-0 group-hover:opacity-100 group-hover:animate-spin transition-opacity"></div>
                <svg className="w-6 h-6 text-white/70 group-hover:text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" /></svg>
            </button>
            
            {/* Indicador de posición (Puntos) */}
            <div className="flex gap-3">
                {slots.map((_, i) => (
                    <div key={i} className={`h-1 rounded-full transition-all duration-500 ${activeIndex === i ? 'w-8 bg-purple-500 shadow-[0_0_10px_#a855f7]' : 'w-1 bg-white/20'}`}></div>
                ))}
            </div>

            {/* Botón Orbita Derecha */}
            <button 
                onClick={() => rotate('next')}
                className="group relative w-16 h-16 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-purple-500/50 transition-all active:scale-95 flex items-center justify-center"
            >
                <div className="absolute inset-0 rounded-full border-t border-purple-500/50 opacity-0 group-hover:opacity-100 group-hover:animate-spin transition-opacity" style={{animationDirection: 'reverse'}}></div>
                <svg className="w-6 h-6 text-white/70 group-hover:text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
            </button>
      </div>

      <style>{`
        .perspective-container {
            perspective: 1000px;
        }
        .transform-style-3d {
            transform-style: preserve-3d;
        }
        /* Animación suave para los anillos de fondo */
        .rotate-x-60 {
            transform: rotateX(60deg);
        }
      `}</style>
    </div>
  );
};

export default ZeroGGyroGallery;