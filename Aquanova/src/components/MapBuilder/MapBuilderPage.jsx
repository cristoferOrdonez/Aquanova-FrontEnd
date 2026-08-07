import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { neighborhoodService } from '../../services/neighborhoodService';
import { mapBuilderService } from '../../services/mapBuilderService';

// Hooks
import { useMapBuilder } from './hooks/useMapBuilder';
import { useCanvasInteraction } from './hooks/useCanvasInteraction';
import { useSnapEngine } from './hooks/useSnapEngine';
import { useDrawingTool } from './hooks/useDrawingTool';
import { useValidation } from './hooks/useValidation';
import { useAutoSave } from './hooks/useAutoSave';

// Components
import CanvasEngine from './CanvasEngine';
import ToolbarPanel from './ToolbarPanel';
import HierarchyPanel from './HierarchyPanel';
import PropertiesPanel from './PropertiesPanel';
import ValidationOverlay from './ValidationOverlay';
import ViewBoxConfig from './ViewBoxConfig';
import ImportSVGModal from './ImportSVGModal';
import ContextMenu from './ContextMenu';
import MiniMap from './MiniMap';

// Utils
import { TOOLS, ACTIONS, KEYBOARD_SHORTCUTS, POLYGON_TYPES } from './utils/constants';
import {
  svgPathToVertices as svgPathToVerticesUtil,
  verticesToSvgPath,
  generateId,
} from './utils/polygonBuilder';
import { calculateArea, calculateCentroid } from './utils/areaCalculator';
import { isPointInPolygon } from './utils/geometryValidation';

