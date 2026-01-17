import SlideDot from './SlideDot.jsx';
import { useImageGalleryContext } from '../hooks/useGeoLevelCreationContext.js';

/**
 * Componente NavigationControl - Controles de navegación del carrusel
 * Consume el contexto directamente
 */
function NavigationControl({ handlePrev, handleNext }) {
    const { slots, activeIndex, goToSlide } = useImageGalleryContext();
    return (
        <div className="relative z-20 flex gap-6 mt-8">
            <button onClick={handlePrev} className="group w-14 h-14 rounded-full bg-white/5 border border-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center transition-all active:scale-95">
            <svg className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-black/20 rounded-full backdrop-blur-sm border border-white/5">
                {slots?.map((_, index) => (
                    <SlideDot 
                        key={index}
                        index={index}
                        goToSlide={goToSlide}
                        activeIndex={activeIndex}
                    />
                ))}
            </div>

            <button onClick={handleNext} className="group w-14 h-14 rounded-full bg-white/5 border border-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center transition-all active:scale-95">
            <svg className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
        </div>
    );
}

export default NavigationControl;