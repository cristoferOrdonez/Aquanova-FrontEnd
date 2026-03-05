function ExitButton({ onClick, disabled = false }) {
    return (
        <button 
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
            className={`
                w-fit pr-4 pl-2.5 py-1 rounded-[30px] border-[1.5px]
                flex flex-row items-center gap-2 transition-all duration-200
                ${disabled
                    ? 'bg-red-50/40 border-red-900/30 text-red-900/40 cursor-not-allowed'
                    : 'bg-red-50 border-red-900 text-red-900 cursor-pointer hover:bg-red-100 transform hover:scale-110'
                }
            `}
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
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
        </svg>

            <span className="text-xs">
            Salir
            </span>
        </button>
    );
}

export default ExitButton;
