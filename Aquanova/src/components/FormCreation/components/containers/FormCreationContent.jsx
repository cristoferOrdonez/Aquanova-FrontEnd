import { useRef } from 'react';
import HeaderSection from './HeaderSection.jsx';
import QuestionList from './QuestionListSection.jsx';
import EditingSection from './EditingSection.jsx';
import CreationButton from './../ui/buttons/CreationButton.jsx';

export default function FormCreationContent() {
  const mainContainerRef = useRef(null);

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
