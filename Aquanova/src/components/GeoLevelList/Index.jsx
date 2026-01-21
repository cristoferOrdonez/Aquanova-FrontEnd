import { GeoLevelListProvider } from './context/GeoLevelListProvider';
import GeoLevelListContent from './components/GeoLevelListContent';

/**
 * Entry del módulo GeoLevelList
 * Mantenerlo limpio (Provider + Content), similar a GeoLevelCreation.
 */
const Index = () => {
  return (
    <GeoLevelListProvider>
      <GeoLevelListContent />
    </GeoLevelListProvider>
  );
};

export default Index;