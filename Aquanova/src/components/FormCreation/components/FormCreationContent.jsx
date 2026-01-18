import { useRef } from 'react';
import Header from './Header';
import QuestionList from './QuestionList';
import EditingSection from './EditingSection';
import CreationButton from './controls/CreationButton';

export default function FormCreationContent() {
  const mainContainerRef = useRef(null);

  return (
    <div
      ref={mainContainerRef}
      className="bg-[var(--bg-color-main)] font-work w-screen h-screen flex flex-col items-center justify-start pt-10 gap-3 overflow-y-auto text-left"
    >
      <Header />

      <QuestionList mainContainerRef={mainContainerRef} />

      <EditingSection mainContainerRef={mainContainerRef} id={-1} />

      <CreationButton mainContainerRef={mainContainerRef} />
    </div>
  );
}
