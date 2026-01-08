import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import FormCreation from './components/FormCreation.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FormCreation />
  </StrictMode>,
)
