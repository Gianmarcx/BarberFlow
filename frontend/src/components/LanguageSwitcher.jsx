import { useTranslation } from 'react-i18next'
import { useState, useRef, useEffect } from 'react'


const FlagIT = () => (
  <svg viewBox="0 0 30 20" className="w-5 h-5 rounded-sm shadow-sm flex-shrink-0">
    <rect width="10" height="20" fill="#009246"/>
    <rect x="10" width="10" height="20" fill="#fff"/>
    <rect x="20" width="10" height="20" fill="#ce2b37"/>
  </svg>
)

const FlagGB = () => (
  <svg viewBox="0 0 60 30" className="w-5 h-5 rounded-sm shadow-sm flex-shrink-0">
    <rect width="60" height="30" fill="#012169"/>
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4"/>
    <path d="M30,0 L30,30 M0,15 L60,15" stroke="#fff" strokeWidth="10"/>
    <path d="M30,0 L30,30 M0,15 L60,15" stroke="#C8102E" strokeWidth="6"/>
  </svg>
)

const FlagES = () => (
  <svg viewBox="0 0 30 20" className="w-5 h-5 rounded-sm shadow-sm flex-shrink-0">
    <rect width="30" height="20" fill="#AA151B"/>
    <rect y="5" width="30" height="10" fill="#F1BF00"/>
  </svg>
)

const FlagFR = () => (
  <svg viewBox="0 0 30 20" className="w-5 h-5 rounded-sm shadow-sm flex-shrink-0">
    <rect width="10" height="20" fill="#0055A4"/>
    <rect x="10" width="10" height="20" fill="#fff"/>
    <rect x="20" width="10" height="20" fill="#EF4135"/>
  </svg>
)

const FlagDE = () => (
  <svg viewBox="0 0 30 20" className="w-5 h-5 rounded-sm shadow-sm flex-shrink-0">
    <rect width="30" height="7" fill="#000"/>
    <rect y="7" width="30" height="7" fill="#DD0000"/>
    <rect y="14" width="30" height="6" fill="#FFCE00"/>
  </svg>
)

const flags = {
  it: <FlagIT />,
  en: <FlagGB />,
  es: <FlagES />,
  fr: <FlagFR />,
  de: <FlagDE />
}

const languages = [
  { code: 'it', name: 'Italiano', flag: flags.it },
  { code: 'en', name: 'English', flag: flags.en },
  { code: 'es', name: 'Español', flag: flags.es },
  { code: 'fr', name: 'Français', flag: flags.fr },
  { code: 'de', name: 'Deutsch', flag: flags.de }
]

export default function LanguageSwitcher({ variant = 'default' }) {
  const { i18n, t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const currentLang = languages.find(l => l.code === i18n.language.split('-')[0]) || languages[0]

  // Chiudi il dropdown se si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside, { passive: true })
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [])

  const handleLanguageChange = (code) => {
    i18n.changeLanguage(code)
    localStorage.setItem('trimflow-language', code)
    setIsOpen(false)
  }

  // Stili ottimizzati
  const buttonClasses = variant === 'mobile'
    ? 'relative p-2 rounded-lg hover:bg-white/10 active:bg-white/20 transition text-white/80 hover:text-white'
    : 'flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium text-white/90 hover:text-white transition border border-white/20'

  const dropdownClasses = variant === 'mobile'
    ? 'absolute top-full right-0 mt-2 w-48 bg-[#0a2a43] rounded-xl shadow-2xl border border-white/20 overflow-hidden z-[100] origin-top-right'
    : 'absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50'

  const itemClasses = variant === 'mobile'
    ? 'flex items-center gap-3 px-4 py-3 hover:bg-white/15 active:bg-white/25 transition-all duration-200 text-white/80 hover:text-white text-sm w-full border-b border-white/10 last:border-b-0'
    : 'flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-200 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm w-full border-b border-gray-100 dark:border-gray-700 last:border-b-0'

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Pulsante principale */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClasses}
        aria-label={t('common.switchLanguage')}
        aria-expanded={isOpen}
        type="button"
      >
        
        <span className="leading-none">{currentLang.flag}</span>
        
        {/* Mostra il nome solo su Desktop */}
        {variant !== 'mobile' && <span className="hidden sm:inline ml-1">{currentLang.name}</span>}
        
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown lingue */}
      {isOpen && (
        <div className={dropdownClasses}>
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`${itemClasses} ${
                lang.code === currentLang.code 
                  ? (variant === 'mobile' ? 'bg-white/20 text-white font-medium' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium') 
                  : ''
              }`}
              type="button"
            >
              
              <span className="leading-none">{lang.flag}</span>
              
              
              <span className="flex-1">{lang.name}</span>
              
              
              {lang.code === currentLang.code && (
                <svg className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}