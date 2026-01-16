import React, { useState } from 'react';

const CommonSelector = ({
    options,
    selectedOption, 
    setSelectedOption,
    widthSelector = "full",
    translateX
}) => {

    const [isSelectorOpen, setIsSelectorOpen] = useState(false);

    return (
        <div className={`relative w-full ${widthSelector === 'auto' ? 'w-auto' : ''}`}>
            {/* Botón Principal */}
            <div 
                onClick={() => setIsSelectorOpen(!isSelectorOpen)}
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
                    ${isSelectorOpen ? 'border-blue-500/50 ring-1 ring-blue-500/50 bg-gray-800' : ''}
                `}
            >
                <span className={`text-sm font-medium truncate ${selectedOption.includes("Seleccione") ? 'text-gray-500' : 'text-gray-200'}`}>
                    {selectedOption}
                </span>

                <svg 
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 group-hover:text-gray-300 ${isSelectorOpen ? 'rotate-180 text-blue-400' : ''}`}
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
                ${isSelectorOpen 
                    ? 'opacity-100 scale-100 translate-y-0 visible' 
                    : 'opacity-0 scale-95 -translate-y-1 invisible pointer-events-none'}
            `}>
                <div className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
                    {options.map((option, index) => (
                        <div 
                            key={index}
                            onClick={() => {
                                setSelectedOption(option);
                                setIsSelectorOpen(false);
                            }}
                            className="
                                px-4 py-2
                                text-sm text-gray-300
                                cursor-pointer 
                                transition-colors duration-150
                                hover:bg-gray-700 hover:text-white
                            "
                        >
                            {option}
                        </div>
                    ))}
                </div>
            </div>
            
            {isSelectorOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setIsSelectorOpen(false)}></div>
            )}
        </div>
    )
}

export default CommonSelector;