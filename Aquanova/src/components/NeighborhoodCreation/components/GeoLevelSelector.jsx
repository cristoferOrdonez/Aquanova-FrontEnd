import ExitButton from './../../ui/ExitButton';

export const PROPERTY_OPTION = 'predio';
export const NEIGHBORHOOD_OPTION = 'barrio';
export const LOCALITY_OPTION = 'localidad';

// Iconos SVG simples para no usar librerías externas
const ICONS = {
    predio: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
    ),
    barrio: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
            <line x1="8" y1="2" x2="8" y2="18"></line>
            <line x1="16" y1="6" x2="16" y2="22"></line>
        </svg>
    ),
    localidad: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
    ),
    chevronDown: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
    )
};

const OPTIONS = [
    { id: PROPERTY_OPTION, label: 'Predio', icon: ICONS.predio },
    { id: NEIGHBORHOOD_OPTION, label: 'Barrio', icon: ICONS.barrio },
    { id: LOCALITY_OPTION, label: 'Localidad', icon: ICONS.localidad },
];

export const InitialLevelGrid = ({
    handleSelect
}) => {               
    return ( 
        <div className="flex-1 flex flex-col gap-12 items-end animate-in fade-in zoom-in duration-300">
            <ExitButton />
            <div className="flex-1 flex flex-col items-center justify-center gap-8 ">
                <h1 className="text-2xl font-bold mb-4">Seleccione lo que desea registrar</h1>
                <div className="flex flex-wrap gap-6 justify-center">
                    {OPTIONS.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => handleSelect(opt.id)}
                            className="w-40 h-40 bg-white shadow-lg rounded-xl flex flex-col items-center justify-center gap-4 hover:scale-105 hover:bg-blue-50 transition-all border border-gray-200"
                        >
                            <div className="text-blue-600 scale-150">
                                {opt.icon}
                            </div>
                            <span className="font-semibold text-lg">{opt.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export const CompactLevelControl = ({
    selectedType,
    isMenuOpen, setIsMenuOpen,
    handleSelect
}) => {
    return (
        <div className="relative">
            {/* Botón Principal de la Barra */}
            <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-300"
            >
                <span className="text-blue-600">
                    {OPTIONS.find(o => o.id === selectedType)?.icon}
                </span>
                <span className="font-medium capitalize">{selectedType}</span>
                <span className={`transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}>
                    {ICONS.chevronDown}
                </span>
            </button>

            {/* Menú Desplegable */}
            {isMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden flex flex-col animate-in slide-in-from-top-2 duration-200">
                    <span className="text-xs font-bold text-gray-400 px-4 py-2 uppercase tracking-wider bg-gray-50">Cambiar a:</span>
                    {OPTIONS.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => handleSelect(opt.id)}
                            className={`flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left
                                ${selectedType === opt.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600'}
                            `}
                        >
                            <span className="scale-90">{opt.icon}</span>
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}