// src/components/DigitalTwinMap/LotSidePanel.jsx
import React, { useState, useEffect } from 'react';

const LotSidePanel = ({ lot, onSave, onDeselect }) => {
  const [formData, setFormData] = useState({
    number: '',
    water_meter_code: '',
    status: 'sin_informacion'
  });
  const [isSaving, setIsSaving] = useState(false);

  // Sincronizar el formulario cada vez que se selecciona un lote diferente
  useEffect(() => {
    if (lot) {
      setFormData({
        number: lot.number || '',
        water_meter_code: lot.water_meter_code || '',
        status: lot.status || 'sin_informacion'
      });
    }
  }, [lot]);

  // Si no hay ningún lote seleccionado, mostramos un mensaje vacío
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
    <div className="h-full flex flex-col p-6 bg-white overflow-y-auto">
      <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestionar Predio</h2>
          <p className="text-sm text-gray-500 mt-1">ID: {lot.id.split('-')[0]}...</p>
        </div>
        <button onClick={onDeselect} className="text-gray-400 hover:text-gray-700 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 flex-1">
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
          <label className="block text-sm font-semibold text-gray-700 mb-1">Código del Medidor</label>
          <input
            type="text"
            name="water_meter_code"
            value={formData.water_meter_code}
            onChange={handleChange}
            placeholder="Ej: M-10293 (Dejar en blanco si no tiene)"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Estado Censal</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          >
            <option value="sin_informacion">Sin Información (Gris)</option>
            <option value="censado">Censado (Amarillo)</option>
            <option value="registrado">Registrado Oficial (Verde)</option>
          </select>
        </div>

        <div className="pt-6 mt-6 border-t border-gray-200">
          <button
            type="submit"
            className="w-full py-3 px-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg disabled:bg-blue-400 flex justify-center items-center"
            disabled={isSaving}
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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