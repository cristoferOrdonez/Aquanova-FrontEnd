// src/components/DigitalTwinMap/LotSidePanel.jsx
import React, { useState, useEffect } from 'react';

// Colores oficiales según la guía de integración frontend
const STATUS_OPTIONS = [
  { value: 'sin_informacion', label: 'Sin Información',   hex: '#9E9E9E' },
  { value: 'censado',         label: 'Censado',            hex: '#2196F3' },
  { value: 'registrado',      label: 'Registrado Oficial', hex: '#4CAF50' },
];

const LotSidePanel = ({ lot, onSave, onDeselect }) => {
  const [formData, setFormData] = useState({
    number: '',
    water_meter_code: '',
    cadastral_id: '',
    status: 'sin_informacion',
    block_code: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (lot) {
      setFormData({
        number:           lot.number           || '',
        water_meter_code: lot.water_meter_code || '',
        cadastral_id:     lot.cadastral_id     || '',
        status:           lot.status           || 'sin_informacion',
        block_code:       lot.block_code       || '',
      });
    }
  }, [lot]);

  if (!lot) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
        <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <p className="text-lg font-medium">Ningún predio seleccionado</p>
        <p className="text-sm mt-2">Haz clic en un polígono del mapa para ver y editar su información.</p>
      </div>
    );
  }

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    // Separar los datos del lote de los de la manzana
    const { block_code, ...lotFields } = formData;
    const saveData = { ...lotFields };

    // Si el código de manzana cambió, adjuntar info para propagación masiva
    if (block_code.trim() !== (lot.block_code || '').trim()) {
      saveData._block_code_changed = block_code.trim();
      saveData._database_block_id = lot.database_block_id;
      saveData._geometric_block_id = lot.block_id;
    }

    await onSave(lot.id, saveData);
    setIsSaving(false);
  };

  const currentStatus = STATUS_OPTIONS.find(s => s.value === formData.status);

  return (
    <div className="h-full flex flex-col p-6 bg-white overflow-y-auto">
      <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestionar Predio</h2>
          <p className="text-sm text-gray-500 mt-1">ID: {lot.id.split('-')[0]}...</p>
        </div>
        <button onClick={onDeselect} className="text-gray-400 hover:text-gray-700 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Info de solo lectura */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Área</p>
          <p className="text-sm font-semibold text-gray-800">{lot.area_m2 ? `${lot.area_m2} m²` : '—'}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-sm border border-black/10 shrink-0"
            style={{ backgroundColor: currentStatus?.hex ?? '#9E9E9E' }}
          />
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Estado</p>
            <p className="text-sm font-semibold text-gray-800">{currentStatus?.label ?? formData.status}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 flex-1">
        {/* Campo Manzana */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <label className="block text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">
            Manzana
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-500">🏘️</span>
            <input
              type="text"
              name="block_code"
              value={formData.block_code}
              onChange={handleChange}
              placeholder="Ej: MZ01, Manzana 5, 10-A"
              className="flex-1 border border-blue-300 bg-white rounded-md px-3 py-1.5 text-sm font-medium text-blue-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all"
            />
          </div>
          <p className="text-xs text-blue-500 mt-1">Cambiar esto actualiza todos los predios de esta manzana.</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Dirección / Número de Lote</label>
          <input
            type="text"
            name="number"
            value={formData.number}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">ID Catastral</label>
          <input
            type="text"
            name="cadastral_id"
            value={formData.cadastral_id}
            onChange={handleChange}
            placeholder="Ej: CAD-001-A (dejar en blanco si no tiene)"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Código del Medidor</label>
          <input
            type="text"
            name="water_meter_code"
            value={formData.water_meter_code}
            onChange={handleChange}
            placeholder="Ej: MED-2026-001 (dejar en blanco si no tiene)"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Estado Catastral</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="pt-4 mt-4 border-t border-gray-200">
          <button
            type="submit"
            className="w-full py-3 px-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg disabled:bg-blue-400 flex justify-center items-center"
            disabled={isSaving}
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Guardando...
              </span>
            ) : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LotSidePanel;