import React from 'react';

export default function QuestionCard({ field, labelSize, children }) {
  return (
    <div className={`w-full bg-[var(--card-bg)] border-[1.5px] border-[var(--card-stroke)] rounded-[5px] p-6 shadow-sm transition-all duration-500 transform-gpu hover:shadow-md hover:scale-[1.01]`}> 
      <div className="mb-2">
        <label className={`block ${labelSize} font-medium text-[var(--text)] mb-1 break-words leading-snug`}>
          {field.title || field.label || "Sin título"}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>
      <div className="mt-1">{children}</div>
    </div>
  );
}
