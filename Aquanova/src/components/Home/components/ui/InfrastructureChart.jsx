import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

const COLORS = {
  con: '#4CAF50',
  sin: '#E0E0E0',
};

function InfrastructureChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Sin datos disponibles
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-3 py-2 shadow-lg rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-800 mb-1">{label}</p>
          {payload.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-gray-600">{item.name === 'con' ? 'Con' : 'Sin'}:</span>
              <span className="font-semibold">{item.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderLegend = () => (
    <div className="flex justify-center gap-4 mt-2">
      <div className="flex items-center gap-1.5 text-xs">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS.con }} />
        <span className="text-gray-600">Con registro</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS.sin }} />
        <span className="text-gray-600">Sin registro</span>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
          >
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="con" fill={COLORS.con} name="con" radius={[4, 4, 0, 0]} barSize={30} />
            <Bar dataKey="sin" fill={COLORS.sin} name="sin" radius={[4, 4, 0, 0]} barSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {renderLegend()}
    </div>
  );
}

export default InfrastructureChart;
