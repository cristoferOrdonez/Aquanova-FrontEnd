import { useState, useRef } from 'react';
//import {Bars3BottomLeftIcon} from '@heroicons/react/24/outline';

function FormCreation() {

  const mainContainerRef = useRef(null); // <--- NUEVO: Referencia al contenedor
  
  const [isNeighborhoodSelectorOpen, setIsNeighborhoodSelectorOpen] = useState(false);
  const [selectedNeighborhoodOption, setSelectedNeighborhoodOption] = useState("Seleccione un barrio");

  const neighborhoodOptions = ["Barrio del putisimo que vive en putilandia con todos sus putiamigos", "Opción 2", "Opción 3", "Opción 4"];

  const [imagePreview, setImagePreview] = useState(null);
  
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  const [isPublishOn, setIsPublishOn] = useState(false);

  const [rotation, setRotation] = useState(0);

  const [isEditingSectionOpen, setIsEditingSectionOpen] = useState(false);

  const [isTypeQuestionSelectorOpen, setIsTypeQuestionSelectorOpen] = useState(false);
  const [selectedTypeQuestionOption, setSelectedTypeQuestionOption] = useState("Sólo texto (sin respuestas)");

  const [isMandatoryOn, setIsMandatoryOn] = useState(false);

  const [isFastOutEditingFrame, setIsFastOutEditingFrame] = useState(false);

  // Estado para marcar visualmente qué pregunta se acabó de editar
  const [justUpdatedQuestionId, setJustUpdatedQuestionId] = useState(null);

  // ... estados anteriores ...

  // Estado para el título de la pregunta actual
  const [questionTitle, setQuestionTitle] = useState("Pregunta sin título");
  
  // Estado para almacenar TODAS las preguntas creadas
  const [questions, setQuestions] = useState([]);

  // Estado para saber qué ID se está animando para salir
  const [exitingQuestionId, setExitingQuestionId] = useState(null);

  // Estado para saber si estamos editando una pregunta específica (null = modo crear)
  const [editingQuestionId, setEditingQuestionId] = useState(null)

  const [justCreatedId, setJustCreatedId] = useState(null);

  const [isCreationOn, setIsCreationOn] = useState(true);

  const handleStartEditing = (questionToEdit) => {

    // 1. Identificamos qué pregunta es
    setEditingQuestionId(questionToEdit.id);

    // 2. Cargamos sus datos en los estados del formulario "editing_frame"
    setQuestionTitle(questionToEdit.title);
    setSelectedTypeQuestionOption(questionToEdit.type);
    
    // Hacemos una copia profunda de las opciones para no mutar el original en tiempo real
    setOptionsList(questionToEdit.options.map(opt => ({...opt}))); 
    
    setIsMandatoryOn(questionToEdit.required);

    // 3. Abrimos el panel de edición (si no estaba abierto)
    setIsEditingSectionOpen(true);
    setIsFastOutEditingFrame(false);
    
    // Opcional: Rotar el botón verde para indicar que está activo
    setRotation(prev => prev + 360);

    // 4. Scroll suave hacia el editor
    setTimeout(() => {
      if (mainContainerRef.current) {
        mainContainerRef.current.scrollTo({
          top: mainContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 100);
  };

  // ... resto de estados ...

    // Función para eliminar una pregunta por su ID
  const handleDeleteQuestion = (idToDelete) => {
    // 1. Iniciamos la animación marcando el ID
    setExitingQuestionId(idToDelete);

    // 2. Esperamos 500ms (lo que dura la animación CSS) antes de borrar los datos
    setTimeout(() => {
      setQuestions(prevQuestions => prevQuestions.filter(q => q.id !== idToDelete));
      setExitingQuestionId(null); // Limpiamos el estado
    }, 500); 
  };

  const handleSaveQuestion = () => {

    setIsFastOutEditingFrame(true);
    setRotation(prev => prev - 360);

    const questionData = {
      title: questionTitle,
      type: selectedTypeQuestionOption,
      options: [...optionsList],
      required: selectedTypeQuestionOption == "Sólo texto (sin respuestas)" ? false : isMandatoryOn
    };

    if (editingQuestionId !== null) {
      // --- MODO EDICIÓN ---
      const currentId = editingQuestionId; // Guardamos el ID antes de limpiarlo

      setQuestions(prevQuestions => 
        prevQuestions.map(q => 
          q.id === currentId 
            ? { ...q, ...questionData } 
            : q
        )
      );
      
      // 1. Activamos el estado de "Recién actualizado"
      setJustUpdatedQuestionId(currentId);

      // 2. Limpiamos el ID de edición actual
      setEditingQuestionId(null);
      
      // 3. Lógica de Scroll y Limpieza de animación
      setTimeout(() => {
        // Buscar el elemento en el DOM y hacer scroll hacia él
        const element = document.getElementById(`question-card-${currentId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Quitar el brillo después de 1 segundo
        setTimeout(() => {
          setJustUpdatedQuestionId(null);
        }, 1000);
      }, 300); // Pequeño delay para asegurar que el DOM se pintó

    } else {
      // --- MODO CREACIÓN (Código existente) ---
      const newQuestion = {
        id: Date.now(),
        ...questionData
      };
      setQuestions([...questions, newQuestion]);
      setJustCreatedId(newQuestion.id);
      setIsCreationOn(false);
      setTimeout(() => {
        setJustCreatedId(null);
      }, 500);
    }

    // Resetear el formulario y cerrar
    setQuestionTitle("");
    setOptionsList([{ id: Date.now(), value: "Opción sin título" }]);
    setSelectedTypeQuestionOption("Sólo texto (sin respuestas)");
    setIsMandatoryOn(false);
    setIsEditingSectionOpen(false);

  };

  const renderCreatedQuestions = () => {
    return questions.map((q) => {
      
      // VARIABLES DE ESTADO PARA ESTA TARJETA
      const isEditingThis = editingQuestionId === q.id;     // Es la que estoy editando
      const isEditingAny = editingQuestionId !== null;      // Hay alguna edición ocurriendo
      const isJustUpdated = justUpdatedQuestionId === q.id; // Acaba de ser guardada

      return (
        <div 
          key={q.id}
          id={`question-card-${q.id}`} // ID necesario para el scroll automático
          className={`
            relative tablet:w-[653px] w-[90%] flex tablet:flex-row flex-col gap-4 tablet:items-center justify-end
            transition-all duration-500 ease-in-out
            
            ${/* 1. Lógica de Salida (Eliminar) */ ''}
            ${exitingQuestionId === q.id ? 'opacity-50 -translate-x-full max-h-0 scale-10 pointer-events-none' : 'max-h-[500px]'}
            
            ${/* 2. Lógica de Bloqueo durante edición */ ''}
            ${(isEditingAny && !isEditingThis) || isCreationOn 
              ? 'opacity-40 grayscale scale-95 pointer-events-none blur-[1px]' // ESTADO BLOQUEADO
              : '' // ESTADO NORMAL
            }

            ${/* 3. CORRECCIÓN AQUÍ: Animación de entrada */ ''}
            ${/* Solo animamos si NO está saliendo y NO se acaba de actualizar (para no chocar con el destello) */ ''}
            ${justCreatedId === q.id ? 'animate-card-entry' : ''}
          `}
        >
          
          {/* TARJETA DE PREGUNTA */}
          <div className={`
              w-full tablet:w-auto flex-1 border-[1.5px] rounded-[5px] p-6 flex flex-col gap-3 shadow-sm
              transition-all duration-500
              
              ${/* CAMBIO DE COLOR AL TERMINAR DE EDITAR (Destello) */ ''}
              ${isJustUpdated 
                  ? 'bg-blue-50 border-[#2138C4] shadow-[0_0_15px_rgba(33,56,196,0.2)]' // Estilo "Titilar"
                  : 'bg-[var(--card-bg)] border-[var(--card-stroke)]' // Estilo Normal
              }
          `}>
            
            {/* Título y Asterisco */}
            <h3 className="text-[var(--text)] tablet:text-base text-sm">
              {q.title}
              {q.required && <span className="text-red-500 ml-1">*</span>}
            </h3>

            {/* Visualización según Tipo (Tu código original se mantiene aquí) */}
            {(q.type !== "Sólo texto (sin respuestas)") && (<div className="mt-1">
              {/* ... CONTENIDO INTERNO DE LA TARJETA (Mismo que tenías) ... */}
              {(q.type === "Respuesta textual" || q.type === "Numérico") && (
                  <div className="w-full h-10 bg-[#F1F5F9] border-[1.5px] border-[#CBD5E1] rounded-[8px] px-3 flex items-center text-gray-400 tablet:text-sm text-[13px]">
                    {q.type === "Numérico" ? "Respuesta numérica" : "Texto de respuesta corta"}
                  </div>
                )}
              {/* ... Copia aquí el resto de tus condiciones (Fecha, Lista, Radio, Checkbox) ... */}
              {q.type === "Fecha" && (
                  <div className="w-full h-10 bg-[#F1F5F9] border-[1.5px] border-[#CBD5E1] rounded-[8px] px-3 flex justify-between items-center text-gray-400 tablet:text-sm text-[13px]">
                    <span>dd/mm/aaaa</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 opacity-50"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
                  </div>
              )}
              {q.type === "Lista desplegable" && (
                  <div className="flex flex-col gap-2 text-[var(--text)]">
                    {q.options.map((opt, index) => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <span className="text-xs font-semibold opacity-40">{index + 1}.</span>
                        <span className="tablet:text-sm text-[13px] opacity-90">{opt.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              {q.type === "Opción multiple" && (
                  <div className="flex flex-col gap-2">
                    {q.options.map((opt) => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full border-[2px] border-gray-400"></div>
                        <span className="tablet:text-sm text-[13px] text-[var(--text)]">{opt.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              {q.type === "Casillas de verificación" && (
                  <div className="flex flex-col gap-2">
                    {q.options.map((opt) => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-[4px] border-[2px] border-gray-400"></div>
                        <span className="tablet:text-sm text-[13px] text-[var(--text)]">{opt.value}</span>
                      </div>
                    ))}
                  </div>
                )}
            </div>)}
          </div>

          {/* BOTONES DE ACCIÓN (Editar / Eliminar) */}
          {/* Aquí la magia: Si es la tarjeta que edito, Oculto los botones */}
          <div className={`
            tablet:absolute tablet:z-40 flex tablet:pl-0 pl-2 
            ${q.type == 'Sólo texto (sin respuestas)'? 'flex-row': 'tablet:flex-col flex-row'} 
            gap-2 tablet:translate-x-full tablet:pl-[15px] mb-3 tablet:mb-0
            transition-all duration-300
            ${isEditingThis ? 'opacity-0 translate-x-0 pointer-events-none' : 'opacity-100'}
          `}>
            <button
                onClick={() => handleStartEditing(q)}
                className="
                  w-fit group flex h-10 items-center justify-center
                  rounded-full border border-[#2138C4] bg-blue-50 p-2
                  transition-all duration-300 ease-in-out
                  hover:bg-blue-100 hover:pr-4 cursor-pointer
                  [@media(pointer:coarse)]:active:bg-blue-100
                  [@media(pointer:coarse)]:pr-4
                "
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[#2138C4] flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
                <span
                  className="
                    max-w-0 overflow-hidden whitespace-nowrap
                    tablet:text-sm text-[13px] font-medium text-[#2138C4] opacity-0
                    transition-all duration-300 ease-out
                    group-hover:ml-2 group-hover:max-w-[100px] group-hover:opacity-100
                    [@media(pointer:coarse)]:ml-2
                    [@media(pointer:coarse)]:max-w-[100px]
                    [@media(pointer:coarse)]:opacity-100
                  "
                >
                  Editar
                </span>
              </button>

              <button
                onClick={() => handleDeleteQuestion(q.id)}
                className="
                  w-fit group flex h-10 items-center justify-center
                  rounded-full border border-red-600 bg-red-50 p-2
                  transition-all duration-300 ease-in-out
                  hover:bg-red-100 hover:pr-4 cursor-pointer
                  [@media(pointer:coarse)]:active:bg-red-100
                  [@media(pointer:coarse)]:pr-4
                "
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-600 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
                <span
                  className="
                    max-w-0 overflow-hidden whitespace-nowrap
                    tablet:text-sm text-[13px] font-medium text-red-600 opacity-0
                    transition-all duration-300 ease-out
                    group-hover:ml-2 group-hover:max-w-[100px] group-hover:opacity-100
                    [@media(pointer:coarse)]:ml-2
                    [@media(pointer:coarse)]:max-w-[100px]
                    [@media(pointer:coarse)]:opacity-100
                  "
                >
                  Eliminar
                </span>
              </button>
          </div>

        </div>
      );
    });
  };

  const handleMandatoryToggle = () => {
    const newState = !isMandatoryOn;
    setIsMandatoryOn(newState);

  };

  // --- NUEVO: Estado para manejar las opciones de respuesta ---
  const [optionsList, setOptionsList] = useState([
    { id: Date.now(), value: "Opción sin título" }
  ]);

  // --- NUEVO: Función para actualizar el texto de una opción ---
  const handleOptionChange = (id, newValue) => {
    setOptionsList(prevOptions => 
      prevOptions.map(option => 
        option.id === id ? { ...option, value: newValue } : option
      )
    );
  };

  // --- NUEVO: Función para agregar una nueva opción ---
  const handleAddOption = () => {

    setTimeout(() => {
      setOptionsList(prev => [
        ...prev, 
        { id: Date.now(), value: "Opción sin título" }
      ]);

      mainContainerRef.current.scrollTo({
        top: mainContainerRef.current.scrollHeight,
        behavior: "instant",
      });
    }, 125);

  };

  // --- NUEVO: Función para eliminar una opción ---
  const handleRemoveOption = (id) => {
    // Evitamos borrar si solo queda una opción (opcional, buena UX)
    setTimeout(() => {
    
      if (optionsList.length > 1) {
        setOptionsList(prev => prev.filter(option => option.id !== id));
      }

    }, 125);

  };

  // --- NUEVO: Función Renderizado de Inputs según tipo ---
  const renderAnswerInput = () => {
    switch (selectedTypeQuestionOption) {
      
      // CASO 1, 2 y 3: Opciones Múltiples / Casillas / Lista (Misma lógica, diferente icono)
      case "Opción multiple":
      case "Casillas de verificación":
      case "Lista desplegable":
        return (
          <div className="flex flex-col gap-2 mt-2 w-full">
            {optionsList.map((option, index) => (
              <div key={option.id} className="flex items-center gap-3 group ">
                {/* Icono indicador a la izquierda */}
                <div className="text-[var(--text)] opacity-40">
                  {selectedTypeQuestionOption === "Opción multiple" && (
                     <div className="w-4 h-4 rounded-full border-[2px] border-current"></div>
                  )}
                  {selectedTypeQuestionOption === "Casillas de verificación" && (
                     <div className="w-4 h-4 rounded-[2px] border-[2px] border-current"></div>
                  )}
                  {selectedTypeQuestionOption === "Lista desplegable" && (
                     <span className="text-xs font-semibold">{index + 1}.</span>
                  )}
                </div>

                {/* Input de la opción */}
                <textarea
                  rows={1}
                  value={option.value}
                  onChange={(e) => {
                    // 1. Actualiza el estado (tu lógica original)
                    handleOptionChange(option.id, e.target.value);
                    
                    // 2. Lógica de auto-resize:
                    // Reseteamos la altura para calcular correctamente si el texto se borró
                    e.target.style.height = 'auto'; 
                    // Ajustamos la altura al tamaño del contenido (scrollHeight)
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                  onBlur={(e) => {
                    if(e.target.value.trim() === "") {
                      handleOptionChange(option.id, "Opción sin título"); 
                    }
                  }}
                  className="
                    flex-1 bg-transparent 
                    border-b-[1px] border-transparent 
                    hover:border-[var(--stroke-selectors-and-search-bars)] 
                    focus:border-[#2138C4] focus:outline-none
                    py-1 tablet:text-sm text-[13px] text-[var(--text)] opacity-90
                    transition-colors duration-200
                    resize-none overflow-hidden block
                  "
                  // Un pequeño ajuste para asegurar que si carga con texto largo, se ajuste (opcional)
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                />

                {/* Botón eliminar (X) - Solo aparece si hay más de 1 opción */}
                {optionsList.length > 1 && (
                  <button 
                    onClick={() => handleRemoveOption(option.id)}
                    className="
                      opacity-0 group-hover:opacity-100 
                      p-1.5 rounded-full 
                      text-gray-400 
                      hover:bg-red-50 hover:text-red-600
                      [@media(pointer:coarse)]:opacity-100
                      [@media(pointer:coarse)]:active:bg-red-50
                      [@media(pointer:coarse)]:active:text-red-600
                      transition-all duration-200
                    "
                    title="Eliminar"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      strokeWidth={2.5} 
                      stroke="currentColor" 
                      className="w-5 h-5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}

            {/* Botón Agregar Opción (Icono + Animación) */}
            <div className="flex items-center mt-2">
              <button 
                onClick={handleAddOption}
                className="
                  group flex items-center 
                  cursor-pointer 
                  transition-all duration-300 ease-in-out
                  outline-none
                  [@media(pointer:coarse)]:duration-200
                  [@media(pointer:coarse)]:active:bg-[#E0EEFF]
                  [@media(pointer:coarse)]:rounded-full
                  [@media(pointer:coarse)]:pr-[8px]
                "
              >
                {/* 1. El Icono (Siempre visible) */}
                <div className="
                  p-1.5 rounded-full 
                  text-[var(--text)] opacity-50 
                  group-hover:bg-[#E0EEFF] group-hover:text-[#2138C4] group-hover:opacity-100
                  [@media(pointer:coarse)]:group-active:text-[#2138C4] [@media(pointer:coarse)]:group-active:opacity-100
                  transition-colors duration-300
                  [@media(pointer:coarse)]:duration-200
+                ">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={2.5} 
                    stroke="currentColor" 
                    className="w-5 h-5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>

                {/* 2. El Texto (Oculto por defecto, aparece con hover) */}
                <span className="
                  max-w-0 opacity-0 overflow-hidden whitespace-nowrap
                  group-hover:max-w-[150px] group-hover:opacity-100 group-hover:ml-2
                  tablet:text-sm text-[13px] font-medium text-[#2138C4]
                  transition-all duration-300 ease-out
                  [@media(pointer:coarse)]:duration-200

                  [@media(pointer:coarse)]:opacity-50
                  [@media(pointer:coarse)]:text-[var(--text)]
                  [@media(pointer:coarse)]:max-w-[150px]
                  [@media(pointer:coarse)]:ml-2
                  [@media(pointer:coarse)]:group-active:opacity-100
                  [@media(pointer:coarse)]:group-active:text-[#2138C4]
                ">
                  Agregar opción
                </span>
              </button>
            </div>
          </div>
        );

      // CASO 4: Respuesta Textual (Visualización pasiva)
      case "Respuesta textual":
        return (
          <div className="mt-4 px-1">
             <div className="bg-[#F1F5F9] rounded-[14px] w-full border-[1.5px] border-[#CBD5E1] px-2 py-2 tablet:text-sm text-[13px] text-[var(--text)] opacity-90 select-none">
                Texto de respuesta corta
             </div>
          </div>
        );

      // CASO 5: Numérico
      case "Numérico":
        return (
            <div className="mt-4 px-1">
               <div className="bg-[#F1F5F9] w-full rounded-[14px] border-[1.5px] border-[#CBD5E1] px-2 py-2 tablet:text-sm text-[13px] text-[var(--text)] opacity-90 select-none flex justify-between items-center">
                  <span>Número</span>
                  {/* Pequeños chevrons simulados para input type number */}
                  <div className="flex flex-col -space-y-1">
                      <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                      <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  </div>
               </div>
            </div>
          );

      // CASO 6: Fecha
      case "Fecha":
        return (
            <div className="mt-4 px-1">
               <div className="bg-[#F1F5F9] w-full rounded-[14px] border-[1.5px] border-[#CBD5E1] px-2 py-2 tablet:text-sm text-[13px] text-[var(--text)] opacity-90 select-none flex justify-between items-center">
                  <span>día/mes/año</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
               </div>
            </div>
          );

      // CASO DEFAULT: Sólo texto
      default:
        return null;
    }
  };

  // Definimos las opciones como objetos con label e icon
  const typeQuestionOptions = [
    {
      label: "Opción multiple",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          <circle cx="12" cy="12" r="5" fill="currentColor" stroke="none" />
        </svg>
      )
    },
    {
      label: "Casillas de verificación",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9A2.25 2.25 0 0 1 18.75 7.5v9A2.25 2.25 0 0 1 16.5 18.75h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75" />
        </svg>
      )
    },
    {
      label: "Lista desplegable",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 10.5 3.75 3.75 3.75-3.75" />
        </svg>
      )
    },
    {
      label: "Respuesta textual",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h9" />
        </svg>
      )
    },
    {
      label: "Numérico",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5v15m0-15l-5.25 4.5" />
        </svg>  
      )
    },
    {
      label: "Fecha",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
        </svg>
      )
    },
    {
      label: "Sólo texto (sin respuestas)",
      icon: null
    }
  ];


  const handleCreation = () => {

    setIsCreationOn(true);

    setIsFastOutEditingFrame(false);

    setRotation(prev => prev + 360);
    setIsEditingSectionOpen(!isEditingSectionOpen);

    // --- AQUÍ ESTÁ LA LIMPIEZA QUE NECESITAS ---
    setQuestionTitle("Pregunta sin título");
    setSelectedTypeQuestionOption("Sólo texto (sin respuestas)"); // Vuelve al default
    setOptionsList([{ id: Date.now(), value: "Opción sin título" }]); // Limpia opciones anteriores
    setIsMandatoryOn(false); // Apaga el obligatorio
    // -------------------------------------------

    // Usamos setTimeout para dar tiempo a que React renderice la nueva sección
    setTimeout(() => {
      if (mainContainerRef.current) {
        mainContainerRef.current.scrollTo({
          top: mainContainerRef.current.scrollHeight, // Altura total del contenido interno
          behavior: "smooth",
        });
      }
    }, 100); // 100ms de espera es imperceptible pero asegura que funcione
  };

  const handlePublishToggle = () => {
    const newState = !isPublishOn;
    setIsPublishOn(newState);

  };

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Por favor suba un archivo de imagen válido.");
    }
  };

  const handleDivClick = () => {
    if (!imagePreview && fileInputRef.current) {
        fileInputRef.current.click();
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };
 
  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleReplaceImage = (e) => {
    e.stopPropagation();
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleOpenNewTab = (e) => {
    e.stopPropagation();
    if (imagePreview) {
        const newWindow = window.open();
        newWindow.document.writeln(`<img src="${imagePreview}" style="max-width:100%;" />`);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.currentTarget.contains(e.relatedTarget)) return;
    
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        handleFile(file);
    }
  };

  return (
    <div 
      ref={mainContainerRef}
      className="bg-[var(--bg-color-main)] font-work w-screen h-screen flex flex-col items-center justify-start pt-10 gap-3 overflow-y-auto"
    >
      
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
              <div className="tablet:w-64 w-auto relative">
                <div 
                  onClick={() => setIsNeighborhoodSelectorOpen(!isNeighborhoodSelectorOpen)}
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
                    {selectedNeighborhoodOption}
                  </span>

                  <svg 
                    className={`w-3 h-3 text-[#000000] opacity-30 transition-transform duration-300 ${isNeighborhoodSelectorOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 18L4 6H20L12 18Z"/>
                  </svg>
                </div>

                <div className={`
                  absolute z-10 tablet:w-[121%] w-full -mt-1.5 
                  bg-white 
                  border-[1.5px] border-[var(--card-stroke)] 
                  rounded-[14px] 
                  tablet:translate-x-4
                  shadow-lg 
                  overflow-hidden
                  
                  transition-all duration-300 ease-out origin-top
                  ${isNeighborhoodSelectorOpen 
                    ? 'opacity-100 scale-100 translate-y-0 visible' 
                    : 'opacity-0 scale-95 -translate-y-2 invisible pointer-events-none'}
                `}>
                  {neighborhoodOptions.map((option, index) => (
                    <div 
                      key={index}
                      onClick={() => {
                        setSelectedNeighborhoodOption(option);
                        setIsNeighborhoodSelectorOpen(false);
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
            </div>
          </div>
          <div className="w-full h-wrap flex flex-col justify-between gap-4">
              <textarea 
                defaultValue="Formulario sin nombre"
                rows="1"
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                onBlur={(e) => {
                  if (e.target.value.trim() === "") {
                    e.target.value = "Formulario sin nombre";

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
                  className="resize-none h-24 p-2 border-[1.5px] border-[var(--stroke-selectors-and-search-bars)] rounded-[14px] 
                  text-xs
                  focus:outline-none focus:border-[#2138C4] 
                  transition-all duration-500 ease-in-out"
                />
              </div>
          </div>
        </div>
        <div className="
          tablet:absolute tablet:z-10 w-wrap h-wrap 
          bg-transparent 
          tablet:translate-x-full
          tablet:pl-[31px]
          tablet:tablet:mt-0 mt-4
          flex tablet:flex-col flex-box gap-4
        ">
          <button 
              className="
                pr-4 pl-2.5 py-1 bg-[#10B981]/10 rounded-[30px] border-[1.5px] border-[#10B981]
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
              Guardar y salir
            </span>
          </button>

          <div 
            onClick={handlePublishToggle} 
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
                ${isPublishOn ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300 hover:bg-gray-400'}
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
            <span className="text-[var(--text)] tablet:text-sm text-[13px]">
              Publicar
            </span>
          </div>
        </div>
      </div>
      <div alt="question_frame" className="flex flex-col items-center justify-start gap-2 w-[100%] tablet:w-auto pt-4 tablet:pt-0">
        {renderCreatedQuestions()}
      </div>
      <div alt="editing_frame" className={`
        tablet:w-[653px] w-[90%] h-wrap bg-[var(--card-bg)] drop-shadow-md border-[1.5px] border-[var(--card-stroke)] rounded-[5px]
        px-6 py-4 mb-10
        flex flex-col justify-between gap-2
        
        transition-all ${isFastOutEditingFrame ? 'duration-0' : 'duration-500'} ease-in-out
        ${isEditingSectionOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible pointer-events-none'}
      `}>
        <div className="flex tablet:flex-row flex-col gap-2">
          <textarea 
            defaultValue={questionTitle}
            rows="1"
            onInput={(e) => {
              setQuestionTitle(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            onBlur={(e) => {
              if (e.target.value.trim() === "") {

                e.target.value = "Pregunta sin título";

                setQuestionTitle(e.target.value);

                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }
            }}
            className="
              w-full resize-none overflow-hidden
              p-1 tablet:text-sm text-[13px] text-[var(--text)]
              border-[1.5px] border-transparent
              rounded-[5px] outline-none
              focus:border-[#2138C4]
              transition-all duration-500 ease-in-out
            "
          />
          <div className="tablet:w-[400px] w-auto relative">
            <div 
              onClick={() => setIsTypeQuestionSelectorOpen(!isTypeQuestionSelectorOpen)}
              className="
                w-full 
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
              <div className="flex items-center gap-2 w-full">
                  <span className="text-[var(--text)] opacity-90">
                      {/* Buscamos el ícono correspondiente al label seleccionado */}
                      {typeQuestionOptions.find(opt => opt.label === selectedTypeQuestionOption)?.icon}
                  </span>
                  <span className="tablet:text-sm text-[13px] text-[var(--text)] opacity-90 truncate">
                    {selectedTypeQuestionOption}
                  </span>
              </div>

              <svg 
                className={`w-3 h-3 text-[#000000] opacity-30 transition-transform duration-300 ${isTypeQuestionSelectorOpen ? 'rotate-180' : ''}`}
                viewBox="0 0 24 24" 
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 18L4 6H20L12 18Z"/>
              </svg>
            </div>

            <div className={`
              absolute z-10 tablet:w-[121%] w-[100%] -mt-1.5
              bg-white 
              border-[1.5px] border-[var(--card-stroke)] 
              rounded-[14px] 
              tablet:translate-x-4
              shadow-lg 
              overflow-hidden
              
              transition-all duration-300 ease-out origin-top
              ${isTypeQuestionSelectorOpen 
                ? 'opacity-100 scale-100 translate-y-0 visible' 
                : 'opacity-0 scale-95 -translate-y-2 invisible pointer-events-none'}
            `}>
              {typeQuestionOptions.map((option, index) => (
                <div 
                  key={index}
                  onClick={() => {
                    setSelectedTypeQuestionOption(option.label);
                    setIsTypeQuestionSelectorOpen(false);
                  }}
                  className="
                      px-4 py-2 
                      flex items-center gap-3  
                      tablet:text-sm text-[13px] text-[var(--text)] opacity-90 
                      hover:bg-[var(--stroke-selectors-and-search-bars)]
                      [@media(pointer:coarse)]:active:bg-[var(--stroke-selectors-and-search-bars)]
                      cursor-pointer 
                      transition-colors"
                >
                  <span className="text-[var(--text)] opacity-90">
                      {option.icon}
                  </span>
                  <span>
                      {option.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="w-full">
            {renderAnswerInput()}
        </div>
        <div className="border-[1px] my-3 border-[var(--card-stroke)]"/>
        <div className="flex flex-row justify-between gap-4">
          <div className="gap-2 flex flex-row [@media(pointer:coarse)]:flex-col items-center justify-center">

            {/* Botón de Aceptar (Verde - Aceptar) */}
            <button 
              onClick={handleSaveQuestion}
              className="
                group flex h-8 items-center justify-center 
                rounded-full border border-emerald-500 bg-emerald-50 
                p-1.5 
                transition-all duration-300 ease-in-out 
                hover:bg-emerald-100 hover:pr-3
                [@media(pointer:coarse)]:active:bg-emerald-100
                [@media(pointer:coarse)]:pr-3
                cursor-pointer
              "
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 text-emerald-500 flex-shrink-0" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              
              <span className="
                max-w-0 overflow-hidden whitespace-nowrap 
                tablet:text-sm text-[13px] font-medium text-emerald-600 
                opacity-0 
                transition-all duration-300 ease-out 
                group-hover:ml-2 group-hover:max-w-[100px] group-hover:opacity-100
                [@media(pointer:coarse)]:ml-2 [@media(pointer:coarse)]:max-w-[100px] [@media(pointer:coarse)]:opacity-100
              ">
                Aceptar
              </span>
            </button>

            {/* Botón de Cancelar (Rojo - Cancelar) */}
            <button 

              onClick={() => {
                // 1. Cerramos la sección de edición
                setIsEditingSectionOpen(false);
                setEditingQuestionId(null); // <--- IMPORTANTE: Resetear modo edición
                // 2. Opcional: Si quieres que el botón verde gire de vuelta, puedes descomentar esto:
                setRotation(prev => prev - 360); 
                setIsCreationOn(false);
              }}

              className="
                group flex h-8 items-center justify-center 
                rounded-full border border-red-800/30 bg-red-50 
                p-1.5 
                transition-all duration-300 ease-in-out 
                hover:bg-red-100 hover:pr-3
                [@media(pointer:coarse)]:active:bg-red-100
                [@media(pointer:coarse)]:pr-3
                cursor-pointer
              "
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 text-red-900 flex-shrink-0" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>

              <span className="
                max-w-0 overflow-hidden whitespace-nowrap 
                tablet:text-sm text-[13px] font-medium text-red-900 
                opacity-0 
                transition-all duration-300 ease-out 
                group-hover:ml-2 group-hover:max-w-[100px] group-hover:opacity-100
                [@media(pointer:coarse)]:ml-2 [@media(pointer:coarse)]:max-w-[100px] [@media(pointer:coarse)]:opacity-100
              ">
                Cancelar
              </span>
            </button>

          </div>

          <div 
            onClick={() => {
               // Evitamos que se pueda clicar mientras está desapareciendo
               if (selectedTypeQuestionOption !== "Sólo texto (sin respuestas)") {
                  handleMandatoryToggle();
               }
            }}
            className={`
              flex flex-row [@media(pointer:coarse)]:flex-col items-center gap-2 group select-none
              transition-all duration-300 ease-in-out
              ${selectedTypeQuestionOption === "Sólo texto (sin respuestas)"
                ? 'opacity-0 invisible pointer-events-none translate-x-4' // Estado Oculto
                : 'opacity-100 visible translate-x-0 cursor-pointer'}    // Estado Visible
            `}
          >
            {/* 1. El Óvalo (Pista) */}
            <div 
              className={`
                w-12 h-6 
                flex items-center 
                rounded-full 
                p-1 
                transition-colors duration-300 ease-in-out
                ${isMandatoryOn ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300 hover:bg-gray-400'}
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
                  ${isMandatoryOn ? 'translate-x-6' : 'translate-x-0'}
                `}
              />
            </div>

            {/* 3. El Texto descriptivo */}
            <span className="text-[var(--text)] tablet:text-sm text-[13px]">
              Obligatorio
            </span>
          </div>

        </div>
      </div>
      <button
        onClick={() => {
          // Solo permitimos el clic si NO está editando (doble seguridad)
          if (!isEditingSectionOpen) {
            handleCreation();
          }
        }}
        // Agregamos 'pointer-events-none' cuando está abierto para que no reciba clicks
        disabled={isEditingSectionOpen} 
        className={`
          tablet:w-[60px] w-[50px] tablet:h-[60px] h-[50px] rounded-full absolute tablet:bottom-[40px] bottom-[25px] tablet:right-[40px] right-[25px] z-10
          flex items-center justify-center shadow-lg
          transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
          
          ${isEditingSectionOpen 
            ? 'bg-gray-300 text-gray-400 scale-75 cursor-default' // Estado DESACTIVADO (Gris, pequeño)
            : 'bg-[#10B981] text-white hover:bg-[#0D9668] [@media(pointer:coarse)]:active:bg-[#0D9668] hover:text-gray-200 [@media(pointer:coarse)]:active:text-gray-200 active:scale-90 cursor-pointer' // Estado ACTIVO
          }
        `}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="3"
          stroke="currentColor"
          className="tablet:w-9 w-8 tablet:h-9 h-8 transition-transform"
          style={{ 
            // Mantenemos tu lógica de rotación
            transform: `rotate(${rotation}deg)`,
            transitionDuration: '1000ms',
            transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' 
          }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>
    </div>
  )
}

export default FormCreation

