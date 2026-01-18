import { FormCreationProvider } from './context/FormCreationProvider';
import FormCreationContent from './components/FormCreationContent';

function Index() {
  return (
    <FormCreationProvider>
      <FormCreationContent />
    </FormCreationProvider>
  );
}

export default Index;