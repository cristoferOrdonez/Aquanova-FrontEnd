import React from 'react';

export default function CheckboxGroup({ field, value = [], onCheckboxChange, sizeClass }) {
  return (
    <div className="space-y-2 mt-1">
      {field.options && field.options.map((opt, idx) => {
        const val = typeof opt === 'object' ? opt.value : opt;
        const key = typeof opt === 'object' ? opt.id : idx;
        const idToStore = typeof opt === 'object' ? opt.id : opt;
        const arr = Array.isArray(value) ? value : [];
        const isCheckedRobust = arr.includes(idToStore) || arr.includes(val);
        return (
          <label key={key} className="flex items-center space-x-2 cursor-pointer group">
            <div className="relative flex items-center">
              <input type="checkbox" checked={isCheckedRobust} onChange={(e) => onCheckboxChange(field.id, idToStore, e.target.checked)} className={`peer appearance-none w-4 h-4 rounded border-2 border-gray-300 checked:bg-blue-600 checked:border-blue-600 transition-all ${sizeClass}`} />
              <svg className="absolute w-3 h-3 text-white top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 scale-0 peer-checked:scale-100 transition-transform pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <span className={`text-gray-700 group-hover:text-gray-900 ${sizeClass}`}>{val}</span>
          </label>
        );
      })}
    </div>
  );
}
