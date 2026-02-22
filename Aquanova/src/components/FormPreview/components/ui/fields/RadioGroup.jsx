import React from 'react';

export default function RadioGroup({ field, value, onChange, onSelect, sizeClass }) {
  return (
    <div className="space-y-2 mt-1">
      {field.options && field.options.map((opt, idx) => {
        const val = typeof opt === 'object' ? opt.value : opt;
        const key = typeof opt === 'object' ? opt.id : idx;
        const idToStore = typeof opt === 'object' ? opt.id : val;
        const isChecked = value === idToStore || value === val;
        return (
          <label key={key} className="flex items-center space-x-2 cursor-pointer group">
            <div className="relative flex items-center">
              <input type="radio" name={`field-${field.id}`} value={idToStore} checked={isChecked} onChange={() => { if (typeof onSelect === 'function') onSelect(idToStore); else if (typeof onChange === 'function') onChange(field.id, idToStore); }} className={`peer appearance-none w-4 h-4 rounded-full border-2 border-gray-300 checked:border-blue-600 transition-all ${sizeClass}`} />
              <div className="absolute w-2 h-2 bg-blue-600 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 scale-0 peer-checked:scale-100 transition-transform"></div>
            </div>
            <span className={`text-gray-700 group-hover:text-gray-900 ${sizeClass}`}>{val}</span>
          </label>
        );
      })}
    </div>
  );
}
