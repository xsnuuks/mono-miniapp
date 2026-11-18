import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div style={{
      minHeight: '100dvh',
      background: '#100D14',
    }}>
      <App />
    </div>
  </StrictMode>,
)
