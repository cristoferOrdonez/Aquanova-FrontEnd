// src/components/DigitalTwinMap/MapaPage.jsx
import React, { useEffect, useState } from 'react';
import MapEngine from './MapEngine';
import MapLegend from './MapLegend';
import LotSidePanel from './LotSidePanel'; // <--- Importamos el nuevo panel
import { prediosService } from '../../services/prediosService';

const MapaPage = () => {
  const [mapData, setMapData] = useState(null);
  const [selectedLot, setSelectedLot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMap = async () => {
      try {
        setLoading(true);
        const response = await prediosService.getDigitalTwinData();
        if (response && response.data) {
          setMapData(response.data);
        } else {
          setError('El formato de datos recibido no es válido.');
        }
      } catch (err) {
        setError(err.message || 'No se pudo cargar el plano digital.');
      } finally {
        setLoading(false);
      }
    };
    fetchMap();
  }, []);

  const handleLotSelect = (lot) => {
    setSelectedLot(lot);
  };

  const handleSaveLotChanges = async (lotId, updatedData) => {
    try {
      await prediosService.updateLotInfo(lotId, updatedData);
      
      // Actualizamos el mapa en tiempo real
      setMapData((prevData) => {
        const newData = { ...prevData };
        newData.blocks = newData.blocks.map(block => ({
          ...block,
          lots: block.lots.map(lot => 
            lot.id === lotId ? { ...lot, ...updatedData } : lot
          )
        }));
        return newData;
      });

      // Actualizamos el estado seleccionado para que el panel mantenga los datos frescos
      setSelectedLot((prev) => ({ ...prev, ...updatedData }));
      
      // Opcional: Podrías mostrar un mensaje de éxito con una librería como react-toastify aquí
      
    } catch (err) {
      alert("Hubo un error al guardar los cambios: " + err.message);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50 text-gray-600 font-medium">Cargando Gemelo Digital...</div>;
  if (error) return <div className="h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    // Contenedor principal de la pantalla con fondo gris claro
    <div className="w-full h-screen bg-slate-100 p-4 md:p-6 flex flex-col md:flex-row gap-6 font-sans">
      
      {/* SECCIÓN IZQUIERDA: Recuadro del Mapa (Ocupa el espacio restante) */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden flex flex-col">
        {/* Cabecera opcional del recuadro del mapa */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h1 className="text-lg font-bold text-gray-800">Plano General - Barrio Acueducto</h1>
          <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">Gemelo Digital</span>
        </div>
        
        {/* Motor del Mapa */}
        <div className="flex-1 relative">
          <MapEngine 
            data={mapData} 
            onSelectLot={handleLotSelect} 
            selectedLotId={selectedLot?.id}
          />
          {/* La leyenda la dejamos flotando dentro del recuadro del mapa, en una esquina */}
          <div className="absolute bottom-4 left-4 pointer-events-none">
             <MapLegend />
          </div>
        </div>
      </div>

      {/* SECCIÓN DERECHA: Menú de Modificaciones */}
      <div className="w-full md:w-[400px] h-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden shrink-0">
        <LotSidePanel 
          lot={selectedLot} 
          onSave={handleSaveLotChanges} 
          onDeselect={() => setSelectedLot(null)} 
        />
      </div>

    </div>
  );
};

export default MapaPage;