import { useEffect, useState } from 'react'
import api from '../../api/axios'

const emptyDay = {
  dayOfWeek: '',
  startTime: '',
  endTime: ''
}

export default function SchedulePage() {

  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingDay, setEditingDay] = useState(null)
  const [form, setForm] = useState(emptyDay)

  useEffect(() => {
    loadSchedule()
  }, [])

  const loadSchedule = async () => {
    try {
      const res = await api.get('/api/schedule')
      setSchedule(res.data)
    } catch (err) {
      console.error(err)
      setError('Errore nel caricamento dell’orario')
    } finally {
      setLoading(false)
    }
  }

  const openEdit = (day) => {
    setEditingDay(day)
    setForm({
      dayOfWeek: day.dayOfWeek,
      startTime: day.startTime,
      endTime: day.endTime
    })
    setError('')
    setShowForm(true)
  }

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!form.startTime || !form.endTime) {
      setError('Compila tutti i campi obbligatori')
      return
    }

    try {
      await api.put(`/api/schedule/${editingDay.id}`, form)
      setShowForm(false)
      loadSchedule()
    } catch (err) {
      setError(err.response?.data?.message || 'Errore salvataggio')
    }
  }

  return (
    <div className="space-y-4">

      <h1 className="text-3xl font-bold text-gray-800">Orario</h1>
      <p className="text-gray-600">
        Gestisci gli orari settimanali del salone.
      </p>

      {loading ? (
        <p className="text-gray-400 animate-pulse">Caricamento...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

          {schedule.map(day => (
            <div
              key={day.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition"
            >
              <h2 className="text-lg font-bold text-gray-800">
                {day.dayOfWeek}
              </h2>

              <div className="mt-3 p-3 bg-gray-50 rounded-xl text-sm text-gray-700">
                {day.startTime} → {day.endTime}
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => openEdit(day)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Modifica
                </button>
              </div>
            </div>
          ))}

        </div>
      )}

      {/* MODAL */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-800">
              Modifica Orario — {editingDay?.dayOfWeek}
            </h2>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Start */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apertura *
              </label>
              <input
                type="time"
                value={form.startTime}
                onChange={e => handleChange('startTime', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* End */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chiusura *
              </label>
              <input
                type="time"
                value={form.endTime}
                onChange={e => handleChange('endTime', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Annulla
              </button>

              <button
                onClick={handleSave}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700"
              >
                Salva
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
