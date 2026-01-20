import { useState, useEffect } from 'react';
import FORM_CREATION_CONFIG from '../config/formCreationConfig';
import { neighborhoodService } from '../../../services/neighborhoodService';

export function useNeighborhoodSelector(initial = null) {
  // selectedOption: null | { id, label }
  const [selectedOption, setSelectedOption] = useState(initial);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [options, setOptions] = useState([]);

  const toggleSelector = () => setIsSelectorOpen(prev => !prev);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await neighborhoodService.getAll();
        if (!mounted) return;
        setOptions(list || []);
        // if no selection, set placeholder-like object
        if (!selectedOption) {
          setSelectedOption({ id: null, label: FORM_CREATION_CONFIG.neighborhoodPlaceholder });
        }
      } catch (err) {
        if (!mounted) return;
        setOptions([]);
        setSelectedOption({ id: null, label: FORM_CREATION_CONFIG.neighborhoodPlaceholder });
      }
    })();

    return () => { mounted = false; };
  }, []);

  return {
    options,
    selectedOption,
    setSelectedOption,
    isSelectorOpen,
    setIsSelectorOpen,
    toggleSelector,
  };
}

export default useNeighborhoodSelector;
