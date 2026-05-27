import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useIsMobile } from '../hooks/useIsMobile'
import LanguageSwitcher from '../components/LanguageSwitcher'

export default function Layout() {
  const { t } = useTranslation()
  const { logout } = useAuth()
  const { darkMode, toggleTheme } = useTheme()
  const isMobile = useIsMobile()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    {
      path: '/',
      label: t('nav.dashboard'),
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
        </svg>
      )
    },
    {
      path: '/bookings',
      label: t('nav.bookings'),
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      path: '/customers',
      label: t('nav.customers'),
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      )
    },
    {
      path: '/services',
      label: t('nav.services'),
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      path: '/barbers',
      label: t('nav.barbers'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"
          />
        </svg>
      )
    },
    {
      path: '/schedule',
      label: t('nav.schedule'),
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      )
    },
  ]

  // ─── MOBILE LAYOUT ───────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 transition-colors duration-200">

        {/* Header mobile */}
        <header
          className="flex items-center justify-between px-4 py-3 text-white shadow-lg"
          style={{ background: 'linear-gradient(135deg, #0a2a43 0%, #133c5a 50%, #b92b27 100%)' }}
        >
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="TrimFlow" className="h-8 w-auto object-contain" />
            <span className="text-lg font-extrabold tracking-tight">TrimFlow</span>
          </div>

          {/* ✅ Azioni header: Language + Theme + Logout allineati */}
          <div className="flex items-center gap-1">
            {/* Language Switcher Mobile */}
            <LanguageSwitcher variant="mobile" />
            
            {/* Toggle dark mode */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-white/80 hover:bg-white/10 transition"
              aria-label={darkMode ? t('theme.switchToLight') : t('theme.switchToDark')}
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-white/80 hover:bg-red-500 transition"
              aria-label={t('nav.logout')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </header>

        {/* Contenuto principale */}
        <main className="flex-1 overflow-auto p-4 pb-24 bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
          <Outlet />
        </main>

        {/* Bottom navigation */}
        <nav
          className="fixed bottom-0 left-0 right-0 flex items-center justify-around py-2 text-white shadow-2xl z-40"
          style={{ background: 'linear-gradient(135deg, #0a2a43 0%, #133c5a 50%, #b92b27 100%)' }}
        >
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'text-white/60 hover:text-white'
                }`
              }
            >
              {item.icon}
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </NavLink>
          ))}
        </nav>

      </div>
    )
  }

  // ─── DESKTOP LAYOUT ──────────────────────────────────────────
  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900 transition-colors duration-200">

      {/* ✅ Sidebar: sticky + h-screen per renderla fissa */}
      <aside className="w-64 text-white flex flex-col bg-gradient-to-br from-[#0a2a43] via-[#133c5a] to-[#b92b27] shadow-2xl sticky top-0 h-screen transition-colors duration-200">

        {/* Logo */}
        <div className="p-6 border-b border-white/10 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-3 select-none">
            <img
              src="/logo.png"
              alt="TrimFlow logo"
              className="h-15 w-10 object-contain drop-shadow-md transition-transform duration-300 hover:scale-105"
            />
            <div className="flex flex-col leading-none">
              <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-md">
                TrimFlow
              </h1>
              <span className="text-[11px] uppercase tracking-[0.25em] text-white/60 mt-1">
                Management
              </span>
            </div>
          </div>
        </div>

        {/* ✅ Language Switcher */}
        <div className="px-5 py-5 border-b border-white/10">
          <LanguageSwitcher variant="default" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white/20 text-white shadow-lg backdrop-blur-md'
                    : 'text-white/80 hover:bg-white/10 hover:text-white hover:translate-x-1'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Toggle Dark Mode */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200"
            title={darkMode ? t('theme.switchToLight') : t('theme.switchToDark')}
          >
            {darkMode ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
            {darkMode ? t('theme.lightMode') : t('theme.darkMode')}
          </button>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/80 hover:bg-red-500 hover:text-white transition-all duration-200 hover:translate-x-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            {t('nav.logout')}
          </button>
        </div>

      </aside>

      {/* ✅ Main content: overflow-auto per scroll indipendente */}
      <main className="flex-1 p-8 overflow-auto bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
        <Outlet />
      </main>

    </div>
  )
}