import React from 'react';

export default function TextResponse({ value, onChange }) {
  return (
    <div className="mt-2 px-1">
      <div className="bg-[#F1F5F9] w-full rounded-[14px] border-[1.5px] border-[#CBD5E1] px-3 py-2 tablet:text-sm text-[13px] text-[var(--text)] opacity-90 select-none">
        <input type="text" placeholder="Tu respuesta" value={value || ''} onChange={(e) => onChange(e.target.value)} className="w-full bg-transparent outline-none text-[inherit]" />
      </div>
    </div>
  );
}
