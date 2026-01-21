function CommonField({
    label,
    placeholder,
    type = "text",
    onInput,
    onKeyDown,
    value,
    multiline = false,
    fixedHeightClass = 'h-28',
    disabled = false,
 }) {
    return (
        <div className="flex flex-col group w-full">
            <label className="mb-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider transition-colors group-focus-within:text-blue-400">
                {label}
            </label>
            {multiline ? (
                <textarea
                    placeholder={placeholder}
                    className={
                        `w-full px-4 py-2.5 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-100 text-sm placeholder-gray-600 outline-none transition-all duration-200 focus:bg-gray-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 hover:border-gray-600 resize-none ${fixedHeightClass} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`
                    }
                    onInput={onInput}
                    value={value}
                    onKeyDown={onKeyDown}
                    disabled={disabled}
                />
            ) : (
                <input
                    type={type}
                    placeholder={placeholder}
                    className="
                        w-full
                        px-4 py-2.5
                        rounded-lg
                        bg-gray-800/50 
                        border border-gray-700
                        text-gray-100
                        text-sm
                        placeholder-gray-600
                        outline-none
                        transition-all duration-200
                        
                        focus:bg-gray-800
                        focus:border-blue-500/50
                        focus:ring-1 focus:ring-blue-500/50
                        
                        hover:border-gray-600
                        disabled:opacity-60 disabled:cursor-not-allowed
                    "
                    onInput={onInput}
                    value={value}
                    onKeyDown={onKeyDown}
                    disabled={disabled}
                />
            )}
        </div>
    )
}

export default CommonField;