import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { consumeTokenFromUrl } from './auth.js'
import { LanguageProvider } from './i18n/index.jsx'
import { applyStoredTheme, ThemeProvider } from './theme.jsx'
import './index.css'

// Render boshlanishidan oldin: Google tokenini saqlaymiz va mavzuni qo'llaymiz
// (aks holda tungi rejimda sahifa bir lahza oq bo'lib "chaqnaydi").
consumeTokenFromUrl()
applyStoredTheme()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
