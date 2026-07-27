import { useEffect, useState, useCallback, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { referralService } from '../../../services/referralService'
import CampaignSelector from '../components/CampaignSelector'

/**
 * Panel de referidos — campaña primero.
 * Spec: CU-01, CU-03, SSD-01, SSD-06, contratos CO-01…CO-04 y CO-13.
 *
 * La campaña seleccionada y el alcance viven en la query string (DA-3) para que
 * la vista sea compartible y sobreviva a un refresh (CA-10).
 */

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

function conversionColor(rate) {
  if (rate >= 50) return 'text-green-600'
  if (rate >= 25) return 'text-yellow-600'
  return 'text-red-600'
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

function KpiCard({ title, value, sub, highlight }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-1"
    >
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{title}</p>
      <p className={`text-2xl font-bold ${highlight ?? 'text-gray-900'}`}>{value ?? '—'}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </motion.div>
  )
}

function LoadingRows({ cols, rows = 5 }) {
  return Array.from({ length: rows }).map((_, i) => (
    <tr key={i}>
      {Array.from({ length: cols }).map((_, j) => (
        <td key={j} className="px-4 py-3">
          <div className="h-4 bg-gray-100 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  ))
}

function EmptyState({ text }) {
  return (
    <tr>
      <td colSpan={99} className="text-center py-12 text-gray-400 text-sm">{text}</td>
    </tr>
  )
}

/** Aviso de que los datos vienen de un fallback y por tanto son incompletos. */
function PartialNotice({ children }) {
  return (
    <p className="mb-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
      {children}
    </p>
  )
}

/** RN-05 — toda cifra que sume campañas debe verse marcada como agregada. */
function AggregateBadge({ count }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-[11px] font-medium text-indigo-700">
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
        <path d="M12 2 2 7l10 5 10-5-10-5zm0 9L2 16l10 5 10-5-10-5z" />
      </svg>
      Suma de {count != null ? `${count} campañas` : 'todas las campañas'}
    </span>
  )
}

// ── Ranking ───────────────────────────────────────────────────────────────────

const MEDALS = ['🥇', '🥈', '🥉']

function RankingTable({ data, loading, partial, navigate, onRowHref, pointsLabel }) {
  const cols = ['#', 'Nombre', 'Código', pointsLabel, 'Referidos', 'Exitosos', 'Última actividad', '']
  return (
    <>
      {partial && (
        <PartialNotice>
          Ranking derivado del leaderboard público de la campaña: no incluye código de
          referente, referidos exitosos ni última actividad. Se completará cuando el
          backend exponga <code className="font-mono">/giveaways/:formId/ranking</code>.
        </PartialNotice>
      )}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {cols.map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loading
              ? <LoadingRows cols={cols.length} />
              : !data?.length
                ? <EmptyState text="Sin participantes todavía" />
                : data.map(row => (
                  <tr key={row.user_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-700">
                      {row.position <= 3 ? MEDALS[row.position - 1] : row.position}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{row.name}</td>
                    <td className="px-4 py-3">
                      {row.referral_code
                        ? <span className="font-mono text-xs bg-blue-50 text-[#0D448A] px-2 py-0.5 rounded-md">{row.referral_code}</span>
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 font-bold text-[#0D448A]">{row.total_points}</td>
                    <td className="px-4 py-3 text-gray-600">{row.total_referrals ?? row.referrals_count}</td>
                    <td className="px-4 py-3 text-gray-600">{row.successful_referrals ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmt(row.last_activity)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(onRowHref(row.user_id))}
                        className="text-xs text-[#1361C5] hover:underline whitespace-nowrap"
                      >
                        Ver perfil →
                      </button>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>
    </>
  )
}

// ── Actividad ─────────────────────────────────────────────────────────────────

function ActivityFeed({ data, loading, truncated, showCampaign }) {
  if (loading) {
    return (
      <ul className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className="flex gap-3 p-4 bg-white rounded-xl border border-gray-100">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-200 mt-1 shrink-0 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
            </div>
          </li>
        ))}
      </ul>
    )
  }

  if (!data?.length) {
    return <p className="text-center text-gray-400 text-sm py-12">Sin actividad reciente</p>
  }

  return (
    <>
      {truncated && (
        <PartialNotice>
          Actividad filtrada en el cliente sobre la ventana global más reciente: puede
          faltar actividad antigua de esta campaña.
        </PartialNotice>
      )}
      <ul className="space-y-2">
        {data.map(item => (
          <li key={item.referral_id} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
            <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${item.is_processed ? 'bg-green-400' : 'bg-yellow-400'}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800">
                <span className="font-semibold">{item.referrer_name}</span>
                {' invitó a '}
                <span className="font-semibold">{item.referred_name ?? 'alguien (pendiente de registro)'}</span>
              </p>
              {showCampaign && (
                <p className="text-xs text-gray-400 mt-0.5 truncate">{item.form_title}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              {item.is_processed
                ? <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+{item.points_awarded} pts</span>
                : <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Pendiente</span>
              }
              <time className="text-[10px] text-gray-400">
                {new Date(item.created_at).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </time>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

// ── Configuración del sorteo + timeline ───────────────────────────────────────

function GiveawayPanel({ campaign, metrics, loading }) {
  if (loading) {
    return <div className="h-48 rounded-xl bg-gray-100 animate-pulse" />
  }

  const config = metrics?.config
  const timeline = metrics?.timeline ?? []

  return (
    <div className="space-y-5">
      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <dt className="text-xs text-gray-400 uppercase tracking-wide">Estado</dt>
          <dd className={`mt-1 font-semibold ${campaign.is_active ? 'text-green-600' : 'text-gray-500'}`}>
            {campaign.is_active ? 'Sorteo activo' : 'Sorteo inactivo'}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-gray-400 uppercase tracking-wide">Puntos por referido</dt>
          <dd className="mt-1 font-semibold text-gray-900">{campaign.points_per_referral}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-400 uppercase tracking-wide">Tope por usuario</dt>
          <dd className="mt-1 font-semibold text-gray-900">
            {campaign.max_points_per_user ?? 'Sin tope'}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-gray-400 uppercase tracking-wide">Identificador público</dt>
          <dd className="mt-1 font-mono text-xs text-gray-700 break-all">
            {campaign.form_key ?? <span className="text-amber-600 font-sans">No publicado</span>}
          </dd>
        </div>
      </dl>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Actividad por fecha</h3>
        {!timeline.length ? (
          <p className="text-center text-gray-400 text-sm py-8 rounded-xl border border-gray-200">
            Sin datos de actividad
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Fecha', 'Creados', 'Convertidos', 'Puntos'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
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

      {config?.total_submissions != null && (
        <p className="text-xs text-gray-400">
          {config.total_submissions} respuestas totales en la campaña.
        </p>
      )}
    </div>
  )
}

// ── Página ────────────────────────────────────────────────────────────────────

const CAMPAIGN_TABS = [
  { id: 'ranking',  label: 'Ranking'   },
  { id: 'activity', label: 'Actividad' },
  { id: 'giveaway', label: 'Sorteo'    },
]

const GLOBAL_TABS = [
  { id: 'ranking',  label: 'Ranking agregado' },
  { id: 'activity', label: 'Actividad'        },
]

export default function ReferralDashboard() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  const scope = params.get('alcance') === 'global' ? 'global' : 'campaign'
  const selectedId = params.get('campana')
  const activeTab = params.get('tab') ?? 'ranking'

  const [campaigns, setCampaigns] = useState(null)
  const [campaignsErr, setCampaignsErr] = useState(null)
  const [campaignsLoading, setCampaignsLoading] = useState(true)

  const [metrics, setMetrics] = useState(null)
  const [ranking, setRanking] = useState(null)
  const [activity, setActivity] = useState(null)
  const [panelLoading, setPanelLoading] = useState(false)
  const [panelErr, setPanelErr] = useState(null)

  const [globalOverview, setGlobalOverview] = useState(null)

  const selected = useMemo(
    () => campaigns?.find(c => c.form_id === selectedId) ?? null,
    [campaigns, selectedId],
  )

  const updateParams = useCallback((patch) => {
    setParams(prev => {
      const next = new URLSearchParams(prev)
      Object.entries(patch).forEach(([k, v]) => {
        if (v == null) next.delete(k)
        else next.set(k, v)
      })
      return next
    }, { replace: true })
  }, [setParams])

  // ── Carga de campañas + preselección (RN-07) ────────────────────────────────
  const fetchCampaigns = useCallback(async () => {
    setCampaignsLoading(true)
    setCampaignsErr(null)
    try {
      const res = await referralService.getCampaigns()
      setCampaigns(res.data)
      return res.data
    } catch (err) {
      setCampaignsErr(err.message ?? 'No se pudieron cargar las campañas')
      return null
    } finally {
      setCampaignsLoading(false)
    }
  }, [])

  useEffect(() => { fetchCampaigns() }, [fetchCampaigns])

  // El servicio ya ordena por RN-07: la primera es la preselección correcta
  useEffect(() => {
    if (!campaigns?.length) return
    const stillExists = campaigns.some(c => c.form_id === selectedId)
    if (!stillExists) updateParams({ campana: campaigns[0].form_id })
  }, [campaigns, selectedId, updateParams])

  // ── Datos del alcance de campaña ────────────────────────────────────────────
  useEffect(() => {
    if (scope !== 'campaign' || !selectedId) return
    let cancelled = false

    setPanelLoading(true)
    setPanelErr(null)
    setRanking(null)
    setActivity(null)
    setMetrics(null)

    Promise.all([
      referralService.getCampaignMetrics(selectedId).catch(() => null),
      referralService.getCampaignRanking(selectedId).catch(() => null),
      referralService.getCampaignActivity(selectedId).catch(() => null),
    ])
      .then(([m, r, a]) => {
        if (cancelled) return
        setMetrics(m?.data ?? null)
        setRanking(r)
        setActivity(a)
        // RN-10: sin datos no es error; solo falla si los tres reventaron
        if (!m && !r && !a) setPanelErr('No se pudieron cargar los datos de la campaña')
      })
      .finally(() => { if (!cancelled) setPanelLoading(false) })

    return () => { cancelled = true }
  }, [scope, selectedId])

  // ── Datos del alcance global (CO-13) ────────────────────────────────────────
  useEffect(() => {
    if (scope !== 'global') return
    let cancelled = false

    setPanelLoading(true)
    setPanelErr(null)

    Promise.all([
      referralService.getGlobalOverview().catch(() => null),
      referralService.getGlobalRanking().catch(() => null),
      referralService.getGlobalActivity().catch(() => null),
    ])
      .then(([o, r, a]) => {
        if (cancelled) return
        setGlobalOverview(o?.data ?? null)
        setRanking(r ? { ...r, partial: false } : null)
        setActivity(a ? { ...a, truncated: false } : null)
      })
      .finally(() => { if (!cancelled) setPanelLoading(false) })

    return () => { cancelled = true }
  }, [scope])

  const handleRefresh = () => {
    fetchCampaigns()
    // Fuerza recarga del panel reescribiendo el alcance actual
    updateParams({ alcance: scope === 'global' ? 'global' : null })
  }

  const tabs = scope === 'global' ? GLOBAL_TABS : CAMPAIGN_TABS
  const currentTab = tabs.some(t => t.id === activeTab) ? activeTab : 'ranking'

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Cabecera */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Panel de Referidos</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Métricas de sorteos e invitaciones por campaña
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
          </svg>
          Actualizar
        </button>
      </div>

      {/* Selector de campaña (CO-01) */}
      <CampaignSelector
        campaigns={campaigns}
        selectedId={selectedId}
        onSelect={(id) => updateParams({ campana: id, alcance: null })}
        loading={campaignsLoading}
        error={campaignsErr}
        onRetry={fetchCampaigns}
        scope={scope}
        onScopeChange={(s) => updateParams({ alcance: s === 'global' ? 'global' : null })}
      />

      {/* KPIs */}
      {scope === 'campaign' && selected && (
        <div>
          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
            <h2 className="font-semibold text-gray-800">{selected.form_title}</h2>
            <button
              onClick={() => navigate(`/referidos/campana/${selected.form_id}`)}
              className="text-xs text-[#1361C5] hover:underline"
            >
              Abrir detalle completo →
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <KpiCard title="Referidos"          value={selected.total_referrals}          sub="invitaciones generadas" />
            <KpiCard title="Conversiones"       value={selected.processed_referrals}      sub="invitados registrados" />
            <KpiCard title="Pendientes"         value={selected.pending_referrals}        sub="sin completar registro" />
            <KpiCard title="Puntos distribuidos" value={selected.total_points_distributed} sub="en esta campaña" />
            <KpiCard
              title="Tasa de conversión"
              value={`${selected.conversion_rate}%`}
              highlight={conversionColor(selected.conversion_rate)}
            />
            <KpiCard title="Referidores activos" value={selected.active_referrers} sub="con al menos 1 punto" />
          </div>
        </div>
      )}

      {scope === 'global' && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-semibold text-gray-800">Todas las campañas</h2>
            <AggregateBadge count={campaigns?.length} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <KpiCard title="Referidos"           value={globalOverview?.total_referrals} />
            <KpiCard title="Conversiones"        value={globalOverview?.processed_referrals} />
            <KpiCard title="Pendientes"          value={globalOverview?.pending_referrals} />
            <KpiCard title="Puntos distribuidos" value={globalOverview?.total_points_distributed} />
            <KpiCard
              title="Tasa de conversión"
              value={globalOverview ? `${globalOverview.conversion_rate}%` : null}
              highlight={globalOverview ? conversionColor(globalOverview.conversion_rate) : ''}
            />
            <KpiCard title="Referidores activos" value={globalOverview?.active_referrers} />
          </div>
        </div>
      )}

      {/* Tabs */}
      {(scope === 'global' || selected) && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex gap-1 p-2 border-b border-gray-100">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => updateParams({ tab: tab.id })}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  currentTab === tab.id
                    ? 'bg-[#0D448A] text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-4">
            {panelErr && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 mb-3">
                {panelErr}
              </div>
            )}

            {currentTab === 'ranking' && (
              <RankingTable
                data={ranking?.data}
                loading={panelLoading}
                partial={Boolean(ranking?.partial)}
                navigate={navigate}
                pointsLabel={scope === 'global' ? 'Puntos totales' : 'Puntos en campaña'}
                onRowHref={(userId) => scope === 'global'
                  ? `/referidos/usuario/${userId}`
                  : `/referidos/campana/${selectedId}/usuario/${userId}`}
              />
            )}

            {currentTab === 'activity' && (
              <ActivityFeed
                data={activity?.data}
                loading={panelLoading}
                truncated={Boolean(activity?.truncated)}
                showCampaign={scope === 'global'}
              />
            )}

            {currentTab === 'giveaway' && selected && (
              <GiveawayPanel campaign={selected} metrics={metrics} loading={panelLoading} />
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}
