// src/components/Home/Index.jsx
import React, { useState, useEffect, useRef } from 'react';

// Importaciones ajustadas a la nueva estructura interna de Home
import MapEngine from './components/containers/MapEngine';
import LotSidePanel from './components/containers/LotSidePanel';
import MetricsPanel from './components/containers/MetricsPanel';
import MapLegend from './components/ui/MapLegend';
import { useMapData } from './hooks/useMapData';

// Importación del servicio (asegúrate de que la cantidad de '../' sea correcta según tu proyecto)
import { prediosService } from '../../services/prediosService'; 

import { mergeLots, areLotsContiguous, generateMergedId, splitLot, generateSplitIds } from '../../utils/geoUtils';

function Index() {
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState('');
  const [selectedLots, setSelectedLots] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const searchRef = useRef(null);

  const { mapData, setMapData, loading, error } = useMapData(selectedNeighborhoodId);
  const isColindante = React.useMemo(() => areLotsContiguous(selectedLots), [selectedLots]);

  // Auditoría topológica: detectar predios cuyo block_id de DB no coincide con su manzana geométrica
  const topologyMismatches = React.useMemo(() => {
    if (!mapData?.blocks) return [];
    return mapData.blocks
      .flatMap(b => b.lots || [])
      .filter(l => l.topology_mismatch === true);
  }, [mapData]);

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

  const handleLotSelect = (lot) => {
    setSelectedLots(prev => {
      const exists = prev.find(l => l.id === lot.id);
      if (exists) {
        return prev.filter(l => l.id !== lot.id);
      } else {
        // Regla: Bloquear selección de predios de diferentes manzanas
        if (prev.length > 0 && prev[0].block_id !== lot.block_id) {
          alert("Solo puedes seleccionar predios de la misma manzana.");
          return prev;
        }
        return [...prev, lot];
      }
    });
    setSelectedLot(lot);
  };

  const handleMergeLots = async () => {
    if (selectedLots.length < 2 || isProcessing) return;

    let mergeResult = null;
    try {
      mergeResult = mergeLots(selectedLots);
    } catch (err) {
      if (err.message === 'NON_CONTIGUOUS') {
        alert("Solo puedes unificar predios que estén tocándose directamente (colindantes).");
        return;
      }
      console.error(err);
      alert("Error interno en la librería geometría.");
      return;
    }
    
    if (!mergeResult || !mergeResult.svg_path) {
      alert("Error al fusionar matemáticamente los polígonos. Revisa la consola del navegador para más detalles.");
      return;
    }

    const newDisplayId = generateMergedId(selectedLots);
    const firstLot = selectedLots[0];
    const mapDeletedLotsPayload = selectedLots.map(l => ({ id: l.id, version: l.version || 1 }));
    const selectedLotIds = selectedLots.map(l => l.id);

    // Identificar IDs de manzana (el UUID real para la DB y el ID sintético para el estado local)
    let targetDatabaseBlockId = firstLot.database_block_id;
    let targetGeometricBlockId = firstLot.block_id; // e.g. "MZ01"

    if (!targetDatabaseBlockId && mapData?.blocks) {
      for (const block of mapData.blocks) {
         if (block.lots.some(l => l.id === firstLot.id)) {
             targetDatabaseBlockId = block.database_block_id;
             targetGeometricBlockId = block.id;
             break;
         }
      }
    }

    const svgPath = mergeResult.svg_path;
    const newLot = {
      ...firstLot,
      id: `temp_merged_${Date.now()}`,
      block_id: targetDatabaseBlockId, // Importante: UUID real para la base de datos
      _geometric_block_id: targetGeometricBlockId, // Para uso interno frontend
      // Enviamos ambas propiedades para garantizar compatibilidad en backend y MapEngine
      svg_path: svgPath,
      path: svgPath,
      centroid: mergeResult.centroid,
      display_id: newDisplayId,
      number: newDisplayId.startsWith('Lote-') ? newDisplayId : `Lote-${newDisplayId}`,
      area_m2: selectedLots.reduce((acc, l) => acc + (l.area_m2 || 0), 0),
      version: 1,
      status: 'sin_informacion'
    };

    setIsProcessing(true);
    try {
      const payload = {
        action: 'MERGE',
        deletedLots: mapDeletedLotsPayload,
        newLots: [newLot]
      };
      
      const response = await prediosService.updateTopology(payload);
      
      // El servidor devuelve { ok, newData: [...] } directamente en la raíz
      // (apiClient.js ya devülve el body parseado, por tanto response === body)
      const serverLots = response?.newData;

      // Construir el array final de lotes reales. Si el servidor devuelve datos,
      // los usamos. Si no (fallback de red), usamos el objeto local.
      const actualNewLots = (serverLots && serverLots.length > 0)
        ? serverLots.map(l => ({
            ...l,
            // Asegurar siempre que 'path' existe para que MapEngine pueda renderizar
            path: l.path || l.svg_path,
            svg_path: l.svg_path || l.path,
            // Si el servidor no devuelve display_id, lo calculamos nosotros
            display_id: l.display_id || l.number?.replace('Lote-', '') || newDisplayId
          }))
        : [{ ...newLot }];

      setMapData(prevData => {
        if (!prevData || !prevData.blocks) return prevData;
        const newData = { ...prevData };
        newData.blocks = newData.blocks.map(block => {
          // Usamos el ID geométrico sintético (MZ01) para encontrar el bloque en el estado local
          if (block.id === targetGeometricBlockId) {
            const remainingLots = block.lots.filter(l => !selectedLotIds.includes(l.id));
            return {
              ...block,
              lots: [...remainingLots, ...actualNewLots]
            };
          }
          return block;
        });
        return newData;
      });

      setSelectedLots([]);
      setSelectedLot(null);
    } catch (err) {
      if (err.message === 'NON_CONTIGUOUS') {
        alert("Error: Los predios seleccionados no están tocándose. Solo puedes unificar predios colindantes.");
      } else if (err.status === 409) {
        alert("Este plano ha sido modificado por otro usuario recientemente. Por favor, recargue la página para ver la versión más reciente.");
      } else {
        alert("Error en la transacción en el servidor: " + err.message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSplitLot = async () => {
    if (selectedLots.length !== 1 || isProcessing) return;

    // Paso 1: elegir dirección del corte
    const dirChoice = window.confirm(
      "¿Cómo desea dividir el predio?\n\n" +
      "✅ Aceptar → Por el ANCHO (cada parte mantiene frente a la calle)\n" +
      "❌ Cancelar → Por la PROFUNDIDAD (cada parte tiene distinta calle/fondo)"
    );
    // confirm retorna true = 'depth' (ancho); false = 'width' (profundidad)
    const splitDirection = dirChoice ? 'depth' : 'width';

    // Paso 2: elegir número de partes
    const partsStr = window.prompt("¿En cuántas partes desea dividir el predio? (Ingrese un número entero mayor a 1)");
    if (!partsStr) return;
    
    const parts = parseInt(partsStr, 10);
    if (isNaN(parts) || parts < 2) {
      alert("Debe ingresar un número entero mayor a 1.");
      return;
    }

    const targetLot = selectedLots[0];
    
    // Find context lots and block_id
    let blockContext = [];
    let targetDatabaseBlockId = targetLot.database_block_id;
    let targetGeometricBlockId = targetLot.block_id;

    if (mapData?.blocks) {
      for (const block of mapData.blocks) {
         if (block.lots.some(l => l.id === targetLot.id)) {
             blockContext = block.lots;
             if (!targetDatabaseBlockId) targetDatabaseBlockId = block.database_block_id;
             if (!targetGeometricBlockId) targetGeometricBlockId = block.id;
             break;
         }
      }
    }

    const splitResults = splitLot(targetLot, parts, blockContext, splitDirection);
    if (!splitResults || splitResults.length === 0) {
      alert("No se pudo calcular la división del polígono matemáticamente.");
      return;
    }

    const newIds = generateSplitIds(targetLot.display_id, splitResults.length);

    const newLots = splitResults.map((res, idx) => ({
      ...targetLot,
      id: `temp_split_${Date.now()}_${idx}`,
      block_id: targetDatabaseBlockId, // UUID real para el backend
      _geometric_block_id: targetGeometricBlockId,
      path: res.svg_path,
      centroid: res.centroid,
      display_id: newIds[idx],
      number: newIds[idx].startsWith('Lote-') ? newIds[idx] : `Lote-${newIds[idx]}`,
      area_m2: (targetLot.area_m2 || 0) / splitResults.length,
      version: 1,
      status: 'sin_informacion'
    }));

    setIsProcessing(true);
    try {
      const payload = {
        action: 'SPLIT',
        deletedLots: [{ id: targetLot.id, version: targetLot.version || 1 }],
        newLots: newLots
      };
      
      const response = await prediosService.updateTopology(payload);

      // Sincronizar con los IDs reales generados por la base de datos
      const actualNewLots = (response.newData && response.newData.length > 0)
        ? response.newData.map(l => ({ ...l, path: l.path || l.svg_path }))
        : newLots.map(l => ({ ...l, path: l.path || l.svg_path }));

      setMapData(prevData => {
        const newData = { ...prevData };
        newData.blocks = newData.blocks.map(block => {
          if (block.id === targetGeometricBlockId) {
            const remainingLots = block.lots.filter(l => l.id !== targetLot.id);
            return {
              ...block,
              lots: [...remainingLots, ...actualNewLots]
            };
          }
          return block;
        });
        return newData;
      });

      setSelectedLots([]);
      setSelectedLot(null);
    } catch (err) {
      if (err.status === 409) {
        alert("Este plano ha sido modificado por otro usuario recientemente. Por favor, recargue la página para ver la versión más reciente.");
      } else {
        alert("Error en la transacción en el servidor: " + err.message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
    setShowSuggestions(true);
    setSelectedLot(null);
  };

  const handleSelectNeighborhood = (hood) => {
    setSelectedNeighborhoodId(hood.id);
    setSearchText(`${hood.name} (${hood.code})`);
    setSearchText(`${hood.name} (${hood.code})`);
    setShowSuggestions(false);
    setSelectedLots([]);
    setSelectedLot(null);
  };

  const filteredNeighborhoods = neighborhoods.filter((hood) => {
    const query = searchText.toLowerCase();
    return hood.name.toLowerCase().includes(query) || hood.code.toLowerCase().includes(query);
  });

  const handleSaveLotChanges = async (lotId, updatedData) => {
    try {
      // Extraer cambio de manzana del payload combinado
      const { _block_code_changed, _database_block_id, _geometric_block_id, ...lotData } = updatedData;

      // 1. Guardar cambios del LOTE (status, number, water_meter_code, cadastral_id)
      await prediosService.updateLotInfo(lotId, lotData);

      // 2. Si el código de manzana cambió, actualizar en DB y propagar al estado
      if (_block_code_changed && _database_block_id) {
        await prediosService.updateBlockInfo(_database_block_id, { code: _block_code_changed });

        // Propagar el nuevo block_code y recalcular display_ids a TODOS los predios de la misma manzana geométrica
        setMapData((prevData) => {
          if (!prevData?.blocks) return prevData;
          return {
            ...prevData,
            blocks: prevData.blocks.map(block => {
              if (block.id !== _geometric_block_id) return block;
              return {
                ...block,
                code: _block_code_changed,
                lots: block.lots.map(lot => {
                  // Extraer el sufijo del ID actual (ej: "-01" de "MZ01-01")
                  const parts = lot.display_id.split('-');
                  const idNum = parts.length > 1 ? parts[parts.length - 1] : '01';
                  return {
                    ...lot,
                    block_code: _block_code_changed,
                    display_id: `${_block_code_changed}-${idNum}`
                  };
                })
              };
            })
          };
        });

        // Actualizar el lote actualmente seleccionado en el panel lateral
        const parts = (selectedLot?.display_id || '').split('-');
        const idNum = parts.length > 1 ? parts[parts.length - 1] : '01';
        setSelectedLot((prev) => prev ? { ...prev, ...lotData, block_code: _block_code_changed, display_id: `${_block_code_changed}-${idNum}` } : prev);
        
        alert(`Manzana actualizada exitosamente a: ${_block_code_changed}`);
      } else {
        // Solo actualizar el lote en el estado sin cambio de manzana
        setMapData((prevData) => {
          const newData = { ...prevData };
          newData.blocks = newData.blocks.map(block => ({
            ...block,
            lots: block.lots.map(lot => lot.id === lotId ? { ...lot, ...lotData } : lot)
          }));
          return newData;
        });
        setSelectedLot((prev) => prev ? { ...prev, ...lotData } : prev);
      }
    } catch (err) {
      alert("Hubo un error al guardar los cambios: " + err.message);
    }
  };

  return (
    <div className="w-full h-full bg-slate-100 overflow-y-auto">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-4 font-sans">

      {/* BARRA SUPERIOR */}
      <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-gray-200 flex flex-col items-start gap-4 shrink-0 w-full overflow-hidden">
        <div className="w-full flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Panel de Control Acueducto</h1>
            <p className="text-sm text-gray-500">Gestión de Gemelos Digitales</p>
          </div>
          <div className="flex gap-2">
            {selectedLots.length === 1 && (
              <button
                disabled={isProcessing}
                onClick={handleSplitLot}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors"
              >
                {isProcessing ? 'Procesando...' : 'Dividir Predio'}
              </button>
            )}
            {selectedLots.length >= 2 && (
              <button
                disabled={isProcessing || !isColindante}
                onClick={handleMergeLots}
                className={`font-medium py-2 px-4 rounded-lg shadow-sm transition-colors ${
                  !isColindante 
                    ? 'bg-gray-400 cursor-not-allowed text-gray-200' 
                    : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                }`}
              >
                {isProcessing ? 'Uniendo...' : !isColindante ? 'No colindantes' : `Unificar Predios (${selectedLots.length})`}
              </button>
            )}
          </div>
        </div>

        {/* Banner de Auditoría Topológica */}
        {topologyMismatches.length > 0 && (
          <div className="w-full flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 text-sm">
            <span className="text-orange-500 text-lg leading-none mt-0.5">⚠</span>
            <div className="flex-1">
              <p className="font-semibold text-orange-700">
                {topologyMismatches.length} {topologyMismatches.length === 1 ? 'predio detectado' : 'predios detectados'} con asignación de manzana inconsistente
              </p>
              <p className="text-orange-600 mt-0.5">
                El motor topológico encontró predios cuya posición geométrica no coincide con su manzana en la base de datos.
                Están marcados con <strong>⚠</strong> y borde naranja en el mapa. Revísalos y corrígelos manualmente.
              </p>
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full" ref={searchRef}>
          <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Sector:</label>
          <div className="relative w-full sm:max-w-md">
            <input
              type="text"
              value={searchText}
              onChange={handleSearchChange}
              onFocus={() => setShowSuggestions(true)}
              placeholder={neighborhoods.length === 0 ? 'Cargando sectores...' : 'Buscar sector...'}
              disabled={neighborhoods.length === 0}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 disabled:bg-gray-200 text-sm"
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
      <div className="flex flex-col md:flex-row gap-6 min-h-[400px] md:min-h-[500px] h-full md:h-auto">
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden flex flex-col min-h-[350px] md:min-h-0">
          {!selectedNeighborhoodId || loading ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">Cargando sector...</div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center text-red-500">{error}</div>
          ) : (
            <div className="flex-1 relative">
              <MapEngine 
                data={mapData} 
                onSelectLot={handleLotSelect} 
                selectedLots={selectedLots}
              />
              <div className="absolute bottom-4 left-4 pointer-events-none">
                 <MapLegend />
              </div>
            </div>
          )}
        </div>

        <div className="w-full md:w-96 min-h-[300px] md:min-h-0 md:h-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden shrink-0">
          <LotSidePanel
            lot={selectedLot}
            onSave={handleSaveLotChanges}
            onDeselect={() => setSelectedLot(null)}
          />
        </div>
      </div>

      {/* PANEL DE MÉTRICAS */}
      <MetricsPanel mapData={mapData} loading={loading} />
      </div>
    </div>
  );
}

export default Index;