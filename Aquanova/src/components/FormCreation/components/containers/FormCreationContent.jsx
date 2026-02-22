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
      <div className="bg-[var(--bg-color-main)] font-work w-screen h-screen flex items-center justify-center">
        <span className="text-lg text-[var(--blue-buttons)] font-semibold animate-pulse">
          Cargando formulario…
        </span>
      </div>
    );
  }

  // Estado de error para modo edición
  if (isEditMode && editLoadError) {
    return (
      <div className="bg-[var(--bg-color-main)] font-work w-screen h-screen flex flex-col items-center justify-center gap-4">
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
      className="bg-[var(--bg-color-main)] font-work w-screen h-screen flex flex-col items-center justify-start pt-10 gap-3 overflow-y-auto text-left"
    >
      <HeaderSection />

      <QuestionList mainContainerRef={mainContainerRef} />

      <EditingSection mainContainerRef={mainContainerRef} id={-1} />

      <CreationButton mainContainerRef={mainContainerRef} />
    </div>
  );
}
