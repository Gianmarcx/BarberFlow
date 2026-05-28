import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { useIsMobile } from '../../hooks/useIsMobile'

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  specialization: ''
}

export default function BarberPage() {
  const { t } = useTranslation()
  const isMobile = useIsMobile()

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
      const msg = t('barbers.nameRequired')
      setError(msg)
      toast.error(msg)
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

      toast.success(t('common.saveSuccess'))
      setShowForm(false)
      setForm(emptyForm)
      loadBarbers()
    } catch (err) {
      const msg = err.response?.data?.message || t('errors.serverError')
      setError(msg)
      toast.error(msg)
      console.error('Errore salvataggio barbiere:', err)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm(t('barbers.deleteConfirm'))) return

    try {
      await api.delete(`/api/barbers/${id}`)
      toast.success(t('common.deleteSuccess'))
      loadBarbers()
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
            {t('barbers.title')}
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            {t('barbers.subtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={openNew}
          className={`
            flex items-center gap-2 px-4 py-2 
            bg-blue-600 text-white 
            rounded-xl font-medium 
            shadow-md shadow-blue-500/20 
            hover-btn-premium hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30
            active:scale-[0.98] active:shadow-md
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
            ${isMobile ? 'px-3 py-1.5 text-xs' : 'text-sm'}
            transition-all duration-200
          `}
        >
          {!isMobile && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          )}
          {isMobile ? '+' : t('barbers.new')}
        </button>
      </div>

      {/* Lista barbieri */}
      {loading ? (
        <p className="text-gray-400 dark:text-gray-500 animate-pulse">{t('common.loading')}</p>
      ) : barbers.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow dark:shadow-gray-700/50 p-8 md:p-12 text-center transition-colors duration-200">
          <p className="text-4xl md:text-5xl mb-4">✂️</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">{t('barbers.empty')}</p>
        </div>
      ) : (
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'}`}>
          {barbers.map(barber => (
            <div
              key={barber.id}
              className="
                bg-white dark:bg-gray-800 
                rounded-2xl shadow-sm dark:shadow-gray-700/50 
                border border-gray-100 dark:border-gray-700 
                p-4 md:p-5 
                hover-card-premium hover:border-blue-200 dark:hover:border-blue-800
                touch-pan-y
              "
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white truncate">{barber.name}</h2>
                  {barber.specialization && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1 truncate">
                      🎯 {barber.specialization}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-3 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                {barber.email && (
                  <p className="flex items-center gap-2 truncate">
                    <span>📧</span> <a href={`mailto:${barber.email}`} className="text-gray-700 dark:text-gray-200 hover:underline transition-colors truncate">{barber.email}</a>
                  </p>
                )}
                {barber.phone && (
                  <p className="flex items-center gap-2 truncate">
                    <span>📱</span> <a href={`tel:${barber.phone}`} className="text-gray-700 dark:text-gray-200 hover:underline transition-colors truncate">{barber.phone}</a>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between mt-4 md:mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  ID #{barber.id}
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                  <button
                    type="button"
                    onClick={() => openEdit(barber)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium hover-btn-premium transition-colors"
                  >
                    {t('common.edit')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(barber.id)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium hover-btn-premium transition-colors"
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
              {editingBarber ? t('barbers.editTitle') : t('barbers.newTitle')}
            </h2>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {t('barbers.name')} *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('barbers.namePlaceholder')}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {t('barbers.email')}
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('barbers.emailPlaceholder')}
              />
            </div>

            {/* Telefono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {t('barbers.phone')}
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => handleChange('phone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('barbers.phonePlaceholder')}
              />
            </div>

            {/* Specializzazione */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {t('barbers.specialization')}
              </label>
              <input
                type="text"
                value={form.specialization}
                onChange={e => handleChange('specialization', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('barbers.specializationPlaceholder')}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="
                  flex-1 py-3 
                  border border-gray-200 dark:border-gray-600 
                  rounded-xl text-sm font-medium 
                  text-gray-600 dark:text-gray-300 
                  hover-btn-premium hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
                  active:scale-[0.98]
                  transition-all duration-200
                "
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="
                  flex-1 py-3 
                  bg-blue-600 text-white 
                  rounded-xl text-sm font-medium 
                  shadow-md shadow-blue-500/20 
                  hover-btn-premium hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30
                  active:scale-[0.98] active:shadow-md
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
                  transition-all duration-200
                "
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