// src/components/DigitalTwinMap/LotEditModal.jsx
import React, { useState, useEffect } from 'react';

const LotEditModal = ({ lot, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    number: '',
    water_meter_code: '',
    status: 'sin_informacion'
  });
  const [isSaving, setIsSaving] = useState(false);

  // Cargar los datos del lote cuando se abre el modal
  useEffect(() => {
    if (lot) {
      setFormData({
        number: lot.number || '',
        water_meter_code: lot.water_meter_code || '',
        status: lot.status || 'sin_informacion'
      });
    }
  }, [lot]);

  if (!isOpen || !lot) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(lot.id, formData);
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Gestionar Predio</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 text-2xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección / Número de Lote</label>
            <input
              type="text"
              name="number"
              value={formData.number}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código del Medidor</label>
            <input
              type="text"
              name="water_meter_code"
              value={formData.water_meter_code}
              onChange={handleChange}
              placeholder="Ej: M-10293 (Dejar en blanco si no tiene)"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado Censal</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="sin_informacion">Sin Información (Gris)</option>
              <option value="censado">Censado (Amarillo)</option>
              <option value="registrado">Registrado Oficial (Verde)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              disabled={isSaving}
            >
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LotEditModal;