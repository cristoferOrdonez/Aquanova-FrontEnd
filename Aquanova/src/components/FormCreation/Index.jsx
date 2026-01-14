import { useState, useRef } from 'react';
import Header from './components/Header';
import QuestionList from './components/QuestionList';
import EditingSection from './components/EditingSection';
import CreationButton from './components/CreationButton';

//import {Bars3BottomLeftIcon} from '@heroicons/react/24/outline';

function Index() {

  const mainContainerRef = useRef(null); // <--- NUEVO: Referencia al contenedor

  const [questions, setQuestions] = useState([]);

  const [justUpdatedQuestionId, setJustUpdatedQuestionId] = useState(null);

  const [justCreatedId, setJustCreatedId] = useState(null);

  const [editingQuestionId, setEditingQuestionId] = useState(null);
  
  const [rotation, setRotation] = useState(0);

  const [isEditingSectionOpen, setIsEditingSectionOpen] = useState(false);

  const [isTypeQuestionSelectorOpen, setIsTypeQuestionSelectorOpen] = useState(false);
  const [selectedTypeQuestionOption, setSelectedTypeQuestionOption] = useState("Sólo texto (sin respuestas)");

  const [isMandatoryOn, setIsMandatoryOn] = useState(false);

  const [isFastOutEditingFrame, setIsFastOutEditingFrame] = useState(false);

  // ... estados anteriores ...

  // Estado para el título de la pregunta actual
  const [questionTitle, setQuestionTitle] = useState("Pregunta sin título");

  const [isCreationOn, setIsCreationOn] = useState(true);

  const [optionsList, setOptionsList] = useState([
    { id: Date.now(), value: "Opción sin título" }
  ]);

  return (
    <div 
      ref={mainContainerRef}
      className="bg-[var(--bg-color-main)] font-work w-screen h-screen flex flex-col items-center justify-start pt-10 gap-3 overflow-y-auto text-left"
    >

    <Header /> 
    <QuestionList
      questions={questions} setQuestions={setQuestions}
      justUpdatedQuestionId={justUpdatedQuestionId}
      justCreatedId={justCreatedId}
      editingQuestionId={editingQuestionId} setEditingQuestionId={setEditingQuestionId}
      isCreationOn={isCreationOn}
      questionTitle={questionTitle} setQuestionTitle={setQuestionTitle}
      selectedTypeQuestionOption={selectedTypeQuestionOption} setSelectedTypeQuestionOption={setSelectedTypeQuestionOption}
      optionsList={optionsList} setOptionsList={setOptionsList}
      isMandatoryOn={isMandatoryOn} setIsMandatoryOn={setIsMandatoryOn}
      isEditingSectionOpen={isEditingSectionOpen} setIsEditingSectionOpen={setIsEditingSectionOpen}
      isFastOutEditingFrame={isFastOutEditingFrame} setIsFastOutEditingFrame={setIsFastOutEditingFrame}
      setRotation={setRotation}
      mainContainerRef={mainContainerRef}
      setJustUpdatedQuestionId={setJustUpdatedQuestionId}
      setJustCreatedId={setJustCreatedId}
      setIsCreationOn={setIsCreationOn}
      isTypeQuestionSelectorOpen={isTypeQuestionSelectorOpen} setIsTypeQuestionSelectorOpen={setIsTypeQuestionSelectorOpen}
    /> 
    <EditingSection
      optionsList={optionsList} setOptionsList={setOptionsList}
      mainContainerRef={mainContainerRef}
      isMandatoryOn={isMandatoryOn} setIsMandatoryOn={setIsMandatoryOn}
      isFastOutEditingFrame={isFastOutEditingFrame} setIsFastOutEditingFrame={setIsFastOutEditingFrame}
      setRotation={setRotation}
      questionTitle={questionTitle} setQuestionTitle={setQuestionTitle}
      selectedTypeQuestionOption={selectedTypeQuestionOption} setSelectedTypeQuestionOption={setSelectedTypeQuestionOption}
      editingQuestionId={editingQuestionId} setEditingQuestionId={setEditingQuestionId}
      questions={questions} setQuestions={setQuestions}
      setJustUpdatedQuestionId={setJustUpdatedQuestionId}
      setJustCreatedId={setJustCreatedId}
      setIsCreationOn={setIsCreationOn}
      isEditingSectionOpen={isEditingSectionOpen} setIsEditingSectionOpen={setIsEditingSectionOpen}
      isTypeQuestionSelectorOpen={isTypeQuestionSelectorOpen} setIsTypeQuestionSelectorOpen={setIsTypeQuestionSelectorOpen}
      id={-1}
      
    />
    <CreationButton
      setIsCreationOn={setIsCreationOn}
      setIsFastOutEditingFrame={setIsFastOutEditingFrame}
      rotation={rotation} setRotation={setRotation}
      isEditingSectionOpen={isEditingSectionOpen} setIsEditingSectionOpen={setIsEditingSectionOpen}
      setQuestionTitle={setQuestionTitle}
      setSelectedTypeQuestionOption={setSelectedTypeQuestionOption}
      setOptionsList={setOptionsList}
      setIsMandatoryOn={setIsMandatoryOn}
      mainContainerRef={mainContainerRef}
      setEditingQuestionId={setEditingQuestionId}
    />  
    </div>
  )
}

export default Index;

