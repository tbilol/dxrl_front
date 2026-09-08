import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { consumeTokenFromUrl } from './auth.js'
import { LanguageProvider } from './i18n/index.jsx'
import log from './logger.js'
import { applyStoredTheme, ThemeProvider } from './theme.jsx'
import './index.css'

log.front(
  'AGROGRAM ishga tushmoqda',
  { debug: log.isDebug() },
)
if (!log.isDebug()) {
  // Debug o'chiq — bu yagona ko'rinadigan xabar, qolganlari jim.
  console.info(
    "%c🌾 AGROGRAM — batafsil loglarni yoqish: localStorage.setItem('AGROGRAM_DEBUG','true') "
      + 'yoki Sozlamalar -> Dasturchi rejimi',
    'color: #A98B76; font-weight: bold;',
  )
}

// Render boshlanishidan oldin: Google tokenini saqlaymiz va mavzuni qo'llaymiz
// (aks holda tungi rejimda sahifa bir lahza oq bo'lib "chaqnaydi").
consumeTokenFromUrl()
applyStoredTheme()
log.front('Boshlang\'ich sozlamalar qo\'llandi (token + mavzu)')

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
