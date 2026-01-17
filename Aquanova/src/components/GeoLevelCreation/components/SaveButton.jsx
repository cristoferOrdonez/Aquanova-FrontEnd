function SaveButton({ onClick, disabled = false, children = 'Guardar', loadingText = 'Guardando ...' }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            aria-busy={disabled}
            className={`mt-2 w-full py-2.5 ${disabled ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'} text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-blue-900/20`}
        >
            {disabled ? loadingText : children}
        </button>
    );
}

export default SaveButton;