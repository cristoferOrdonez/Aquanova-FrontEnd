// src/components/mapa/LotPath.jsx
import React from 'react';
import classNames from 'classnames';

const STATUS_CLASSES = {
  registrado:      "fill-emerald-500 hover:fill-emerald-400 stroke-emerald-700", // Verde sólido
  censado:         "fill-orange-400 hover:fill-orange-300 stroke-orange-600",    // Naranja (Alerta/Proceso)
  sin_informacion: "fill-gray-300 hover:fill-gray-200 stroke-gray-400",          // Gris neutro
  
  default:         "fill-gray-200 stroke-gray-300"
};

const LotPath = ({ lot, onSelect, isSelected }) => {
  const statusClass = STATUS_CLASSES[lot.status] || STATUS_CLASSES.default;
  
  return (
    <g 
      onClick={(e) => {
        e.stopPropagation();
        onSelect(lot);
      }}
      className="cursor-pointer transition-colors duration-300 ease-in-out group"
    >
      <path
        d={lot.path}
        className={classNames(
          "stroke-[1px] vector-effect-non-scaling-stroke", // El borde no engorda al hacer zoom
          statusClass,
          isSelected ? "stroke-blue-600 stroke-[3px] z-50 relative" : ""
        )}
      />
      
      {/* Etiqueta solo visible al acercarse mucho o hover (Opcional) */}
      {lot.centroid && (
        <text
          x={lot.centroid.x}
          y={lot.centroid.y}
          className="text-[8px] fill-black/60 font-sans pointer-events-none select-none opacity-0 group-hover:opacity-100 transition-opacity font-bold"
          textAnchor="middle"
          dominantBaseline="central"
        >
          {lot.number}
        </text>
      )}
    </g>
  );
};

export default LotPath;