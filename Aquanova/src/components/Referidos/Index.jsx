import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useParams } from 'react-router-dom'

const ReferralDashboard    = lazy(() => import('./pages/ReferralDashboard'))
const CampaignReferralPage = lazy(() => import('./pages/FormReferralDetail'))
const UserReferralDetail   = lazy(() => import('./pages/UserReferralDetail'))
const ReferralProfilePage  = lazy(() => import('./pages/ReferralProfilePage'))

const Fallback = () => (
  <div className="w-full h-48 flex items-center justify-center text-gray-400 text-sm">
    Cargando…
  </div>
)

/**
 * DA-4 — `formulario/:formId` se renombró a `campana/:formId` para que la URL
 * use el mismo vocabulario que la UI. Se conserva la ruta anterior redirigiendo,
 * porque puede estar compartida o en marcadores.
 */
function LegacyCampaignRedirect() {
  const { formId } = useParams()
  return <Navigate to={`/referidos/campana/${formId}`} replace />
}

function LegacyCampaignUserRedirect() {
  const { formId, userId } = useParams()
  return <Navigate to={`/referidos/campana/${formId}/usuario/${userId}`} replace />
}

export default function Referidos() {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        <Route index element={<ReferralDashboard />} />
        <Route path="perfil" element={<ReferralProfilePage />} />

        {/* Alcance de campaña — CU-02, CU-08 */}
        <Route path="campana/:formId" element={<CampaignReferralPage />} />
        <Route path="campana/:formId/usuario/:userId" element={<UserReferralDetail />} />

        {/* Vista transversal del referente — CO-12 */}
        <Route path="usuario/:userId" element={<UserReferralDetail />} />

        {/* Rutas anteriores */}
        <Route path="formulario/:formId" element={<LegacyCampaignRedirect />} />
        <Route path="formulario/:formId/usuario/:userId" element={<LegacyCampaignUserRedirect />} />

        <Route path="*" element={<Navigate to="/referidos" replace />} />
      </Routes>
    </Suspense>
  )
}
