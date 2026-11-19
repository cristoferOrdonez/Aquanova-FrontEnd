import { motion } from 'framer-motion'

/**
 * Selector de campaña — entrada de primer nivel del panel de referidos.
 * Spec: CO-01, RN-05, RN-07, RN-10.
 *
 * El orden y la preselección los resuelve `referralService.getCampaigns()`
 * (RN-07); aquí solo se pinta lo que llega.
 */

function conversionTone(rate) {
  if (rate >= 50) return 'text-green-600'
  if (rate >= 25) return 'text-yellow-600'
  return 'text-red-500'
}

function CampaignCard({ campaign, selected, onSelect }) {
  const c = campaign
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(c.form_id)}
      whileTap={{ scale: 0.98 }}
      aria-pressed={selected}
      className={`text-left rounded-2xl border p-4 transition-all shrink-0 w-64 ${
        selected
          ? 'border-[#0D448A] bg-blue-50/60 shadow-sm ring-1 ring-[#0D448A]/20'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
          {c.form_title}
        </p>
        <span
          className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
            c.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}
        >
          {c.is_active ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-y-1.5 text-xs">
        <span className="text-gray-400">Referidos</span>
        <span className="text-right font-medium text-gray-700">{c.total_referrals}</span>

        <span className="text-gray-400">Conversión</span>
        <span className={`text-right font-semibold ${conversionTone(c.conversion_rate)}`}>
          {c.conversion_rate}%
        </span>

        <span className="text-gray-400">Puntos</span>
        <span className="text-right font-semibold text-[#0D448A]">
          {c.total_points_distributed}
        </span>
      </div>

      {/* RN-04 / D-2: sin slug publicado no se pueden generar links de esta campaña */}
      {!c.form_key && (
        <p className="mt-2 text-[10px] text-amber-600 leading-tight">
          Sin identificador público — no genera links
        </p>
      )}
    </motion.button>
  )
}

function SkeletonCard() {
  return (
    <div className="shrink-0 w-64 rounded-2xl border border-gray-200 bg-white p-4">
      <div className="h-4 w-3/4 rounded bg-gray-100 animate-pulse" />
      <div className="mt-4 space-y-2">
        {[0, 1, 2].map(i => (
          <div key={i} className="h-3 rounded bg-gray-100 animate-pulse" />
        ))}
      </div>
    </div>
  )
}

export default function CampaignSelector({
  campaigns,
  selectedId,
  onSelect,
  loading,
  error,
  onRetry,
  scope,
  onScopeChange,
}) {
  // CU-01 ext. 2b — el error no debe borrar la selección previa
  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 border border-red-200 p-4 flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-red-700">{error}</p>
        <button
          onClick={onRetry}
          className="text-sm font-medium text-[#1361C5] hover:underline"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-1">
        {[0, 1, 2].map(i => <SkeletonCard key={i} />)}
      </div>
    )
  }

  // CU-01 ext. 2a — ninguna campaña tiene sorteo configurado
  if (!campaigns?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
        <p className="font-medium text-gray-700">Todavía no hay campañas con sorteo</p>
        <p className="mt-1 text-sm text-gray-400">
          Configura un sorteo en una campaña para empezar a medir referidos.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-sm font-semibold text-gray-700">Campaña</h2>
          <p className="text-xs text-gray-400">
            Las métricas de abajo corresponden a la campaña seleccionada
          </p>
        </div>

        {/* RN-05 — el alcance global es una consulta secundaria y explícita */}
        <div className="flex rounded-xl border border-gray-200 bg-white p-1 text-xs font-medium">
          <button
            type="button"
            onClick={() => onScopeChange('campaign')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              scope === 'campaign' ? 'bg-[#0D448A] text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Por campaña
          </button>
          <button
            type="button"
            onClick={() => onScopeChange('global')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              scope === 'global' ? 'bg-[#0D448A] text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Todas
          </button>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {campaigns.map(c => (
          <CampaignCard
            key={c.form_id}
            campaign={c}
            selected={scope === 'campaign' && c.form_id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}
