import React from 'react';
import { useMetrics, STATUS_COLORS } from '../../hooks/useMetrics';
import MetricCard from '../ui/MetricCard';
import StatusPieChart from '../ui/StatusPieChart';
import CoverageBarChart from '../ui/CoverageBarChart';
import InfrastructureChart from '../ui/InfrastructureChart';
import AreaChartByStatus from '../ui/AreaChartByStatus';

function MetricsPanel({ mapData, loading }) {
  const metrics = useMetrics(mapData);

  const formatArea = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M m²`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K m²`;
    }
    return `${value.toFixed(0)} m²`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4">
        Métricas del Sector
      </h2>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <MetricCard
          title="Total Predios"
          value={metrics.totalLotes}
          subtitle={`${metrics.totalManzanas} manzanas`}
        />
        <MetricCard
          title="Sin Información"
          value={metrics.sinInformacion}
          color={STATUS_COLORS.sin_informacion}
        />
        <MetricCard
          title="Censados"
          value={metrics.censados}
          color={STATUS_COLORS.censado}
        />
        <MetricCard
          title="Registrados"
          value={metrics.registrados}
          color={STATUS_COLORS.registrado}
        />
        <MetricCard
          title="Cobertura"
          value={`${metrics.cobertura}%`}
          subtitle="censados + registrados"
          color="#0D448A"
        />
        <MetricCard
          title="Área Total"
          value={formatArea(metrics.areaTotal)}
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Gráfico de Dona - Distribución Catastral */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 text-center">
            Distribución Catastral
          </h3>
          <div className="h-48">
            <StatusPieChart data={metrics.distribucionEstado} />
          </div>
        </div>

        {/* Gráfico de Dona - Estado Físico */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 text-center">
            Estado Físico (Predios)
          </h3>
          <div className="h-48 flex items-center justify-center">
            {metrics.distribucionFisica.length > 0 ? (
              <StatusPieChart data={metrics.distribucionFisica} />
            ) : (
              <span className="text-xs text-gray-400">Sin datos registrados</span>
            )}
          </div>
        </div>

        {/* Barra de Cobertura */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 text-center">
            Avance de Cobertura
          </h3>
          <div className="h-48">
            <CoverageBarChart
              sinInformacion={metrics.sinInformacion}
              censados={metrics.censados}
              registrados={metrics.registrados}
              cobertura={metrics.cobertura}
            />
          </div>
        </div>

        {/* Infraestructura */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 text-center">
            Infraestructura
          </h3>
          <div className="h-48">
            <InfrastructureChart data={metrics.infraestructura} />
          </div>
        </div>

        {/* Área por Estado */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 text-center">
            Área por Estado
          </h3>
          <div className="h-48">
            <AreaChartByStatus data={metrics.areaPorEstado} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MetricsPanel;
