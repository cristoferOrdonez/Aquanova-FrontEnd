import FormPreviewProvider from './context/FormPreviewProvider.jsx';
import FormPreviewContent from './components/containers/FormPreviewContent.jsx';

const Index = () => {
  return (
    <FormPreviewProvider>
      <FormPreviewContent />
    </FormPreviewProvider>
  );
};

export default Index;
