import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from './en.json'
import it from './it.json'
import es from './es.json'
import fr from './fr.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      it: { translation: it },
      es: { translation: es },
      fr: { translation: fr }
    },
    fallbackLng: 'en',
    // ✅ RIMOSSO: lng: 'en' (che bloccava il rilevamento automatico)
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'] // 
    },
    interpolation: {
      escapeValue: false
    }
  })

export default i18n

if (import.meta.env.DEV){
  window.i18n = i18n
}