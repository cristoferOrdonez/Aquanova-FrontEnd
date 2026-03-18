import { lazy, Suspense } from 'react'
import Navbar from './components/ui/Navbar'
const FormList = lazy(() => import('./components/FormList/Index'))
const FormCreation = lazy(() => import('./components/FormCreation/Index'))
const Login = lazy(() => import('./components/Login/Index'))
const GeoLevelList = lazy(() => import('./components/GeoLevelList/Index'))
const NeighborhoodCreation = lazy(() => import('./components/GeoLevelCreation/Index'))
const FormPreview = lazy(() => import('./components/FormPreview/Index'))
const FormSubmission = lazy(() => import('./components/FormSubmission/Index'))
const Home = lazy(() => import('./components/Home/Index'))
const PublicForm = lazy(() => import('./components/PublicForm/Index'))
const UserProfile = lazy(() => import('./components/UserProfile/Index'))
const UserManagement = lazy(() => import('./components/UserManagement/Index'))
import PrivateRoute from './components/ui/PrivateRoute'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'

function App() {
  const location = useLocation()
  const hideNavbar =
    location.pathname === '/form_creation' || location.pathname.startsWith('/form_creation/') || location.pathname === '/login' || location.pathname.startsWith('/geolevel_creation') || location.pathname.startsWith('/formulario/') || location.pathname.startsWith('/form/preview/') || location.pathname.startsWith('/form/')

  const noMargin =
    location.pathname === '/login' ||
    location.pathname === '/form_creation' ||
    location.pathname.startsWith('/form_creation/') ||
    location.pathname.startsWith('/geolevel_creation') ||
    location.pathname === '/home' ||
    location.pathname.startsWith('/formulario/')

  const isHome = location.pathname === '/home'
  const isFormCreation =
    location.pathname === '/form_creation' ||
    location.pathname.startsWith('/form_creation/')

  return (
    <div className='App flex flex-col h-screen overflow-hidden'>
      {!hideNavbar && <Navbar />}
      <div className={
        isHome          ? 'flex-1 overflow-hidden' :
        isFormCreation  ? 'flex-1 overflow-y-auto' :
        !noMargin       ? 'flex-1 overflow-y-auto py-8 sm:px-4 md:px-10 lg:px-24 xl:px-40 2xl:px-60' :
                          'flex-1 overflow-y-auto'
      }>
        <Suspense fallback={<div className="w-full h-full flex items-center justify-center">Cargando…</div>}>
          <Routes>
            <Route path='/' element={<Navigate to='/login' replace />} />
            <Route path='/login' element={<Login />} />
            <Route path='/formulario/:formKey' element={<PublicForm />} />

            <Route path='/home' element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path='/my-account' element={<PrivateRoute><UserProfile /></PrivateRoute>} />
            <Route path='/user-management' element={<PrivateRoute><UserManagement /></PrivateRoute>} />
            <Route path='/forms' element={<PrivateRoute><FormList /></PrivateRoute>} />
            <Route path='/form_creation' element={<PrivateRoute><FormCreation /></PrivateRoute>} />
            <Route path='/form_creation/:id' element={<PrivateRoute><FormCreation /></PrivateRoute>} />
            <Route path='/form/preview/:id' element={<PrivateRoute><FormPreview /></PrivateRoute>} />
            <Route path='/form/submit/:id' element={<PrivateRoute><FormSubmission /></PrivateRoute>} />
            <Route path='/neighborhoods' element={<PrivateRoute><GeoLevelList /></PrivateRoute>} />
            <Route path='/geolevel_creation' element={<PrivateRoute><NeighborhoodCreation /></PrivateRoute>} />
            <Route path='/geolevel_creation/:id' element={<PrivateRoute><NeighborhoodCreation /></PrivateRoute>} />
          </Routes>
        </Suspense>
      </div>
    </div>
  )
}

export default App
