import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'

export default function CustomersPage() {
  const { t } = useTranslation()

  const [customers, setCustomers] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const [showForm, setShowForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)

  const [form, setForm] = useState({
    name: '',
    surname: '',
    phone: '',
    notes: ''
  })

  const [error, setError] = useState('')

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    try {
      const [customersRes, bookingsRes] = await Promise.all([
        api.get('/api/customers'),
        api.get('/api/bookings')
      ])

      setCustomers(customersRes.data)
      setBookings(bookingsRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const openNew = () => {
    setEditingCustomer(null)

    setForm({
      name: '',
      surname: '',
      phone: '',
      notes: ''
    })

    setError('')
    setShowForm(true)
  }

  const openEdit = (customer) => {
    setEditingCustomer(customer)

    setForm({
      name: customer.name || '',
      surname: customer.surname || '',
      phone: customer.phone || '',
      notes: customer.notes || ''
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
    if (!form.name || !form.phone) {
      setError('Nome e telefono obbligatori')
      return
    }

    try {
      // Controllo duplicati:
      // stesso nome + stesso telefono = update
      const existingCustomer = customers.find(
        c =>
          c.phone === form.phone &&
          c.id !== editingCustomer?.id
      )

      if (existingCustomer && !editingCustomer) {
        setError('Cliente con questo numero già esistente')
        return
      }

      const payload = {
        name: form.name,
        surname: form.surname,
        phone: form.phone,
        notes: form.notes
      }

      if (editingCustomer) {
        await api.put(`/api/customers/${editingCustomer.id}`, payload)
      } else {
        await api.post('/api/customers', payload)
      }

      setShowForm(false)
      loadAll()
    } catch (err) {
      setError(err.response?.data?.message || 'Errore salvataggio')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm(t('customers.confirmDelete'))) return

    try {
      await api.delete(`/api/customers/${id}`)
      loadAll()
    } catch (err) {
      console.error(err)
    }
  }

  const getCustomerBookings = (customerId) => {
    return bookings.filter(b => b.customerId === customerId)
  }

  const getLastBooking = (customerId) => {
    const customerBookings = getCustomerBookings(customerId)

    if (customerBookings.length === 0) return null

    return customerBookings.sort((a, b) =>
      new Date(b.startTime) - new Date(a.startTime)
    )[0]
  }

  const formatDate = (date) => {
    if (!date) return '-'

    return new Date(date).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {t('customers.title')}
          </h1>

          <p className="text-sm text-gray-400 mt-1">
            Gestisci agenda clienti e storico prenotazioni
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

          Nuovo Cliente
        </button>

      </div>

      {/* Lista clienti */}
      {loading ? (
        <p className="text-gray-400">{t('common.loading')}</p>
      ) : customers.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-12 text-center">
          <p className="text-5xl mb-4">👤</p>
          <p className="text-gray-400">
            Nessun cliente presente
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

          {customers.map(customer => {

            const customerBookings = getCustomerBookings(customer.id)
            const lastBooking = getLastBooking(customer.id)

            return (
              <div
                key={customer.id}
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

                {/* Header card */}
                <div className="flex items-start justify-between">

                  <div>

                    <h2 className="text-lg font-bold text-gray-800">
                      {customer.name} {customer.surname}
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      📞 {customer.phone || 'Nessun telefono'}
                    </p>

                  </div>

                  <div className="flex items-center gap-3">

                    <button
                      onClick={() => openEdit(customer)}
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
                      onClick={() => handleDelete(customer.id)}
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

                {/* Stats */}
                <div className="mt-5 grid grid-cols-2 gap-3">

                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">
                      Prenotazioni Totali
                    </p>

                    <p className="text-2xl font-bold text-gray-800">
                      {customerBookings.length}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">
                      Ultima Prenotazione
                    </p>

                    <p className="text-sm font-semibold text-gray-700">
                      {lastBooking
                        ? formatDate(lastBooking.startTime)
                        : '-'}
                    </p>
                  </div>

                </div>

                {/* Notes */}
                {customer.notes && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                    <p className="text-xs font-semibold text-blue-700 mb-1">
                      Note Cliente
                    </p>

                    <p className="text-sm text-blue-800">
                      {customer.notes}
                    </p>
                  </div>
                )}

                {/* Storico prenotazioni */}
                {customerBookings.length > 0 && (
                  <div className="mt-5">

                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      Storico Prenotazioni
                    </p>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">

                      {customerBookings
                        .sort((a, b) =>
                          new Date(b.startTime) - new Date(a.startTime)
                        )
                        .map(booking => (

                          <div
                            key={booking.id}
                            className="
                              flex items-center justify-between
                              bg-gray-50
                              rounded-xl
                              px-3 py-2
                            "
                          >

                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                {formatDate(booking.startTime)}
                              </p>

                              <p className="text-xs text-gray-400">
                                {booking.status}
                              </p>
                            </div>

                            <div className="
                              text-xs
                              px-2 py-1
                              rounded-full
                              bg-blue-100
                              text-blue-700
                              font-medium
                            ">
                              #{booking.id}
                            </div>

                          </div>

                        ))}

                    </div>

                  </div>
                )}

              </div>
            )
          })}

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
              {editingCustomer
                ? 'Modifica Cliente'
                : 'Nuovo Cliente'}
            </h2>

            {error && (
              <div className="
                p-3
                bg-red-50
                border
                border-red-200
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
                Nome *
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

            {/* Cognome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cognome
              </label>

              <input
                type="text"
                value={form.surname}
                onChange={e => handleChange('surname', e.target.value)}
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

            {/* Telefono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefono *
              </label>

              <input
                type="tel"
                value={form.phone}
                onChange={e => handleChange('phone', e.target.value)}
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

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note
              </label>

              <textarea
                rows={3}
                value={form.notes}
                onChange={e => handleChange('notes', e.target.value)}
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