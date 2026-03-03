// src/components/Home/Index.jsx
import React, { useState, useEffect, useRef } from 'react';

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
  const [searchText, setSearchText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  const { mapData, setMapData, loading, error } = useMapData(selectedNeighborhoodId);

  useEffect(() => {
    const fetchNeighborhoods = async () => {
      try {
        const response = await prediosService.getNeighborhoods();
        if (response.data && response.data.length > 0) {
          setNeighborhoods(response.data);
          const defaultHood = response.data.find(h => h.code === 'SMCN-001') ?? response.data[0];
          setSelectedNeighborhoodId(defaultHood.id);
          setSearchText(`${defaultHood.name} (${defaultHood.code})`);
        }
      } catch (err) {
        console.error("Error cargando los sectores:", err);
      }
    };
    fetchNeighborhoods();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLotSelect = (lot) => setSelectedLot(lot);

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
    setShowSuggestions(true);
    setSelectedLot(null);
  };

  const handleSelectNeighborhood = (hood) => {
    setSelectedNeighborhoodId(hood.id);
    setSearchText(`${hood.name} (${hood.code})`);
    setShowSuggestions(false);
    setSelectedLot(null);
  };

  const filteredNeighborhoods = neighborhoods.filter((hood) => {
    const query = searchText.toLowerCase();
    return hood.name.toLowerCase().includes(query) || hood.code.toLowerCase().includes(query);
  });

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
    <div className="w-full h-full bg-slate-100 p-4 md:p-6 flex flex-col gap-4 font-sans">
      
      {/* BARRA SUPERIOR */}
      <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Panel de Control Acueducto</h1>
          <p className="text-sm text-gray-500">Gestión de Gemelos Digitales</p>
        </div>
        
        <div className="flex items-center gap-3" ref={searchRef}>
          <label className="text-sm font-semibold text-gray-700">Sector:</label>
          <div className="relative">
            <input
              type="text"
              value={searchText}
              onChange={handleSearchChange}
              onFocus={() => setShowSuggestions(true)}
              placeholder={neighborhoods.length === 0 ? 'Cargando sectores...' : 'Buscar sector...'}
              disabled={neighborhoods.length === 0}
              className="border border-gray-300 rounded-lg px-4 py-2 w-64 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 disabled:bg-gray-200 text-sm"
            />
            {showSuggestions && filteredNeighborhoods.length > 0 && (
              <ul className="absolute z-50 top-full mt-1 left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                {filteredNeighborhoods.map((hood) => (
                  <li
                    key={hood.id}
                    onMouseDown={() => handleSelectNeighborhood(hood)}
                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 ${
                      hood.id === selectedNeighborhoodId ? 'bg-blue-100 font-semibold text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    {hood.name} <span className="text-gray-400">({hood.code})</span>
                  </li>
                ))}
              </ul>
            )}
            {showSuggestions && filteredNeighborhoods.length === 0 && searchText !== '' && (
              <div className="absolute z-50 top-full mt-1 left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-2 text-sm text-gray-400">
                Sin resultados
              </div>
            )}
          </div>
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

        <div className="w-full md:w-100 h-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden shrink-0">
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