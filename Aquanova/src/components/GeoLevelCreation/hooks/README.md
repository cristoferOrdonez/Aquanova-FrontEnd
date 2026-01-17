# Hooks de GeoLevel Creation

Este módulo contiene hooks personalizados para manejar la funcionalidad de creación de niveles geográficos. Los hooks están organizados siguiendo el principio de responsabilidad única (Single Responsibility Principle) de Clean Code.

## Arquitectura de Hooks

```
useGeoLevelCreationForm (Orquestador)
    │
    ├── useGeoLevelSelection
    │   ├── Configuración de niveles geográficos
    │   ├── Selección de tipo de nivel
    │   └── Selectores padre
    │
    ├── useImageGallery
    │   ├── Carrusel de imágenes
    │   ├── Drag & Drop
    │   └── Gestión de slots
    │
    └── useResizablePanel
        ├── Redimensionamiento
        └── Límites de tamaño
```

## Estructura de Hooks

### 1. `useGeoLevelSelection.js`
**Responsabilidad:** Manejo de la selección y configuración de niveles geográficos.

**Retorna:**
- Constantes de opciones de niveles geográficos (predio, barrio, localidad)
- Configuración de fondos para cada nivel
- Estado de selección de nivel geográfico
- Estado de selectores padre (barrio y localidad)
- Función para manejar la selección de nivel

**Cuándo usar:** Cuando necesites gestionar la selección de tipos de niveles geográficos y sus configuraciones asociadas.

---

### 2. `useImageGallery.js`
**Responsabilidad:** Manejo de la galería de imágenes con funcionalidad de carrusel y drag & drop.

**Parámetros:**
- `slotsQuantity` (número): Cantidad de slots disponibles en la galería (default: 5)

**Retorna:**
- Estado de slots de imágenes
- Índice activo del carrusel
- Estado de arrastre (dragging)
- Funciones de navegación (siguiente, anterior, ir a slide)
- Manejadores de archivos (input change, drag & drop)
- Acciones de tarjeta (eliminar imagen, abrir en nueva pestaña)

**Cuándo usar:** Cuando necesites implementar una galería de imágenes con carga de archivos y navegación tipo carrusel.

---

### 3. `useResizablePanel.js`
**Responsabilidad:** Manejo de un panel redimensionable con límites configurables.

**Parámetros:**
- `initialWidth` (número): Ancho inicial del panel en porcentaje (default: 35)
- `minWidth` (número): Ancho mínimo del panel en porcentaje (default: 20)
- `maxWidth` (número): Ancho máximo del panel en porcentaje (default: 50)

**Retorna:**
- Ancho actual del panel
- Referencia al sidebar
- Estado de redimensionamiento
- Funciones para iniciar/detener redimensionamiento
- Constantes MIN_WIDTH y MAX_WIDTH

**Cuándo usar:** Cuando necesites implementar un panel lateral redimensionable con límites.

---

### 4. `useGeoLevelCreationForm.js` (Hook Principal)
**Responsabilidad:** Orquestar todos los hooks relacionados con la creación de niveles geográficos.

**Patrón de diseño:** Composición de hooks

**Retorna:** 
Consolidación de todos los valores de los hooks individuales mediante spread operator.

**Cuándo usar:** En componentes que necesiten la funcionalidad completa de creación de niveles geográficos.

---

## Ventajas de esta Arquitectura

1. **Separación de Responsabilidades:** Cada hook tiene una responsabilidad clara y única
2. **Reutilización:** Los hooks individuales pueden ser usados independientemente
3. **Mantenibilidad:** Es más fácil localizar y corregir bugs
4. **Testabilidad:** Cada hook puede ser probado de forma aislada
5. **Escalabilidad:** Nuevas funcionalidades se pueden agregar como nuevos hooks
6. **Legibilidad:** Código más limpio y fácil de entender

## Ejemplo de Uso

```javascript
import { useGeoLevelCreationForm } from "./hooks/useGeoLevelCreationForm";

const MiComponente = () => {
    const {
        selectedGeoLevel,
        slots,
        handleNext,
        leftWidth,
        // ... otros valores
    } = useGeoLevelCreationForm();

    // Usar los valores...
};
```

## Uso Individual de Hooks

También puedes usar los hooks de forma individual si solo necesitas funcionalidad específica:

```javascript
import { useImageGallery } from "./hooks/useImageGallery";

const GaleriaSimple = () => {
    const { slots, handleNext, handlePrev } = useImageGallery(3);
    // Solo funcionalidad de galería
};
```
