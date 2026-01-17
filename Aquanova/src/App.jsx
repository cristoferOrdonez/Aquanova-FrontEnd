import { useState } from 'react'
import FormList from './components/FormList/Index'
import Navbar from './components/ui/Navbar'
import FormCreation from './components/FormCreation/Index'
import Login from './components/Login/Index'
import NeighborhoodList from './components/NeighborhoodList/NeighborhoodList'
import NeighborhoodCreation from './components/GeoLevelCreation/Index'
import Home from './components/Home/Index'
import { Routes, Route, useLocation } from 'react-router-dom'

function App() {
  const [count, setCount] = useState(0)
  const location = useLocation()
  const hideNavbar = 
    location.pathname === '/form_creation' || location.pathname === '/login' || location.pathname === '/neighborhood_creation'

  return (
    <div className='App'>
      {!hideNavbar && <Navbar />}
        <Routes>
          <Route path='/forms' element={<FormList />} />
          <Route path='/form_creation' element={<FormCreation />} />
          <Route path='/login' element={<Login />} />
          <Route path='/neighborhoods' element={<NeighborhoodList />} />
          <Route path='/neighborhood_creation' element={<NeighborhoodCreation />} />
          <Route path='/home' element={<Home />} />
        </Routes>
    </div>
  )
}

export default App
