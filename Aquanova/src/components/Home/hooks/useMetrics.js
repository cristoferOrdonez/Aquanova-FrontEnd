import { useMemo } from 'react';

export const STATUS_COLORS = {
  sin_informacion: '#9E9E9E',
  censado: '#2196F3',
  registrado: '#4CAF50',
};

export const STATUS_LABELS = {
  sin_informacion: 'Sin Información',
  censado: 'Censado',
  registrado: 'Registrado',
};

export function useMetrics(mapData) {
  return useMemo(() => {
    if (!mapData?.blocks) {
      return {
        totalLotes: 0,
        totalManzanas: 0,
        sinInformacion: 0,
        censados: 0,
        registrados: 0,
        cobertura: 0,
        conMedidor: 0,
        sinMedidor: 0,
        conCatastro: 0,
        sinCatastro: 0,
        areaTotal: 0,
        areaPorEstado: [],
        distribucionEstado: [],
        infraestructura: [],
      };
    }

    const allLots = mapData.blocks.flatMap(b => b.lots);
    const totalLotes = allLots.length;
    const totalManzanas = mapData.blocks.length;

    // Conteo por estado
    const sinInformacion = allLots.filter(l => l.status === 'sin_informacion').length;
    const censados = allLots.filter(l => l.status === 'censado').length;
    const registrados = allLots.filter(l => l.status === 'registrado').length;

    // Cobertura
    const cobertura = totalLotes > 0
      ? ((censados + registrados) / totalLotes) * 100
      : 0;

    // Infraestructura
    const conMedidor = allLots.filter(l => l.water_meter_code).length;
    const sinMedidor = totalLotes - conMedidor;
    const conCatastro = allLots.filter(l => l.cadastral_id).length;
    const sinCatastro = totalLotes - conCatastro;

    // Área
    const areaTotal = allLots.reduce((acc, l) => acc + (l.area_m2 || 0), 0);

    // Datos para gráficos
    const distribucionEstado = [
      { name: 'Sin Información', value: sinInformacion, color: STATUS_COLORS.sin_informacion },
      { name: 'Censado', value: censados, color: STATUS_COLORS.censado },
      { name: 'Registrado', value: registrados, color: STATUS_COLORS.registrado },
    ].filter(d => d.value > 0);

    const areaPorEstado = [
      {
        name: 'Sin Info',
        value: allLots.filter(l => l.status === 'sin_informacion').reduce((acc, l) => acc + (l.area_m2 || 0), 0),
        color: STATUS_COLORS.sin_informacion
      },
      {
        name: 'Censado',
        value: allLots.filter(l => l.status === 'censado').reduce((acc, l) => acc + (l.area_m2 || 0), 0),
        color: STATUS_COLORS.censado
      },
      {
        name: 'Registrado',
        value: allLots.filter(l => l.status === 'registrado').reduce((acc, l) => acc + (l.area_m2 || 0), 0),
        color: STATUS_COLORS.registrado
      },
    ];

    const infraestructura = [
      { name: 'Medidor', con: conMedidor, sin: sinMedidor },
      { name: 'Catastro', con: conCatastro, sin: sinCatastro },
    ];

    return {
      totalLotes,
      totalManzanas,
      sinInformacion,
      censados,
      registrados,
      cobertura: cobertura.toFixed(1),
      conMedidor,
      sinMedidor,
      conCatastro,
      sinCatastro,
      areaTotal,
      areaPorEstado,
      distribucionEstado,
      infraestructura,
    };
  }, [mapData]);
}
