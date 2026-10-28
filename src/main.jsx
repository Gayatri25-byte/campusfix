import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App.jsx'
import { StoreProvider } from './app/StoreProvider.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StoreProvider>
    <App />
  </StoreProvider>,
)
