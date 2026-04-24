import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './mahjong_danran_mvp_prototype.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
