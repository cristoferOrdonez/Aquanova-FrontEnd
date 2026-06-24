import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'

const ReferralDashboard    = lazy(() => import('./pages/ReferralDashboard'))
const FormReferralDetail   = lazy(() => import('./pages/FormReferralDetail'))
const UserReferralDetail   = lazy(() => import('./pages/UserReferralDetail'))
const ReferralProfilePage  = lazy(() => import('./pages/ReferralProfilePage'))

const Fallback = () => (
  <div className="w-full h-48 flex items-center justify-center text-gray-400 text-sm">
    Cargando…
  </div>
)

export default function Referidos() {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        <Route index                          element={<ReferralDashboard />} />
        <Route path="perfil"                  element={<ReferralProfilePage />} />
        <Route path="formulario/:formId"      element={<FormReferralDetail />} />
        <Route path="usuario/:userId"         element={<UserReferralDetail />} />
      </Routes>
    </Suspense>
  )
}
