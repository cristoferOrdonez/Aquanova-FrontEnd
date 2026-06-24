import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { referralService } from '../../../services/referralService'

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

function conversionColor(rate) {
  if (rate >= 50) return 'text-green-600 bg-green-50'
  if (rate >= 25) return 'text-yellow-600 bg-yellow-50'
  return 'text-red-600 bg-red-50'
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

// ── Tabla ranking global ──────────────────────────────────────────────────────

function RankingTable({ data, loading, navigate }) {
  const medals = ['🥇', '🥈', '🥉']
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {['#', 'Nombre', 'Código', 'Puntos', 'Referidos', 'Exitosos', 'Última actividad', ''].map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {loading
            ? <LoadingRows cols={8} />
            : !data?.length
              ? <EmptyState text="Sin datos de ranking aún" />
              : data.map(row => (
                <tr key={row.user_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-700">
                    {row.position <= 3 ? medals[row.position - 1] : row.position}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{row.name}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs bg-blue-50 text-[#0D448A] px-2 py-0.5 rounded-md">{row.referral_code}</span>
                  </td>
                  <td className="px-4 py-3 font-bold text-[#0D448A]">{row.total_points}</td>
                  <td className="px-4 py-3 text-gray-600">{row.total_referrals}</td>
                  <td className="px-4 py-3 text-gray-600">{row.successful_referrals}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmt(row.last_activity)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/referidos/usuario/${row.user_id}`)}
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
  )
}

// ── Tabla por formulario ──────────────────────────────────────────────────────

function PerFormTable({ data, loading, navigate }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {['Formulario', 'Estado', 'Pts/referido', 'Total refs', 'Procesados', 'Pendientes', 'Puntos dist.', 'Participantes', ''].map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {loading
            ? <LoadingRows cols={9} />
            : !data?.length
              ? <EmptyState text="Sin formularios con sorteo activo" />
              : data.map(row => (
                <tr key={row.form_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">{row.form_title}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${row.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {row.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{row.points_per_referral}</td>
                  <td className="px-4 py-3 text-gray-600">{row.total_referrals}</td>
                  <td className="px-4 py-3 text-green-600 font-medium">{row.processed_referrals}</td>
                  <td className="px-4 py-3 text-yellow-600 font-medium">{row.pending_referrals}</td>
                  <td className="px-4 py-3 font-bold text-[#0D448A]">{row.total_points_distributed}</td>
                  <td className="px-4 py-3 text-gray-600">{row.active_referrers}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/referidos/formulario/${row.form_id}`)}
                      className="text-xs text-[#1361C5] hover:underline whitespace-nowrap"
                    >
                      Ver detalle →
                    </button>
                  </td>
                </tr>
              ))
          }
        </tbody>
      </table>
    </div>
  )
}

// ── Feed de actividad ─────────────────────────────────────────────────────────

function ActivityFeed({ data, loading }) {
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
            <p className="text-xs text-gray-400 mt-0.5 truncate">{item.form_title}</p>
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
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

const TABS = [
  { id: 'ranking',   label: 'Ranking global' },
  { id: 'per-form',  label: 'Por formulario' },
  { id: 'activity',  label: 'Actividad'      },
]

export default function ReferralDashboard() {
  const navigate = useNavigate()

  const [overview, setOverview]   = useState(null)
  const [overviewErr, setOvErr]   = useState(null)
  const [activeTab, setActiveTab] = useState('ranking')

  // Datos por tab
  const [tabData, setTabData]     = useState({ ranking: null, 'per-form': null, activity: null })
  const [tabLoading, setTabLoad]  = useState({ ranking: false, 'per-form': false, activity: false })

  // Fetch overview
  const fetchOverview = useCallback(async () => {
    setOvErr(null)
    try {
      const res = await referralService.getOverview()
      if (res.ok) setOverview(res.data)
      else setOvErr(res.message ?? 'Error al cargar resumen')
    } catch {
      setOvErr('Error de conexión')
    }
  }, [])

  // Fetch datos del tab activo
  const fetchTab = useCallback(async (tab) => {
    setTabLoad(prev => ({ ...prev, [tab]: true }))
    try {
      let res
      if (tab === 'ranking')   res = await referralService.getRanking()
      if (tab === 'per-form')  res = await referralService.getPerForm()
      if (tab === 'activity')  res = await referralService.getActivity()
      if (res?.ok) setTabData(prev => ({ ...prev, [tab]: res.data }))
    } catch { /* silently ignore */ }
    finally { setTabLoad(prev => ({ ...prev, [tab]: false })) }
  }, [])

  // Carga inicial
  useEffect(() => {
    fetchOverview()
    fetchTab('ranking')
  }, [fetchOverview, fetchTab])

  // Cargar datos al cambiar de tab (si aún no se cargaron)
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (!tabData[tab]) fetchTab(tab)
  }

  const handleRefresh = () => {
    fetchOverview()
    fetchTab(activeTab)
  }

  const ov = overview

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Panel de Referidos</h1>
          <p className="text-sm text-gray-400 mt-0.5">Métricas del sistema de sorteos e invitaciones</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
          Actualizar
        </button>
      </div>

      {/* Tarjetas KPI */}
      {overviewErr ? (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">{overviewErr}</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          <KpiCard title="Total invitaciones"     value={ov?.total_referrals}            sub="links que generaron registro" />
          <KpiCard title="Conversiones"           value={ov?.processed_referrals}        sub="invitados registrados" />
          <KpiCard title="Pendientes"             value={ov?.pending_referrals}          sub="sin completar registro" />
          <KpiCard title="Puntos distribuidos"    value={ov?.total_points_distributed}   sub="en el ledger" />
          <KpiCard
            title="Tasa de conversión"
            value={ov ? `${ov.conversion_rate}%` : null}
            highlight={ov ? conversionColor(ov.conversion_rate) : ''}
          />
          <KpiCard title="Participación viral"    value={ov ? `${ov.referral_share}%` : null}   sub="de submissions vía link" />
          <KpiCard title="Referidores activos"    value={ov?.active_referrers}           sub="ganaron al menos 1 pt" />
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex gap-1 p-2 border-b border-gray-100">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-[#0D448A] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {activeTab === 'ranking'  && <RankingTable  data={tabData.ranking}         loading={tabLoading.ranking}   navigate={navigate} />}
          {activeTab === 'per-form' && <PerFormTable  data={tabData['per-form']}     loading={tabLoading['per-form']} navigate={navigate} />}
          {activeTab === 'activity' && <ActivityFeed  data={tabData.activity}        loading={tabLoading.activity} />}
        </div>
      </div>
    </motion.div>
  )
}
