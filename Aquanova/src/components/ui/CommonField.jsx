function CommonField({
    label,
    placeholder,
    type,
    onInput,
    onKeyDown
 }) {
    return (
        <div className="flex flex-col group">
            <span
                className="
                    text-sm font-semibold
                    transition-all duration-300 ease-in-out
                    group-hover:scale-[1.07]
                    group-hover-:translate-y-1
                "
            >
                {label}
            </span>
            <input
                type={type}
                placeholder={placeholder}
                className="
                    /* --- Diseño Base --- */
                    border border-[#0000004d]
                    bg-[#EDEDED]
                    text-center
                    rounded-[10px] p-2
                    outline-none

                    /* --- La Magia de la Animación --- */
                    transition-all duration-300 ease-in-out
                    
                    /* Efecto al enfocar (Focus) */
                    focus:bg-[#f0f0f0]
                    focus:border-[#1361C5]          /* Cambia el borde a color (puedes cambiar indigo por tu color) */
                    focus:ring-4 focus:ring-[#1361C5]/20 /* Añade un anillo difuminado alrededor */
                    focus:shadow-lg                  /* Añade sombra para dar profundidad */
                    group-hover:scale-[1.03]               /* Crece un 3% para destacar */
                    group-hover:translate-y-1

                    /* --- Ocultar Flechas (Tu código) --- */
                    [appearance:textfield] 
                    [&::-webkit-outer-spin-button]:appearance-none 
                    [&::-webkit-inner-spin-button]:appearance-none
                "
                onInput={onInput}
                onKeyDown={onKeyDown}
            />
        </div>
    )
}

export default CommonField;