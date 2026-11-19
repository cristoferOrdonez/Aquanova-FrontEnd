function SaveButton({ onClick, disabled = false, children = 'Guardar', loadingText = 'Guardando ...' }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            aria-busy={disabled}
            className={`mt-2 w-full py-3 min-h-[44px] ${disabled ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#00A896] hover:bg-[#008F80]'} text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-[#00A896]/20`}
        >
            {disabled ? loadingText : children}
        </button>
    );
}

export default SaveButton;