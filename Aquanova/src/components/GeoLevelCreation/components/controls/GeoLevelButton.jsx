import React from 'react';

function GeoLevelButton({
    opt,
    handleGeoLevelSelect
}) {
    return (
        <button
            onClick={() => handleGeoLevelSelect(opt.id)}
            className="
                group relative
                w-48 h-48 
                rounded-2xl
                bg-gray-800/40 
                border border-white/5
                flex flex-col items-center justify-center gap-4
                transition-all duration-300
                hover:bg-gray-800 hover:border-gray-600 hover:-translate-y-1
            "
        >
            <div className="
                p-3 rounded-full bg-gray-700/50 text-gray-400
                transition-colors duration-300 
                group-hover:bg-blue-600 group-hover:text-white
            ">
                {React.cloneElement(opt.icon, { width: 32, height: 32, strokeWidth: 1.5 })}
            </div>
            <div className="text-center">
                <span className="block text-sm font-semibold text-gray-200 group-hover:text-white transition-colors">{opt.label}</span>
                <span className="block text-xs text-gray-500 mt-1">{opt.desc}</span>
            </div>
        </button>
    );
}

export default GeoLevelButton;