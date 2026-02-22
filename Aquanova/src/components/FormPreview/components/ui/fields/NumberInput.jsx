import React from 'react';

export default function NumberInput({ value, onChange }) {
  return (
    <div className="mt-2 px-1">
      <div className="bg-[#F1F5F9] w-full rounded-[14px] border-[1.5px] border-[#CBD5E1] px-2 py-1 tablet:text-sm text-[13px] text-[var(--text)] opacity-90 select-none flex items-center justify-between">
        <input type="number" placeholder="Introduce un número" value={value || ''} onChange={(e) => onChange(e.target.value)} className="bg-transparent outline-none w-full pr-2 text-[inherit]" />
        <div className="flex flex-col -space-y-1 ml-2">
          <button type="button" onClick={() => { const n = parseFloat(value) || 0; onChange(String(n + 1)); }} className="p-1 hover:text-gray-700">
            <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
          </button>
          <button type="button" onClick={() => { const n = parseFloat(value) || 0; onChange(String(n - 1)); }} className="p-1 hover:text-gray-700">
            <svg className="w-3 h-3 rotate-180" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
