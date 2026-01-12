import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import FormCreation from './components/FormCreation.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App/>
  </StrictMode>,
)
