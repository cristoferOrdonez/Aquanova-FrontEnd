import ImageCard from './../gallery/ImageCard.jsx';
import AnimatedBackground from './../gallery/AnimatedBackground.jsx';
import { useGeoLevelSelectionContext, useImageGalleryContext } from './../../hooks/useGeoLevelCreationContext.js';

/**
 * Componente Gallery - Vista de subida de imagen única.
 * La API solo admite una imagen por registro (metadata.imagen en Cloudinary).
 * Formatos aceptados: JPEG, PNG, WebP, AVIF, GIF, SVG. Máximo 10 MB.
 *
 * En modo edición, muestra la imagen existente de Cloudinary si la hay,
 * con opción de reemplazarla subiendo una nueva.
 */
const Gallery = () => {
  const { selectedGeoLevel, backgroundConfig, isEditMode, existingImageUrl } = useGeoLevelSelectionContext();
  const { slots, isDragging, triggerInput, inputRefs, handleInputChange } = useImageGalleryContext();

  // La imagen a mostrar: la nueva subida (slots[0]) tiene prioridad sobre la existente de Cloudinary
  const currentImage = slots[0] || existingImageUrl || null;
  const hasExistingImage = isEditMode && existingImageUrl && !slots[0];

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
          Imagen {selectedGeoLevel === 'localidad' ? 'de la ' : 'del '} <span className="text-blue-400">{selectedGeoLevel}</span>
        </h2>
        <p className="text-gray-300 text-base font-light leading-relaxed">
          {isEditMode
            ? 'Puedes actualizar la imagen actual subiendo una nueva.'
            : 'Sube una fotografía para destacar este espacio.'}
          <br /> <span className="text-gray-500 text-sm">Formatos: JPEG, PNG, WebP, AVIF, GIF, SVG · Máx. 10 MB</span>
        </p>
      </div>

      {/* --- IMAGEN ÚNICA --- */}
      <div className="relative w-full max-w-md h-[400px] flex items-center justify-center z-10">
        <ImageCard
          index={0}
          isActive={true}
          showDragOverlay={isDragging}
          isPrev={false}
          isNext={false}
          offset={0}
          imagePreview={currentImage}
        />
      </div>

      {/* --- BOTÓN ACTUALIZAR IMAGEN (visible cuando hay imagen existente de Cloudinary) --- */}
      {hasExistingImage && (
        <div className="relative z-10 mt-6 animate-fade-in-up">
          {/* Input oculto para el botón externo */}
          <input
            type="file"
            ref={(el) => (inputRefs.current['update-btn'] = el)}
            onChange={(e) => handleInputChange(e, 0)}
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml"
            className="hidden"
          />
          <button
            onClick={() => triggerInput(0)}
            className="
              flex items-center gap-3 px-6 py-3
              bg-blue-600/80 hover:bg-blue-500 
              text-white font-medium text-sm
              rounded-full backdrop-blur-md
              border border-blue-400/30
              transition-all duration-300
              hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25
              active:scale-95
            "
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar imagen
          </button>

          <p className="text-center text-gray-500 text-xs mt-2">
            Imagen actual de Cloudinary
          </p>
        </div>
      )}

      {/* --- Indicador de nueva imagen seleccionada --- */}
      {isEditMode && slots[0] && existingImageUrl && (
        <div className="relative z-10 mt-4 animate-fade-in-up">
          <p className="text-center text-green-400 text-sm font-medium">
            ✓ Nueva imagen seleccionada — se actualizará al guardar
          </p>
        </div>
      )}
    </div>
  );
};

export default Gallery;