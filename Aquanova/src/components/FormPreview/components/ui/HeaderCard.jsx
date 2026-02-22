import React from 'react';

export default function HeaderCard({ form, isMobile, titleSize, descSize, handleHeaderRemove, handleHeaderReplace }) {
  return (
    <div className={`w-full bg-[var(--card-bg)] border-[1.5px] border-[var(--card-stroke)] rounded-[5px] p-6 shadow-sm border-t-[8px] border-t-[var(--blue-buttons)] shrink-0`}>
      { form.imageUrl && (
        <div className={`mb-4 overflow-hidden w-full h-auto ${isMobile ? 'max-h-[200px]' : 'max-h-[400px]'}`}>
          <div className="relative w-full h-full group">
            <img src={form.imageUrl} alt="Form cover" className="w-full h-full object-cover rounded-[12px] transition-transform duration-500 group-hover:scale-[1.01]" />
            <div className="absolute inset-0 z-10 rounded-[12px] bg-[#E0EEFF]/0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out">
              <button onClick={handleHeaderRemove} className="p-2 bg-white rounded-full shadow-sm hover:bg-red-50 hover:text-red-500 text-gray-600 transition-colors transform hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
              </button>
              <label className="p-2 bg-white rounded-full shadow-sm hover:bg-blue-50 hover:text-blue-600 text-gray-600 transition-colors transform hover:scale-110 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files[0]; if (file) handleHeaderReplace(file); }} />
              </label>
            </div>
          </div>
        </div>
      )}
      <h1 className={`${titleSize} font-bold text-[var(--text)] mb-2 break-words leading-tight`}>{form.title}</h1>
      {form.description && (<p className={`${descSize} text-gray-600 whitespace-pre-wrap break-words mt-2`}>{form.description}</p>)}
    </div>
  );
}
