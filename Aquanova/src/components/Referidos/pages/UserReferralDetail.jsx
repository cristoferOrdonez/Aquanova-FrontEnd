import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { referralService } from '../../../services/referralService'

function fmt(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

/**
 * Perfil de un referente. Spec: CU-08, SSD-05, contratos CO-11 / CO-12.
 *
 * Con `formId` en la ruta se acota a esa campaña (CO-11); sin él, muestra la
 * vista transversal de todas sus participaciones (CO-12).
 */
export default function UserReferralDetail() {
  const { userId, formId } = useParams()
  const navigate   = useNavigate()

  const [data, setData]       = useState(null)
  const [error, setError]     = useState(null)
  const [loading, setLoading] = useState(true)

  const scoped = Boolean(formId)
  const backTo = scoped ? `/referidos?campana=${formId}` : '/referidos'

  useEffect(() => {
    setLoading(true)
    setError(null)
    referralService.getUserMetrics(userId, formId ?? null)
      .then(res => {
        if (res.ok) setData(res.data)
        else setError(res.message ?? 'Error al cargar perfil')
      })
      .catch(() => setError('Error de conexión'))
      .finally(() => setLoading(false))
  }, [userId, formId])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-gray-200 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-48 bg-gray-200 rounded-2xl" />
          <div className="h-48 bg-gray-200 rounded-2xl" />
        </div>
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

  const { profile, by_giveaway, recent_referrals } = data
  // CO-11: acotado a campaña ⇒ by_giveaway trae solo esa campaña
  const campaign = scoped ? by_giveaway?.[0] ?? null : null

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

      {/* Header de perfil */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate(backTo)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 mt-0.5 shrink-0"
            aria-label="Volver"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{profile.name}</h1>
                <p className="text-sm text-gray-500 mt-0.5">{profile.email}</p>
                {profile.phone && <p className="text-sm text-gray-400">{profile.phone}</p>}
              </div>
              <div className="text-right shrink-0">
                <span className="font-mono text-sm bg-blue-50 text-[#0D448A] px-3 py-1 rounded-lg font-semibold">
                  {profile.referral_code}
                </span>
                <p className="text-xs text-gray-400 mt-1">Código de referido</p>
              </div>
            </div>

            {/* Puntos en la campaña — el dato que importa en alcance acotado */}
            {scoped && (
              <div className="mt-5 rounded-xl border border-[#0D448A]/20 bg-blue-50/60 p-4">
                <p className="text-xs font-medium text-[#0D448A] uppercase tracking-wide">
                  En esta campaña
                </p>
                <p className="text-sm text-gray-600 mt-0.5 truncate">
                  {campaign?.form_title ?? 'Campaña seleccionada'}
                </p>
                <div className="flex items-baseline gap-4 mt-2">
                  <span className="text-2xl font-bold text-[#0D448A]">
                    {campaign?.points_earned ?? 0}
                  </span>
                  <span className="text-sm text-gray-500">
                    pts · {campaign?.referrals_in_giveaway ?? 0} referido
                    {(campaign?.referrals_in_giveaway ?? 0) === 1 ? '' : 's'}
                  </span>
                </div>
              </div>
            )}

            {/* Mini KPIs — RN-05: en alcance de campaña son el acumulado global */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              {[
                { label: scoped ? 'Puntos (todas)' : 'Puntos acumulados', value: profile.total_accumulated_points, cls: 'text-[#0D448A]' },
                { label: scoped ? 'Referidos (todas)' : 'Total referidos', value: profile.total_referrals },
                { label: 'Exitosos',          value: profile.successful_referrals, cls: 'text-green-600' },
                { label: 'Pendientes',        value: profile.pending_referrals,   cls: 'text-yellow-600' },
              ].map(({ label, value, cls }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className={`text-xl font-bold mt-0.5 ${cls ?? 'text-gray-900'}`}>{value}</p>
                </div>
              ))}
            </div>
            {scoped && (
              <p className="text-[11px] text-gray-400 mt-2">
                Los cuatro indicadores de arriba suman todas las campañas del referente.
              </p>
            )}

            <p className="text-xs text-gray-400 mt-3">
              Última actividad: {fmt(profile.last_activity)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Participación por sorteo */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
            <h2 className="font-semibold text-gray-800">
              {scoped ? 'Participación en esta campaña' : 'Participación por campaña'}
            </h2>
            {/* CO-12 — salida a la vista transversal */}
            {scoped && (
              <button
                onClick={() => navigate(`/referidos/usuario/${userId}`)}
                className="text-xs text-[#1361C5] hover:underline whitespace-nowrap"
              >
                Ver todas →
              </button>
            )}
          </div>
          {!by_giveaway?.length ? (
            <p className="text-center text-gray-400 text-sm py-10">Sin participación en sorteos</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Formulario', 'Referidos', 'Puntos ganados'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {by_giveaway.map(g => (
                    <tr key={g.form_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800 max-w-[180px] truncate">{g.form_title}</td>
                      <td className="px-4 py-3 text-gray-600">{g.referrals_in_giveaway}</td>
                      <td className="px-4 py-3 font-bold text-[#0D448A]">{g.points_earned}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Historial reciente */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Actividad reciente</h2>
          </div>
          {!recent_referrals?.length ? (
            <p className="text-center text-gray-400 text-sm py-10">Sin actividad registrada</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recent_referrals.map(r => (
                <li key={r.referral_id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${r.is_processed ? 'bg-green-400' : 'bg-yellow-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 font-medium truncate">
                      {r.referred_name ?? 'Pendiente de registro'}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{r.form_title}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {r.is_processed
                      ? <span className="text-xs font-semibold text-green-600">+{r.points_earned} pts</span>
                      : <span className="text-xs text-gray-400">Pendiente</span>
                    }
                    <p className="text-[10px] text-gray-300 mt-0.5">{fmt(r.created_at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </motion.div>
  )
}
