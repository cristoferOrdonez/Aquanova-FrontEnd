// src/components/mapa/BlockLayer.jsx
import React from 'react';
import LotPath from './LotPath';

const BlockLayer = ({ block, selectedLotId, onSelectLot }) => {
  return (
    <g id={`block-${block.code}`}>
      {/* Etiqueta de la Manzana (ej: "M-1") */}
      {block.label_position && (
        <text
          x={block.label_position.x}
          y={block.label_position.y}
          className="fill-gray-400 text-4xl font-bold opacity-30 pointer-events-none select-none"
        >
          {block.code}
        </text>
      )}

      {/* Renderizado de Lotes */}
      {block.lots.map((lot) => (
        <LotPath
          key={lot.id}
          lot={lot}
          isSelected={selectedLotId === lot.id}
          onSelect={onSelectLot}
        />
      ))}
    </g>
  );
};

export default BlockLayer;