import { useImageGalleryContext } from '../hooks/useGeoLevelCreationContext.js';

/**
 * Componente ImageCard - Tarjeta individual de imagen en el carrusel
 * Consume el contexto directamente para acceder a handlers
 */
function ImageCard({
    index,
    isActive,
    showDragOverlay,
    isPrev,
    isNext,
    offset,
    imagePreview
}) {
    const {
        goToSlide,
        inputRefs,
        handleInputChange,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        triggerInput,
        handleOpenNewTab,
        handleRemoveImage
    } = useImageGalleryContext();
    return (
        <div
            key={index}
            onClick={() => goToSlide(index)}
            className={`
                absolute transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)]
                w-[300px] h-[400px] rounded-3xl
                ${isActive ? 'z-30 opacity-100 cursor-default shadow-2xl shadow-blue-900/20' : ''}
                ${isActive && !showDragOverlay ? 'scale-100' : ''} 
                ${showDragOverlay ? 'scale-105' : ''}
                ${isPrev ? 'z-20 -translate-x-[260px] scale-[0.85] opacity-60 cursor-pointer hover:opacity-80 blur-[1px]' : ''}
                ${isNext ? 'z-20 translate-x-[260px] scale-[0.85] opacity-60 cursor-pointer hover:opacity-80 blur-[1px]' : ''}
                ${Math.abs(offset) >= 2 ? 'z-10 opacity-0 scale-50' : ''}
            `}
        >
            {/* Input oculto */}
            <input
            type="file"
            ref={(el) => (inputRefs.current[index] = el)}
            onChange={(e) => handleInputChange(e, index)}
            accept="image/*"
            className="hidden"
            />

            {/* --- TARJETA CONTENEDOR --- */}
            <div 
            className={`
                w-full h-full rounded-3xl overflow-hidden relative group
                bg-white/5 backdrop-blur-md border border-white/10
                transition-all duration-300 flex items-center justify-center
                ${showDragOverlay ? 'border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.3)]' : ''}
            `}
            onDragOver={isActive ? handleDragOver : undefined}
            onDragLeave={isActive ? handleDragLeave : undefined}
            onDrop={(e) => isActive && handleDrop(e, index)}
            >
            
            {/* --- LÓGICA PRINCIPAL DE VISUALIZACIÓN --- */}
            {showDragOverlay ? (
                // ESTADO: ARRASTRANDO
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gray-900/95 backdrop-blur-md border-2 border-dashed border-blue-400 m-1 rounded-2xl animate-pulse pointer-events-none transition-all duration-300">
                    <div className="bg-blue-500/20 p-4 rounded-full mb-3 animate-bounce">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-blue-300">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                    </div>
                    <h3 className="text-white text-lg font-bold tracking-wide drop-shadow-md">Suelta la imagen aquí</h3>
                    <p className="text-blue-200 text-xs mt-1">Se actualizará instantáneamente</p>
                </div>
            ) : (
                // ESTADO NORMAL
                <>
                    {!imagePreview && (
                        <div 
                        onClick={() => isActive && triggerInput(index)}
                        className={`
                            flex flex-col items-center justify-center h-full w-full
                            text-gray-400 hover:text-white transition-colors
                            ${isActive ? 'cursor-pointer' : 'cursor-default pointer-events-none'}
                        `}
                        >
                        <div className={`
                            w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-all duration-300
                            ${isActive ? 'bg-white/10 group-hover:bg-blue-600 group-hover:scale-110 shadow-lg' : 'bg-white/5'}
                        `}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </div>
                        
                        {isActive && (
                            <div className="text-center animate-fade-in-up">
                                <p className="font-medium text-lg">Añadir foto</p>
                                <p className="text-xs text-gray-500 mt-1">Arrastra o haz clic</p>
                            </div>
                        )}
                        </div>
                    )}

                    {imagePreview && (
                        <>
                        <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        
                        {isActive && (
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                            <button onClick={(e) => handleOpenNewTab(e, imagePreview)} className="w-12 h-12 rounded-full bg-white/20 hover:bg-white text-white hover:text-gray-900 backdrop-blur-md flex items-center justify-center transition-all transform hover:scale-110 shadow-lg" title="Ver pantalla completa">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); triggerInput(index); }} className="w-12 h-12 rounded-full bg-blue-600/80 hover:bg-blue-500 text-white backdrop-blur-md flex items-center justify-center transition-all transform hover:scale-110 shadow-lg" title="Reemplazar">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            </button>
                            <button onClick={(e) => handleRemoveImage(e, index)} className="w-12 h-12 rounded-full bg-red-600/80 hover:bg-red-500 text-white backdrop-blur-md flex items-center justify-center transition-all transform hover:scale-110 shadow-lg" title="Eliminar">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                            </div>
                        )}
                        </>
                    )}
                </>
            )}
            </div>
        </div>
    );
    
}

export default ImageCard;