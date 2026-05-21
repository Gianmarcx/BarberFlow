import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast' // ✅ Aggiungi questo import
import './index.css'
import './i18n/locales'
import { ThemeProvider } from './context/ThemeContext'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#ffffff',
            color: '#1f2937',
            border: '1px solid #e5e7eb',
            borderRadius: '0.75rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          },
          
          className: 'dark:bg-gray-800 dark:text-white dark:border-gray-700',
          success: { duration: 3000, theme: { primary: '#10b981', secondary: '#fff' } },
          error: { duration: 4000, theme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </ThemeProvider>
  </StrictMode>,
)