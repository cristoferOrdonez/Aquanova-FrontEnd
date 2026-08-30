import React, { memo, useState, useMemo, useRef } from 'react';
import { POLYGON_TYPES } from './utils/constants';

/**
 * Item individual en el árbol jerárquico con soporte para renombrado inline.
 *
 * @param {object} props
 * @param {object} props.polygon - Polígono a mostrar
 * @param {boolean} props.isSelected - Si está seleccionado
 * @param {Function} props.onSelect - Click para seleccionar
 * @param {Function} props.onRename - Renombrar inline
 * @param {Function} props.onContextMenu - Click derecho
 * @param {number} props.indent - Nivel de indentación
 */
function HierarchyItem({ polygon, isSelected, onSelect, onRename, onContextMenu, indent = 0 }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef(null);

  const label = polygon.code || polygon.number
    ? (polygon.code || `Predio ${polygon.number}`)
    : `Polígono-${polygon.id.substring(0, 6)}`;

  const handleDoubleClick = () => {
    setEditValue(label);
    setIsEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const handleRenameConfirm = () => {
    if (editValue.trim() && editValue.trim() !== label) {
      onRename(polygon.id, editValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleRenameConfirm();
    if (e.key === 'Escape') setIsEditing(false);
  };

  return (
    <div
      className={`
        flex items-center gap-1 px-2 py-1 cursor-pointer rounded text-sm
        ${isSelected ? 'bg-blue-900/40 text-blue-200' : 'text-gray-300 hover:bg-gray-700/50'}
      `}
      style={{ paddingLeft: `${indent * 16 + 8}px` }}
      onClick={() => onSelect(polygon.id)}
      onDoubleClick={handleDoubleClick}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu(e, polygon);
      }}
    >
      <span className="text-gray-500 text-xs">•</span>
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleRenameConfirm}
          onKeyDown={handleKeyDown}
          className="bg-gray-700 text-white text-sm px-1 py-0 rounded border border-gray-500 outline-none flex-1 min-w-0"
          autoFocus
        />
      ) : (
        <span className="truncate">{label}</span>
      )}
    </div>
  );
}

/**
 * Grupo expandible de manzana (block) con sus lotes hijos.
 *
 * @param {object} props
 * @param {object} props.block - Polígono tipo block
 * @param {Array} props.lots - Lotes del bloque
 * @param {Array} props.selectedIds - IDs seleccionados
 * @param {Function} props.onSelect - Seleccionar
 * @param {Function} props.onRename - Renombrar
 * @param {Function} props.onContextMenu - Menú contextual
 */
function BlockGroup({ block, lots, selectedIds, onSelect, onRename, onContextMenu }) {
  const [expanded, setExpanded] = useState(false);
  const label = block.code || `Manzana-${block.id.substring(0, 6)}`;
  const isSelected = selectedIds.includes(block.id);

  return (
    <div>
      <div
        className={`
          flex items-center gap-1 px-2 py-1 cursor-pointer rounded text-sm
          ${isSelected ? 'bg-blue-900/40 text-blue-200' : 'text-gray-300 hover:bg-gray-700/50'}
        `}
        onClick={() => {
          onSelect(block.id);
          setExpanded(!expanded);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          onContextMenu(e, block);
        }}
      >
        <span className="text-gray-400 text-xs w-4">
          {expanded ? '▼' : '▷'}
        </span>
        <span className="truncate flex-1">{label}</span>
        <span className="text-gray-500 text-xs">({lots.length} pred.)</span>
      </div>

      {expanded && lots.map((lot) => (
        <HierarchyItem
          key={lot.id}
          polygon={lot}
          isSelected={selectedIds.includes(lot.id)}
          onSelect={onSelect}
          onRename={onRename}
          onContextMenu={onContextMenu}
          indent={2}
        />
      ))}
    </div>
  );
}

