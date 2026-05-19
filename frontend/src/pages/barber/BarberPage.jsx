import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  specialization: ''
}

export default function BarberPage() {
  const { t } = useTranslation()

  const [barbers, setBarbers] = useState([])
  const [loading, setLoading] = useState(true)

  const [showForm, setShowForm] = useState(false)
  const [editingBarber, setEditingBarber] = useState(null)

  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  useEffect(() => {
    loadBarbers()
  }, [])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setShowForm(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const loadBarbers = async () => {
    try {
      const res = await api.get('/api/barbers')
      setBarbers(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const openNew = () => {
    setEditingBarber(null)
    setForm(emptyForm)
    setError('')
    setShowForm(true)
  }

  const openEdit = (barber) => {
    setEditingBarber(barber)
    setForm({
      name: barber.name || '',
      email: barber.email || '',
      phone: barber.phone || '',
      specialization: barber.specialization || ''
    })
    setError('')
    setShowForm(true)
  }

  const handleChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError(t('barbers.nameRequired'))
      return
    }

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        specialization: form.specialization.trim() || null
      }

      if (editingBarber) {
        await api.put(`/api/barbers/${editingBarber.id}`, payload)
      } else {
        await api.post('/api/barbers', payload)
      }

      setShowForm(false)
      setForm(emptyForm)
      loadBarbers()
    } catch (err) {
      console.error('Errore salvataggio barbiere:', err)
      setError(err.response?.data?.message || t('errors.serverError'))
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm(t('barbers.deleteConfirm'))) return

    try {
      await api.delete(`/api/barbers/${id}`)
      loadBarbers()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {t('barbers.title')}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {t('barbers.subtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm font-medium shadow"
        >
          {t('barbers.new')}
        </button>
      </div>

      {/* Lista barbieri */}
      {loading ? (
        <p className="text-gray-400 animate-pulse">{t('common.loading')}</p>
      ) : barbers.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-12 text-center">
          <p className="text-5xl mb-4">✂️</p>
          <p className="text-gray-400">{t('barbers.empty')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {barbers.map(barber => (
            <div
              key={barber.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">{barber.name}</h2>
                  {barber.specialization && (
                    <p className="text-xs text-blue-600 font-medium mt-1">
                      🎯 {barber.specialization}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-3 space-y-1 text-sm text-gray-500">
                {barber.email && (
                  <p className="flex items-center gap-2">
                    <span>📧</span> {barber.email}
                  </p>
                )}
                {barber.phone && (
                  <p className="flex items-center gap-2">
                    <span>📱</span> {barber.phone}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-400">
                  ID #{barber.id}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => openEdit(barber)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {t('common.edit')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(barber.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            </div>
          ))}
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
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-800">
              {editingBarber ? t('barbers.editTitle') : t('barbers.newTitle')}
            </h2>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('barbers.name')} *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('barbers.namePlaceholder')}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('barbers.email')}
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('barbers.emailPlaceholder')}
              />
            </div>

            {/* Telefono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('barbers.phone')}
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => handleChange('phone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('barbers.phonePlaceholder')}
              />
            </div>

            {/* Specializzazione */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('barbers.specialization')}
              </label>
              <input
                type="text"
                value={form.specialization}
                onChange={e => handleChange('specialization', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('barbers.specializationPlaceholder')}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
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