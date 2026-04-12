// src/components/PublicForm/components/LotSelectorField.jsx
import { useState, useEffect, useRef } from 'react';
import { prediosService } from '../../../services/prediosService';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

// Colores según status
const STATUS_COLORS = {
  sin_informacion: '#9E9E9E',
  censado: '#2196F3',
  registrado: '#4CAF50',
};

// Colores según el estado físico/ocupacional del predio (Dinámico o Backend)
const PROPERTY_STATE_COLORS = {
  // Estados originales
  'Predio Demolido': '#EF4444',        // Rojo
  'Predio Solo (Habitado)': '#8B5CF6', // Morado
  'Predio Desocupado': '#F59E0B',      // Ambar
  'Predio en Obra': '#06B6D4',         // Cyan
  // Nuevos estados añadidos
  'Predio solo': '#1E3A8A',                                // Azul oscuro
  'Predio para vincular': '#EC4899',                       // Rosado
  'Predio sin construir (solo)': '#10B981',                // Verde
  'Lote en construcción o en obras': '#F97316',            // Naranja
  'Lote con cuenta contrato - vinculado': '#EAB308',       // Amarillo
};

/**
 * Componente para seleccionar un lote del mapa dentro de un formulario.
 * Muestra el mapa del barrio y permite seleccionar cualquier lote.
 */
function LotSelectorField({ neighborhoodId, value, onChange, error, formResponses = {} }) {
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLot, setSelectedLot] = useState(null);
  const [mapError, setMapError] = useState(null);
  const transformRef = useRef(null);

  // Cargar datos del mapa
  useEffect(() => {
    if (!neighborhoodId) {
      setLoading(false);
      setMapError('No se ha seleccionado un barrio para el mapa.');
      return;
    }

    const fetchLots = async () => {
      setLoading(true);
      setMapError(null);
      try {
        const response = await prediosService.getAvailableLots(neighborhoodId);
        if (response.ok && response.data) {
          setMapData(response.data);
        } else {
          setMapError('No se pudo cargar el mapa del barrio.');
        }
      } catch (err) {
        console.error('Error cargando mapa:', err);
        setMapError('Error de conexión al cargar el mapa.');
      } finally {
        setLoading(false);
      }
    };

    fetchLots();
  }, [neighborhoodId]);

  // Sincronizar valor externo con estado interno
  useEffect(() => {
    if (value && mapData) {
      for (const block of mapData.blocks || []) {
        const lot = block.lots.find((l) => l.id === value);
        if (lot) {
          setSelectedLot(lot);
          return;
        }
      }
    }
    if (!value) {
      setSelectedLot(null);
    }
  }, [value, mapData]);

  const handleLotSelect = (lot) => {
    // Permitir selección de todos los lotes, incluso los censados
    // ya que se debe poder contestar más de una vez en un mismo predio.
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
        <div className="flex items-center gap-2 text-gray-500">
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
      <div className="flex items-center justify-center h-64 bg-red-50 rounded-xl border border-red-200">
        <div className="text-red-500 text-sm">{mapError}</div>
      </div>
    );
  }

  if (!mapData || !mapData.blocks || mapData.blocks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-yellow-50 rounded-xl border border-yellow-200">
        <div className="text-yellow-700 text-sm">Este barrio no tiene un mapa asociado.</div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-3 ${error ? 'ring-2 ring-red-400 rounded-xl p-2' : ''}`}>
      {/* Mapa embebido con zoom/pan */}
      <div className="relative h-72 bg-slate-100 rounded-xl border border-gray-200 overflow-hidden">
        <TransformWrapper
          ref={transformRef}
          initialScale={1}
          minScale={0.5}
          maxScale={20}
          centerOnInit
          limitToBounds={false}
          wheel={{ step: 0.1 }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              {/* Controles de zoom */}
              <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => zoomIn()}
                  className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => zoomOut()}
                  className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => resetTransform()}
                  className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50 text-xs"
                >
                  &#8634;
                </button>
              </div>

              <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
                <svg
                  viewBox={mapData.viewBox || '0 0 1103 667'}
                  className="w-full h-full"
                  style={{ background: '#f8fafc' }}
                >
                  {mapData.blocks.map((block) => (
                    <g key={block.id}>
                      {block.lots.map((lot) => {
                          const isSelected = selectedLot?.id === lot.id;
                          const isAvailable = lot.available;

                          let baseColor = STATUS_COLORS[lot.status] || '#9E9E9E';
                          if (lot.property_state && PROPERTY_STATE_COLORS[lot.property_state]) {
                            baseColor = PROPERTY_STATE_COLORS[lot.property_state];
                          }

                          let activeColor = '#1976D2';
                          if (isSelected) {
                            const answeredState = Object.values(formResponses || {}).find(ans => PROPERTY_STATE_COLORS[ans]);
                            if (answeredState) {
                              activeColor = PROPERTY_STATE_COLORS[answeredState];
                            } else if (lot.property_state && PROPERTY_STATE_COLORS[lot.property_state]) {
                              activeColor = PROPERTY_STATE_COLORS[lot.property_state];
                            }
                          }

                          return (
                            <path
                              key={lot.id}
                              d={lot.path}
                              fill={isSelected ? activeColor : baseColor}
                              stroke={isSelected ? '#0D47A1' : '#ffffff'}
                              strokeWidth={isSelected ? 1.5 : 0.5}
                              opacity={isSelected ? 1 : 0.9}
                              style={{
                                cursor: 'pointer',
                                transition: 'fill 0.15s, opacity 0.15s',
                              }}
                              onClick={() => handleLotSelect(lot)}
                            />
                          );
                        })}
                      {/* Números de lote */}
                      {block.lots.map((lot) =>
                        lot.centroid ? (
                          <text
                            key={`label-${lot.id}`}
                            x={lot.centroid.x}
                            y={lot.centroid.y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="3"
                            fill="#ffffff"
                            fontWeight="500"
                            style={{ pointerEvents: 'none', userSelect: 'none' }}
                          >
                            {lot.number?.replace('Lote-', '')}
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
        <div className="absolute bottom-2 left-2 bg-white/95 rounded-lg px-3 py-2 text-xs shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#9E9E9E' }}></span>
              Disponible
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#2196F3' }}></span>
              Censado
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#4CAF50' }}></span>
              Registrado
            </span>
          </div>
        </div>
      </div>

      {/* Lote seleccionado */}
      {selectedLot && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-sm bg-[#1976D2]"></span>
            <span className="text-sm font-medium text-blue-800">
              Lote seleccionado: <strong>{selectedLot.number}</strong>
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
      )}

      {/* Mensaje si no hay selección */}
      {!selectedLot && (
        <p className="text-sm text-gray-500 text-center py-1">
          Haz clic en cualquier lote para seleccionarlo
        </p>
      )}
    </div>
  );
}

export default LotSelectorField;
