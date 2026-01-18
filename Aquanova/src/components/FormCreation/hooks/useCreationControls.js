import { useState } from 'react';

export function useCreationControls() {
  const [rotation, setRotation] = useState(0);
  const [isCreationOn, setIsCreationOn] = useState(true);

  const toggleCreation = () => setIsCreationOn(prev => !prev);

  return {
    rotation,
    setRotation,
    isCreationOn,
    setIsCreationOn,
    toggleCreation,
  };
}

export default useCreationControls;
