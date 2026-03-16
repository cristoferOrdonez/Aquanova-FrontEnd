import { useNeighborhoodSelectorContext } from './../../../hooks/useFormCreationContext.js';
import FORM_CREATION_CONFIG from '../../../config/formCreationConfig';
import { useState } from 'react';

const NeighborhoodSelector = ({ options = null }) => {
    const {
        selectedOption,
        setSelectedOption,
        isSelectorOpen,
        setIsSelectorOpen,
        toggleSelector,
        options: ctxOptions,
    } = useNeighborhoodSelectorContext();

    const [searchTerm, setSearchTerm] = useState('');

    const list = options ?? ctxOptions ?? [];

    const filteredList = list.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="tablet:w-64 w-auto relative">
            <div
                onClick={() => (toggleSelector ? toggleSelector() : setIsSelectorOpen(!isSelectorOpen))}
            className="
                bg-[var(--selectors-and-search-bars)] 
                border-[1.5px] border-[var(--stroke-selectors-and-search-bars)] 
                rounded-[14px] 
                px-2.5
                py-1.5 
                flex items-center justify-between 
                cursor-pointer 
                hover:bg-[var(--stroke-selectors-and-search-bars)]
                transition-colors
            "
            >
            <span className="tablet:text-base text-[15px] text-[var(--text)] opacity-90 truncate max-w-[85%]">
                                {selectedOption?.label ?? FORM_CREATION_CONFIG.neighborhoodPlaceholder}
            </span>

            <svg 
                className={`w-3 h-3 text-[#000000] opacity-30 transition-transform duration-300 ${isSelectorOpen ? 'rotate-180' : ''}`}
                viewBox="0 0 24 24" 
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M12 18L4 6H20L12 18Z"/>
            </svg>
            </div>

            <div
                className={`
                        absolute z-10 tablet:w-[121%] w-full -mt-1.5 
                        bg-white 
                        border-[1.5px] border-[var(--card-stroke)] 
                        rounded-[14px] 
                        tablet:translate-x-4
                        shadow-lg 
                        max-h-60 overflow-y-auto
            
                        transition-all duration-300 ease-out origin-top
                        ${isSelectorOpen
                            ? 'opacity-100 scale-100 translate-y-0 visible'
                            : 'opacity-0 scale-95 -translate-y-2 invisible pointer-events-none'}
                `}
            >
                <div className="sticky top-0 bg-white border-b border-[var(--card-stroke)] p-2">
                    <input
                        type="text"
                        placeholder="Buscar barrio..."
                        className="w-full text-sm py-1.5 px-3 border border-[var(--card-stroke)] rounded-[8px] focus:outline-none focus:border-[#2138C4]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
                {filteredList.length > 0 ? filteredList.map((option) => (
                    <div
                        key={option.id ?? option.label}
                        onClick={() => {
                            setSelectedOption(option);
                            setIsSelectorOpen(false);
                            setSearchTerm(''); // Clear on select
                        }}
                        className="
                                        px-4 py-2 
                                        tablet:text-normal text-[15px] text-[var(--text)] opacity-90 
                                        hover:bg-[var(--stroke-selectors-and-search-bars)]
                                        cursor-pointer 
                                        transition-colors"
                    >
                        {option.label}
                    </div>
                )) : (
                    <div className="px-4 py-3 text-sm text-[var(--instruction-text)] opacity-50 text-center">
                        No se encontraron resultados
                    </div>
                )}
            </div>
        </div>
    );
};

export default NeighborhoodSelector;
