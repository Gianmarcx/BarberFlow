import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function WhatsAppSettings() {
  const { t } = useTranslation()
  const [config, setConfig] = useState({
    enabled: false,
    configured: false,
    phoneNumberId: ''
  })
  const [form, setForm] = useState({
    phoneNumberId: '',
    accessToken: '',
    enabled: false
  })
  const [testPhone, setTestPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [showToken, setShowToken] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const res = await api.get('/api/whatsapp/config')
      setConfig(res.data)
      setForm(prev => ({ ...prev, enabled: res.data.enabled }))
    } catch (err) {
      console.error('Failed to load WhatsApp config:', err)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await api.post('/api/whatsapp/config', {
        phoneNumberId: form.phoneNumberId.trim(),
        accessToken: form.accessToken.trim(),
        enabled: form.enabled
      })
      toast.success(t('settings.whatsapp.saved'))
      loadConfig()
      setForm(prev => ({ ...prev, accessToken: '' })) // Clear token after save
    } catch (err) {
      toast.error(err.response?.data?.message || t('errors.serverError'))
    } finally {
      setLoading(false)
    }
  }

  const handleTest = async () => {
    if (!testPhone) {
      toast.error(t('settings.whatsapp.testPhoneRequired'))
      return
    }
    try {
      const res = await api.post('/api/whatsapp/test', { phone: testPhone })
      toast.success(res.data.message)
    } catch (err) {
      toast.error(err.response?.data?.error || t('settings.whatsapp.testFailed'))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          📱 {t('settings.whatsapp.title')}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t('settings.whatsapp.subtitle')}
        </p>
      </div>

      {/* Toggle abilitazione */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => setForm(prev => ({ ...prev, enabled: e.target.checked }))}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {t('settings.whatsapp.enable')}
          </span>
        </label>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 ml-8">
          {t('settings.whatsapp.enableHelp')}
        </p>
      </div>

      {/* Configurazione (mostra solo se enabled) */}
      {form.enabled && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow space-y-4">
          
          {/* Phone Number ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              {t('settings.whatsapp.phoneNumberId')} *
            </label>
            <input
              type="text"
              value={form.phoneNumberId}
              onChange={(e) => setForm(prev => ({ ...prev, phoneNumberId: e.target.value }))}
              placeholder="1234567890"
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {t('settings.whatsapp.phoneNumberIdHelp')}
            </p>
          </div>

          {/* Access Token */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              {t('settings.whatsapp.accessToken')} *
            </label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={form.accessToken}
                onChange={(e) => setForm(prev => ({ ...prev, accessToken: e.target.value }))}
                placeholder="EAAB..."
                className="w-full px-4 py-3 pr-20 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-600 hover:text-blue-800"
              >
                {showToken ? '🙈' : '👁️'}
              </button>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {t('settings.whatsapp.accessTokenHelp')}
            </p>
          </div>

          {/* Pulsante salva */}
          <button
            onClick={handleSave}
            disabled={loading || !form.phoneNumberId || !form.accessToken}
            className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? t('common.loading') : t('common.save')}
          </button>

          {/* Stato configurazione */}
          {config.configured && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm text-green-700 dark:text-green-400">
              ✅ {t('settings.whatsapp.configured')} {config.phoneNumberId && `(...${config.phoneNumberId.slice(-4)})`}
            </div>
          )}
        </div>
      )}

      {/* Test messaggio */}
      {form.enabled && config.configured && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
          <h3 className="font-medium text-gray-800 dark:text-white mb-3">
            🧪 {t('settings.whatsapp.testTitle')}
          </h3>
          <div className="flex gap-2">
            <input
              type="tel"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="393331234567"
              className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleTest}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              {t('settings.whatsapp.testButton')}
            </button>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            {t('settings.whatsapp.testHelp')}
          </p>
        </div>
      )}

      {/* Link alla guida */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
        <p className="text-sm text-blue-700 dark:text-blue-400 mb-2">
          📖 {t('settings.whatsapp.needHelp')}
        </p>
        <a
          href="/guida-whatsapp.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline text-sm font-medium"
        >
          {t('settings.whatsapp.openGuide')} →
        </a>
      </div>
    </div>
  )
}