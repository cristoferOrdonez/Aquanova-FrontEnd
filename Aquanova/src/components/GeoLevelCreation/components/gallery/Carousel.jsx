import ImageCard from './ImageCard.jsx';
import { useImageGalleryContext } from '../../hooks/useGeoLevelCreationContext.js';

/**
 * Componente Carousel - Carrusel de imágenes
 * Consume el contexto directamente
 */
function Carousel() {
    const {
        slots,
        activeIndex,
        isDragging,
    } = useImageGalleryContext();

    const slotsQuantity = slots.length;
    return (
        <div className="relative w-full max-w-6xl h-[450px] flex items-center justify-center z-10 perspective-1000">
            {slots?.map((imagePreview, index) => {
                let offset = (index - activeIndex);
                if (offset < -2) offset += slotsQuantity;
                if (offset > 2) offset -= slotsQuantity;
                
                const isActive = offset === 0;
                const isPrev = offset === -1;
                const isNext = offset === 1;
                const isVisible = Math.abs(offset) <= 2; 
                const showDragOverlay = isActive && isDragging;

                if (!isVisible) return null;

                return (
                    <ImageCard 
                        key={index}
                        index = {index}
                        isActive = {isActive}
                        showDragOverlay = {showDragOverlay}
                        isPrev = {isPrev}
                        isNext = {isNext}
                        offset = {offset}
                        imagePreview = {imagePreview}
                    />
                );
            })}
        </div>
    );
}

export default Carousel;