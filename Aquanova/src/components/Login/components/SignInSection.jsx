import Logo from './../../../assets/images/logo_frog.png'
import { useState } from 'react';

function SignInSection() {

    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const cedulaInputOnInput = (e) => {
        // Cortar si excede 10 dígitos
        if (e.target.value.length > 10) {
            // Cortar si excede 10 dígitos
            if (e.target.value.length > 10) {
            e.target.value = e.target.value.slice(0, 10);
            }
        }
    }

    const cedulaInputOnKeyDown = (e) => {
        // Bloquear caracteres especiales de inputs numéricos: e, E, +, -, .
        if (["e", "E", "+", "-", "."].includes(e.key)) {
            e.preventDefault();
        } 
    }

    return (
        <div className="py-6 px-12 bg-[var(--bg-main)] h-screen flex flex-col">
            <div className = "text-sm flex flex-row justify-end gap-2 mb-6">
                <span className="text-[#4E5A68]">¿Tiene algún inconveniente?</span>
                <span className="text-[#0D448A] hover:font-semibold hover:underline">Soporte técnico</span>
            </div>
            <div className="flex flex-1 flex-col justify-evenly">
                <div className="flex flex-row justify-center gap-4">
                    <img src={Logo}  width={150} height={150} className='shrink-0 ' alt='Logo' />
                    <div className="max-w-xs flex flex-col justify-center gap-3">
                        <span className="text-xl font-semibold">El nombre de nuestra GRAN APP</span>
                        <span className="text-[#4E5A68] text-base">
                            Accede al portal de servicios de visualización de predios y creación de formularios.
                        </span>
                    </div>
                </div>
                <div className="flex flex-col justify-center gap-8">
                    <div className="flex flex-col group">
                        <span
                            className="
                                text-sm font-semibold
                                transition-all duration-300 ease-in-out
                                group-hover:scale-[1.07]
                                group-hover-:translate-y-1
                            "
                        >
                            Cedula:
                        </span>
                        <input
                            type="number"
                            placeholder="Digite su cédula"
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
                            onInput={cedulaInputOnInput}
                            onKeyDown={cedulaInputOnKeyDown}
                        />
                    </div>
                    <div className="flex flex-col group">
                        <span
                            className="
                                text-sm font-semibold
                                transition-all duration-300 ease-in-out
                                group-hover:scale-[1.07]
                                group-hover-:translate-y-1
                            "
                        >
                            Contraseña:
                        </span>
                        <div
                            className="
                            flex flex-row items-center
                            border border-[#0000004d]
                            bg-[#EDEDED]
                            rounded-[10px]
                            overflow-hidden /* Para que los hijos no se salgan de las esquinas redondeadas */
                            
                            /* --- Animaciones trasladadas al contenedor --- */
                            transition-all duration-300 ease-in-out
                            group-hover:scale-[1.03]
                            group-hover:translate-y-1
                            
                            /* Efectos de Focus (usamos focus-within) */
                            focus-within:bg-[#f0f0f0]
                            focus-within:border-[#1361C5]
                            focus-within:ring-4 focus-within:ring-[#1361C5]/20
                            focus-within:shadow-lg
                            "
                        >
                            {/* INPUT REAL: Fondo transparente, sin bordes */}
                            <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Digite su contraseña"
                            className="
                                flex-1 /* Toma todo el espacio disponible */
                                bg-transparent
                                text-center
                                p-2
                                outline-none
                                text-gray-700
                                placeholder-gray-500
                                
                                /* Ocultar flechas y estilos nativos */
                                [appearance:textfield]
                                [&::-webkit-outer-spin-button]:appearance-none
                                [&::-webkit-inner-spin-button]:appearance-none
                            "
                            />

                            {/* BOTÓN DEL OJO */}
                            <button
                            type="button" // Importante para no enviar formularios
                            onClick={togglePasswordVisibility}
                            className="
                                bg-[#EDE5E5]
                                px-3
                                h-10
                                flex items-center justify-center
                                text-[#0000004d]
                                hover:text-[#1361C5]
                                transition-colors
                                cursor-pointer
                                outline-none
                                border border-[#0000004d] border-y-0 border-r-0
                                hover:bg-[#e7dfdf]
                            "
                            >
                            {showPassword ? (
                                /* Icono: Ojo Abierto (Visible) */
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#00000082" width="24" height="24">
                                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zM12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                                </svg>
                            ) : (
                                /* Icono: Ojo Tachado (No visible) - Fiel a tu imagen */
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#00000082" width="24" height="24">
                                    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-4 .7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                                </svg>
                            )}
                            </button>
                        </div>
                        
                    </div>
                    <div className="flex flex-col justify-center items-center mt-2">
                        <button
                            className="
                                w-full bg-[var(--blue-buttons)]
                                text-lg p-3 rounded-[10px] text-white font-semibold
                                transition-all duration-300 ease-in-out
                                hover:scale-[1.03]
                                hover:opacity-95
                            "
                        >
                            Ingresar
                        </button>
                        <div className="flex flex-row justify-between w-full mt-3">
                            <span className="text-sm text-[#0D448A] hover:font-semibold hover:underline cursor-pointer">Recuperar Contraseña o Usuario</span>
                            <div className="flex flex-row gap-2">
                                <span className="text-sm text-[#4E5A68]">¿Eres nuevo?</span>
                                <span className="text-sm text-[#0D448A] hover:font-semibold hover:underline cursor-pointer">Regístrate</span>
                            </div>
                        </div>
                    </div>  

                </div>
            </div>
        </div>
    )
}

export default SignInSection;