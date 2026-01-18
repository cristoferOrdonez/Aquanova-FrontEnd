import { useState } from 'react';

export function useQuestionList(initial = []) {
  const [questions, setQuestions] = useState(initial);
  const [justUpdatedQuestionId, setJustUpdatedQuestionId] = useState(null);
  const [justCreatedId, setJustCreatedId] = useState(null);

  const addQuestion = (q) => {
    setQuestions(prev => [...prev, q]);
    setJustCreatedId(q.id);
    setTimeout(() => setJustCreatedId(null), 500);
  };

  const updateQuestion = (id, patch) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...patch } : q));
    setJustUpdatedQuestionId(id);
    setTimeout(() => setJustUpdatedQuestionId(null), 1000);
  };

  const deleteQuestion = (id) => {
    // keep animation: mark then delete after timeout should be handled by UI layer
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  return {
    questions,
    setQuestions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    justUpdatedQuestionId,
    justCreatedId,
    setJustUpdatedQuestionId,
    setJustCreatedId,
  };
}

export default useQuestionList;
