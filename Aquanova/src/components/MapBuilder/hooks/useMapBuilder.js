import { useReducer, useCallback } from 'react';
import { ACTIONS, MAP_BUILDER_CONFIG, POLYGON_TYPES, TOOLS } from '../utils/constants';
import { verticesToSvgPath, generateId } from '../utils/polygonBuilder';
import { calculateArea, calculateCentroid } from '../utils/areaCalculator';
import { useHistory } from './useHistory';

/**
 * Estado inicial del Map Builder.
 * Nota: zoom y pan NO viven aquí — son responsabilidad de useCanvasInteraction.
 */
const initialState = {
  neighborhoodId: null,
  polygons: [],
  selectedIds: [],
  activeTool: TOOLS.SELECT,
  drawingPoints: [],
  viewBox: MAP_BUILDER_CONFIG.DEFAULT_VIEWBOX,
  showGrid: true,
  gridSize: MAP_BUILDER_CONFIG.DEFAULT_GRID_SIZE,
  validationResults: [],
  isDirty: false,
  lastSavedAt: null,
};

/**
 * Reducer puro para gestionar el estado del Map Builder.
 * Cada acción de ADD/UPDATE/DELETE marca isDirty=true.
 *
 * @param {object} state - Estado actual
 * @param {object} action - Acción a ejecutar { type, payload }
 * @returns {object} Nuevo estado
 */
