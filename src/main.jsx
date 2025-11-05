import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { StoreProvider } from './utils/jsonStore.jsx'
import { StatusProvider } from './utils/status.jsx'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <StatusProvider>
          <App />
        </StatusProvider>
      </StoreProvider>
    </BrowserRouter>
  </StrictMode>,
)