/**
 * Panel de jerarquía del mapa - muestra estructura árbol de manzanas y predios.
 *
 * @param {object} props
 * @param {Array} props.polygons - Todos los polígonos
 * @param {Array} props.selectedIds - IDs seleccionados
 * @param {Function} props.onSelect - Selecciona un polígono por ID
 * @param {Function} props.onRename - Renombra polígono
 * @param {Function} props.onContextMenu - Abre el menú contextual (e, polygon)
 * @param {Function} props.onAutoAssign - Asigna los polígonos sueltos por contención
 */
function HierarchyPanel({
  polygons,
  selectedIds,
  onSelect,
  onRename,
  onContextMenu,
  onAutoAssign,
}) {
  const [blocksExpanded, setBlocksExpanded] = useState(true);
  const [unassignedExpanded, setUnassignedExpanded] = useState(true);

  const { blocks, unassigned, lotsByBlock } = useMemo(() => {
    const blocksArr = polygons.filter((p) => p.type === POLYGON_TYPES.BLOCK);
    const unassignedArr = polygons.filter((p) => p.type === POLYGON_TYPES.UNASSIGNED);
    const lotsMap = {};

    blocksArr.forEach((block) => {
      lotsMap[block.id] = polygons.filter(
        (p) => p.type === POLYGON_TYPES.LOT && p.parentId === block.id
      );
    });

    return { blocks: blocksArr, unassigned: unassignedArr, lotsByBlock: lotsMap };
  }, [polygons]);

  return (
    <div className="flex flex-col bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 bg-gray-900/50 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-gray-200">Jerarquía del Mapa</h3>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-1 max-h-64">
        {/* Manzanas */}
        <div>
          <div
            className="flex items-center gap-1 px-2 py-1 cursor-pointer text-sm text-gray-400 hover:text-gray-200"
            onClick={() => setBlocksExpanded(!blocksExpanded)}
          >
            <span className="text-xs w-4">{blocksExpanded ? '▼' : '▷'}</span>
            <span className="font-medium">Manzanas</span>
            <span className="text-gray-500 text-xs">({blocks.length})</span>
          </div>

          {blocksExpanded && blocks.map((block) => (
            <BlockGroup
              key={block.id}
              block={block}
              lots={lotsByBlock[block.id] || []}
              selectedIds={selectedIds}
              onSelect={onSelect}
              onRename={onRename}
              onContextMenu={onContextMenu}
            />
          ))}
        </div>

        {/* Sin Asignar */}
        <div className="mt-1 border-t border-gray-700 pt-1">
          <div
            className="flex items-center gap-1 px-2 py-1 cursor-pointer text-sm text-gray-400 hover:text-gray-200"
            onClick={() => setUnassignedExpanded(!unassignedExpanded)}
          >
            <span className="text-xs w-4">{unassignedExpanded ? '▼' : '▷'}</span>
            <span className="font-medium">Sin Asignar</span>
            <span className="text-gray-500 text-xs">({unassigned.length})</span>
          </div>

          {/* Los polígonos sin asignar no se guardan: este atajo los convierte
              en manzanas y predios según qué polígono contiene a cuál. */}
          {unassigned.length > 0 && onAutoAssign && (
            <div className="px-2 pb-1">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onAutoAssign(); }}
                className="w-full px-2 py-1 text-xs rounded bg-amber-600 hover:bg-amber-500 text-white transition-colors"
                title="Asigna los polígonos sueltos como manzana o predio según su contención geométrica"
              >
                Auto-asignar {unassigned.length} sin asignar
              </button>
            </div>
          )}

          {unassignedExpanded && unassigned.map((polygon) => (
            <HierarchyItem
              key={polygon.id}
              polygon={polygon}
              isSelected={selectedIds.includes(polygon.id)}
              onSelect={onSelect}
              onRename={onRename}
              onContextMenu={onContextMenu}
              indent={1}
            />
          ))}
        </div>

        {/* Empty state */}
        {polygons.length === 0 && (
          <div className="text-center text-gray-500 text-xs py-4">
            No hay polígonos en el mapa
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(HierarchyPanel);
