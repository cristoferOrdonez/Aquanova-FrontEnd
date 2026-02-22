import { useContext } from 'react';
import { FormPreviewContext } from '../context/FormPreviewContext';

export function useFormPreviewContext() {
  return useContext(FormPreviewContext);
}
