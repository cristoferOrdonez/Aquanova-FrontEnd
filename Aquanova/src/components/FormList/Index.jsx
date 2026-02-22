// src/components/FormList/Index.jsx
import { FormListProvider } from "./context/FormListProvider";
import FormListContent from "./components/FormListContent";

/**
 * Punto de entrada para la funcionalidad de FormList.
 * Envuelve el contenido con el FormListProvider para gestionar el estado.
 */
const Index = () => {
    return (
        <FormListProvider>
            <FormListContent />
        </FormListProvider>
    );
};

export default Index;
