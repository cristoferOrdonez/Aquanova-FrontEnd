import { GeoLevelCreationProvider } from "./context/GeoLevelCreationProvider.jsx";
import GeoLevelCreationContent from "./components/containers/GeoLevelCreationContent.jsx";

/**
 * Componente principal de creación de niveles geográficos
 * Envuelve la aplicación con el provider de contexto
 */
const Index = () => {
    return (
        <GeoLevelCreationProvider>
            <GeoLevelCreationContent />
        </GeoLevelCreationProvider>
    );
};

export default Index;