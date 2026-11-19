import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { referralService } from '../../../services/referralService'

function fmt(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

function KpiCard({ title, value, highlight }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{title}</p>
      <p className={`text-2xl font-bold mt-1 ${highlight ?? 'text-gray-900'}`}>{value ?? '—'}</p>
    </div>
  )
}

/**
 * Detalle completo de una campaña. Spec: CU-02, contrato CO-02.
 * El panel (`/referidos`) cubre el uso frecuente; esta página es el deep link.
 */
export default function FormReferralDetail() {
  const { formId } = useParams()
  const navigate   = useNavigate()

  const [data, setData]   = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const backTo = `/referidos?campana=${formId}`

  useEffect(() => {
    setLoading(true)
    setError(null)
    referralService.getCampaignMetrics(formId)
      .then(res => {
        if (res.ok) setData(res.data)
        else setError(res.message ?? 'Error al cargar')
      })
      .catch(() => setError('Error de conexión'))
      .finally(() => setLoading(false))
  }, [formId])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded-xl w-48" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}
        </div>
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
        <p className="text-red-700 font-medium">{error}</p>
        <button onClick={() => navigate(backTo)} className="mt-3 text-sm text-[#1361C5] hover:underline">
          ← Volver al panel
        </button>
      </div>
    )
  }

  const { config, timeline, top10 } = data
  const convRate = config.conversion_rate

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

      {/* Cabecera */}
      <div className="flex items-start gap-3">
        <button
          onClick={() => navigate(backTo)}
          className="mt-1 p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          aria-label="Volver"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 leading-tight">{config.form_title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {config.is_active ? 'Sorteo activo' : 'Sorteo inactivo'}
            </span>
            <span className="text-xs text-gray-400">{config.points_per_referral} pts por referido</span>
            {config.max_points_per_user && (
              <span className="text-xs text-gray-400">· máx {config.max_points_per_user} pts por usuario</span>
            )}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard title="Total submissions" value={config.total_submissions} />
        <KpiCard title="Total referidos"   value={config.total_referrals} />
        <KpiCard title="Procesados"        value={config.processed_referrals} />
        <KpiCard title="Pendientes"        value={config.pending_referrals} />
        <KpiCard title="Puntos dist."      value={config.total_points_distributed} />
        <KpiCard
          title="Tasa de conversión"
          value={`${convRate}%`}
          highlight={convRate >= 50 ? 'text-green-600' : convRate >= 25 ? 'text-yellow-600' : 'text-red-600'}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Actividad por fecha</h2>
          </div>
          {!timeline?.length ? (
            <p className="text-center text-gray-400 text-sm py-10">Sin datos de actividad</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Fecha', 'Creados', 'Convertidos', 'Puntos'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {timeline.map(row => (
                    <tr key={row.date} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 text-gray-700 whitespace-nowrap font-medium">{row.date}</td>
                      <td className="px-4 py-2.5 text-gray-600">{row.referrals_created}</td>
                      <td className="px-4 py-2.5">
                        <span className={row.referrals_converted > 0 ? 'text-green-600 font-medium' : 'text-gray-400'}>
                          {row.referrals_converted}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-[#0D448A]">
                        {row.points_awarded > 0 ? `+${row.points_awarded}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top 10 */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Top participantes</h2>
          </div>
          {!top10?.length ? (
            <p className="text-center text-gray-400 text-sm py-10">Sin participantes aún</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {top10.map(row => {
                const medals = ['🥇', '🥈', '🥉']
                return (
                  <li key={row.user_id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                    <span className="w-7 text-center font-medium text-gray-500 text-sm">
                      {row.position <= 3 ? medals[row.position - 1] : row.position}
                    </span>
                    <span className="flex-1 font-medium text-gray-900 text-sm truncate">{row.name}</span>
                    <span className="text-xs text-gray-400">{row.referrals_count} refs</span>
                    <span className="font-bold text-[#0D448A] text-sm ml-2">{row.total_points} pts</span>
                    <button
                      onClick={() => navigate(`/referidos/campana/${formId}/usuario/${row.user_id}`)}
                      className="text-xs text-[#1361C5] hover:underline ml-1 shrink-0"
                    >
                      Ver →
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </motion.div>
  )
}
