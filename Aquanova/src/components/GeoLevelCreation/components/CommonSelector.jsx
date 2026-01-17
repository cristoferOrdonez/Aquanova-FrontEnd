const CommonSelector = ({
    options,
    selectedOption,
    setSelectedOption,
    isGeoLevelParentSelectorOpen, setIsGeoLevelParentSelectorOpen
}) => {
    // Manejar tanto strings como objetos {id,label}
    const getLabel = (opt) => {
        if (!opt) return '';
        if (typeof opt === 'string') return opt;
        return opt.label ?? opt.name ?? String(opt);
    };

    const displayLabel = getLabel(selectedOption);

    return (
        <div className="relative w-full">
            {/* Botón Principal */}
            <div
                onClick={() => setIsGeoLevelParentSelectorOpen(!isGeoLevelParentSelectorOpen)}
                className={`
                    w-full
                    flex items-center justify-between
                    px-4 py-2.5
                    rounded-lg
                    bg-gray-800/50 
                    border border-gray-700
                    cursor-pointer
                    transition-all duration-200
                    group
                    hover:bg-gray-800 hover:border-gray-600
                    ${isGeoLevelParentSelectorOpen ? 'border-blue-500/50 ring-1 ring-blue-500/50 bg-gray-800' : ''}
                `}
            >
                <span className={`text-sm font-medium truncate ${displayLabel.includes('Seleccione') ? 'text-gray-500' : 'text-gray-200'}`}>
                    {displayLabel}
                </span>

                <svg
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 group-hover:text-gray-300 ${isGeoLevelParentSelectorOpen ? 'rotate-180 text-blue-400' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </div>

            {/* Menú Desplegable */}
            <div className={`
                absolute z-50 w-full mt-1
                bg-gray-800 
                border border-gray-700
                rounded-lg
                shadow-xl
                overflow-hidden
                transition-all duration-200 ease-out origin-top
                ${isGeoLevelParentSelectorOpen
                    ? 'opacity-100 scale-100 translate-y-0 visible'
                    : 'opacity-0 scale-95 -translate-y-1 h-0 invisible pointer-events-none'}
            `}>
                <div className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
                    {options.map((option, index) => {
                        const label = getLabel(option);
                        return (
                            <div
                                key={option?.id ?? index}
                                onClick={() => {
                                    setSelectedOption(option);
                                    setIsGeoLevelParentSelectorOpen(false);
                                }}
                                className="
                                    px-4 py-2
                                    text-sm text-gray-300
                                    cursor-pointer 
                                    transition-colors duration-150
                                    hover:bg-gray-700 hover:text-white
                                "
                            >
                                {label}
                            </div>
                        );
                    })}
                </div>
            </div>

            {isGeoLevelParentSelectorOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setIsGeoLevelParentSelectorOpen(false)}></div>
            )}
        </div>
    )
}

export default CommonSelector;