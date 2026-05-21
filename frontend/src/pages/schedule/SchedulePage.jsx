import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'
import toast from 'react-hot-toast' // ✅ 1. Importa toast

const DAYS = [
  'MONDAY', 'TUESDAY', 'WEDNESDAY',
  'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'
]

const WORKING_DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']

const DEFAULT_OPEN = '08:30'
const DEFAULT_CLOSE_WEEKDAY = '20:30'
const DEFAULT_CLOSE_SATURDAY = '19:00'

export default function SchedulePage() {
  const { t } = useTranslation()

  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    dayOfWeek: '',
    openTime: '',
    closeTime: ''
  })

  useEffect(() => {
    loadSchedules()
  }, [])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setShowForm(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const loadSchedules = async () => {
    try {
      const res = await api.get('/api/schedules')
      setSchedules(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const openNew = () => {
    setEditingSchedule(null)
    setForm({ dayOfWeek: '', openTime: '', closeTime: '' })
    setError('')
    setShowForm(true)
  }

  const openEdit = (schedule) => {
    setEditingSchedule(schedule)
    setForm({
      dayOfWeek: schedule.dayOfWeek,
      openTime: schedule.openTime?.slice(0, 5),
      closeTime: schedule.closeTime?.slice(0, 5)
    })
    setError('')
    setShowForm(true)
  }

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  // ✅ 2. handleSave aggiornato con Toast
  const handleSave = async () => {
    if (!form.dayOfWeek || !form.openTime || !form.closeTime) {
      const msg = t('schedule.requiredFields')
      setError(msg)
      toast.error(msg) // ✅ Feedback visivo validazione
      return
    }

    try {
      await api.post('/api/schedules', {
        dayOfWeek: form.dayOfWeek,
        openTime: form.openTime + ':00',
        closeTime: form.closeTime + ':00'
      })
      
      toast.success(t('common.saveSuccess')) // ✅ Notifica successo
      setShowForm(false)
      loadSchedules()
    } catch (err) {
      const msg = err.response?.data?.message || t('errors.serverError')
      setError(msg)
      toast.error(msg) // ✅ Notifica errore
    }
  }

  // ✅ 3. setupWorkingDays aggiornato con Toast (sostituisce alert)
  const setupWorkingDays = async () => {
    if (!window.confirm(t('schedule.setupWorkingDaysConfirm', {
      weekdayOpen: DEFAULT_OPEN,
      weekdayClose: DEFAULT_CLOSE_WEEKDAY,
      saturdayClose: DEFAULT_CLOSE_SATURDAY
    }))) {
      return
    }

    setBulkLoading(true)
    setError('')

    try {
      const configuredDays = schedules.map(s => s.dayOfWeek)
      const daysToCreate = WORKING_DAYS.filter(day => !configuredDays.includes(day))

      if (daysToCreate.length === 0) {
        toast.info(t('schedule.alreadyConfigured')) // ✅ Info toast invece di alert
        return
      }

      const promises = daysToCreate.map(day => {
        const closeTime = day === 'SATURDAY' ? DEFAULT_CLOSE_SATURDAY : DEFAULT_CLOSE_WEEKDAY
        
        return api.post('/api/schedules', {
          dayOfWeek: day,
          openTime: `${DEFAULT_OPEN}:00`,
          closeTime: `${closeTime}:00`
        })
      })

      await Promise.all(promises)
      toast.success(t('schedule.configuredSuccess', { count: daysToCreate.length })) // ✅ Success toast
      loadSchedules()
    } catch (err) {
      const msg = err.response?.data?.message || t('errors.serverError')
      setError(msg)
      toast.error(msg) // ✅ Error toast
      console.error(err)
    } finally {
      setBulkLoading(false)
    }
  }

  // ✅ 4. handleDelete aggiornato con Toast
  const handleDelete = async (dayOfWeek) => {
    if (!window.confirm(t('schedule.deleteConfirm'))) return
    try {
      await api.delete(`/api/schedules/${dayOfWeek}`)
      toast.success(t('common.deleteSuccess')) // ✅ Notifica eliminazione
      loadSchedules()
    } catch (err) {
      toast.error(t('common.deleteError')) // ✅ Notifica errore
      console.error(err)
    }
  }

  const configuredDays = schedules.map(s => s.dayOfWeek)
  const availableDays = DAYS.filter(d => !configuredDays.includes(d))

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            {t('schedule.title')}
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            {t('schedule.subtitle')}
          </p>
        </div>

        <div className="flex gap-2">
          {/* Pulsante BULK */}
          <button
            onClick={setupWorkingDays}
            disabled={bulkLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium shadow dark:shadow-gray-700/50 transition ${
              bulkLoading
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 dark:hover:bg-emerald-800'
            }`}
          >
            {bulkLoading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                {t('schedule.configuring')}
              </>
            ) : (
              <>⚡ {t('schedule.setupWorkingDays')}</>
            )}
          </button>

          {/* Pulsante Aggiungi singolo */}
          {availableDays.length > 0 && (
            <button
              onClick={openNew}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-800 transition text-sm font-medium shadow dark:shadow-gray-700/50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('schedule.addDay')}
            </button>
          )}
        </div>
      </div>

      {/* Griglia giorni settimana */}
      {loading ? (
        <p className="text-gray-400 dark:text-gray-500 animate-pulse">{t('common.loading')}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {DAYS.map(day => {
            const schedule = schedules.find(s => s.dayOfWeek === day)
            const isConfigured = !!schedule
            const isWorkingDay = WORKING_DAYS.includes(day)

            return (
              <div
                key={day}
                className={`rounded-2xl border p-5 transition-colors duration-200 ${
                  isConfigured
                    ? 'bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-700/50 border-gray-100 dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg'
                    : 'bg-gray-50 dark:bg-gray-700/50 border-dashed border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                    {t(`schedule.days.${day}`)}
                  </h2>

                  {isConfigured ? (
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full font-medium">
                      {t('schedule.open')}
                    </span>
                  ) : (
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      isWorkingDay 
                        ? day === 'SATURDAY'
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                          : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                    }`}>
                      {isWorkingDay 
                        ? day === 'SATURDAY' 
                          ? '08:30-19:00'
                          : '08:30-20:30'
                        : t('schedule.closed')}
                    </span>
                  )}
                </div>

                {isConfigured ? (
                  <>
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-sm text-gray-700 dark:text-gray-200 font-medium transition-colors duration-200">
                      🕐 {schedule.openTime?.slice(0, 5)} → {schedule.closeTime?.slice(0, 5)}
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-4">
                      <button
                        onClick={() => openEdit(schedule)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        onClick={() => handleDelete(day)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                      >
                        {t('common.delete')}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        setForm({ dayOfWeek: day, openTime: '', closeTime: '' })
                        setEditingSchedule(null)
                        setError('')
                        setShowForm(true)
                      }}
                      className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                    >
                      + {t('schedule.configure')}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl dark:shadow-gray-700/50 w-full max-w-md p-6 space-y-4 transition-colors duration-200"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              {editingSchedule ? t('common.edit') : t('schedule.configure')} — {t(`schedule.days.${form.dayOfWeek}`)}
            </h2>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {!editingSchedule && !form.dayOfWeek && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  {t('schedule.day')} *
                </label>
                <select
                  value={form.dayOfWeek}
                  onChange={e => handleChange('dayOfWeek', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- {t('schedule.selectDay')} --</option>
                  {availableDays.map(d => (
                    <option key={d} value={d}>{t(`schedule.days.${d}`)}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Apertura */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {t('schedule.open')} *
              </label>
              <input
                type="time"
                value={form.openTime}
                onChange={e => handleChange('openTime', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Chiusura */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {t('schedule.close')} *
              </label>
              <input
                type="time"
                value={form.closeTime}
                onChange={e => handleChange('closeTime', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-800 transition"
              >
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}