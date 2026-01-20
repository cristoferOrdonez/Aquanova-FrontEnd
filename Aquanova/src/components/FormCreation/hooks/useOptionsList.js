import { useState } from 'react';
import FORM_CREATION_CONFIG from '../config/formCreationConfig';

export function useOptionsList(initial = [FORM_CREATION_CONFIG.createDefaultOption()]) {
  const [optionsList, setOptionsList] = useState(initial);

  const addOption = (value = FORM_CREATION_CONFIG.defaultOptionLabel) => {
    setOptionsList(prev => [...prev, { id: Date.now(), value }]);
  };

  const updateOption = (id, value) => {
    setOptionsList(prev => prev.map(o => o.id === id ? { ...o, value } : o));
  };

  const removeOption = (id) => {
    setOptionsList(prev => prev.filter(o => o.id !== id));
  };

  const resetOptions = () => setOptionsList([ FORM_CREATION_CONFIG.createDefaultOption() ]);

  return {
    optionsList,
    setOptionsList,
    addOption,
    updateOption,
    removeOption,
    resetOptions,
  };
}

export default useOptionsList;
