function GeoLevelCompactButton({
    opt,
    handleGeoLevelSelect,
    selectedGeoLevel
}) {
    return (
        <button
            key={opt.id}
            onClick={() => handleGeoLevelSelect(opt.id)}
            className={`
                flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                ${selectedGeoLevel === opt.id 
                    ? 'bg-blue-900/20 text-blue-400 font-medium' 
                    : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'}
            `}
        >
            <span className="scale-75">{opt.icon}</span>
            <span className="text-xs font-medium">{opt.label}</span>
        </button>
    )
}

export default GeoLevelCompactButton;