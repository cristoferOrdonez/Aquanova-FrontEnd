import ExitButton from './../ui/buttons/ExitButton.jsx';
import NeighborhoodSelector from './../ui/selectors/NeighborhoodSelector.jsx';
import FORM_CREATION_CONFIG from '../../config/formCreationConfig';
import {
    useHeaderContext,
    useNeighborhoodSelectorContext,
    useEditModeContext,
} from '../../hooks/useFormCreationContext';

function HeaderSection() {

    const header = useHeaderContext();
    const neighborhoodCtx = useNeighborhoodSelectorContext();
    const { isEditMode, isLoadingEdit, editLoadError } = useEditModeContext();
        const {
      fileInputRef,
      imagePreview,
      isDragging,
      isPublishOn,
      handleInputChange,
      handleDivClick,
      handleDragOver,
      handleDragEnter,
      handleDragLeave,
      handleDrop,
      handleRemoveImage,
      handleReplaceImage,
      handleOpenNewTab,
      togglePublish,
        } = header;

        const { title, setTitle, description, setDescription, createForm, updateForm, exitToList } = header;

        const handleSaveAndExit = async () => {
            try {
                let resp;
                if (isEditMode) {
                    if (!updateForm) throw new Error('updateForm no está disponible');
                    resp = await updateForm();
                    alert(resp?.message || 'Formulario actualizado correctamente');
                } else {
                    if (!createForm) throw new Error('createForm no está disponible');
                    resp = await createForm();
                    alert(resp?.message || 'Formulario creado correctamente');
                }
                // Navegar de vuelta a la lista después de guardar
                if (exitToList) exitToList();
            } catch (err) {
                console.error(err);
                alert(err?.message || (isEditMode ? 'Error al actualizar el formulario' : 'Error al crear el formulario'));
            }
        };

    const { selectedOption, setSelectedOption } = neighborhoodCtx;

    return (
        
        <div className="relative flex flex-col tablet:items-end tablet:w-auto w-[90%]">
            <div className="bg-[var(--card-bg)] tablet:w-[653px] w-auto h-wrap border-[1.5px] border-[var(--card-stroke)] rounded-[5px] gap-6 px-6 py-4 flex phone:flex-row flex-col phone:m-0">

            <div className="phone:w-[65%] tablet:w-[44%] w-auto h-wrap gap-4 flex flex-col" >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleInputChange}
                    accept="image/*"
                    className="hidden"
                />

                <div
                    onClick={handleDivClick}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                    bg-[#E0EEFF] border-[1.5px] border-[var(--card-stroke)] rounded-[14px] 
                    items-center justify-center flex flex-col group 
                    ${!imagePreview ? 'hover:cursor-pointer hover:bg-[#CBDFF2] [@media(pointer:coarse)]:active:bg-[#CBDFF2]' : ''} transition-colors
                    relative overflow-hidden h-50 w-full
                    `}
                >
                    
                    {/* Overlay de Drag & Drop (Mantenido igual) */}
                    <div className={`
                        absolute inset-0 z-30 
                        bg-red-500/80 backdrop-blur-[2px]
                        flex flex-col items-center justify-center
                        transition-all duration-300 ease-in-out
                        pointer-events-none
                        ${isDragging ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'}
                    `}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-white mb-2 animate-bounce">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                        </svg>
                        <span className="text-white font-work font-bold text-lg drop-shadow-md">
                            Suelte la imagen aquí
                        </span>
                    </div>

                    {imagePreview ? (
                        // --- ZONA MODIFICADA: Imagen con Overlay de acciones ---
                        <div className="relative w-full h-full group/overlay">
                            <img 
                                src={imagePreview} 
                                alt="Preview" 
                                className="w-full h-full object-cover rounded-[12px]" 
                            />
                            
                            {/* Overlay Azul Claro al hacer Hover */}
                            <div 
                                onClick={(e) => e.stopPropagation()} // Evita clicks accidentales en el fondo
                                className="
                                absolute inset-0 z-10 rounded-[12px]
                                bg-[#E0EEFF]/90 backdrop-blur-[1px]
                                flex items-center justify-center gap-4
                                opacity-0 group-hover/overlay:opacity-100
                                transition-all duration-300 ease-in-out
                                cursor-default
                            ">
                                {/* Botón 1: Quitar imagen */}
                                <button 
                                    onClick={handleRemoveImage}
                                    title="Quitar imagen"
                                    className="p-2 bg-white rounded-full shadow-sm hover:bg-red-50 hover:text-red-500 text-gray-600 transition-colors transform hover:scale-110"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                    </svg>
                                </button>

                                {/* Botón 2: Seleccionar otra imagen */}
                                <button 
                                    onClick={handleReplaceImage}
                                    title="Cambiar imagen"
                                    className="p-2 bg-white rounded-full shadow-sm hover:bg-blue-50 hover:text-blue-600 text-gray-600 transition-colors transform hover:scale-110"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                                    </svg>
                                </button>

                                {/* Botón 3: Abrir en otra pantalla */}
                                <button 
                                    onClick={handleOpenNewTab}
                                    title="Abrir imagen"
                                    className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 hover:text-gray-900 text-gray-600 transition-colors transform hover:scale-110"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ) : (
                    <div className="flex flex-col items-center justify-center px-4 pt-2 pb-3 pointer-events-none">
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={0.75}
                        stroke="currentColor"
                        className="w-30 h-30 text-[#2138C4] translate-y-7 group-hover:translate-y-0 [@media(pointer:coarse)]:translate-y-0 group-hover:scale-110 [@media(pointer:coarse)]:group-active:scale-110 transition-transform"
                        >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                        </svg>
                        <span className="
                        text-center tablet:text-sm text-[13px] text-[#2138C4] mt-2
                        opacity-0 max-h-10 translate-y-2 overflow-hidden
                        group-hover:opacity-100 group-hover:-translate-y-2
                        transition-all duration-300 ease-in-out
                        [@media(pointer:coarse)]:-translate-y-2
                        [@media(pointer:coarse)]:opacity-100
                        ">
                        Arrastra una imagen o haz clic para seleccionar una
                        </span>
                    </div>
                    )}
                </div>

                {/* Selector de Barrio */}
                <div className="flex flex-col gap-1">
                    <span className="tablet:text-sm text-[13px] text-[var(--instruction-text)] opacity-50">
                        Barrio de la campaña
                    </span>
                    <NeighborhoodSelector />
                </div>
            </div>
            <div className="w-full h-wrap flex flex-col justify-between gap-4">
                                <textarea
                                        value={title}
                                        rows="1"
                                        onChange={(e) => setTitle(e.target.value)}
                                        onInput={(e) => {
                                            e.target.style.height = 'auto';
                                            e.target.style.height = e.target.scrollHeight + 'px';
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value.trim() === '') {
                                                setTitle(FORM_CREATION_CONFIG.defaultFormTitle);
                                                e.target.style.height = 'auto';
                                                e.target.style.height = e.target.scrollHeight + 'px';
                                            }
                                        }}
                                        className="
                                        w-full resize-none overflow-hidden
                                        p-1 tablet:text-lg text-[15px] text-[var(--text)]
                                        border-[1.5px] border-transparent
                                        rounded-[5px] outline-none
                                        focus:border-[#2138C4]
                                        transition-all duration-500 ease-in-out
                                        "
                                />
                <div className="w-full h-wrap flex flex-col justify-between gap-1">
                    <span className="tablet:text-sm text-[13px] text-[var(--instruction-text)] opacity-50">
                    Descripción (solo para operadores)
                    </span>
                    <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="resize-none h-24 p-2 border-[1.5px] border-[var(--stroke-selectors-and-search-bars)] rounded-[14px] 
                    text-xs
                    focus:outline-none focus:border-[#2138C4] 
                    transition-all duration-500 ease-in-out"
                    />
                </div>
            </div>
            </div>
            <div className="
                tablet:absolute tablet:z-10 w-wrap h-wrap flex-wrap 
                bg-transparent 
                tablet:translate-x-full
                tablet:pl-[31px]
                tablet:tablet:mt-0 mt-4
                flex tablet:flex-col flex-box gap-4
            ">
            <button 
                onClick={handleSaveAndExit}
                className="
                    w-fit pr-4 pl-2.5 py-1 bg-[#10B981]/10 rounded-[30px] border-[1.5px] border-[#10B981]
                    hover:bg-[#10B981]/20 text-[#10B981] transition-colors transform hover:scale-110
                    flex flex-row items-center gap-2 cursor-pointer

                    [@media(pointer:coarse)]:active:bg-[#10B981]/20
                    [@media(pointer:coarse)]:active:scale-110
                "
            >
                <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-7 h-7"
                >
                {/* Contorno del disquete */}
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                
                {/* Cuadrado inferior (Etiqueta) */}
                <polyline points="17 21 17 13 7 13 7 21" />
                
                {/* Cuadrado superior (Obturador) */}
                <polyline points="7 3 7 8 15 8" />
                </svg>

                <span className="text-xs">
                {isEditMode ? 'Guardar cambios' : 'Guardar y salir'}
                </span>
            </button>

            <ExitButton onClick={exitToList} />

            <div 
                onClick={togglePublish} 
                className="flex items-center gap-2 cursor-pointer group select-none"
            >
                {/* 1. El Óvalo (Pista) */}
                <div 
                className={`
                    w-12 h-6 
                    flex items-center 
                    rounded-full 
                    p-1 
                    transition-colors duration-300 ease-in-out
                    ${
                        isPublishOn
                            ? 'bg-green-500 hover:bg-green-600'
                            : isEditMode
                                ? 'bg-red-400 hover:bg-red-500'
                                : 'bg-gray-300 hover:bg-gray-400'
                    }
                `}
                >
                {/* 2. El Círculo (Knob) */}
                <div 
                    className={`
                    bg-gray-100 
                    w-4 h-4 
                    rounded-full 
                    shadow-md 
                    transform transition-transform duration-300 ease-in-out
                    ${isPublishOn ? 'translate-x-6' : 'translate-x-0'}
                    `}
                />
                </div>

                {/* 3. El Texto descriptivo */}
                <div className="flex flex-col leading-tight">
                    <span className={`tablet:text-sm text-[13px] font-medium transition-colors duration-300 ${
                        isPublishOn ? 'text-green-600' : isEditMode ? 'text-red-500' : 'text-gray-500'
                    }`}>
                        {isPublishOn ? 'Activo' : 'Inactivo'}
                    </span>
                    <span className="text-[10px] text-gray-400">
                        {isEditMode ? 'Estado del formulario' : 'Al guardar'}
                    </span>
                </div>
            </div>
            </div>
        </div>

        );

    }

export default HeaderSection;