function mapBuilderReducer(state, action) {
  const { type, payload } = action;

  switch (type) {
    case ACTIONS.SET_NEIGHBORHOOD:
      return { ...state, neighborhoodId: payload };

    case ACTIONS.SET_VIEWBOX:
      return { ...state, viewBox: payload };

    case ACTIONS.TOGGLE_GRID:
      return { ...state, showGrid: !state.showGrid };

    case ACTIONS.SET_GRID_SIZE:
      return { ...state, gridSize: payload };

    case ACTIONS.SET_ACTIVE_TOOL:
      return { ...state, activeTool: payload, drawingPoints: [] };

    case ACTIONS.ADD_DRAWING_POINT:
      return { ...state, drawingPoints: [...state.drawingPoints, payload] };

    case ACTIONS.CLOSE_POLYGON: {
      if (state.drawingPoints.length < MAP_BUILDER_CONFIG.MIN_POLYGON_VERTICES) {
        return { ...state, drawingPoints: [] };
      }
      const vertices = [...state.drawingPoints];
      const svgPath = verticesToSvgPath(vertices);
      const centroid = calculateCentroid(vertices);
      const area = calculateArea(vertices);

      const newPolygon = {
        id: generateId(),
        vertices,
        svgPath,
        centroid,
        area,
        type: POLYGON_TYPES.UNASSIGNED,
        parentId: null,
        code: null,
        number: null,
        metadata: {},
        createdAt: new Date().toISOString(),
      };

      return {
        ...state,
        polygons: [...state.polygons, newPolygon],
        drawingPoints: [],
        isDirty: true,
      };
    }

    case ACTIONS.CANCEL_DRAWING:
      return { ...state, drawingPoints: [] };

    case ACTIONS.ADD_POLYGON:
      return {
        ...state,
        polygons: [...state.polygons, payload],
        isDirty: true,
      };

    case ACTIONS.ADD_POLYGONS_BATCH:
      return {
        ...state,
        polygons: [...state.polygons, ...payload],
        isDirty: true,
      };

    case ACTIONS.UPDATE_POLYGON:
      return {
        ...state,
        polygons: state.polygons.map((p) =>
          p.id === payload.id ? { ...p, ...payload.changes } : p
        ),
        isDirty: true,
      };

    case ACTIONS.DELETE_POLYGONS:
      return {
        ...state,
        polygons: state.polygons.filter((p) => !payload.includes(p.id)),
        selectedIds: state.selectedIds.filter((id) => !payload.includes(id)),
        isDirty: true,
      };

    case ACTIONS.SELECT_POLYGON:
      return {
        ...state,
        selectedIds: payload ? [payload] : [],
      };

    case ACTIONS.SELECT_POLYGONS:
      return { ...state, selectedIds: payload };

    case ACTIONS.DESELECT_ALL:
      return { ...state, selectedIds: [] };

    case ACTIONS.MOVE_VERTEX: {
      const { polygonId, vertexIndex, position } = payload;
      return {
        ...state,
        polygons: state.polygons.map((p) => {
          if (p.id !== polygonId) return p;
          const newVertices = [...p.vertices];
          newVertices[vertexIndex] = position;
          return {
            ...p,
            vertices: newVertices,
            svgPath: verticesToSvgPath(newVertices),
            centroid: calculateCentroid(newVertices),
            area: calculateArea(newVertices),
          };
        }),
        isDirty: true,
      };
    }

    case ACTIONS.ADD_VERTEX: {
      const { polygonId, afterIndex, position } = payload;
      return {
        ...state,
        polygons: state.polygons.map((p) => {
          if (p.id !== polygonId) return p;
          const newVertices = [...p.vertices];
          newVertices.splice(afterIndex + 1, 0, position);
          return {
            ...p,
            vertices: newVertices,
            svgPath: verticesToSvgPath(newVertices),
            centroid: calculateCentroid(newVertices),
            area: calculateArea(newVertices),
          };
        }),
        isDirty: true,
      };
    }

    case ACTIONS.DELETE_VERTEX: {
      const { polygonId, vertexIndex } = payload;
      return {
        ...state,
        polygons: state.polygons.map((p) => {
          if (p.id !== polygonId) return p;
          if (p.vertices.length <= MAP_BUILDER_CONFIG.MIN_POLYGON_VERTICES) return p;
          const newVertices = p.vertices.filter((_, i) => i !== vertexIndex);
          return {
            ...p,
            vertices: newVertices,
            svgPath: verticesToSvgPath(newVertices),
            centroid: calculateCentroid(newVertices),
            area: calculateArea(newVertices),
          };
        }),
        isDirty: true,
      };
    }

    case ACTIONS.ASSIGN_AS_BLOCK:
      return {
        ...state,
        polygons: state.polygons.map((p) =>
          p.id === payload.polygonId
            ? { ...p, type: POLYGON_TYPES.BLOCK, code: payload.code, parentId: null, number: null }
            : p
        ),
        isDirty: true,
      };

    case ACTIONS.ASSIGN_AS_LOT:
      return {
        ...state,
        polygons: state.polygons.map((p) =>
          p.id === payload.polygonId
            ? { ...p, type: POLYGON_TYPES.LOT, parentId: payload.blockId, number: payload.number, code: null }
            : p
        ),
        isDirty: true,
      };

    case ACTIONS.UNASSIGN:
      return {
        ...state,
        polygons: state.polygons.map((p) =>
          p.id === payload
            ? { ...p, type: POLYGON_TYPES.UNASSIGNED, parentId: null, code: null, number: null }
            : p
        ),
        isDirty: true,
      };

    case ACTIONS.UPDATE_METADATA:
      return {
        ...state,
        polygons: state.polygons.map((p) =>
          p.id === payload.polygonId
            ? { ...p, metadata: { ...p.metadata, ...payload.metadata } }
            : p
        ),
        isDirty: true,
      };

    case ACTIONS.IMPORT_POLYGONS:
      return {
        ...state,
        polygons: [...state.polygons, ...payload],
        isDirty: true,
      };

    case ACTIONS.SET_VALIDATION_RESULTS:
      return { ...state, validationResults: payload };

    case ACTIONS.MARK_SAVED:
      return { ...state, isDirty: false, lastSavedAt: new Date().toISOString() };

    case ACTIONS.MARK_DIRTY:
      return { ...state, isDirty: true };

    case ACTIONS.LOAD_STATE:
      return {
        ...state,
        polygons: payload,
        isDirty: true,
      };

    case ACTIONS.LOAD_DRAFT:
      return {
        ...state,
        ...payload,
        isDirty: false,
      };

    default:
      return state;
  }
}

