import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'

export default function ServicesPage() {
  const { t } = useTranslation()

  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  const [showForm, setShowForm] = useState(false)
  const [editingService, setEditingService] = useState(null)

  const [form, setForm] = useState({
    name: '',
    price: '',
    description: ''
  })

  const [error, setError] = useState('')

  useEffect(() => {
    loadServices()
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

    setForm({
      name: '',
      price: '',
      description: ''
    })

    setError('')
    setShowForm(true)
  }

  const openEdit = (service) => {
    setEditingService(service)

    setForm({
      name: service.name || '',
      price: service.price || '',
      description: service.description || ''
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
    if (!form.name || !form.price) {
      setError('Compila tutti i campi obbligatori')
      return
    }

    try {
      const payload = {
        name: form.name,
        price: parseFloat(form.price),
        description: form.description
      }

      if (editingService) {
        await api.put(`/api/services/${editingService.id}`, payload)
      } else {
        await api.post('/api/services', payload)
      }

      setShowForm(false)
      loadServices()
    } catch (err) {
      setError(err.response?.data?.message || 'Errore salvataggio')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Vuoi eliminare questo servizio?')) return

    try {
      await api.delete(`/api/services/${id}`)
      loadServices()
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
            {t('services.title')}
          </h1>

          <p className="text-sm text-gray-400 mt-1">
            Gestisci tutti i servizi del salone
          </p>
        </div>

        <button
          onClick={openNew}
          className="
            flex items-center gap-2
            px-4 py-2
            bg-blue-600
            text-white
            rounded-xl
            hover:bg-blue-700
            transition
            text-sm
            font-medium
            shadow
          "
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>

          Nuovo Servizio
        </button>

      </div>

      {/* Lista servizi */}
      {loading ? (
        <p className="text-gray-400">{t('common.loading')}</p>
      ) : services.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-12 text-center">
          <p className="text-5xl mb-4">✂️</p>

          <p className="text-gray-400">
            Nessun servizio disponibile
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">

          {services.map(service => (

            <div
              key={service.id}
              className="
                bg-white
                rounded-2xl
                shadow-sm
                border
                border-gray-100
                p-5
                hover:shadow-md
                transition
              "
            >

              {/* Header */}
              <div className="flex items-start justify-between">

                <div>

                  <h2 className="text-lg font-bold text-gray-800">
                    {service.name}
                  </h2>

                </div>

                <div className="
                  bg-blue-100
                  text-blue-700
                  text-sm
                  font-bold
                  px-3
                  py-1
                  rounded-full
                ">
                  €{service.price}
                </div>

              </div>

              {/* Description */}
              {service.description && (
                <div className="
                  mt-4
                  p-4
                  bg-gray-50
                  rounded-xl
                ">

                  <p className="text-sm text-gray-600 leading-relaxed">
                    {service.description}
                  </p>

                </div>
              )}

              {/* Footer */}
              <div className="
                flex items-center justify-between
                mt-5
                pt-4
                border-t border-gray-100
              ">

                <div className="text-xs text-gray-400">
                  ID #{service.id}
                </div>

                <div className="flex items-center gap-3">

                  <button
                    onClick={() => openEdit(service)}
                    className="
                      text-blue-600
                      hover:text-blue-800
                      text-sm
                      font-medium
                    "
                  >
                    {t('common.edit')}
                  </button>

                  <button
                    onClick={() => handleDelete(service.id)}
                    className="
                      text-red-500
                      hover:text-red-700
                      text-sm
                      font-medium
                    "
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
        <div className="
          fixed inset-0
          bg-black/50
          flex items-center justify-center
          z-50
          p-4
        ">

          <div className="
            bg-white
            rounded-2xl
            shadow-2xl
            w-full
            max-w-md
            p-6
            space-y-4
          ">

            <h2 className="text-xl font-bold text-gray-800">
              {editingService
                ? 'Modifica Servizio'
                : 'Nuovo Servizio'}
            </h2>

            {error && (
              <div className="
                p-3
                bg-red-50
                border border-red-200
                rounded-xl
                text-red-600
                text-sm
              ">
                {error}
              </div>
            )}

            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Servizio *
              </label>

              <input
                type="text"
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                className="
                  w-full
                  px-4 py-3
                  border border-gray-200
                  rounded-xl
                  bg-gray-50
                  text-sm
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "
              />
            </div>

            {/* Prezzo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prezzo (€) *
              </label>

              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={e => handleChange('price', e.target.value)}
                className="
                  w-full
                  px-4 py-3
                  border border-gray-200
                  rounded-xl
                  bg-gray-50
                  text-sm
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "
              />
            </div>

            {/* Descrizione */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrizione
              </label>

              <textarea
                rows={3}
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
                className="
                  w-full
                  px-4 py-3
                  border border-gray-200
                  rounded-xl
                  bg-gray-50
                  text-sm
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">

              <button
                onClick={() => setShowForm(false)}
                className="
                  flex-1
                  py-3
                  border border-gray-200
                  rounded-xl
                  text-sm
                  font-medium
                  text-gray-600
                  hover:bg-gray-50
                  transition
                "
              >
                {t('common.cancel')}
              </button>

              <button
                onClick={handleSave}
                className="
                  flex-1
                  py-3
                  bg-blue-600
                  text-white
                  rounded-xl
                  text-sm
                  font-medium
                  hover:bg-blue-700
                  transition
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