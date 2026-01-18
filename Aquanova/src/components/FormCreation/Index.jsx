import { FormCreationProvider } from './context/FormCreationProvider.jsx';
import FormCreationContent from './components/containers/FormCreationContent.jsx';

function Index() {
  return (
    <FormCreationProvider>
      <FormCreationContent />
    </FormCreationProvider>
  );
}

export default Index;