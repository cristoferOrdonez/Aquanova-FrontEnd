import React from 'react';

export default function FileUploadField({ field, value, onChange, sizeClass }) {
  const previewUrl = value && typeof value === 'object' ? value.previewUrl : null;

  return (
    <div className="mt-2">
      <label className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors overflow-hidden ${sizeClass}`}>
        {previewUrl ? <img src={previewUrl} alt="Vista previa" className="absolute inset-0 w-full h-full object-cover" /> : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg aria-hidden="true" className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
            <p className={`mb-2 text-gray-500 text-center ${sizeClass === 'text-xs' ? 'text-[10px]' : 'text-sm'}`}><span className="font-semibold">Click para subir</span></p>
            <p className={`text-gray-500 text-center ${sizeClass === 'text-xs' ? 'text-[8px]' : 'text-xs'}`}>PNG, JPG (MAX. 10MB)</p>
          </div>
        )}
        <input type="file" className="hidden" accept="image/*" onChange={(e) => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { onChange(field.id, { name: file.name, previewUrl: reader.result }); }; reader.readAsDataURL(file); }} />
      </label>
      {previewUrl && (
        <div className="flex gap-2 mt-2">
          <label className={`inline-flex items-center justify-center px-3 py-1.5 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer transition ${sizeClass === 'text-xs' ? 'text-[10px]' : 'text-sm'}`}>
            Cambiar imagen
            <input type="file" className="hidden" accept="image/*" onChange={(e) => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { onChange(field.id, { name: file.name, previewUrl: reader.result }); }; reader.readAsDataURL(file); }} />
          </label>
          <button type="button" className={`inline-flex items-center justify-center px-3 py-1.5 rounded-md border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition ${sizeClass === 'text-xs' ? 'text-[10px]' : 'text-sm'}`} onClick={() => onChange(field.id, null)}>Quitar imagen</button>
        </div>
      )}
      {!previewUrl && value && typeof value === 'string' && (<div className={`text-gray-600 mt-1 truncate ${sizeClass === 'text-xs' ? 'text-[10px]' : 'text-sm'}`}>Archivo: {value}</div>)}
    </div>
  );
}
