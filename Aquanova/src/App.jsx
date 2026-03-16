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
import Error404 from './components/Error404/Index'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'

function App() {
  const location = useLocation()
  
  // Determinamos explícitamente en qué rutas principales SI se debe mostrar el Navbar.
  // Cualquier ruta que no esté aquí (incluidas las que no existen) ocultará el Navbar.
  const showNavbar = ['/home', '/forms', '/neighborhoods'].includes(location.pathname);

  const noMargin =
    !showNavbar || // Generalmente, las vistas sin navbar tienen su propio control de márgenes.
    location.pathname === '/home';

  const isHome = location.pathname === '/home'
  const isFormCreation =
    location.pathname === '/form_creation' ||
    location.pathname.startsWith('/form_creation/')

  return (
    <div className='App flex flex-col h-screen overflow-hidden'>
      {showNavbar && <Navbar />}
      <div className={
        isHome          ? 'flex-1 overflow-hidden' :
        isFormCreation  ? 'flex-1 overflow-y-auto bg-[var(--form-creation-bg)]' :
        !noMargin       ? 'flex-1 overflow-y-auto py-8 sm:px-4 md:px-10 lg:px-24 xl:px-40 2xl:px-60' :
                          'flex-1 overflow-y-auto'
      }>
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
          <Route path='*' element={<Error404 />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
