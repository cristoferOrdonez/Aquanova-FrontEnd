# Arquitectura de `FormList`

Este documento describe la arquitectura del componente `FormList`, que ha sido refactorizado para seguir las mejores prácticas de Clean Code y utilizar la Context API para gestionar el estado.

## Estructura de Archivos

La carpeta `FormList` está organizada de la siguiente manera:

```
FormList/
├── components/
│   ├── FormCard.jsx
│   ├── FormListContent.jsx
│   └── FormStateElement.jsx
├── context/
│   ├── FormListContext.jsx
│   └── FormListProvider.jsx
├── hooks/
│   ├── useFormListContext.js
│   └── useForms.js
└── Index.jsx
```

### `Index.jsx`

Es el punto de entrada del componente `FormList`. Su única responsabilidad es envolver el componente `FormListContent` con el `FormListProvider`.

```jsx
import { FormListProvider } from "./context/FormListProvider";
import FormListContent from "./components/FormListContent";

const Index = () => {
    return (
        <FormListProvider>
            <FormListContent />
        </FormListProvider>
    );
};

export default Index;
```

### `context/`

Este directorio contiene todo lo relacionado con el Context API de `FormList`.

- **`FormListContext.jsx`**: Define el `FormListContext` utilizando `createContext`. También define el `FormListContextType` con JSDoc para describir la forma del contexto.

- **`FormListProvider.jsx`**: Es un componente que utiliza el hook `useForms` para obtener el estado y las funciones relacionadas con la lista de formularios. Luego, proporciona este estado y funciones a sus componentes hijos a través del `FormListContext.Provider`.

### `hooks/`

Este directorio contiene los hooks personalizados utilizados en la característica `FormList`.

- **`useForms.js`**: Este hook es responsable de toda la lógica de negocio relacionada con los formularios. Se encarga de obtener los formularios, manejar la búsqueda, la carga, los errores y la eliminación de formularios.

- **`useFormListContext.js`**: Un hook simple que proporciona acceso al `FormListContext`. También incluye una validación para asegurar que se utiliza dentro de un `FormListProvider`.

### `components/`

Este directorio contiene los componentes de la interfaz de usuario.

- **`FormListContent.jsx`**: Este componente consume el `FormListContext` utilizando el hook `useFormListContext` y renderiza la lista de formularios, la barra de búsqueda y los estados de carga y error.

- **`FormCard.jsx`**: Un componente que representa una sola tarjeta de formulario en la lista.

- **`FormStateElement.jsx`**: Un componente para mostrar los estados de la lista de formularios (carga, error, vacío).

## Principios de Clean Code Aplicados

- **Single Responsibility Principle (SRP)**: Cada componente, hook y contexto tiene una única responsabilidad.
- **Separation of Concerns**: La lógica de estado está separada de la interfaz de usuario.
- **Don't Repeat Yourself (DRY)**: La lógica de estado se centraliza en el hook `useForms` y se reutiliza en todo el componente.
- **Dependency Inversion**: Los componentes dependen de abstracciones (contexto) en lugar de implementaciones concretas.
