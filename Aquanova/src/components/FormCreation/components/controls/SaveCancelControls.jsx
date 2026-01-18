export default function SaveCancelControls({ onSave, onCancel }) {
  return (
    <div className="gap-2 flex flex-row [@media(pointer:coarse)]:flex-col items-center justify-center">
      <button
        onClick={onSave}
        className="
          group flex h-8 items-center justify-center rounded-full border border-emerald-500 bg-emerald-50 p-1.5 transition-all duration-300 ease-in-out hover:bg-emerald-100 hover:pr-3 cursor-pointer
        "
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span className="max-w-0 overflow-hidden whitespace-nowrap tablet:text-sm text-[13px] font-medium text-emerald-600 opacity-0 transition-all duration-300 ease-out group-hover:ml-2 group-hover:max-w-[100px] group-hover:opacity-100">Aceptar</span>
      </button>

      <button
        onClick={onCancel}
        className="
          group flex h-8 items-center justify-center rounded-full border border-red-800/30 bg-red-50 p-1.5 transition-all duration-300 ease-in-out hover:bg-red-100 hover:pr-3 cursor-pointer
        "
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-900 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
        <span className="max-w-0 overflow-hidden whitespace-nowrap tablet:text-sm text-[13px] font-medium text-red-900 opacity-0 transition-all duration-300 ease-out group-hover:ml-2 group-hover:max-w-[100px] group-hover:opacity-100">Cancelar</span>
      </button>
    </div>
  );
}
