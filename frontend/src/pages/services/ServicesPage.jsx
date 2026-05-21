import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'
import toast from 'react-hot-toast' // ✅ 1. Importa toast

const emptyForm = {
  name: '',
  price: '',
  duration: '',
  description: ''
}

export default function ServicesPage() {
  const { t } = useTranslation()

  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  const [showForm, setShowForm] = useState(false)
  const [editingService, setEditingService] = useState(null)

  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  useEffect(() => {
    loadServices()
  }, [])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setShowForm(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const loadServices = async () => {
    try {
      const res = await api.get('/api/services')
      setServices(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const openNew = () => {
    setEditingService(null)
    setForm(emptyForm)
    setError('')
    setShowForm(true)
  }

  const openEdit = (service) => {
    setEditingService(service)
    setForm({
      name: service.name || '',
      price: service.price?.toString() || '',
      description: service.description || '',
      duration: service.duration?.toString() || ''
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

  // ✅ 2. handleSave aggiornato con Toast
  const handleSave = async () => {
    if (!form.name || form.price === '' || form.duration === '') {
      const msg = t('errors.required')
      setError(msg)
      toast.error(msg) // ✅ Feedback visivo validazione
      return
    }

    const price = Number(form.price)
    if (isNaN(price)) {
      const msg = t('services.priceInvalid') || t('errors.invalidInput')
      setError(msg)
      toast.error(msg) // ✅ Feedback visivo prezzo non valido
      return
    }

    try {
      const payload = {
        name: form.name.trim(),
        price: parseFloat(form.price),
        duration: parseInt(form.duration, 10),
        description: form.description?.trim() || ''
      }

      if (editingService) {
        await api.put(`/api/services/${editingService.id}`, payload)
      } else {
        await api.post('/api/services', payload)
      }

      toast.success(t('common.saveSuccess')) // ✅ Notifica successo
      setShowForm(false)
      setForm(emptyForm)
      loadServices()
    } catch (err) {
      const msg = err.response?.data?.message || t('errors.serverError')
      setError(msg)
      toast.error(msg) // ✅ Notifica errore
      if (import.meta.env.DEV) {
        console.error('ServicesPage save error:', err)
      }
    }
  }

  // ✅ 3. handleDelete aggiornato con Toast
  const handleDelete = async (id) => {
    if (!window.confirm(t('services.confirmDelete'))) return
    try {
      await api.delete(`/api/services/${id}`)
      toast.success(t('common.deleteSuccess')) // ✅ Notifica eliminazione
      loadServices()
    } catch (err) {
      toast.error(t('common.deleteError')) // ✅ Notifica errore
      console.error(err)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            {t('services.title')}
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            {t('services.subtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-800 transition text-sm font-medium shadow dark:shadow-gray-700/50"
        >
          {t('services.new')}
        </button>
      </div>

      {/* Lista servizi */}
      {loading ? (
        <p className="text-gray-400 dark:text-gray-500 animate-pulse">
          {t('common.loading')}...
        </p>
      ) : services.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow dark:shadow-gray-700/50 p-12 text-center transition-colors duration-200">
          <p className="text-5xl mb-4">✂️</p>
          <p className="text-gray-400 dark:text-gray-500">
            {t('services.empty')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {services.map(service => (
            <div
              key={service.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-700/50 border border-gray-100 dark:border-gray-700 p-5 hover:shadow-md dark:hover:shadow-lg transition-colors duration-200"
            >
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">{service.name}</h2>
                <div className="flex gap-2">
                  <div className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm px-3 py-1 rounded-full">
                    {service.duration} {t('services.minutes')}
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-bold px-3 py-1 rounded-full">
                    €{service.price}
                  </div>
                </div>
              </div>

              {service.description && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl transition-colors duration-200">
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  ID #{service.id}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => openEdit(service)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    {t('common.edit')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(service.id)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
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
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl dark:shadow-gray-700/50 w-full max-w-md p-6 space-y-4 transition-colors duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              {editingService ? t('services.editTitle') : t('services.new')}
            </h2>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {t('services.nameLabel')}
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('services.namePlaceholder')}
              />
            </div>

            {/* Prezzo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {t('services.priceLabel')}
              </label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={e => handleChange('price', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('services.pricePlaceholder')}
              />
            </div>

            {/* Durata */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {t('services.duration')} *
              </label>
              <input
                type="number"
                value={form.duration}
                onChange={e => handleChange('duration', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('services.durationPlaceholder')}
              />
            </div>

            {/* Descrizione */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {t('services.descriptionLabel')}
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('services.descriptionPlaceholder')}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
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