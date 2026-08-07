import React, { memo } from 'react';
import { TOOLS } from './utils/constants';

/**
 * Botón individual de la toolbar con icono SVG y tooltip.
 *
 * @param {object} props
 * @param {string} props.title - Tooltip del botón
 * @param {boolean} props.active - Si está activo
 * @param {boolean} props.disabled - Si está deshabilitado
 * @param {Function} props.onClick - Handler de click
 * @param {React.ReactNode} props.children - Icono SVG
 */
function ToolButton({ title, active, disabled, onClick, children }) {
  return (
    <button
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`
        w-10 h-10 flex items-center justify-center rounded-lg transition-colors
        ${active ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {children}
    </button>
  );
}

/**
 * Separador horizontal en la toolbar.
 */
function Divider() {
  return <div className="w-8 h-px bg-gray-600 my-1" />;
}

/**
 * Barra de herramientas lateral izquierda del Map Builder.
 *
 * @param {object} props
 * @param {string} props.activeTool - Herramienta activa actual
 * @param {Function} props.onToolChange - Callback al cambiar herramienta
 * @param {Function} props.onUndo - Deshacer
 * @param {Function} props.onRedo - Rehacer
 * @param {boolean} props.canUndo - Si se puede deshacer
 * @param {boolean} props.canRedo - Si se puede rehacer
 * @param {Function} props.onSave - Guardar mapa
 * @param {boolean} props.isSaving - Si está guardando
 * @param {boolean} props.isDirty - Si hay cambios sin guardar
 * @param {boolean} props.gridVisible - Si la grid está visible
 * @param {Function} props.onToggleGrid - Toggle grid
 * @param {Function} props.onZoomIn - Zoom in
 * @param {Function} props.onZoomOut - Zoom out
 * @param {Function} props.onFitView - Ajustar vista
 * @param {Function} props.onImport - Abre modal de importación
 */
function ToolbarPanel({
  activeTool,
  onToolChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onSave,
  isSaving,
  isDirty,
  gridVisible,
  onToggleGrid,
  onZoomIn,
  onZoomOut,
  onFitView,
  onImport,
}) {
  return (
    <div className="flex flex-col items-center gap-1 p-2 bg-gray-800 rounded-xl shadow-lg">
      {/* Herramientas de dibujo */}
      <ToolButton
        title="Seleccionar (V)"
        active={activeTool === TOOLS.SELECT}
        onClick={() => onToolChange(TOOLS.SELECT)}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
        </svg>
      </ToolButton>

      <ToolButton
        title="Dibujar polígono (P)"
        active={activeTool === TOOLS.DRAW_POLYGON}
        onClick={() => onToolChange(TOOLS.DRAW_POLYGON)}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" />
        </svg>
      </ToolButton>

      <ToolButton
        title="Dibujar rectángulo (R)"
        active={activeTool === TOOLS.DRAW_RECTANGLE}
        onClick={() => onToolChange(TOOLS.DRAW_RECTANGLE)}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="5" width="18" height="14" rx="1" />
        </svg>
      </ToolButton>

      <ToolButton
        title="Editar vértices (E)"
        active={activeTool === TOOLS.EDIT_VERTICES}
        onClick={() => onToolChange(TOOLS.EDIT_VERTICES)}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="6" cy="6" r="2" />
          <circle cx="18" cy="6" r="2" />
          <circle cx="18" cy="18" r="2" />
          <circle cx="6" cy="18" r="2" />
          <line x1="8" y1="6" x2="16" y2="6" />
          <line x1="18" y1="8" x2="18" y2="16" />
          <line x1="16" y1="18" x2="8" y2="18" />
          <line x1="6" y1="16" x2="6" y2="8" />
        </svg>
      </ToolButton>

      <Divider />

      {/* Undo / Redo */}
      <ToolButton title="Deshacer (Ctrl+Z)" disabled={!canUndo} onClick={onUndo}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 10h13a4 4 0 010 8H9" />
          <polyline points="7,6 3,10 7,14" />
        </svg>
      </ToolButton>

      <ToolButton title="Rehacer (Ctrl+Shift+Z)" disabled={!canRedo} onClick={onRedo}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10H8a4 4 0 000 8h7" />
          <polyline points="17,6 21,10 17,14" />
        </svg>
      </ToolButton>

      <Divider />

      {/* Zoom y Grid */}
      <ToolButton title="Acercar (+)" onClick={onZoomIn}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="11" y1="8" x2="11" y2="14" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </ToolButton>

      <ToolButton title="Alejar (-)" onClick={onZoomOut}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </ToolButton>

      <ToolButton title="Ajustar vista" onClick={onFitView}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
        </svg>
      </ToolButton>

      <ToolButton title="Mostrar/Ocultar grid (G)" active={gridVisible} onClick={onToggleGrid}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="3" y1="15" x2="21" y2="15" />
          <line x1="9" y1="3" x2="9" y2="21" />
          <line x1="15" y1="3" x2="15" y2="21" />
        </svg>
      </ToolButton>

      <Divider />

      {/* Importar y Guardar */}
      <ToolButton title="Importar SVG" onClick={onImport}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="7,10 12,15 17,10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </ToolButton>

      <ToolButton
        title={isSaving ? 'Guardando...' : 'Guardar (Ctrl+S)'}
        disabled={!isDirty || isSaving}
        onClick={onSave}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
          <polyline points="17,21 17,13 7,13 7,21" />
          <polyline points="7,3 7,8 15,8" />
        </svg>
      </ToolButton>
    </div>
  );
}

export default memo(ToolbarPanel);
