import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'

const DAYS = [
  'MONDAY', 'TUESDAY', 'WEDNESDAY',
  'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'
]

// ✅ Sabato incluso nei giorni lavorativi
const WORKING_DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']

const DEFAULT_OPEN = '08:30'
const DEFAULT_CLOSE_WEEKDAY = '20:30'  // ← Lun-Ven
const DEFAULT_CLOSE_SATURDAY = '19:00' // ← Sabato

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

  const handleSave = async () => {
    if (!form.dayOfWeek || !form.openTime || !form.closeTime) {
      setError('Compila tutti i campi obbligatori')
      return
    }

    try {
      await api.post('/api/schedules', {
        dayOfWeek: form.dayOfWeek,
        openTime: form.openTime + ':00',
        closeTime: form.closeTime + ':00'
      })
      setShowForm(false)
      loadSchedules()
    } catch (err) {
      setError(err.response?.data?.message || t('errors.serverError'))
    }
  }

  // ✅ FUNZIONE BULK: Imposta orari lavorativi (Lun-Ven 08:30-20:30, Sab 08:30-19:00)
  const setupWorkingDays = async () => {
    if (!window.confirm(`Impostare orari lavorativi default?\n\nLun-Ven: ${DEFAULT_OPEN} → ${DEFAULT_CLOSE_WEEKDAY}\nSabato: ${DEFAULT_OPEN} → ${DEFAULT_CLOSE_SATURDAY}`)) {
      return
    }

    setBulkLoading(true)
    setError('')

    try {
      const configuredDays = schedules.map(s => s.dayOfWeek)
      const daysToCreate = WORKING_DAYS.filter(day => !configuredDays.includes(day))

      if (daysToCreate.length === 0) {
        alert('✅ Tutti i giorni lavorativi sono già configurati!')
        return
      }

      // ✅ Crea promesse con orario di chiusura dinamico
      const promises = daysToCreate.map(day => {
        const closeTime = day === 'SATURDAY' ? DEFAULT_CLOSE_SATURDAY : DEFAULT_CLOSE_WEEKDAY
        
        return api.post('/api/schedules', {
          dayOfWeek: day,
          openTime: `${DEFAULT_OPEN}:00`,
          closeTime: `${closeTime}:00`
        })
      })

      await Promise.all(promises)
      alert(`✅ Configurati ${daysToCreate.length} giorni lavorativi!\nLun-Ven: 08:30-20:30\nSabato: 08:30-19:00`)
      loadSchedules()
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Errore durante la configurazione bulk')
    } finally {
      setBulkLoading(false)
    }
  }

  const handleDelete = async (dayOfWeek) => {
    if (!window.confirm(t('schedule.delete') + '?')) return
    try {
      await api.delete(`/api/schedules/${dayOfWeek}`)
      loadSchedules()
    } catch (err) {
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
          <h1 className="text-3xl font-bold text-gray-800">
            {t('schedule.title')}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Configura i giorni e gli orari lavorativi
          </p>
        </div>

        <div className="flex gap-2">
          {/* ✅ PULSANTE BULK */}
          <button
            onClick={setupWorkingDays}
            disabled={bulkLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium shadow transition ${
              bulkLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {bulkLoading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Configurazione...
              </>
            ) : (
              <>⚡ Imposta orari lavorativi</>
            )}
          </button>

          {/* Pulsante Aggiungi singolo */}
          {availableDays.length > 0 && (
            <button
              onClick={openNew}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm font-medium shadow"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Aggiungi Giorno
            </button>
          )}
        </div>
      </div>

      {/* Griglia giorni settimana */}
      {loading ? (
        <p className="text-gray-400 animate-pulse">{t('common.loading')}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

          {DAYS.map(day => {
            const schedule = schedules.find(s => s.dayOfWeek === day)
            const isConfigured = !!schedule
            const isWorkingDay = WORKING_DAYS.includes(day)

            return (
              <div
                key={day}
                className={`rounded-2xl border p-5 transition ${
                  isConfigured
                    ? 'bg-white shadow-sm border-gray-100 hover:shadow-md'
                    : 'bg-gray-50 border-dashed border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-800">
                    {t(`schedule.days.${day}`)}
                  </h2>

                  {isConfigured ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                      Aperto
                    </span>
                  ) : (
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      isWorkingDay 
                        ? day === 'SATURDAY'
                          ? 'bg-purple-100 text-purple-700'  // Sabato in viola
                          : 'bg-amber-100 text-amber-700'    // Lun-Ven in ambra
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {isWorkingDay 
                        ? day === 'SATURDAY' 
                          ? '08:30-19:00'   // Badge con orario Sabato
                          : '08:30-20:30'   // Badge con orario Lun-Ven
                        : 'Chiuso'}
                    </span>
                  )}
                </div>

                {isConfigured ? (
                  <>
                    <div className="mt-3 p-3 bg-gray-50 rounded-xl text-sm text-gray-700 font-medium">
                      🕐 {schedule.openTime?.slice(0, 5)} → {schedule.closeTime?.slice(0, 5)}
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-4">
                      <button
                        onClick={() => openEdit(schedule)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        onClick={() => handleDelete(day)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
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
                      className="text-sm text-blue-500 hover:text-blue-700 font-medium"
                    >
                      + Configura orario
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
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-800">
              {editingSchedule ? t('common.edit') : 'Configura Orario'} — {t(`schedule.days.${form.dayOfWeek}`)}
            </h2>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            {!editingSchedule && !form.dayOfWeek && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('schedule.day')} *
                </label>
                <select
                  value={form.dayOfWeek}
                  onChange={e => handleChange('dayOfWeek', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Seleziona giorno --</option>
                  {availableDays.map(d => (
                    <option key={d} value={d}>{t(`schedule.days.${d}`)}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Apertura */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('schedule.open')} *
              </label>
              <input
                type="time"
                value={form.openTime}
                onChange={e => handleChange('openTime', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Chiusura */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('schedule.close')} *
              </label>
              <input
                type="time"
                value={form.closeTime}
                onChange={e => handleChange('closeTime', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition"
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