export default function MapBuilderPage() {
  const navigate = useNavigate();
  const svgRef = useRef(null);

  // ─── Local UI state ──────────────────────────────────────────────────────────
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(true);
  const [loadingMap, setLoadingMap] = useState(false);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showViewBoxConfig, setShowViewBoxConfig] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [gridVisible, setGridVisible] = useState(true);
  const [contextMenu, setContextMenu] = useState({ isOpen: false, position: { x: 0, y: 0 }, targetPolygon: null });
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);
  const [pendingDraft, setPendingDraft] = useState(null);
  const [draggingVertex, setDraggingVertex] = useState(null);

  // Evita que el click sintético posterior a un arrastre o pan dispare el canvas
  const suppressClickRef = useRef(false);

  // ─── Hooks composition ───────────────────────────────────────────────────────
  const {
    state, dispatch, addPolygon, addPolygons, updatePolygon, deletePolygon,
    deleteSelected, pushHistorySnapshot, assignAsBlock, assignAsLot,
    updateMetadata, undo, redo, canUndo, canRedo, getBlocks, getLots,
    serialize, loadFromServer,
  } = useMapBuilder();

  // Única fuente de verdad de la vista (zoom + pan): el reducer no los guarda
  const {
    zoomLevel, isPanning, viewRect, transformedViewBox, handleWheel,
    zoomIn, zoomOut, handlePanStart, handlePanMove, handlePanEnd,
    centerOn, fitToContent, screenToSvg,
  } = useCanvasInteraction(state.viewBox);

  const { snapTarget, getSnappedPosition } = useSnapEngine();

  const {
    drawingPoints, isDrawing, previewPoint, handleCanvasClick,
    handleMouseMove, cancelDrawing, completePolygon,
  } = useDrawingTool({
    activeTool: state.activeTool,
    polygons: state.polygons,
    snapEngine: { getSnappedPosition, snapTarget },
  });

  const { validationResults, hasErrors, hasWarnings } = useValidation(state.polygons);

  const { lastSavedAt, loadDraft, deleteDraft } = useAutoSave({
    state,
    neighborhoodId: state.neighborhoodId,
  });

  // Manzanas disponibles (menú contextual y asignación de predios)
  const blocks = useMemo(() => getBlocks(), [getBlocks]);

  // ─── Load neighborhoods on mount ────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function fetchNeighborhoods() {
      try {
        const data = await neighborhoodService.getAll();
        if (!cancelled) setNeighborhoods(data || []);
      } catch {
        if (!cancelled) setError('Error al cargar barrios');
      } finally {
        if (!cancelled) setLoadingNeighborhoods(false);
      }
    }
    fetchNeighborhoods();
    return () => { cancelled = true; };
  }, []);

  // ─── Neighborhood selection handler ──────────────────────────────────────────
  const handleNeighborhoodSelect = useCallback(async (neighborhoodId) => {
    if (!neighborhoodId) return;

    setLoadingMap(true);
    setError(null);

    dispatch({ type: ACTIONS.SET_NEIGHBORHOOD, payload: neighborhoodId });

    try {
      // Try to load a draft first
      const draft = await loadDraft(neighborhoodId);

      if (draft) {
        // Draft found – ask user if they want to restore it
        setPendingDraft(draft);
        setShowDraftPrompt(true);
        setLoadingMap(false);
        return;
      }

      // No draft – load from server
      await loadMapFromServer(neighborhoodId);
    } catch {
      // No draft available, try server load
      await loadMapFromServer(neighborhoodId);
    }
  }, [dispatch, loadDraft]);

  const loadMapFromServer = async (neighborhoodId) => {
    try {
      const response = await mapBuilderService.loadMap(neighborhoodId);
      const mapData = response?.data || response;

      if (mapData && mapData.blocks && mapData.blocks.length > 0) {
        // Transformar blocks/lots del backend al formato de polígonos del editor
        const polygons = [];

        for (const block of mapData.blocks) {
          // Agregar bloque como polígono de tipo 'block'
          if (block.geom_path && block.geom_path !== 'M0,0 Z') {
            polygons.push({
              id: block.id,
              vertices: svgPathToVerticesUtil(block.geom_path),
              svgPath: block.geom_path,
              centroid: block.label_position || null,
              area: 0,
              type: 'block',
              parentId: null,
              code: block.code,
              number: null,
              metadata: {},
            });
          }

          // Agregar cada lote como polígono de tipo 'lot'
          for (const lot of (block.lots || [])) {
            if (lot.svg_path) {
              polygons.push({
                id: lot.id,
                vertices: svgPathToVerticesUtil(lot.svg_path),
                svgPath: lot.svg_path,
                centroid: lot.centroid || null,
                area: lot.area_m2 || 0,
                type: 'lot',
                parentId: block.id,
                code: null,
                number: lot.number,
                metadata: {
                  cadastralId: lot.cadastral_id || null,
                  waterMeterCode: lot.water_meter_code || null,
                  status: lot.status || 'sin_informacion',
                },
              });
            }
          }
        }

        loadFromServer({
          neighborhoodId,
          polygons,
          viewBox: mapData.viewBox || '0 0 1000 1000',
        });
      }
      // If no blocks, canvas starts empty (default state already set via SET_NEIGHBORHOOD)
    } catch {
      // 404 or no map found → start with empty canvas
      console.info('No existing map found, starting empty canvas');
    } finally {
      setLoadingMap(false);
    }
  };

  const handleDraftRestore = useCallback((restore) => {
    setShowDraftPrompt(false);
    if (restore && pendingDraft) {
      dispatch({ type: ACTIONS.LOAD_DRAFT, payload: pendingDraft });
    } else {
      // Discard draft and load from server
      if (state.neighborhoodId) {
        deleteDraft(state.neighborhoodId);
        loadMapFromServer(state.neighborhoodId);
      }
    }
    setPendingDraft(null);
    setLoadingMap(false);
  }, [pendingDraft, dispatch, deleteDraft, state.neighborhoodId]);

  // ─── Save handler ────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!state.neighborhoodId || isSaving) return;

    setIsSaving(true);
    setError(null);

    try {
      const serialized = serialize();
      await mapBuilderService.saveMap({
        neighborhoodId: state.neighborhoodId,
        ...serialized,
      });
      dispatch({ type: ACTIONS.MARK_SAVED });
      // Delete draft after successful save
      await deleteDraft(state.neighborhoodId);
    } catch (err) {
      setError('Error al guardar el mapa');
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  }, [state.neighborhoodId, isSaving, serialize, dispatch, deleteDraft]);

  // ─── Canvas event wrappers ───────────────────────────────────────────────────
  const closeContextMenu = useCallback(() => {
    setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, targetPolygon: null });
  }, []);

  const handleCanvasClickWrapped = useCallback((e) => {
    // Cerrar el menú contextual con el primer click
    if (contextMenu.isOpen) {
      closeContextMenu();
      return;
    }

    // Ignorar el click sintético que sigue a un arrastre de vértice o a un pan
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }

    const svgPoint = screenToSvg(e);
    if (!svgPoint) return;

    // El snap se aplica dentro de useDrawingTool, que conoce los puntos en curso
    const result = handleCanvasClick(svgPoint);
    if (!result) return;

    if (result.vertices) {
      addPolygon(result);
      return;
    }

    if (result.action === 'select') {
      dispatch({ type: ACTIONS.SELECT_POLYGON, payload: result.polygonId });
    } else if (result.action === 'deselect') {
      dispatch({ type: ACTIONS.DESELECT_ALL });
    }
  }, [contextMenu.isOpen, closeContextMenu, screenToSvg, handleCanvasClick, addPolygon, dispatch]);

  const handleCanvasMouseMoveWrapped = useCallback((e) => {
    if (isPanning) {
      handlePanMove(e);
      return;
    }

    const svgPoint = screenToSvg(e);
    if (!svgPoint) return;

    // Arrastre de vértice: se snapea a vértices de OTROS polígonos
    if (draggingVertex) {
      const position = getSnappedPosition(svgPoint, state.polygons, draggingVertex.polygonId);
      dispatch({ type: ACTIONS.MOVE_VERTEX, payload: { ...draggingVertex, position } });
      return;
    }

    // handleMouseMove ya recalcula el snap (conoce los puntos en curso)
    handleMouseMove(svgPoint);
  }, [
    isPanning, handlePanMove, screenToSvg, draggingVertex, getSnappedPosition,
    state.polygons, dispatch, handleMouseMove,
  ]);

  const handleCanvasMouseUp = useCallback(() => {
    // El pan es con botón central: no genera evento `click`, no hay que suprimir nada
    if (isPanning) {
      handlePanEnd();
    }
    if (draggingVertex) {
      setDraggingVertex(null);
      suppressClickRef.current = true;
    }
  }, [isPanning, handlePanEnd, draggingVertex]);

  // ─── Edición de vértices ─────────────────────────────────────────────────────
  const handleVertexMouseDown = useCallback((e, polygonId, vertexIndex) => {
    e.stopPropagation();
    e.preventDefault();
    // Un solo snapshot para todo el arrastre (MOVE_VERTEX despacha en cada mousemove)
    pushHistorySnapshot();
    setDraggingVertex({ polygonId, vertexIndex });
    suppressClickRef.current = true;
  }, [pushHistorySnapshot]);

  const handleVertexDoubleClick = useCallback((e, polygonId, vertexIndex) => {
    e.stopPropagation();
    e.preventDefault();
    pushHistorySnapshot();
    dispatch({ type: ACTIONS.DELETE_VERTEX, payload: { polygonId, vertexIndex } });
    setDraggingVertex(null);
    suppressClickRef.current = true;
  }, [pushHistorySnapshot, dispatch]);

  // ─── Menú contextual ─────────────────────────────────────────────────────────
  const openContextMenu = useCallback((clientX, clientY, polygon) => {
    if (polygon) {
      dispatch({ type: ACTIONS.SELECT_POLYGON, payload: polygon.id });
    }
    setContextMenu({
      isOpen: true,
      position: { x: clientX, y: clientY },
      targetPolygon: polygon || null,
    });
  }, [dispatch]);

  const handleContextMenuOpen = useCallback((e) => {
    e.preventDefault();
    const svgPoint = screenToSvg(e);
    // Polígono bajo el cursor (gana el último dibujado, que es el que se ve encima)
    const target = svgPoint
      ? [...state.polygons].reverse().find((p) => p.vertices && isPointInPolygon(svgPoint, p.vertices))
      : null;
    openContextMenu(e.clientX, e.clientY, target || null);
  }, [screenToSvg, state.polygons, openContextMenu]);

  const handleHierarchyContextMenu = useCallback((e, polygon) => {
    e.preventDefault();
    openContextMenu(e.clientX, e.clientY, polygon);
  }, [openContextMenu]);

  // ─── Tool change handler ─────────────────────────────────────────────────────
  const handleToolChange = useCallback((tool) => {
    if (isDrawing) {
      cancelDrawing();
    }
    dispatch({ type: ACTIONS.SET_ACTIVE_TOOL, payload: tool });
  }, [isDrawing, cancelDrawing, dispatch]);

  // ─── Polygon click handler ───────────────────────────────────────────────────
  const handlePolygonClick = useCallback((polygon, e) => {
    // Mientras se dibuja, el click pertenece al dibujo, no a la selección
    if (state.activeTool === TOOLS.DRAW_POLYGON || state.activeTool === TOOLS.DRAW_RECTANGLE) {
      return;
    }
    e?.stopPropagation();
    dispatch({ type: ACTIONS.SELECT_POLYGON, payload: polygon.id });
  }, [state.activeTool, dispatch]);

  // ─── Códigos automáticos de asignación ──────────────────────────────────────
  const nextBlockCode = useCallback(() => {
    const used = new Set(blocks.map((b) => b.code).filter(Boolean));
    let i = blocks.length + 1;
    while (used.has(`MZ-${String(i).padStart(2, '0')}`)) i += 1;
    return `MZ-${String(i).padStart(2, '0')}`;
  }, [blocks]);

  const nextLotNumber = useCallback((blockId) => {
    const max = getLots(blockId).reduce((acc, lot) => Math.max(acc, Number(lot.number) || 0), 0);
    return String(max + 1);
  }, [getLots]);

  // ─── Context menu action handler ────────────────────────────────────────────
  // Los nombres y params provienen de ContextMenu.jsx / HierarchyPanel.jsx
  const handleContextMenuAction = useCallback((action, params = {}) => {
    const id = params.id ?? contextMenu.targetPolygon?.id;
    closeContextMenu();
    if (!id) return;

    switch (action) {
      case 'assignBlock':
        assignAsBlock(id, nextBlockCode());
        break;
      case 'assignLot':
      case 'changeLotBlock': {
        if (!params.blockId) break;
        const current = state.polygons.find((p) => p.id === id);
        assignAsLot(id, params.blockId, current?.number || nextLotNumber(params.blockId));
        break;
      }
      case 'unassign':
        dispatch({ type: ACTIONS.UNASSIGN, payload: id });
        break;
      case 'delete':
        deletePolygon(id);
        break;
      case 'rename':
      case 'properties':
        // El panel de propiedades edita el polígono seleccionado
        dispatch({ type: ACTIONS.SELECT_POLYGON, payload: id });
        break;
      default:
        break;
    }
  }, [
    contextMenu.targetPolygon, closeContextMenu, assignAsBlock, nextBlockCode,
    state.polygons, assignAsLot, nextLotNumber, dispatch, deletePolygon,
  ]);

  // ─── Import SVG handler ──────────────────────────────────────────────────────
  const handleImport = useCallback((imported, importedViewBox) => {
    setShowImportModal(false);
    if (!imported || imported.length === 0) return;

    // El importador entrega { tempId, vertices, svgPath, area, centroid } sin `type`:
    // hay que normalizarlo al formato de polígono del editor o no se renderiza.
    const polygons = imported.map((p) => {
      const vertices = p.vertices || [];
      return {
        id: generateId(),
        vertices,
        svgPath: p.svgPath || verticesToSvgPath(vertices),
        centroid: p.centroid || calculateCentroid(vertices),
        area: p.area ?? calculateArea(vertices),
        type: POLYGON_TYPES.UNASSIGNED,
        parentId: null,
        code: null,
        number: null,
        metadata: {},
        createdAt: new Date().toISOString(),
      };
    });

    // Adoptar el viewBox del SVG sólo si el lienzo está vacío
    if (importedViewBox && state.polygons.length === 0) {
      dispatch({ type: ACTIONS.SET_VIEWBOX, payload: importedViewBox });
    }

    addPolygons(polygons);
  }, [state.polygons.length, dispatch, addPolygons]);

  // ─── ViewBox change handler ──────────────────────────────────────────────────
  const handleViewBoxChange = useCallback((newViewBox) => {
    dispatch({ type: ACTIONS.SET_VIEWBOX, payload: newViewBox });
  }, [dispatch]);

  // ─── Keyboard shortcuts ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!state.neighborhoodId) return;

    const handleKeyDownGlobal = (e) => {
      // Ignore if user is typing in an input/select/textarea
      const tag = e.target.tagName.toLowerCase();
      if (['input', 'textarea', 'select'].includes(tag)) return;

      // Ctrl+S / Cmd+S → Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
        return;
      }

      // Ctrl+Z / Cmd+Z → Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
        return;
      }

      // Ctrl+Shift+Z / Cmd+Shift+Z → Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        if (canRedo) redo();
        return;
      }

      // Ctrl+Y / Cmd+Y → Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        if (canRedo) redo();
        return;
      }

      // Map keyboard shortcuts
      const shortcutAction = KEYBOARD_SHORTCUTS[e.key];
      if (!shortcutAction) return;

      e.preventDefault();

      if (Object.values(TOOLS).includes(shortcutAction)) {
        handleToolChange(shortcutAction);
      } else {
        switch (shortcutAction) {
          case 'cancel':
            cancelDrawing();
            setDraggingVertex(null);
            dispatch({ type: ACTIONS.DESELECT_ALL });
            break;
          case 'confirm':
            if (isDrawing) {
              const result = completePolygon();
              if (result && result.vertices) {
                addPolygon(result);
              }
            }
            break;
          case 'delete':
            deleteSelected();
            break;
          case 'toggle-grid':
            setGridVisible((v) => !v);
            dispatch({ type: ACTIONS.TOGGLE_GRID });
            break;
          default:
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDownGlobal);
    return () => document.removeEventListener('keydown', handleKeyDownGlobal);
  }, [
    state.neighborhoodId, handleSave, canUndo, canRedo, undo, redo,
    handleToolChange, cancelDrawing, dispatch, isDrawing, completePolygon,
    addPolygon, deleteSelected,
  ]);

  // ─── Selected polygon for properties panel ──────────────────────────────────
  const selectedPolygon = state.polygons?.find((p) => state.selectedIds?.includes(p.id)) || null;

  // ─── Determine save status label ────────────────────────────────────────────
  const getSaveStatus = () => {
    if (isSaving) return { label: 'Guardando...', className: 'text-blue-400 animate-pulse' };
    if (state.isDirty) return { label: 'Sin guardar', className: 'text-yellow-400' };
    if (lastSavedAt) return { label: 'Guardado', className: 'text-green-400' };
    return { label: '', className: '' };
  };
  const saveStatus = getSaveStatus();

  // ─── Render: No neighborhood selected (selector view) ───────────────────────
  if (!state.neighborhoodId) {
    return (
      <div className="h-screen w-screen bg-gray-900 flex flex-col items-center justify-center">
        <div className="bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700 w-full max-w-md">
          <h1 className="text-2xl font-bold text-white mb-2">Map Builder</h1>
          <p className="text-gray-400 mb-6">Selecciona un barrio para comenzar a editar su mapa.</p>

          {error && (
            <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 mb-4 text-red-300 text-sm">
              {error}
            </div>
          )}

          {loadingNeighborhoods ? (
            <div className="flex items-center gap-3 text-gray-400">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Cargando barrios...
            </div>
          ) : (
            <select
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              defaultValue=""
              onChange={(e) => handleNeighborhoodSelect(e.target.value)}
            >
              <option value="" disabled>— Seleccionar barrio —</option>
              {neighborhoods.map((n) => (
                <option key={n.id} value={n.id}>{n.label || n.name}</option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={() => navigate('/home')}
            className="mt-6 w-full text-center text-gray-400 hover:text-white text-sm transition-colors"
          >
            ← Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // ─── Render: Loading map ─────────────────────────────────────────────────────
  if (loadingMap) {
    return (
      <div className="h-screen w-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-gray-400 text-sm">Cargando mapa...</span>
        </div>
      </div>
    );
  }

  // ─── Render: Draft prompt ────────────────────────────────────────────────────
  if (showDraftPrompt) {
    return (
      <div className="h-screen w-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700 w-full max-w-md">
          <h2 className="text-xl font-bold text-white mb-2">Borrador encontrado</h2>
          <p className="text-gray-400 mb-6">
            Se encontró un borrador sin guardar para este barrio. ¿Deseas restaurarlo?
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleDraftRestore(true)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Restaurar borrador
            </button>
            <button
              type="button"
              onClick={() => handleDraftRestore(false)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Descartar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render: Main editor layout ─────────────────────────────────────────────
  return (
    <div className="h-screen w-screen bg-gray-900 flex flex-col overflow-hidden">
      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex items-center gap-4 px-4 py-2 bg-gray-800 border-b border-gray-700 shrink-0">
        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="text-gray-400 hover:text-white text-sm flex items-center gap-1 transition-colors"
          title="Volver"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>

        {/* Neighborhood selector */}
        <select
          className="bg-gray-700 border border-gray-600 text-white text-sm rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={state.neighborhoodId || ''}
          onChange={(e) => handleNeighborhoodSelect(e.target.value)}
        >
          {neighborhoods.map((n) => (
            <option key={n.id} value={n.id}>{n.label || n.name}</option>
          ))}
        </select>

        {/* ViewBox config button */}
        <button
          type="button"
          onClick={() => setShowViewBoxConfig(true)}
          className="text-gray-400 hover:text-white text-xs border border-gray-600 rounded px-2 py-1 transition-colors"
        >
          ViewBox
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Error indicator */}
        {error && (
          <span className="text-red-400 text-xs">{error}</span>
        )}

        {/* Save status */}
        {saveStatus.label && (
          <span className={`text-xs font-medium ${saveStatus.className}`}>
            {saveStatus.label}
          </span>
        )}

        {/* Validation warnings */}
        {hasWarnings && (
          <span className="text-yellow-400 text-xs" title="Hay advertencias de validación">⚠</span>
        )}
        {hasErrors && (
          <span className="text-red-400 text-xs" title="Hay errores de validación">✕</span>
        )}
      </header>

      {/* ─── Body: Toolbar + Canvas + Panels ────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Toolbar */}
        <div className="w-12 shrink-0 bg-gray-800 border-r border-gray-700">
          <ToolbarPanel
            activeTool={state.activeTool}
            onToolChange={handleToolChange}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
            onSave={handleSave}
            isSaving={isSaving}
            isDirty={state.isDirty}
            gridVisible={gridVisible}
            onToggleGrid={() => {
              setGridVisible((v) => !v);
              dispatch({ type: ACTIONS.TOGGLE_GRID });
            }}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onFitView={() => fitToContent(state.polygons)}
            onImport={() => setShowImportModal(true)}
          />
        </div>

        {/* Center: Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <CanvasEngine
            state={state}
            activeTool={state.activeTool}
            viewBox={transformedViewBox}
            zoomLevel={zoomLevel}
            isPanning={isPanning}
            drawingPoints={drawingPoints}
            previewPoint={previewPoint}
            snapTarget={snapTarget}
            selectedIds={state.selectedIds}
            validationResults={validationResults}
            draggingVertex={draggingVertex}
            onCanvasClick={handleCanvasClickWrapped}
            onCanvasMouseMove={handleCanvasMouseMoveWrapped}
            onCanvasMouseDown={handlePanStart}
            onCanvasMouseUp={handleCanvasMouseUp}
            onCanvasMouseLeave={handleCanvasMouseUp}
            onWheel={handleWheel}
            onContextMenu={handleContextMenuOpen}
            onPolygonClick={handlePolygonClick}
            onVertexMouseDown={handleVertexMouseDown}
            onVertexDoubleClick={handleVertexDoubleClick}
            svgRef={svgRef}
          />

          {/* MiniMap overlay (bottom-right of canvas) */}
          <div className="absolute bottom-4 right-4 pointer-events-auto">
            <MiniMap
              polygons={state.polygons}
              viewBox={state.viewBox}
              currentView={viewRect}
              onNavigate={centerOn}
            />
          </div>

          {/* Validation overlay */}
          {(hasErrors || hasWarnings) && (
            <div className="absolute top-4 left-4 pointer-events-auto">
              <ValidationOverlay
                validationResults={validationResults}
                polygons={state.polygons}
                onSelectError={(polygonId) => dispatch({ type: ACTIONS.SELECT_POLYGON, payload: polygonId })}
              />
            </div>
          )}
        </div>

        {/* Right: Hierarchy + Properties panels */}
        <div className="w-72 shrink-0 bg-gray-800 border-l border-gray-700 flex flex-col overflow-hidden">
          {/* Hierarchy Panel */}
          <div className="flex-1 overflow-y-auto border-b border-gray-700">
            <HierarchyPanel
              polygons={state.polygons}
              selectedIds={state.selectedIds}
              onSelect={(id) => dispatch({ type: ACTIONS.SELECT_POLYGON, payload: id })}
              onRename={(id, name) => updatePolygon(id, { code: name })}
              onContextMenu={handleHierarchyContextMenu}
            />
          </div>

          {/* Properties Panel */}
          <div className="h-64 shrink-0 overflow-y-auto">
            <PropertiesPanel
              selectedPolygon={selectedPolygon}
              onUpdateMetadata={updateMetadata}
              onUpdatePolygon={updatePolygon}
            />
          </div>
        </div>
      </div>

      {/* ─── Modals & Overlays ──────────────────────────────────────────────── */}
      <ViewBoxConfig
        viewBox={state.viewBox}
        onChange={handleViewBoxChange}
        isOpen={showViewBoxConfig}
        onClose={() => setShowViewBoxConfig(false)}
      />

      <ImportSVGModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
      />

      <ContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        onClose={closeContextMenu}
        selectedPolygon={contextMenu.targetPolygon}
        blocks={blocks}
        onAction={handleContextMenuAction}
      />
    </div>
  );
}
