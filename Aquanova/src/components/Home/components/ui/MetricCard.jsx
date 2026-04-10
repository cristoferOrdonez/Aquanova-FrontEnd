import React from 'react';

function MetricCard({ title, value, subtitle, color, icon: Icon }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col items-center justify-center min-h-[100px] hover:shadow-md transition-shadow">
      {Icon && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center mb-2"
          style={{ backgroundColor: color ? `${color}20` : '#f3f4f6' }}
        >
          <Icon className="w-4 h-4" style={{ color: color || '#6b7280' }} />
        </div>
      )}
      {color && !Icon && (
        <div
          className="w-3 h-3 rounded-full mb-2"
          style={{ backgroundColor: color }}
        />
      )}
      <span
        className="text-2xl font-bold"
        style={{ color: color || '#1f2937' }}
      >
        {value}
      </span>
      <span className="text-xs text-gray-500 text-center mt-1">{title}</span>
      {subtitle && (
        <span className="text-xs text-gray-400 mt-0.5">{subtitle}</span>
      )}
    </div>
  );
}

export default MetricCard;
