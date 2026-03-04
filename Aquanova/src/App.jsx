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
          <Route path='/forms' element={<FormList />} />
          <Route path='/form_creation' element={<FormCreation />} />
          <Route path='/form/preview/:id' element={<FormPreview />} />
          <Route path='/form/submit/:id' element={<FormSubmission />} />
          <Route path='/form_creation/:id' element={<FormCreation />} />
          <Route path='/login' element={<Login />} />
          <Route path='/neighborhoods' element={<GeoLevelList />} />
          <Route path='/geolevel_creation' element={<NeighborhoodCreation />} />
          <Route path='/geolevel_creation/:id' element={<NeighborhoodCreation />} />
          <Route path='/home' element={<Home />} />
          <Route path='/formulario/:formKey' element={<PublicForm />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
