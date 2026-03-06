import { useRef } from 'react';
import HeaderSection from './HeaderSection.jsx';
import QuestionList from './QuestionListSection.jsx';
import EditingSection from './EditingSection.jsx';
import CreationButton from './../ui/buttons/CreationButton.jsx';
import { useEditModeContext } from '../../hooks/useFormCreationContext.js';

export default function FormCreationContent() {
  const mainContainerRef = useRef(null);
  const { isEditMode, isLoadingEdit, editLoadError, exitToList } = useEditModeContext();

  // Estado de carga para modo edición
  if (isEditMode && isLoadingEdit) {
    return (
      <div className="bg-[var(--bg-color-main)] font-work w-screen h-full flex flex-col items-center justify-start pt-10 gap-4 overflow-y-auto">
        {/* Skeleton del header */}
        <div className="tablet:w-[653px] w-[90%] bg-[var(--card-bg)] border-[1.5px] border-[var(--card-stroke)] rounded-[5px] px-6 py-4 flex phone:flex-row flex-col gap-6 animate-pulse">
          <div className="phone:w-[44%] w-full h-48 bg-[#E0EEFF] rounded-[14px]" />
          <div className="flex-1 flex flex-col gap-3 justify-center">
            <div className="w-3/4 h-6 bg-gray-200 rounded-[5px]" />
            <div className="w-full h-4 bg-gray-200 rounded-[5px]" />
            <div className="w-5/6 h-4 bg-gray-200 rounded-[5px]" />
            <div className="w-2/3 h-4 bg-gray-200 rounded-[5px]" />
            <div className="w-1/2 h-10 bg-[#E0EEFF] rounded-[14px] mt-2" />
          </div>
        </div>
        {/* Skeleton de preguntas */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="tablet:w-[653px] w-[90%] bg-[var(--card-bg)] border-[1.5px] border-[var(--card-stroke)] rounded-[5px] p-6 flex flex-col gap-3 animate-pulse">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-gray-200 rounded-full" />
              <div className="w-2/3 h-4 bg-gray-200 rounded-[5px]" />
            </div>
            <div className="w-full h-10 bg-[#F1F5F9] rounded-[8px]" />
          </div>
        ))}
        <p className="text-xs text-gray-400 animate-pulse pb-6">Cargando formulario…</p>
      </div>
    );
  }

  // Estado de error para modo edición
  if (isEditMode && editLoadError) {
    return (
      <div className="bg-[var(--bg-color-main)] font-work w-screen h-full flex flex-col items-center justify-center gap-4">
        <p className="text-red-500 text-lg">{editLoadError}</p>
        <button
          onClick={exitToList}
          className="text-blue-500 underline"
        >
          Volver a la lista
        </button>
      </div>
    );
  }

  return (
    <div
      ref={mainContainerRef}
      className="bg-[var(--bg-color-main)] font-work w-full min-h-full flex flex-col items-center justify-start pt-10 pb-20 gap-3 text-left"
    >
      {/* Indicador de modo: creación o edición */}
      <div className="tablet:w-[653px] w-[90%] flex items-center gap-2 -mb-1">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
          isEditMode
            ? 'bg-blue-50 text-[#2138C4] border-blue-200'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
        }`}>
          {isEditMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          )}
          {isEditMode ? 'Editando formulario' : 'Nuevo formulario'}
        </span>
      </div>

      <HeaderSection />

      <QuestionList mainContainerRef={mainContainerRef} />

      <div id="creation-editing-frame">
        <EditingSection mainContainerRef={mainContainerRef} id={-1} />
      </div>

      <CreationButton />
    </div>
  );
}
