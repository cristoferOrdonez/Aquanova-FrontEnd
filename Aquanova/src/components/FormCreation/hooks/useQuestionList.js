import { useState } from 'react';
import FORM_CREATION_CONFIG from '../config/formCreationConfig';

export function useQuestionList(initial = []) {
  const [questions, setQuestions] = useState(initial);
  const [justUpdatedQuestionId, setJustUpdatedQuestionId] = useState(null);
  const [justCreatedId, setJustCreatedId] = useState(null);

  const addQuestion = (q) => {
    setQuestions(prev => [...prev, q]);
    setJustCreatedId(q.id);
    setTimeout(() => setJustCreatedId(null), FORM_CREATION_CONFIG.timeouts.justCreated);
  };

  const updateQuestion = (id, patch) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...patch } : q));
    setJustUpdatedQuestionId(id);
    setTimeout(() => setJustUpdatedQuestionId(null), FORM_CREATION_CONFIG.timeouts.justUpdated);
  };

  const deleteQuestion = (id) => {
    // keep animation: mark then delete after timeout should be handled by UI layer
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const moveQuestion = (fromIndex, toIndex) => {
    setQuestions(prev => {
        const updated = [...prev];
        const [movedItem] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, movedItem);
        return updated;
    });
  };

  return {
    questions,
    setQuestions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    moveQuestion,
    justUpdatedQuestionId,
    justCreatedId,
    setJustUpdatedQuestionId,
    setJustCreatedId,
  };
}

export default useQuestionList;
