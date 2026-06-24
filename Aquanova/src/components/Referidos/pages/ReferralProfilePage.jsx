// @ts-nocheck
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { referralService } from '../../../services/referralService'

// ── QR Modal ───────────────────────────────────────────────────────────────

function QRModal({ onClose }) {
  const [qrData, setQrData]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    referralService.getReferralQR()
      .then(res => {
        if (res.ok) setQrData(res.data)
        else setError(res.message ?? 'No se pudo cargar el QR')
      })
      .catch(() => setError('Error de conexión'))
      .finally(() => setLoading(false))
  }, [])

  // Close on Escape
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [onClose])

  const handleDownload = async () => {
    if (!qrData) return
    setDownloading(true)
    try { await referralService.downloadQRPng(qrData.referral_code) }
    catch { /* silencio — el navegador ya muestra el error */ }
    finally { setDownloading(false) }
  }

  const handleShare = () => {
    if (!qrData) return
    if (navigator.share) {
      navigator.share({
        title: 'Únete al censo — Aquanova',
        text: '¡Escanea este QR o abre el link para completar el censo!',
        url: qrData.referral_url,
      })
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
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>

        <h2 className="text-lg font-bold text-gray-900 mb-4">Tu QR de referido</h2>

        {loading && (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#1361C5]" />
            <p className="text-sm text-gray-400">Generando QR…</p>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-center text-sm text-red-700">
            {error === 'FRONTEND_URL no está configurada en el servidor.'
              ? 'El QR no está disponible. Contacta al administrador.'
              : error}
          </div>
        )}

        {qrData && (
          <div className="flex flex-col items-center gap-4">
            {/* QR image */}
            <div className="p-3 border border-gray-200 rounded-2xl bg-white">
              <img
                src={qrData.qr_data_url}
                alt={`QR de referido ${qrData.referral_code}`}
                width={220}
                height={220}
                className="block"
              />
            </div>

            <div className="text-center">
              <span className="font-mono text-sm font-bold text-[#0D448A] bg-blue-50 px-3 py-1 rounded-lg">
                {qrData.referral_code}
              </span>
              <p className="text-xs text-gray-400 mt-2 break-all">{qrData.referral_url}</p>
            </div>

            <p className="text-xs text-gray-400 text-center">
              Escanea con la cámara del celular para abrir el formulario directamente.
            </p>

            <div className="flex gap-2 w-full">
              {navigator.share && (
                <button
                  onClick={handleShare}
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

// ── Profile Card ───────────────────────────────────────────────────────────

function ReferralProfileCard({ profile }) {
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(profile.referral_url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard blocked in insecure context */
    }
  }

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Únete al censo de Aquanova',
        text: '¡Ayuda a tu comunidad completando el censo! Usa mi link:',
        url: profile.referral_url,
      })
    } else {
      copyLink()
    }
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-semibold text-gray-900">Tu link de referido</h2>
            <p className="text-xs text-gray-400 mt-0.5">Comparte e invita a tu comunidad al censo</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[#0D448A]">{profile.total_accumulated_points}</p>
            <p className="text-xs text-gray-400">puntos acumulados</p>
          </div>
        </div>

        <div className="p-6 flex flex-col gap-5">
          {/* Código */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 shrink-0">Tu código</span>
            <span className="font-mono font-bold text-[#0D448A] bg-blue-50 px-3 py-1 rounded-lg text-sm tracking-widest">
              {profile.referral_code}
            </span>
          </div>

          {/* URL */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Link de invitación</label>
            <div
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 font-mono cursor-pointer hover:border-[#1361C5] transition-colors break-all"
              onClick={copyLink}
              title="Clic para copiar"
            >
              {profile.referral_url}
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={copyLink}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors text-gray-700"
            >
              {copied ? (
                <>
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-green-500">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                  </svg>
                  ¡Copiado!
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
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
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
              </svg>
              Compartir
            </button>

            <button
              onClick={() => setShowQR(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors text-gray-700"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM13 13h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h2v2h-2v-2zm-4 4h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h2v2h-2v-2zm0 4h2v2h-2v-2zm-4-2h2v4h-2v-4z"/>
              </svg>
              Ver QR
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showQR && <QRModal onClose={() => setShowQR(false)} />}
      </AnimatePresence>
    </>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function ReferralProfilePage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    referralService.getReferralProfile()
      .then(res => {
        if (res.ok) setProfile(res.data)
        else setError(res.message ?? 'No se pudo cargar el perfil')
      })
      .catch(() => setError('Error de conexión'))
      .finally(() => setLoading(false))
  }, [])

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
          Comparte tu link o QR e invita a otros a completar el censo.
          Acumulas puntos cada vez que alguien se registra con tu código.
        </p>
      </div>

      {loading && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 flex flex-col items-center gap-3 animate-pulse">
          <div className="h-6 bg-gray-200 rounded-xl w-48" />
          <div className="h-4 bg-gray-100 rounded-xl w-64 mt-2" />
          <div className="h-10 bg-gray-100 rounded-xl w-full mt-4" />
          <div className="flex gap-2 w-full mt-2">
            {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 rounded-xl flex-1" />)}
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
          <p className="text-red-700 font-medium">{error}</p>
          <button
            onClick={() => { setError(null); setLoading(true); referralService.getReferralProfile().then(r => r.ok ? setProfile(r.data) : setError(r.message ?? 'Error')).catch(() => setError('Error de conexión')).finally(() => setLoading(false)) }}
            className="mt-3 text-sm text-[#1361C5] hover:underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {profile && !loading && <ReferralProfileCard profile={profile} />}
    </motion.div>
  )
}
