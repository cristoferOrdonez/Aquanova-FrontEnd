import React from 'react';
import ExitButton from './ExitButton';

export const PROPERTY_OPTION = 'predio';
export const NEIGHBORHOOD_OPTION = 'barrio';
export const LOCALITY_OPTION = 'localidad';

// Iconos (Mismos SVGs, pero ajustados en uso abajo)
const ICONS = {
    predio: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
    ),
    barrio: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
    ),
    localidad: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"></path></svg>
    ),
    chevronDown: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
    )
};

const OPTIONS = [
    { id: PROPERTY_OPTION, label: 'Predio', icon: ICONS.predio, desc: 'Unidad inmobiliaria' },
    { id: NEIGHBORHOOD_OPTION, label: 'Barrio', icon: ICONS.barrio, desc: 'Sector urbano' },
    { id: LOCALITY_OPTION, label: 'Localidad', icon: ICONS.localidad, desc: 'División admin.' },
];

export const InitialLevelGrid = ({ handleSelect }) => {               
    return ( 
        <div className="flex-1 flex flex-col items-center justify-center w-full h-full animate-fade-in">
            <div className="absolute top-6 right-6">
                <ExitButton />
            </div>

            <div className="flex flex-col items-center justify-center gap-8 w-full px-4">
                <div className="text-center space-y-1 mb-4">
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        Tipo de Registro
                    </h1>
                    <p className="text-gray-500 text-sm">Selecciona el nivel geográfico para continuar.</p>
                </div>

                <div className="flex flex-wrap gap-4 justify-center w-full max-w-4xl">
                    {OPTIONS.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => handleSelect(opt.id)}
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
                    ))}
                </div>
            </div>
        </div>
    )
}

export const CompactLevelControl = ({ selectedType, isMenuOpen, setIsMenuOpen, handleSelect }) => {
    return (
        <div className="relative z-50">
            <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`
                    flex items-center gap-2.5 px-4 py-2 
                    bg-gray-800/50 hover:bg-gray-800
                    border border-white/5 hover:border-gray-600
                    rounded-lg
                    transition-all duration-200
                    text-gray-200
                    ${isMenuOpen ? 'bg-gray-800 border-gray-600' : ''}
                `}
            >
                <span className="text-gray-400 group-hover:text-blue-400">
                    {React.cloneElement(OPTIONS.find(o => o.id === selectedType)?.icon, { width: 16, height: 16 })}
                </span>
                <span className="font-medium text-xs uppercase tracking-wide">{selectedType}</span>
                <span className={`text-gray-500 w-3 h-3 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}>
                    {ICONS.chevronDown}
                </span>
            </button>

            {isMenuOpen && (
                <div className="
                    absolute top-full left-0 mt-1 w-48 
                    bg-gray-800 border border-gray-700
                    rounded-lg shadow-xl
                    overflow-hidden flex flex-col 
                    animate-in fade-in zoom-in-95 duration-100
                ">
                    {OPTIONS.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => handleSelect(opt.id)}
                            className={`
                                flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                                ${selectedType === opt.id 
                                    ? 'bg-blue-900/20 text-blue-400 font-medium' 
                                    : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'}
                            `}
                        >
                            <span className="scale-75">{opt.icon}</span>
                            <span className="text-xs font-medium">{opt.label}</span>
                        </button>
                    ))}
                </div>
            )}
            
            {isMenuOpen && <div className="fixed inset-0 z-[-1]" onClick={() => setIsMenuOpen(false)}></div>}
        </div>
    )
}