import React, { useState } from 'react';

const CommonSelector = ({
    options,
    selectedOption, setSelectedOption,
    widthSelector,
    scaleOptions,
    translateX
}) => {

    const [isSelectorOpen, setIsSelectorOpen] = useState(false);

    return (
        <div className={`tablet:w-${widthSelector} w-auto relative`}>
            <div 
            onClick={() => setIsSelectorOpen(!isSelectorOpen)}
            className="
                bg-[var(--selectors-and-search-bars)] 
                border-[1.5px] border-[var(--stroke-selectors-and-search-bars)] 
                rounded-[14px] 
                px-2.5
                py-1.5 
                flex items-center justify-between 
                cursor-pointer 
                hover:bg-[var(--stroke-selectors-and-search-bars)]
                [@media(pointer:coarse)]:active:bg-[var(--stroke-selectors-and-search-bars)] 
                transition-colors
            "
            >
            <span className="tablet:text-base text-[15px] text-[var(--text)] opacity-90 truncate max-w-[85%]">
                {selectedOption}
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

            <div className={`
            absolute z-10 tablet:w-[${scaleOptions}%] w-full -mt-1.5 
            bg-white 
            border-[1.5px] border-[var(--card-stroke)] 
            rounded-[14px] 
            tablet:translate-x-${translateX}
            shadow-lg 
            overflow-hidden
            
            transition-all duration-300 ease-out origin-top
            ${isSelectorOpen 
                ? 'opacity-100 scale-100 translate-y-0 visible' 
                : 'opacity-0 scale-95 -translate-y-2 invisible pointer-events-none'}
            `}>
            {options.map((option, index) => (
                <div 
                key={index}
                onClick={() => {
                    setSelectedOption(option);
                    setIsSelectorOpen(false);
                }}
                className="
                    px-4 py-2 
                    tablet:text-normal text-[15px] text-[var(--text)] opacity-90 
                    hover:bg-[var(--stroke-selectors-and-search-bars)]
                    [@media(pointer:coarse)]:active:bg-[var(--stroke-selectors-and-search-bars)]
                    cursor-pointer 
                    transition-colors"
                >
                {option}
                </div>
            ))}
            </div>
        </div>
    )
}

export default CommonSelector;