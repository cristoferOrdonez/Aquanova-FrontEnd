import React, { useState } from 'react';

export default function FileUploadField({ field, value, onChange, sizeClass }) {
  // Asegurarnos de que value sea siempre un array
  const filesArray = Array.isArray(value) ? value : (value ? [value] : []);
  const [activeMenuIndex, setActiveMenuIndex] = useState(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    let validFiles = [];
    let overSize = false;

    selectedFiles.forEach(file => {
      const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        overSize = true;
      } else {
        validFiles.push(file);
      }
    });

    if (overSize) {
      alert(`Algunos archivos son demasiado grandes y fueron omitidos. Máximo 50MB para videos, 10MB para imágenes.`);
    }

    if (validFiles.length === 0) return;

    Promise.all(validFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            name: file.name,
            previewUrl: reader.result,
            type: file.type,
            file: file // Guardar el archivo original para subida posterior
          });
        };
        reader.readAsDataURL(file);
      });
    })).then(newFiles => {
      onChange(field.id, [...filesArray, ...newFiles]);
    });
  };

  const removeFile = (indexToRemove) => {
    const newFiles = filesArray.filter((_, idx) => idx !== indexToRemove);
    onChange(field.id, newFiles.length > 0 ? newFiles : null);
    setActiveMenuIndex(null);
  };

  const openOptions = (idx) => {
    setActiveMenuIndex(activeMenuIndex === idx ? null : idx);
  };

  const openInNewTab = (url, isVideo) => {
    if (url) {
      if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
        window.open(url, '_blank');
      } else {
        const newTab = window.open();
        if (newTab) {
          newTab.document.write(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Archivo Adjunto</title>
              <style>
                body { margin: 0; background-color: #000; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
                img, video { max-width: 100%; max-height: 100%; object-fit: contain; }
              </style>
            </head>
            <body>
              ${isVideo ? `<video src="${url}" controls autoplay></video>` : `<img src="${url}" alt="Vista previa" />`}
            </body>
            </html>
          `);
          newTab.document.close();
        } else {
          alert('Por favor, permite las ventanas emergentes (pop-ups) en tu navegador para ver la imagen.');
        }
      }
    }
    setActiveMenuIndex(null);
  };

  return (
    <div className="mt-2 w-full">
      {filesArray.length === 0 ? (
        <div className="flex flex-col sm:flex-row gap-2 w-full h-auto sm:h-32">
          <label className={`flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-all ${sizeClass}`}>
            <svg aria-hidden="true" className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
            <p className={`mb-1 text-gray-500 text-center ${sizeClass === 'text-xs' ? 'text-[10px]' : 'text-sm'}`}><span className="font-semibold">Subir archivo(s)</span></p>
            <input
              type="file"
              className="hidden"
              accept="image/*,video/*"
              multiple
              onChange={handleFileChange}
            />
          </label>
          <label className={`flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-all ${sizeClass}`}>
            <svg aria-hidden="true" className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            <p className={`mb-1 text-gray-500 text-center ${sizeClass === 'text-xs' ? 'text-[10px]' : 'text-sm'}`}><span className="font-semibold">Tomar foto</span></p>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              capture="camera"
              onChange={handleFileChange}
            />
          </label>
        </div>
      ) : (
        <div className="w-full">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {filesArray.map((fileObj, idx) => {
              const previewUrl = typeof fileObj === 'object' ? fileObj.previewUrl : null;
              const isVideo = typeof fileObj === 'object' && fileObj.type && fileObj.type.startsWith('video/');
              const isStringUrl = typeof fileObj === 'string';

              return (
                <div key={idx} className="relative aspect-square border border-gray-200 rounded-lg overflow-hidden group shadow-sm cursor-pointer" onClick={() => openOptions(idx)}>
                  {previewUrl ? (
                    isVideo ? (
                      <video src={previewUrl} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <img src={previewUrl} alt={`Vista previa ${idx}`} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                    )
                  ) : isStringUrl ? (
                    <div className="absolute inset-0 flex items-center justify-center p-2 bg-gray-50">
                      <span className={`text-gray-600 truncate break-all text-xs text-center`}>{fileObj}</span>
                    </div>
                  ) : null}
                  
                  {activeMenuIndex === idx && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-1 md:p-1.5 gap-1 md:gap-1.5 z-20 backdrop-blur-sm overflow-hidden text-center">
                      <button
                        type="button"
                        className="w-full flex-1 max-h-6 bg-white text-gray-800 text-[9px] sm:text-[10px] rounded shadow-sm hover:bg-gray-100 transition-colors font-medium flex items-center justify-center leading-none"
                        onClick={(e) => { e.stopPropagation(); openInNewTab(previewUrl || fileObj, isVideo || false); }}
                      >
                        Ver
                      </button>
                      <button
                        type="button"
                        className="w-full flex-1 max-h-6 bg-red-500 text-white text-[9px] sm:text-[10px] rounded shadow-sm hover:bg-red-600 transition-colors font-medium flex items-center justify-center leading-none"
                        onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                      >
                        Borrar
                      </button>
                      <button
                        type="button"
                        className="w-full flex-1 max-h-6 bg-gray-500 text-white text-[9px] sm:text-[10px] rounded shadow-sm hover:bg-gray-600 transition-colors font-medium flex items-center justify-center leading-none"
                        onClick={(e) => { e.stopPropagation(); setActiveMenuIndex(null); }}
                      >
                        Cerrar
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            <label className="relative aspect-square border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-all flex flex-col items-center justify-center text-center shadow-sm">
              <svg aria-hidden="true" className="w-6 h-6 mb-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              <span className={`text-gray-500 font-medium ${sizeClass === 'text-xs' ? 'text-[9px]' : 'text-xs'} px-1`}>Añadir archivos</span>
              <input
                type="file"
                className="hidden"
                accept="image/*,video/*"
                multiple
                onChange={handleFileChange}
              />
            </label>
            <label className="relative aspect-square border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-all flex flex-col items-center justify-center text-center shadow-sm">
              <svg aria-hidden="true" className="w-6 h-6 mb-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              <span className={`text-gray-500 font-medium ${sizeClass === 'text-xs' ? 'text-[9px]' : 'text-xs'} px-1`}>Cámara</span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                capture="camera"
                onChange={handleFileChange}
              />
            </label>
          </div>
          <p className={`mt-3 text-gray-400 ${sizeClass === 'text-xs' ? 'text-[10px]' : 'text-xs'}`}>Puedes seguir añadiendo, ya sea de tu galería o cámara. Pulsa un archivo para ver opciones.</p>
        </div>
      )}
    </div>
  );
}
