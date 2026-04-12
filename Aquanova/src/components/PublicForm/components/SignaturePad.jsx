import React, { useRef, useState, useEffect } from 'react';

const SignaturePad = ({ onChange, error }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Initialize canvas context when modal opens
  useEffect(() => {
    if (!isOpen) return;
    
    // Prevent scrolling on body when modal is open
    document.body.style.overflow = 'hidden';
    
    const timeout = setTimeout(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      const ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#000000';
      
      // White background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, 100); // small delay to ensure DOM is updated

    return () => {
      document.body.style.overflow = 'auto';
      clearTimeout(timeout);
    };
  }, [isOpen]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const pos = getPos(canvas, e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault(); // Prevent scrolling on touch
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const pos = getPos(canvas, e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
    }
  };

  const getPos = (canvas, e) => {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const saveAndClose = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) {
      // If closing without signature, reset
      onChange(null);
      setPreviewImage(null);
      setIsOpen(false);
      return;
    }
    
    // Save preview for the inline view
    const dataUrl = canvas.toDataURL('image/png');
    setPreviewImage(dataUrl);

    // Convert canvas to File object
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "signature.png", { type: "image/png" });
      onChange(file);
      setIsOpen(false);
    }, 'image/png');
  };

  const clearSignature = (e) => {
    e.stopPropagation();
    onChange(null);
    setHasSignature(false);
    setPreviewImage(null);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-sm font-medium text-gray-700">
        Firma (Requerido) <span className="text-red-500">*</span>
      </label>
      
      {/* Inline Preview / Trigger Button */}
      <div 
        onClick={() => setIsOpen(true)}
        className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
          error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
        }`}
      >
        {previewImage ? (
          <div className="flex flex-col items-center gap-2 w-full">
            <img src={previewImage} alt="Firma" className="max-h-24 object-contain border border-gray-200 bg-white rounded shadow-sm" />
            <span className="text-sm text-green-600 font-medium">Firma guardada. Toca para editar.</span>
            <button 
              type="button"
              onClick={clearSignature}
              className="absolute top-2 right-2 text-xs text-red-500 hover:text-red-700 bg-white border border-red-200 px-2 py-1 rounded"
            >
              Eliminar
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-gray-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span className="font-medium text-sm">Abrir pad para firmar</span>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Fullscreen Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-gray-900 bg-opacity-95 backdrop-blur-sm sm:p-6 p-0 transition-opacity">
          
          {/* Header Actions */}
          <div className="flex items-center justify-between p-4 bg-white rounded-t-2xl sm:rounded-2xl sm:mb-4 shrink-0 shadow-lg">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 active:scale-95 transition-all"
            >
              Cerrar
            </button>
            <h3 className="font-medium text-gray-800">Dibuja tu firma</h3>
            <button
              type="button"
              onClick={saveAndClose}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-95 transition-all"
            >
              Guardar
            </button>
          </div>

          {/* Canvas Container */}
          <div 
            ref={containerRef} 
            className="flex-1 w-full relative bg-white sm:rounded-2xl overflow-hidden touch-none"
          >
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="absolute inset-0 w-full h-full cursor-crosshair bg-white"
            />
            {/* Overlay hint if empty */}
            {!hasSignature && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <span className="text-3xl font-bold text-gray-100 opacity-50 select-none">FIRMA AQUÍ</span>
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="p-4 bg-white sm:rounded-2xl sm:mt-4 shrink-0 flex justify-center pb-8 sm:pb-4 shadow-lg">
            <button
              type="button"
              onClick={clear}
              className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 active:scale-95 transition-all"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Limpiar firma
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignaturePad;