import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { useIsMobile } from '../../hooks/useIsMobile'

const emptyForm = {
  name: '',
  price: '',
  duration: '',
  description: ''
}

export default function ServicesPage() {
  const { t } = useTranslation()
  const isMobile = useIsMobile()

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

  const handleSave = async () => {
    if (!form.name || form.price === '' || form.duration === '') {
      const msg = t('errors.required')
      setError(msg)
      toast.error(msg)
      return
    }

    const price = Number(form.price)
    if (isNaN(price)) {
      const msg = t('services.priceInvalid') || t('errors.invalidInput')
      setError(msg)
      toast.error(msg)
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

      toast.success(t('common.saveSuccess'))
      setShowForm(false)
      setForm(emptyForm)
      loadServices()
    } catch (err) {
      const msg = err.response?.data?.message || t('errors.serverError')
      setError(msg)
      toast.error(msg)
      console.error('ServicesPage save error:', err)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm(t('services.confirmDelete'))) return
    try {
      await api.delete(`/api/services/${id}`)
      toast.success(t('common.deleteSuccess'))
      loadServices()
    } catch (err) {
      toast.error(t('common.deleteError'))
      console.error(err)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={`flex items-center ${isMobile ? 'justify-between' : 'justify-between'} gap-2 flex-wrap`}>
        <div>
          <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-800 dark:text-white`}>
            {t('services.title')}
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            {t('services.subtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={openNew}
          className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-800 transition text-sm font-medium shadow dark:shadow-gray-700/50 ${
            isMobile ? 'px-3 py-1.5 text-xs' : ''
          }`}
        >
          {!isMobile && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          )}
          {isMobile ? '+' : t('services.new')}
        </button>
      </div>

      {/* Lista servizi */}
      {loading ? (
        <p className="text-gray-400 dark:text-gray-500 animate-pulse">{t('common.loading')}...</p>
      ) : services.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow dark:shadow-gray-700/50 p-8 md:p-12 text-center transition-colors duration-200">
          <p className="text-4xl md:text-5xl mb-4">✂️</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">{t('services.empty')}</p>
        </div>
      ) : (
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'}`}>
          {services.map(service => (
            <div
              key={service.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-700/50 border border-gray-100 dark:border-gray-700 p-4 md:p-5 hover:shadow-md dark:hover:shadow-lg transition-colors duration-200 touch-pan-y"
            >
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white truncate">{service.name}</h2>
                <div className="flex gap-1 md:gap-2 flex-shrink-0">
                  <div className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                    {service.duration} {t('services.minutes')}
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold px-2 py-1 rounded-full">
                    €{service.price}
                  </div>
                </div>
              </div>

              {service.description && (
                <div className="mt-4 p-3 md:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl transition-colors duration-200">
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between mt-4 md:mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  ID #{service.id}
                </div>
                <div className="flex items-center gap-2 md:gap-3">
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
          className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-0 md:p-4"
          onClick={() => setShowForm(false)}
        >
          <div
            className={`bg-white dark:bg-gray-800 w-full md:max-w-md p-6 space-y-4 overflow-y-auto transition-colors duration-200 ${
              isMobile ? 'rounded-t-3xl max-h-[90vh]' : 'rounded-2xl shadow-2xl max-h-[90vh]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {isMobile && (
              <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto -mt-2 mb-2" />
            )}

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