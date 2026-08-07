export const MAP_BUILDER_CONFIG = {
  // Canvas
  DEFAULT_VIEWBOX: '0 0 1000 1000',
  MIN_ZOOM: 0.25,
  MAX_ZOOM: 4.0,
  ZOOM_STEP: 0.1,
  ZOOM_WHEEL_FACTOR: 0.001,

  // Snap
  SNAP_RADIUS_PX: 8,
  SNAP_TO_GRID: false,

  // Validación
  POLYGON_CLOSE_THRESHOLD: 8,
  MIN_POLYGON_VERTICES: 3,
  MIN_POLYGON_AREA: 10,

  // Grid
  DEFAULT_GRID_SIZE: 20,
  GRID_SUBDIVISIONS: 5,

  // History
  MAX_UNDO_STACK: 50,

  // Auto-save
  AUTOSAVE_INTERVAL_MS: 30000,

  // Drawing
  VERTEX_HANDLE_RADIUS: 5,
  EDGE_HIT_TOLERANCE: 6,
};

export const TOOLS = {
  SELECT: 'select',
  DRAW_POLYGON: 'draw-polygon',
  DRAW_RECTANGLE: 'draw-rectangle',
  EDIT_VERTICES: 'edit-vertices',
};

export const POLYGON_TYPES = {
  BLOCK: 'block',
  LOT: 'lot',
  UNASSIGNED: 'unassigned',
};

export const STYLES = {
  block: {
    normal: { fill: '#3b82f6', fillOpacity: 0.15, stroke: '#1e40af', strokeWidth: 2 },
    selected: { fill: '#60a5fa', fillOpacity: 0.3, stroke: '#1e40af', strokeWidth: 2.5 },
    hover: { fill: '#3b82f6', fillOpacity: 0.25, stroke: '#1d4ed8', strokeWidth: 2 },
  },
  lot: {
    normal: { fill: '#10b981', fillOpacity: 0.25, stroke: '#065f46', strokeWidth: 1.5 },
    selected: { fill: '#34d399', fillOpacity: 0.4, stroke: '#065f46', strokeWidth: 2 },
    hover: { fill: '#10b981', fillOpacity: 0.35, stroke: '#047857', strokeWidth: 1.5 },
  },
  unassigned: {
    normal: { fill: '#6b7280', fillOpacity: 0.2, stroke: '#374151', strokeWidth: 1.5 },
    selected: { fill: '#9ca3af', fillOpacity: 0.35, stroke: '#374151', strokeWidth: 2 },
    hover: { fill: '#6b7280', fillOpacity: 0.3, stroke: '#4b5563', strokeWidth: 1.5 },
  },
  drawing: {
    preview: { fill: '#8b5cf6', fillOpacity: 0.15, stroke: '#6d28d9', strokeWidth: 1.5, strokeDasharray: '5 3' },
    point: { fill: '#ffffff', stroke: '#6d28d9', strokeWidth: 2, r: 4 },
    firstPoint: { fill: '#f97316', stroke: '#ea580c', strokeWidth: 2, r: 6 },
  },
  validation: {
    error: { fill: '#ef4444', fillOpacity: 0.3, stroke: '#b91c1c', strokeWidth: 2 },
    warning: { fill: '#f59e0b', fillOpacity: 0.3, stroke: '#d97706', strokeWidth: 2 },
  },
  snap: {
    indicator: { fill: 'none', stroke: '#f97316', strokeWidth: 2, r: 6 },
    crosshair: { stroke: '#f97316', strokeWidth: 1, strokeDasharray: '3 3' },
  },
  grid: {
    major: { stroke: '#d1d5db', strokeWidth: 0.5 },
    minor: { stroke: '#e5e7eb', strokeWidth: 0.25 },
  },
  vertex: {
    normal: { fill: '#ffffff', stroke: '#374151', strokeWidth: 1.5, r: 4 },
    hover: { fill: '#3b82f6', stroke: '#1e40af', strokeWidth: 2, r: 5 },
    dragging: { fill: '#f59e0b', stroke: '#d97706', strokeWidth: 2, r: 5 },
  },
};

export const KEYBOARD_SHORTCUTS = {
  'v': TOOLS.SELECT,
  'p': TOOLS.DRAW_POLYGON,
  'r': TOOLS.DRAW_RECTANGLE,
  'e': TOOLS.EDIT_VERTICES,
  'Escape': 'cancel',
  'Enter': 'confirm',
  'Delete': 'delete',
  'Backspace': 'delete',
  'g': 'toggle-grid',
};

export const ACTIONS = {
  SET_NEIGHBORHOOD: 'SET_NEIGHBORHOOD',
  SET_VIEWBOX: 'SET_VIEWBOX',
  TOGGLE_GRID: 'TOGGLE_GRID',
  SET_GRID_SIZE: 'SET_GRID_SIZE',
  SET_ACTIVE_TOOL: 'SET_ACTIVE_TOOL',
  ADD_DRAWING_POINT: 'ADD_DRAWING_POINT',
  CLOSE_POLYGON: 'CLOSE_POLYGON',
  CANCEL_DRAWING: 'CANCEL_DRAWING',
  ADD_POLYGON: 'ADD_POLYGON',
  ADD_POLYGONS_BATCH: 'ADD_POLYGONS_BATCH',
  UPDATE_POLYGON: 'UPDATE_POLYGON',
  DELETE_POLYGONS: 'DELETE_POLYGONS',
  SELECT_POLYGON: 'SELECT_POLYGON',
  SELECT_POLYGONS: 'SELECT_POLYGONS',
  DESELECT_ALL: 'DESELECT_ALL',
  MOVE_VERTEX: 'MOVE_VERTEX',
  ADD_VERTEX: 'ADD_VERTEX',
  DELETE_VERTEX: 'DELETE_VERTEX',
  ASSIGN_AS_BLOCK: 'ASSIGN_AS_BLOCK',
  ASSIGN_AS_LOT: 'ASSIGN_AS_LOT',
  UNASSIGN: 'UNASSIGN',
  UPDATE_METADATA: 'UPDATE_METADATA',
  IMPORT_POLYGONS: 'IMPORT_POLYGONS',
  SET_VALIDATION_RESULTS: 'SET_VALIDATION_RESULTS',
  UNDO: 'UNDO',
  REDO: 'REDO',
  MARK_SAVED: 'MARK_SAVED',
  MARK_DIRTY: 'MARK_DIRTY',
  LOAD_STATE: 'LOAD_STATE',
  LOAD_DRAFT: 'LOAD_DRAFT',
};
