// src/components/Home/Index.jsx
import React, { useState, useEffect } from 'react';

// Importaciones ajustadas a la nueva estructura interna de Home
import MapEngine from './components/containers/MapEngine';
import LotSidePanel from './components/containers/LotSidePanel';
import MapLegend from './components/ui/MapLegend';
import { useMapData } from './hooks/useMapData';

// Importación del servicio (asegúrate de que la cantidad de '../' sea correcta según tu proyecto)
import { prediosService } from '../../services/prediosService'; 

function Index() {
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState('');
  const [selectedLot, setSelectedLot] = useState(null);

  const { mapData, setMapData, loading, error } = useMapData(selectedNeighborhoodId);

  useEffect(() => {
    const fetchNeighborhoods = async () => {
      try {
        const response = await prediosService.getNeighborhoods();
        if (response.data && response.data.length > 0) {
          setNeighborhoods(response.data);
          setSelectedNeighborhoodId(response.data[0].id); 
        }
      } catch (err) {
        console.error("Error cargando los sectores:", err);
      }
    };
    fetchNeighborhoods();
  }, []);

  const handleLotSelect = (lot) => setSelectedLot(lot);

  const handleMapChange = (e) => {
    setSelectedNeighborhoodId(e.target.value);
    setSelectedLot(null);
  };

  const handleSaveLotChanges = async (lotId, updatedData) => {
    try {
      await prediosService.updateLotInfo(lotId, updatedData);
      setMapData((prevData) => {
        const newData = { ...prevData };
        newData.blocks = newData.blocks.map(block => ({
          ...block,
          lots: block.lots.map(lot => lot.id === lotId ? { ...lot, ...updatedData } : lot)
        }));
        return newData;
      });
      setSelectedLot((prev) => ({ ...prev, ...updatedData }));
    } catch (err) {
      alert("Hubo un error al guardar los cambios: " + err.message);
    }
  };

  return (
    <div className="w-full h-screen bg-slate-100 p-4 md:p-6 flex flex-col gap-4 font-sans">
      
      {/* BARRA SUPERIOR */}
      <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Panel de Control Acueducto</h1>
          <p className="text-sm text-gray-500">Gestión de Gemelos Digitales</p>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-gray-700">Seleccionar Sector:</label>
          <select 
            value={selectedNeighborhoodId} 
            onChange={handleMapChange}
            disabled={neighborhoods.length === 0}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 disabled:bg-gray-200"
          >
            {neighborhoods.length === 0 && <option>Cargando sectores...</option>}
            {neighborhoods.map(hood => (
              <option key={hood.id} value={hood.id}>
                {hood.name} ({hood.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ÁREA PRINCIPAL: MAPA + PANEL */}
      <div className="flex flex-col md:flex-row gap-6 flex-1 overflow-hidden">
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden flex flex-col">
          {!selectedNeighborhoodId || loading ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">Cargando sector...</div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center text-red-500">{error}</div>
          ) : (
            <div className="flex-1 relative">
              <MapEngine 
                data={mapData} 
                onSelectLot={handleLotSelect} 
                selectedLotId={selectedLot?.id}
              />
              <div className="absolute bottom-4 left-4 pointer-events-none">
                 <MapLegend />
              </div>
            </div>
          )}
        </div>

        <div className="w-full md:w-[400px] h-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden shrink-0">
          <LotSidePanel 
            lot={selectedLot} 
            onSave={handleSaveLotChanges} 
            onDeselect={() => setSelectedLot(null)} 
          />
        </div>
      </div>
    </div>
  );
}

export default Index;