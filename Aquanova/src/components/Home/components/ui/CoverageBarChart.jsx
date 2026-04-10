import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { STATUS_COLORS } from '../../hooks/useMetrics';

function CoverageBarChart({ sinInformacion, censados, registrados, cobertura }) {
  const total = sinInformacion + censados + registrados;

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Sin datos disponibles
      </div>
    );
  }

  const data = [
    {
      name: 'Cobertura',
      sinInformacion,
      censados,
      registrados,
    }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-3 py-2 shadow-lg rounded-lg border border-gray-200">
          {payload.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-gray-600">{item.name}:</span>
              <span className="font-semibold">{item.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="text-center mb-2">
        <span className="text-3xl font-bold text-gray-800">{cobertura}%</span>
        <p className="text-xs text-gray-500">Cobertura total</p>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
          >
            <XAxis type="number" hide domain={[0, total]} />
            <YAxis type="category" dataKey="name" hide />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="registrados" stackId="a" fill={STATUS_COLORS.registrado} name="Registrado" radius={[0, 0, 0, 0]} />
            <Bar dataKey="censados" stackId="a" fill={STATUS_COLORS.censado} name="Censado" radius={[0, 0, 0, 0]} />
            <Bar dataKey="sinInformacion" stackId="a" fill={STATUS_COLORS.sin_informacion} name="Sin Info" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center gap-4 mt-2">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS.registrado }} />
          <span className="text-gray-600">Registrado ({registrados})</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS.censado }} />
          <span className="text-gray-600">Censado ({censados})</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS.sin_informacion }} />
          <span className="text-gray-600">Sin Info ({sinInformacion})</span>
        </div>
      </div>
    </div>
  );
}

export default CoverageBarChart;
