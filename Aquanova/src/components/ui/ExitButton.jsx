function ExitButton() {
    return (
        <button 
            className="
                w-fit pr-4 pl-2.5 py-1 bg-red-50 rounded-[30px] border-[1.5px] border-red-900
                hover:bg-red-100 text-red-900 transition-colors transform hover:scale-110
                flex flex-row items-center gap-2 cursor-pointer

                [@media(pointer:coarse)]:active:bg-red-100
                [@media(pointer:coarse)]:active:scale-110
            "
        >
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="w-7 h-7"
        >
        {/* Marco de la puerta (Lado izquierdo) */}
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            
            {/* Punta de la flecha */}
            <polyline points="16 17 21 12 16 7" />
            
            {/* Línea de la flecha */}
            <line x1="21" y1="12" x2="9" y2="12" />
        </svg>

            <span className="text-xs">
            Salir
            </span>
        </button>
    );
}

export default ExitButton;