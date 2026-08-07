import React, { memo, useEffect, useRef, useState, useCallback } from 'react';
import { POLYGON_TYPES } from './utils/constants';

/**
 * Item del menú contextual.
 *
 * @param {object} props
 * @param {string} props.label - Texto del item
 * @param {boolean} props.danger - Si es una acción destructiva
 * @param {Function} props.onClick - Handler de click
 * @param {React.ReactNode} [props.submenu] - Sub-menú (opcional)
 */
function MenuItem({ label, danger, onClick, submenu }) {
  const [showSubmenu, setShowSubmenu] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => submenu && setShowSubmenu(true)}
      onMouseLeave={() => submenu && setShowSubmenu(false)}
    >
      <button
        onClick={onClick}
        className={`
          w-full text-left px-3 py-1.5 text-sm flex items-center justify-between
          transition-colors hover:bg-gray-700
          ${danger ? 'text-red-400 hover:text-red-300' : 'text-gray-300 hover:text-white'}
        `}
      >
        <span>{label}</span>
        {submenu && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9,6 15,12 9,18" />
          </svg>
        )}
      </button>

      {/* Submenu */}
      {showSubmenu && submenu && (
        <div className="absolute left-full top-0 ml-1 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-1 min-w-[140px] z-[60]">
          {submenu}
        </div>
      )}
    </div>
  );
}

/**
 * Separador de menú.
 */
function MenuDivider() {
  return <div className="border-t border-gray-700 my-1" />;
}

/**
 * Menú contextual (click derecho) del Map Builder.
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Si el menú está visible
 * @param {{x: number, y: number}} props.position - Posición en pantalla
 * @param {Function} props.onClose - Cerrar menú
 * @param {object|null} props.selectedPolygon - Polígono seleccionado
 * @param {Array} props.blocks - Lista de manzanas disponibles
 * @param {Function} props.onAction - Callback de acción (action, params)
 */
function ContextMenu({ isOpen, position, onClose, selectedPolygon, blocks, onAction }) {
  const menuRef = useRef(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Close handler that also resets state
  const handleClose = useCallback(() => {
    setConfirmDelete(false);
    onClose();
  }, [onClose]);

  // Cerrar al hacer click fuera
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        handleClose();
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') handleClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleClose]);

  const handleAction = useCallback((action, params = {}) => {
    onAction(action, params);
    handleClose();
  }, [onAction, handleClose]);

  const handleDelete = useCallback(() => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    handleAction('delete', { id: selectedPolygon?.id });
  }, [confirmDelete, handleAction, selectedPolygon]);

  if (!isOpen) return null;

  // Ajustar posición para no salir de pantalla
  const style = {
    position: 'fixed',
    top: `${position.y}px`,
    left: `${position.x}px`,
    zIndex: 9999,
  };

  const polygonType = selectedPolygon?.type;

  return (
    <div ref={menuRef} style={style} className="bg-gray-800 rounded-lg shadow-2xl border border-gray-700 py-1 min-w-[180px]">
      {/* Opciones para polígonos sin asignar */}
      {selectedPolygon && polygonType === POLYGON_TYPES.UNASSIGNED && (
        <>
          <MenuItem
            label="Asignar como Manzana"
            onClick={() => handleAction('assignBlock', { id: selectedPolygon.id })}
          />
          <MenuItem
            label="Asignar como Predio"
            submenu={
              blocks && blocks.length > 0 ? (
                blocks.map((block) => (
                  <button
                    key={block.id}
                    onClick={() => handleAction('assignLot', { id: selectedPolygon.id, blockId: block.id })}
                    className="w-full text-left px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    {block.code || `Manzana-${block.id.substring(0, 6)}`}
                  </button>
                ))
              ) : (
                <span className="px-3 py-1.5 text-sm text-gray-500 block">
                  No hay manzanas
                </span>
              )
            }
          />
          <MenuDivider />
        </>
      )}

      {/* Opciones para manzanas */}
      {selectedPolygon && polygonType === POLYGON_TYPES.BLOCK && (
        <>
          <MenuItem
            label="Renombrar"
            onClick={() => handleAction('rename', { id: selectedPolygon.id })}
          />
          <MenuItem
            label="Desasignar"
            onClick={() => handleAction('unassign', { id: selectedPolygon.id })}
          />
          <MenuDivider />
        </>
      )}

      {/* Opciones para predios */}
      {selectedPolygon && polygonType === POLYGON_TYPES.LOT && (
        <>
          <MenuItem
            label="Cambiar manzana"
            submenu={
              blocks && blocks.length > 0 ? (
                blocks.map((block) => (
                  <button
                    key={block.id}
                    onClick={() => handleAction('changeLotBlock', { id: selectedPolygon.id, blockId: block.id })}
                    className="w-full text-left px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    {block.code || `Manzana-${block.id.substring(0, 6)}`}
                  </button>
                ))
              ) : (
                <span className="px-3 py-1.5 text-sm text-gray-500 block">
                  No hay manzanas
                </span>
              )
            }
          />
          <MenuItem
            label="Desasignar"
            onClick={() => handleAction('unassign', { id: selectedPolygon.id })}
          />
          <MenuDivider />
        </>
      )}

      {/* Opciones siempre visibles */}
      {selectedPolygon && (
        <MenuItem
          label={confirmDelete ? '¿Confirmar eliminación?' : 'Eliminar'}
          danger
          onClick={handleDelete}
        />
      )}

      {selectedPolygon && (
        <MenuItem
          label="Propiedades"
          onClick={() => handleAction('properties', { id: selectedPolygon.id })}
        />
      )}

      {/* Si no hay polígono seleccionado */}
      {!selectedPolygon && (
        <span className="px-3 py-1.5 text-sm text-gray-500 block">
          No hay selección
        </span>
      )}
    </div>
  );
}

export default memo(ContextMenu);
