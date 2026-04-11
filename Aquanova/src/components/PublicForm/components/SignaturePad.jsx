import React, { useRef, useState, useEffect } from 'react';

const SignaturePad = ({ onChange, error }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Initialize canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set proper size to avoid scaling issues
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = 200; // Fixed height

    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000000';
    
    // White background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

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
      updateValue();
    }
  };

  const getPos = (canvas, e) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
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
    onChange(null); // Clear value
  };

  const updateValue = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) {
      onChange(null);
      return;
    }
    
    // Convert canvas to File object
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "signature.png", { type: "image/png" });
      onChange(file);
    }, 'image/png');
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-sm font-medium text-gray-700">
        Firma (Requerido) <span className="text-red-500">*</span>
      </label>
      <div className={`relative border rounded-lg overflow-hidden ${error ? 'border-red-500' : 'border-gray-300'}`}>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full bg-white cursor-crosshair touch-none"
        />
        <button
          type="button"
          onClick={clear}
          className="absolute top-2 right-2 px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 text-gray-700"
        >
          Limpiar
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default SignaturePad;