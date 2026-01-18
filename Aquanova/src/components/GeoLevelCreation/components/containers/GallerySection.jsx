import Carousel from './../gallery/Carousel.jsx';
import NavigationControl from './../gallery/NavigationControl.jsx';
import AnimatedBackground from './../gallery/AnimatedBackground.jsx';
import { useGeoLevelSelectionContext, useImageGalleryContext } from './../../hooks/useGeoLevelCreationContext.js';

/**
 * Componente Gallery - Muestra la galería de imágenes con fondo animado
 * Consume el contexto directamente, eliminando prop drilling
 */
const Gallery = () => {
  const { selectedGeoLevel, backgroundConfig } = useGeoLevelSelectionContext();
  const { handleNext, handlePrev } = useImageGalleryContext();

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-screen overflow-hidden bg-gray-900">
      
      {/* --- BACKGROUND ANIMADO --- */}
      <div className="absolute inset-0 z-0">
        {(backgroundConfig ?? []).map((bg, index) => {
          const isActive = selectedGeoLevel === bg.id;

          return (
          <AnimatedBackground 
              key={bg.id ?? index}
              index={index}
              bg={bg}
              isActive={isActive}
          />
          );
        
        })}
        {/* Capa oscura superpuesta */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none"></div>
      </div>

      {/* --- HEADER --- */}
      <div className="relative z-10 text-center mb-8 max-w-lg px-4 animate-fade-in-down">
        <h2 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-xl mb-2">
          Galería {selectedGeoLevel === 'localidad'? 'de la ' : 'del '} <span className="text-blue-400">{selectedGeoLevel}</span>
        </h2>
        <p className="text-gray-300 text-base font-light leading-relaxed">
          Sube hasta 5 fotografías para destacar este espacio. 
          <br/> Selecciona una tarjeta para empezar.
        </p>
      </div>

      {/* --- CAROUSEL MODERNO --- */}
      <Carousel />

      {/* --- CONTROLES DE NAVEGACIÓN --- */}
      <NavigationControl
        handlePrev={handlePrev}
        handleNext={handleNext}
      />
    </div>
  );
};

export default Gallery;