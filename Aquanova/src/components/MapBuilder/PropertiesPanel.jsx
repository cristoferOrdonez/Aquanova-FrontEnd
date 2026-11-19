import React, { memo, useState, useCallback } from 'react';
import { POLYGON_TYPES } from './utils/constants';

/**
 * Campo de propiedad readonly.
 *
 * @param {object} props
 * @param {string} props.label - Etiqueta del campo
 * @param {string|number} props.value - Valor a mostrar
 */
function ReadonlyField({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-xs text-gray-400">{label}</label>
      <div className="bg-gray-900 text-gray-300 text-sm px-2 py-1.5 rounded border border-gray-700">
        {value}
      </div>
    </div>
  );
}

/**
 * Campo de propiedad editable.
 *
 * @param {object} props
 * @param {string} props.label - Etiqueta del campo
 * @param {string} props.value - Valor actual
 * @param {Function} props.onChange - Handler de cambio
 * @param {string} [props.placeholder] - Placeholder
 */
function EditableField({ label, value, onChange, placeholder }) {
  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-xs text-gray-400">{label}</label>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-gray-800 text-white text-sm px-2 py-1.5 rounded border border-gray-600 outline-none focus:border-blue-500 transition-colors"
      />
    </div>
  );
}

/**
 * Formatea un número de área en m² con 2 decimales.
 * @param {number} area
 * @returns {string}
 */
function formatArea(area) {
  if (!area && area !== 0) return '—';
  return `${area.toFixed(2)} m²`;
}

/**
 * Calcula el perímetro a partir de los vértices.
 * @param {Array<{x: number, y: number}>} vertices
 * @returns {number}
 */
function calculatePerimeter(vertices) {
  if (!vertices || vertices.length < 2) return 0;
  let perimeter = 0;
  for (let i = 0; i < vertices.length; i++) {
    const a = vertices[i];
    const b = vertices[(i + 1) % vertices.length];
    perimeter += Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
  }
  return perimeter;
}

/**
 * Mapa de etiquetas de tipo de polígono.
 */
const TYPE_LABELS = {
  [POLYGON_TYPES.BLOCK]: 'Manzana',
  [POLYGON_TYPES.LOT]: 'Predio',
  [POLYGON_TYPES.UNASSIGNED]: 'Sin asignar',
};

/**
 * Contenido del panel de propiedades. Montado con key={polygon.id}
 * para que el state se reinicialice al cambiar de selección.
 */
function PropertiesContent({ polygon, onUpdateMetadata, onUpdatePolygon }) {
  const [localMetadata, setLocalMetadata] = useState(polygon.metadata || {});

  const handleMetadataChange = useCallback((field, value) => {
    const updated = { ...localMetadata, [field]: value };
    setLocalMetadata(updated);
    onUpdateMetadata(polygon.id, { [field]: value });
  }, [localMetadata, polygon.id, onUpdateMetadata]);

  const perimeter = calculatePerimeter(polygon.vertices);

  return (
    <div className="flex flex-col gap-2 p-3 overflow-y-auto max-h-72">
      {/* Tipo */}
      <ReadonlyField label="Tipo" value={TYPE_LABELS[polygon.type] || 'Desconocido'} />

      {/* Código — campo real del polígono, no metadata */}
      <EditableField
        label="Código"
        value={polygon.code || ''}
        onChange={(val) => onUpdatePolygon(polygon.id, { code: val })}
        placeholder="Ej: MZ-001"
      />

      {/* Número (solo para predios) */}
      {polygon.type === POLYGON_TYPES.LOT && (
        <ReadonlyField label="Número" value={polygon.number || '—'} />
      )}

      {/* Área */}
      <ReadonlyField label="Área" value={formatArea(polygon.area)} />

      {/* Perímetro */}
      <ReadonlyField label="Perímetro" value={`${perimeter.toFixed(2)} u`} />

      {/* Vértices */}
      <ReadonlyField label="Vértices" value={polygon.vertices?.length || 0} />

      {/* Campos adicionales para predios */}
      {polygon.type === POLYGON_TYPES.LOT && (
        <>
          <EditableField
            label="ID Catastral"
            value={localMetadata.cadastralId || ''}
            onChange={(val) => handleMetadataChange('cadastralId', val)}
            placeholder="Ej: CAT-2025-001"
          />
          <EditableField
            label="Código Medidor"
            value={localMetadata.meterId || ''}
            onChange={(val) => handleMetadataChange('meterId', val)}
            placeholder="Ej: MED-001"
          />
        </>
      )}
    </div>
  );
}

/**
 * Panel de propiedades del elemento seleccionado.
 *
 * @param {object} props
 * @param {object|null} props.selectedPolygon - Polígono seleccionado o null
 * @param {Function} props.onUpdateMetadata - Callback para actualizar metadata (id, metadata)
 * @param {Function} props.onUpdatePolygon - Callback para actualizar campos del polígono (id, changes)
 */
function PropertiesPanel({ selectedPolygon, onUpdateMetadata, onUpdatePolygon }) {
  return (
    <div className="flex flex-col bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 bg-gray-900/50 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-gray-200">Propiedades</h3>
      </div>

      {/* Content */}
      {selectedPolygon ? (
        <PropertiesContent
          key={selectedPolygon.id}
          polygon={selectedPolygon}
          onUpdateMetadata={onUpdateMetadata}
          onUpdatePolygon={onUpdatePolygon}
        />
      ) : (
        <div className="flex items-center justify-center p-6 text-gray-500 text-sm">
          Seleccione un elemento
        </div>
      )}
    </div>
  );
}

export default memo(PropertiesPanel);
