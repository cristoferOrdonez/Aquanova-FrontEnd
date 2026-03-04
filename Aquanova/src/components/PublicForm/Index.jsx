// src/components/PublicForm/Index.jsx
import { PublicFormProvider } from './context/PublicFormProvider';
import PublicFormContent from './components/PublicFormContent';

function PublicForm() {
  return (
    <PublicFormProvider>
      <PublicFormContent />
    </PublicFormProvider>
  );
}

export default PublicForm;
