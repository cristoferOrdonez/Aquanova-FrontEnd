import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { referralService } from '../../../services/referralService'
import { authService } from '../../../services/authService'

/**
 * Perfil del referente — un link y un QR por campaña.
 * Spec: CU-04, CU-05, SSD-02, contratos CO-05 / CO-06 / CO-07.
 *
 * DA-5 opción (a): se listan todas las campañas activas, haya invitado o no,
 * para que el referente pueda arrancar en una campaña nueva.
 */

// ── QR Modal ───────────────────────────────────────────────────────────────

function QRModal({ campaign, referralCode, onClose }) {
  const [qr, setQr] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    let cancelled = false
    referralService.getCampaignQR(campaign.form_key, referralCode)
      .then(data => { if (!cancelled) setQr(data) })
      .catch(err => { if (!cancelled) setError(err.message ?? 'No se pudo generar el QR') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [campaign.form_key, referralCode])

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [onClose])

  const handleDownload = async () => {
    setDownloading(true)
    try {
      await referralService.downloadCampaignQR(campaign.form_key, referralCode, campaign.form_title)
    } catch (err) {
      setError(err.message ?? 'No se pudo descargar el QR')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Cerrar"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>

        <h2 className="text-lg font-bold text-gray-900">QR de referido</h2>
        <p className="text-xs text-gray-400 mt-0.5 mb-4 pr-6">{campaign.form_title}</p>

        {loading && (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#1361C5]" />
            <p className="text-sm text-gray-400">Generando QR…</p>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-center text-sm text-red-700">
            {error}
          </div>
        )}

        {qr && (
          <div className="flex flex-col items-center gap-4">
            <div className="p-3 border border-gray-200 rounded-2xl bg-white">
              <img
                src={qr.qr_data_url}
                alt={`QR de referido para ${campaign.form_title}`}
                width={220}
                height={220}
                className="block"
              />
            </div>

            <div className="text-center">
              <span className="font-mono text-sm font-bold text-[#0D448A] bg-blue-50 px-3 py-1 rounded-lg">
                {referralCode}
              </span>
              <p className="text-xs text-gray-400 mt-2 break-all">{qr.referral_url}</p>
            </div>

            <p className="text-xs text-gray-400 text-center">
              Al escanearlo se abre esta campaña con tu código ya aplicado.
            </p>

            <div className="flex gap-2 w-full">
              {typeof navigator !== 'undefined' && navigator.share && (
                <button
                  onClick={() => navigator.share({
                    title: campaign.form_title,
                    text: '¡Ayuda a tu comunidad completando esta campaña!',
                    url: qr.referral_url,
                  })}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#1361C5] hover:brightness-110 transition-all"
                >
                  Compartir
                </button>
              )}
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-[#0D448A] border border-[#0D448A]/30 hover:bg-blue-50 transition-all disabled:opacity-60"
              >
                {downloading ? 'Descargando…' : 'Descargar PNG'}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

// ── Tarjeta de campaña ─────────────────────────────────────────────────────

function CampaignRow({ campaign, referralCode, selected, onSelect }) {
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)

  const url = campaign.referral_url

  const copyLink = async () => {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* portapapeles bloqueado en contexto inseguro */
    }
  }

  const shareLink = () => {
    if (!url) return
    if (navigator.share) {
      navigator.share({
        title: campaign.form_title,
        text: '¡Ayuda a tu comunidad completando esta campaña!',
        url,
      })
    } else {
      copyLink()
    }
  }

  return (
    <>
      <div
        className={`rounded-2xl border transition-all ${
          selected ? 'border-[#0D448A] bg-blue-50/40 shadow-sm' : 'border-gray-200 bg-white'
        }`}
      >
        <button
          type="button"
          onClick={() => onSelect(selected ? null : campaign.form_id)}
          className="w-full text-left px-5 py-4 flex items-center gap-4"
          aria-expanded={selected}
        >
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{campaign.form_title}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {campaign.referrals_in_campaign} referido{campaign.referrals_in_campaign === 1 ? '' : 's'}
              {campaign.position ? ` · puesto #${campaign.position}` : ''}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xl font-bold text-[#0D448A]">{campaign.points_in_campaign}</p>
            <p className="text-[10px] text-gray-400">puntos aquí</p>
          </div>
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={`w-5 h-5 text-gray-300 shrink-0 transition-transform ${selected ? 'rotate-180' : ''}`}
          >
            <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
          </svg>
        </button>

        {selected && (
          <div className="px-5 pb-5 border-t border-gray-100 pt-4">
            {/* RN-04 / D-2 — sin slug publicado no hay link posible */}
            {!url ? (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                Esta campaña no tiene un identificador público publicado, así que todavía
                no se puede generar su link de invitación.
              </div>
            ) : (
              <>
                <label className="text-xs text-gray-400 mb-1 block">Link de invitación</label>
                <div
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 font-mono cursor-pointer hover:border-[#1361C5] transition-colors break-all"
                  onClick={copyLink}
                  title="Clic para copiar"
                >
                  {url}
                </div>

                <div className="flex gap-2 flex-wrap mt-4">
                  <button
                    onClick={copyLink}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors text-gray-700"
                  >
                    {copied ? (
                      <>
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-green-500">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                        </svg>
                        ¡Copiado!
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                        </svg>
                        Copiar link
                      </>
                    )}
                  </button>

                  <button
                    onClick={shareLink}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#1361C5] hover:brightness-110 transition-all"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
                    </svg>
                    Compartir
                  </button>

                  <button
                    onClick={() => setShowQR(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors text-gray-700"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM13 13h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h2v2h-2v-2zm-4 4h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h2v2h-2v-2zm0 4h2v2h-2v-2zm-4-2h2v4h-2v-4z" />
                    </svg>
                    Ver QR
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showQR && url && (
          <QRModal
            campaign={campaign}
            referralCode={referralCode}
            onClose={() => setShowQR(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

// ── Página ─────────────────────────────────────────────────────────────────

export default function ReferralProfilePage() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  const user = useMemo(() => authService.getUser(), [])

  // El estado inicial ya es "cargando"; el reintento lo activa desde su handler.
  // Así el efecto no llama setState de forma síncrona (react-hooks/set-state-in-effect).
  useEffect(() => {
    let cancelled = false
    referralService.getMyCampaigns(user?.id)
      .then(res => {
        if (cancelled) return
        setResult(res)
        // Abre la primera campaña para que el link quede a un clic
        setSelectedId(prev => prev ?? res.data?.[0]?.form_id ?? null)
      })
      .catch(err => {
        if (!cancelled) setError(err.message ?? 'No se pudo cargar tu perfil de referido')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [user?.id, reloadKey])

  const retry = useCallback(() => {
    setError(null)
    setLoading(true)
    setReloadKey(k => k + 1)
  }, [])

  const campaigns = result?.data ?? []
  const totalPoints = result?.total_accumulated_points

  return (
    <motion.div
      className="max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mis referidos</h1>
        <p className="text-sm text-gray-400 mt-1">
          Cada campaña tiene su propio link y su propio puntaje. Comparte el de la
          campaña en la que quieras sumar.
        </p>
      </div>

      {loading && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-40" />
            <div className="h-4 bg-gray-100 rounded w-56 mt-3" />
          </div>
          {[0, 1].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-2/3" />
              <div className="h-3 bg-gray-100 rounded w-1/3 mt-2" />
            </div>
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
          <p className="text-red-700 font-medium">{error}</p>
          <button onClick={retry} className="mt-3 text-sm text-[#1361C5] hover:underline">
            Reintentar
          </button>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-4">
          {/* Cabecera: código + total agregado (RN-05) */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Tu código</span>
              <span className="font-mono font-bold text-[#0D448A] bg-blue-50 px-3 py-1 rounded-lg text-sm tracking-widest">
                {result.referral_code}
              </span>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#0D448A]">{totalPoints}</p>
              <p className="text-[11px] text-gray-400">
                puntos · suma de todas las campañas
              </p>
            </div>
          </div>

          {/* CU-04 ext. 2a — ninguna campaña con sorteo activo */}
          {!campaigns.length ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
              <p className="font-medium text-gray-700">No hay campañas abiertas</p>
              <p className="mt-1 text-sm text-gray-400">
                Cuando se active una campaña con sorteo, aquí aparecerá tu link para invitar.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {campaigns.map(c => (
                <CampaignRow
                  key={c.form_id}
                  campaign={c}
                  referralCode={result.referral_code}
                  selected={selectedId === c.form_id}
                  onSelect={setSelectedId}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
