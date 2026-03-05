import FormList from './components/FormList/Index'
import Navbar from './components/ui/Navbar'
import FormCreation from './components/FormCreation/Index'
import Login from './components/Login/Index'
import GeoLevelList from './components/GeoLevelList/Index'
import NeighborhoodCreation from './components/GeoLevelCreation/Index'
import FormPreview from './components/FormPreview/Index'
import FormSubmission from './components/FormSubmission/Index'
import Home from './components/Home/Index'
import PublicForm from './components/PublicForm/Index'
import PrivateRoute from './components/ui/PrivateRoute'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'

function App() {
  const location = useLocation()
  const hideNavbar =
    location.pathname === '/form_creation' || location.pathname.startsWith('/form_creation/') || location.pathname === '/login' || location.pathname.startsWith('/geolevel_creation') || location.pathname.startsWith('/formulario/')

  const noMargin =
    location.pathname === '/login' ||
    location.pathname === '/form_creation' ||
    location.pathname.startsWith('/form_creation/') ||
    location.pathname.startsWith('/geolevel_creation') ||
    location.pathname === '/home' ||
    location.pathname.startsWith('/formulario/')

  const isHome = location.pathname === '/home'

  return (
    <div className='App flex flex-col min-h-screen'>
      {!hideNavbar && <Navbar />}
      <div className={isHome ? 'flex-1 overflow-hidden' : !noMargin ? 'flex-1 overflow-y-auto py-8 sm:px-4 md:px-10 lg:px-24 xl:px-40 2xl:px-60' : 'flex-1 overflow-y-auto'}>
        <Routes>
          <Route path='/' element={<Navigate to='/login' replace />} />
          <Route path='/login' element={<Login />} />
          <Route path='/formulario/:formKey' element={<PublicForm />} />

          <Route path='/home' element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path='/forms' element={<PrivateRoute><FormList /></PrivateRoute>} />
          <Route path='/form_creation' element={<PrivateRoute><FormCreation /></PrivateRoute>} />
          <Route path='/form_creation/:id' element={<PrivateRoute><FormCreation /></PrivateRoute>} />
          <Route path='/form/preview/:id' element={<PrivateRoute><FormPreview /></PrivateRoute>} />
          <Route path='/form/submit/:id' element={<PrivateRoute><FormSubmission /></PrivateRoute>} />
          <Route path='/neighborhoods' element={<PrivateRoute><GeoLevelList /></PrivateRoute>} />
          <Route path='/geolevel_creation' element={<PrivateRoute><NeighborhoodCreation /></PrivateRoute>} />
          <Route path='/geolevel_creation/:id' element={<PrivateRoute><NeighborhoodCreation /></PrivateRoute>} />
        </Routes>
      </div>
    </div>
  )
}

export default App
