import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import FormList from './components/FormList'
import Navbar from './components/Navbar'
import FormCreation from './components/FormCreation'
import NeighborhoodList from './components/NeighborhoodList'
import { Routes, Route, useLocation } from 'react-router-dom'

function App() {
  const [count, setCount] = useState(0)
  const location = useLocation()
  const hideNavbar = location.pathname === '/form_creation'

  return (
    <div className='App'>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path='/' element={<FormList />} />
        <Route path='/form_creation' element={<FormCreation />} />
        <Route path='/neighborhoods' element={<NeighborhoodList />} />
      </Routes>
    </div>
  )
}

export default App
