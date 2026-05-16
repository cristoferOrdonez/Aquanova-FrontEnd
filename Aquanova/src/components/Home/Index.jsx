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
  const [historyStack, setHistoryStack] = useState([]);
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

  const handleLotSelect = React.useCallback((lot) => {
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
  }, []);

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

    // Identificar block_id localizando la manzana que contiene el lote
    let targetBlockId = null;
    if (mapData && mapData.blocks) {
      for (const block of mapData.blocks) {
         if (block.lots.some(l => l.id === firstLot.id)) {
             targetBlockId = block.id;
             break;
         }
      }
    }

    const svgPath = mergeResult.svg_path;
    const newLot = {
      ...firstLot,
      id: `temp_merged_${Date.now()}`,
      block_id: targetBlockId,
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
            // Asegurar que el block_id se mantenga igual a la manzana UI ("MZ-XX") y retener el real en database_block_id
            block_id: targetBlockId || l.block_id,
            database_block_id: l.block_id || l.database_block_id,
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
          // Buscamos si alguno de los predios eliminados pertenecía a este bloque
          const containsSelected = block.lots.some(l => selectedLotIds.includes(l.id));
          if (containsSelected) {
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

      // Guardar en el historial de deshacer
      setHistoryStack(prev => [...prev, {
        action: 'RESTORE',
        deletedLots: actualNewLots, // Al deshacer, eliminamos el polígono combinado
        newLots: selectedLots       // Al deshacer, restauramos los polígonos individuales
      }]);

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
    const partsStr = window.prompt("¿En cuántas partes desea dividir el predio? (Ingrese un número entero mayor a 1)");
    if (!partsStr) return;
    
    const parts = parseInt(partsStr, 10);
    if (isNaN(parts) || parts < 2) {
      alert("Debe ingresar un número entero mayor a 1.");
      return;
    }

    const directionStr = window.prompt("¿En qué dirección desea hacer los cortes? (Ingrese 'V' para vertical, 'H' para horizontal, 'A' para automático).", "V");
    if (!directionStr) return;
    const dirUpper = directionStr.trim().toUpperCase();
    let direction = 'auto';
    if (dirUpper === 'V') direction = 'vertical';
    else if (dirUpper === 'H') direction = 'horizontal';

    const targetLot = selectedLots[0];
    
    // Find context lots and block_id
    let blockContext = [];
    let targetBlockId = null;
    if (mapData && mapData.blocks) {
      for (const block of mapData.blocks) {
         if (block.lots.some(l => l.id === targetLot.id)) {
             blockContext = block.lots;
             targetBlockId = block.id;
             break;
         }
      }
    }

    const splitResults = splitLot(targetLot, parts, blockContext, direction);
    if (!splitResults || splitResults.length === 0) {
      alert("No se pudo calcular la división del polígono matemáticamente.");
      return;
    }

    const newIds = generateSplitIds(targetLot.display_id, splitResults.length);

    const newLots = splitResults.map((res, idx) => ({
      ...targetLot,
      id: `temp_split_${Date.now()}_${idx}`,
      block_id: targetBlockId,
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
          ? response.newData.map(l => ({ 
              ...l, 
              // Mantener el identificador de la manzana UI para evitar conflictos de selección (MZ-XX)
              block_id: targetBlockId || l.block_id,
              database_block_id: l.block_id || l.database_block_id,
              path: l.path || l.svg_path 
            }))            : newLots.map(l => ({ ...l, path: l.path || l.svg_path }));
      setMapData(prevData => {
        const newData = { ...prevData };
        newData.blocks = newData.blocks.map(block => {
          if (block.lots.some(l => l.id === targetLot.id)) {
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

      // Guardar en el historial de deshacer
      setHistoryStack(prev => [...prev, {
        action: 'RESTORE',
        deletedLots: actualNewLots, // Al deshacer, eliminamos las partes divididas
        newLots: [targetLot]        // Al deshacer, restauramos el lote original
      }]);

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

  const handleUndoLastAction = async () => {
    if (historyStack.length === 0 || isProcessing) return;
    
    // Tomar la última acción
    const lastAction = historyStack[historyStack.length - 1];
    
    setIsProcessing(true);
    try {
      const payload = {
        action: 'RESTORE',
        deletedLots: lastAction.deletedLots.map(l => ({ id: l.id, version: l.version || 1 })),
        newLots: lastAction.newLots
      };
      
      const response = await prediosService.undoTopology(payload);
      
      const serverLots = response?.newData;
      const actualRestoredLots = (serverLots && serverLots.length > 0)
        ? serverLots.map(l => ({
            ...l,
            block_id: lastAction.newLots[0]?.block_id || l.block_id, // Forzar la compatibilidad
            database_block_id: l.block_id || l.database_block_id,
            path: l.path || l.svg_path,
            svg_path: l.svg_path || l.path,
          }))
        : lastAction.newLots;

      setMapData(prevData => {
        if (!prevData || !prevData.blocks) return prevData;
        const newData = { ...prevData };
        const deletedIds = lastAction.deletedLots.map(l => l.id);
        
        newData.blocks = newData.blocks.map(block => {
          let modified = false;
          let remainingLots = block.lots;

          // Borrar los lotes que se están deshaciendo
          if (block.lots.some(l => deletedIds.includes(l.id))) {
            remainingLots = remainingLots.filter(l => !deletedIds.includes(l.id));
            modified = true;
          }

          // Re-insertar los lotes restaurados en la manzana correspondiente
          const targetBlockId = lastAction.newLots[0]?.block_id;
          if (block.id === targetBlockId) {
            remainingLots = [...remainingLots, ...actualRestoredLots];
            modified = true;
          }

          return modified ? { ...block, lots: remainingLots } : block;
        });
        return newData;
      });

      // Extraer de la pila de historial
      setHistoryStack(prev => prev.slice(0, -1));
      setSelectedLots([]);
      setSelectedLot(null);

    } catch (err) {
      alert("Error al deshacer: " + (err.message || 'Transacción fallida'));
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
    <div className="w-full h-full bg-slate-100 overflow-y-scroll">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-4 font-sans">

      {/* BARRA SUPERIOR */}
      <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-gray-200 flex flex-col items-start gap-4 shrink-0 w-full">
        <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Panel de Control Acueducto</h1>
            <p className="text-sm text-gray-500">Gestión de Gemelos Digitales</p>
          </div>
          <div className="flex flex-wrap gap-2 min-h-[44px] items-center w-full md:w-auto">
            {historyStack.length > 0 && (
              <button
                disabled={isProcessing}
                onClick={handleUndoLastAction}
                title="Deshacer última unión o división"
                className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors"
              >
                {isProcessing ? 'Procesando...' : (
                  <>
                    <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
                    </svg>
                    Deshacer
                  </>
                )}
              </button>
            )}
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

        {/* Banner de Auditoría Topológica (Oculto dinámicamente sin saltos bruscos) */}
        <div
          className={`w-full flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-lg px-4 text-sm transition-all duration-300 overflow-hidden ${
            topologyMismatches.length > 0 ? 'py-3 opacity-100 max-h-[500px]' : 'py-0 opacity-0 max-h-0 border-0 !p-0 m-0'
          }`}
        >
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
              className="border border-gray-300 rounded-lg px-4 pr-10 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 disabled:bg-gray-200 text-sm"
            />
            {searchText && (
              <button
                type="button"
                onClick={() => setSearchText('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                title="Limpiar búsqueda"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
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
      <div className="flex flex-col md:flex-row gap-6 h-auto md:h-[calc(100vh-280px)] md:min-h-[500px] shrink-0">
        <div className="w-full md:flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden flex flex-col h-[450px] md:h-full md:min-h-0">
          {!selectedNeighborhoodId || loading ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">Cargando sector...</div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center text-red-500">{error}</div>
          ) : (
            <div className="flex-1 relative h-full">
              <MapEngine 
                data={mapData} 
                onSelectLot={handleLotSelect} 
                selectedLots={selectedLots}
              />
            </div>
          )}
        </div>

        <div className="w-full md:w-96 min-h-[400px] md:min-h-0 h-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden shrink-0">
          <LotSidePanel
            lot={selectedLot}
            onSave={handleSaveLotChanges}
            onDeselect={() => setSelectedLot(null)}
          />
        </div>
      </div>

      {/* LEYENDA DEL MAPA */}
      <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-4 shrink-0">
        <MapLegend />
      </div>

      {/* PANEL DE MÉTRICAS */}
      <MetricsPanel mapData={mapData} loading={loading} />
      </div>
    </div>
  );
}

export default Index;