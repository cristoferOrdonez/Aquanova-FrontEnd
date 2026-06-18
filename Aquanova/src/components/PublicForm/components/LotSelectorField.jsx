// src/components/PublicForm/components/LotSelectorField.jsx
import { useState, useEffect, useRef } from 'react';
import { prediosService } from '../../../services/prediosService';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

const STATUS_COLORS = {
  sin_informacion: '#9E9E9E',
  censado:         '#2196F3',
  registrado:      '#4CAF50',
};

/**
 * @param {{ neighborhoodId: string|null, value: string|null, onChange: (id: string|null) => void, error: string|null }} props
 */
function LotSelectorField({ neighborhoodId, value, onChange, error }) {
  const [mapData, setMapData]         = useState(/** @type {any|null} */ (null));
  const [loading, setLoading]         = useState(true);
  const [selectedLot, setSelectedLot] = useState(/** @type {any|null} */ (null));
  const [mapError, setMapError]       = useState(/** @type {string|null} */ (null));
  const transformRef = useRef(null);

  useEffect(() => {
    if (!neighborhoodId) {
      setLoading(false);
      setMapError('Este formulario no tiene un barrio configurado.');
      return;
    }

    const fetchMap = async () => {
      setLoading(true);
      setMapError(null);
      try {
        const response = await prediosService.getDigitalTwinData(neighborhoodId);
        if (response?.data?.blocks?.length > 0) {
          setMapData(response.data);
        } else {
          setMapError('Este barrio no tiene un mapa digital configurado.');
        }
      } catch (err) {
        console.error('Error cargando mapa del formulario:', err);
        setMapError('No se pudo cargar el mapa del barrio.');
      } finally {
        setLoading(false);
      }
    };

    fetchMap();
  }, [neighborhoodId]);

  // Sincronizar valor externo (edición / borrador guardado) con estado interno
  useEffect(() => {
    if (value && mapData) {
      for (const block of mapData.blocks || []) {
        const lot = block.lots.find((l) => l.id === value);
        if (lot) { setSelectedLot(lot); return; }
      }
    }
    if (!value) setSelectedLot(null);
  }, [value, mapData]);

  const handleLotClick = (lot) => {
    setSelectedLot(lot);
    onChange(lot.id);
  };

  const handleClearSelection = () => {
    setSelectedLot(null);
    onChange(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Cargando mapa...
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="flex items-center justify-center h-32 bg-yellow-50 rounded-xl border border-yellow-200">
        <p className="text-yellow-700 text-sm text-center px-4">{mapError}</p>
      </div>
    );
  }

  if (!mapData?.blocks?.length) {
    return (
      <div className="flex items-center justify-center h-32 bg-gray-50 rounded-xl border border-gray-200">
        <p className="text-gray-500 text-sm">Sin mapa disponible para este barrio.</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-3 ${error ? 'ring-2 ring-red-400 rounded-xl p-2' : ''}`}>

      {/* Instrucción */}
      <p className="text-xs text-gray-500">
        Toca el predio en el mapa para seleccionarlo. Usa pellizco o los botones para hacer zoom.
      </p>

      {/* Mapa SVG interactivo */}
      <div className="relative h-72 bg-slate-100 rounded-xl border border-gray-200 overflow-hidden">
        <TransformWrapper
          ref={transformRef}
          initialScale={1}
          minScale={0.3}
          maxScale={8}
          centerOnInit
          limitToBounds={false}
          wheel={{ step: 0.1 }}
          doubleClick={{ disabled: true }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              {/* Controles de zoom */}
              <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => zoomIn()}
                  className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => zoomOut()}
                  className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={() => resetTransform()}
                  className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-100 text-base"
                  title="Restablecer vista"
                >
                  ↺
                </button>
              </div>

              <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
                <svg
                  viewBox={mapData.viewBox}
                  width="100%"
                  height="100%"
                  style={{ display: 'block', background: '#f8fafc' }}
                >
                  {mapData.blocks.map((block) => (
                    <g key={block.id}>
                      {/* Polígonos de predios */}
                      {block.lots.map((lot) => {
                        const svgPath = lot.path || lot.svg_path;
                        if (!svgPath) return null;
                        const isSelected = selectedLot?.id === lot.id;
                        return (
                          <path
                            key={lot.id}
                            d={svgPath}
                            fill={isSelected ? '#1565C0' : STATUS_COLORS[lot.status] ?? STATUS_COLORS.sin_informacion}
                            stroke={isSelected ? '#0D47A1' : '#ffffff'}
                            strokeWidth={isSelected ? 1.5 : 0.5}
                            opacity={isSelected ? 1 : 0.85}
                            style={{ cursor: 'pointer', transition: 'fill 0.15s, opacity 0.15s' }}
                            onClick={() => handleLotClick(lot)}
                          >
                            <title>{lot.display_id || lot.number || lot.id}</title>
                          </path>
                        );
                      })}
                      {/* Etiquetas de número */}
                      {block.lots.map((lot) =>
                        lot.centroid?.x != null ? (
                          <text
                            key={`lbl-${lot.id}`}
                            x={lot.centroid.x}
                            y={lot.centroid.y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="3"
                            fill="#ffffff"
                            fontWeight="600"
                            style={{ pointerEvents: 'none', userSelect: 'none' }}
                          >
                            {(lot.display_id || lot.number)?.replace('Lote-', '')}
                          </text>
                        ) : null
                      )}
                    </g>
                  ))}
                </svg>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>

        {/* Leyenda */}
        <div className="absolute bottom-2 left-2 bg-white/95 rounded-lg px-3 py-1.5 text-xs shadow-sm border border-gray-100 flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: '#9E9E9E' }} />
            Sin información
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: '#2196F3' }} />
            Censado
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: '#4CAF50' }} />
            Registrado
          </span>
        </div>
      </div>

      {/* Predio seleccionado */}
      {selectedLot ? (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-sm inline-block" style={{ backgroundColor: '#1565C0' }} />
            <span className="text-sm font-medium text-blue-800">
              Predio seleccionado:{' '}
              <strong>{selectedLot.display_id || selectedLot.number?.replace('Lote-', '') || selectedLot.id}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={handleClearSelection}
            className="text-blue-600 hover:text-blue-800 text-sm underline"
          >
            Cambiar
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-1">
          Ningún predio seleccionado — toca uno en el mapa
        </p>
      )}

    </div>
  );
}

export default LotSelectorField;
