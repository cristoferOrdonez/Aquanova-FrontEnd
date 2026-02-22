import { useContext } from 'react';
import FormSubmissionContext from '../context/FormSubmissionContext';

export default function useFormSubmissionContext() {
  return useContext(FormSubmissionContext);
}