/**
 * Hook principal del Map Builder.
 * Gestiona el estado completo con useReducer e integra historial de undo/redo.
 *
 * @returns {{
 *   state: object,
 *   dispatch: Function,
 *   addPolygon: (polygon: object) => void,
 *   addPolygons: (polygons: Array) => void,
 *   updatePolygon: (polygonId: string, changes: object) => void,
 *   deletePolygon: (polygonId: string) => void,
 *   deleteSelected: () => void,
 *   pushHistorySnapshot: () => void,
 *   assignAsBlock: (polygonId: string, code: string) => void,
 *   assignAsLot: (polygonId: string, blockId: string, number: string|number) => void,
 *   updateMetadata: (polygonId: string, metadata: object) => void,
 *   undo: () => void,
 *   redo: () => void,
 *   canUndo: boolean,
 *   canRedo: boolean,
 *   getBlocks: () => Array,
 *   getLots: (blockId: string) => Array,
 *   getUnassigned: () => Array,
 *   serialize: () => object,
 *   loadFromServer: (data: object) => void,
 * }}
 */
export const useMapBuilder = () => {
  const [state, dispatch] = useReducer(mapBuilderReducer, initialState);
  const history = useHistory();

  /**
   * Agrega un polígono al estado y guarda snapshot en historial.
   * @param {object} polygon - Polígono completo a agregar
   */
  const addPolygon = useCallback((polygon) => {
    history.pushState(state.polygons);
    dispatch({ type: ACTIONS.ADD_POLYGON, payload: polygon });
  }, [state.polygons, history]);

  /**
   * Agrega varios polígonos de una vez (importación) con un solo snapshot.
   * @param {Array} polygons - Polígonos ya normalizados
   */
  const addPolygons = useCallback((polygons) => {
    if (!polygons || polygons.length === 0) return;
    history.pushState(state.polygons);
    dispatch({ type: ACTIONS.ADD_POLYGONS_BATCH, payload: polygons });
  }, [state.polygons, history]);

  /**
   * Actualiza campos de primer nivel de un polígono (code, number, type…).
   * @param {string} polygonId - ID del polígono
   * @param {object} changes - Campos a reemplazar
   */
  const updatePolygon = useCallback((polygonId, changes) => {
    if (!polygonId || !changes) return;
    dispatch({ type: ACTIONS.UPDATE_POLYGON, payload: { id: polygonId, changes } });
  }, []);

  /**
   * Elimina un polígono concreto (menú contextual / jerarquía).
   * @param {string} polygonId - ID del polígono
   */
  const deletePolygon = useCallback((polygonId) => {
    if (!polygonId) return;
    history.pushState(state.polygons);
    dispatch({ type: ACTIONS.DELETE_POLYGONS, payload: [polygonId] });
  }, [state.polygons, history]);

  /**
   * Elimina los polígonos seleccionados y guarda snapshot en historial.
   */
  const deleteSelected = useCallback(() => {
    if (state.selectedIds.length === 0) return;
    history.pushState(state.polygons);
    dispatch({ type: ACTIONS.DELETE_POLYGONS, payload: state.selectedIds });
  }, [state.selectedIds, state.polygons, history]);

  /**
   * Guarda un snapshot antes de una operación externa que despacha muchas
   * veces seguidas (por ejemplo el arrastre de un vértice).
   */
  const pushHistorySnapshot = useCallback(() => {
    history.pushState(state.polygons);
  }, [state.polygons, history]);

  /**
   * Asigna un polígono como bloque (manzana) con un código.
   * @param {string} polygonId - ID del polígono
   * @param {string} code - Código del bloque
   */
  const assignAsBlock = useCallback((polygonId, code) => {
    if (!polygonId) return;
    history.pushState(state.polygons);
    dispatch({ type: ACTIONS.ASSIGN_AS_BLOCK, payload: { polygonId, code } });
  }, [state.polygons, history]);

  /**
   * Asigna un polígono como lote dentro de un bloque.
   * @param {string} polygonId - ID del polígono
   * @param {string} blockId - ID del bloque padre
   * @param {string|number} number - Número del lote
   */
  const assignAsLot = useCallback((polygonId, blockId, number) => {
    if (!polygonId || !blockId) return;
    history.pushState(state.polygons);
    dispatch({ type: ACTIONS.ASSIGN_AS_LOT, payload: { polygonId, blockId, number } });
  }, [state.polygons, history]);

  /**
   * Actualiza metadata de un polígono.
   * @param {string} polygonId - ID del polígono
   * @param {object} metadata - Campos de metadata a actualizar (merge)
   */
  const updateMetadata = useCallback((polygonId, metadata) => {
    dispatch({ type: ACTIONS.UPDATE_METADATA, payload: { polygonId, metadata } });
  }, []);

  /**
   * Deshace la última acción restaurando el estado anterior de polígonos.
   */
  const undo = useCallback(() => {
    const previousState = history.undo();
    if (previousState) {
      dispatch({ type: ACTIONS.LOAD_STATE, payload: previousState });
    }
  }, [history]);

  /**
   * Rehace la última acción deshecha.
   */
  const redo = useCallback(() => {
    const nextState = history.redo();
    if (nextState) {
      dispatch({ type: ACTIONS.LOAD_STATE, payload: nextState });
    }
  }, [history]);

  /**
   * Retorna todos los polígonos asignados como bloques.
   * @returns {Array} Polígonos de tipo 'block'
   */
  const getBlocks = useCallback(() => {
    return state.polygons.filter((p) => p.type === POLYGON_TYPES.BLOCK);
  }, [state.polygons]);

  /**
   * Retorna los lotes de un bloque específico.
   * @param {string} blockId - ID del bloque padre
   * @returns {Array} Polígonos de tipo 'lot' con parentId === blockId
   */
  const getLots = useCallback((blockId) => {
    return state.polygons.filter(
      (p) => p.type === POLYGON_TYPES.LOT && p.parentId === blockId
    );
  }, [state.polygons]);

  /**
   * Retorna todos los polígonos sin asignar.
   * @returns {Array} Polígonos de tipo 'unassigned'
   */
  const getUnassigned = useCallback(() => {
    return state.polygons.filter((p) => p.type === POLYGON_TYPES.UNASSIGNED);
  }, [state.polygons]);

  /**
   * Serializa el estado completo para persistencia (guardado/draft).
   * @returns {object} Estado serializable
   */
  const serialize = useCallback(() => {
    return {
      neighborhoodId: state.neighborhoodId,
      polygons: state.polygons,
      viewBox: state.viewBox,
      gridSize: state.gridSize,
      showGrid: state.showGrid,
      exportedAt: new Date().toISOString(),
    };
  }, [state.neighborhoodId, state.polygons, state.viewBox, state.gridSize, state.showGrid]);

  /**
   * Carga datos del backend al estado (reemplaza polígonos y metadata).
   * @param {object} data - Datos del servidor { polygons, neighborhoodId, viewBox, ... }
   */
  const loadFromServer = useCallback((data) => {
    history.clear();
    dispatch({
      type: ACTIONS.LOAD_DRAFT,
      payload: {
        neighborhoodId: data.neighborhoodId || null,
        polygons: data.polygons || [],
        viewBox: data.viewBox || MAP_BUILDER_CONFIG.DEFAULT_VIEWBOX,
        gridSize: data.gridSize || MAP_BUILDER_CONFIG.DEFAULT_GRID_SIZE,
        showGrid: data.showGrid || false,
        selectedIds: [],
        drawingPoints: [],
        validationResults: [],
      },
    });
  }, [history]);

  return {
    state,
    dispatch,
    addPolygon,
    addPolygons,
    updatePolygon,
    deletePolygon,
    deleteSelected,
    pushHistorySnapshot,
    assignAsBlock,
    assignAsLot,
    updateMetadata,
    undo,
    redo,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    getBlocks,
    getLots,
    getUnassigned,
    serialize,
    loadFromServer,
  };
};
