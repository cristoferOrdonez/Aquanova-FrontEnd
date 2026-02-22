import { useState } from 'react'
import FormList from './components/FormList/Index'
import Navbar from './components/ui/Navbar'
import FormCreation from './components/FormCreation/Index'
import Login from './components/Login/Index'
import GeoLevelList from './components/GeoLevelList/Index'
import NeighborhoodCreation from './components/GeoLevelCreation/Index'
import FormPreview from './components/FormPreview/Index'
import FormSubmission from './components/FormSubmission/Index'
import Home from './components/Home/Index'
import { Routes, Route, useLocation } from 'react-router-dom'

function App() {
  const [count, setCount] = useState(0)
  const location = useLocation()
  const hideNavbar = 
    location.pathname === '/form_creation' || location.pathname.startsWith('/form_creation/') || location.pathname === '/login' || location.pathname.startsWith('/geolevel_creation')

  return (
    <div className='App'>
      {!hideNavbar && <Navbar />}
        <Routes>
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
        </Routes>
    </div>
  )
}

export default App
