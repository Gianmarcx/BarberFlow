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
      setError(t('errors.required'))
      return
    }

    try {
      const existingCustomer = customers.find(
        c => c.phone === form.phone && c.id !== editingCustomer?.id
      )

      if (existingCustomer && !editingCustomer) {
        setError(t('customers.phoneExists'))
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
      setError(err.response?.data?.message || t('errors.serverError'))
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
    return new Date(date).toLocaleDateString(t('locale'), {
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            {t('customers.title')}
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            {t('customers.subtitle')}
          </p>
        </div>

        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-800 transition text-sm font-medium shadow dark:shadow-gray-700/50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('customers.new')}
        </button>
      </div>

      {/* Lista clienti */}
      {loading ? (
        <p className="text-gray-400 dark:text-gray-500">{t('common.loading')}</p>
      ) : customers.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow dark:shadow-gray-700/50 p-12 text-center transition-colors duration-200">
          <p className="text-5xl mb-4">👤</p>
          <p className="text-gray-400 dark:text-gray-500">{t('customers.empty')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {customers.map(customer => {
            const customerBookings = getCustomerBookings(customer.id)
            const lastBooking = getLastBooking(customer.id)

            return (
              <div
                key={customer.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-700/50 border border-gray-100 dark:border-gray-700 p-5 hover:shadow-md dark:hover:shadow-lg transition-colors duration-200"
              >
                {/* Header card */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                      {customer.name} {customer.surname}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      📞 {customer.phone || t('customers.noPhone')}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => openEdit(customer)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                    >
                      {t('common.edit')}
                    </button>
                    <button
                      onClick={() => handleDelete(customer.id)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                    >
                      {t('common.delete')}
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 transition-colors duration-200">
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
                      {t('customers.totalBookings')}
                    </p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      {customerBookings.length}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 transition-colors duration-200">
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
                      {t('customers.lastBooking')}
                    </p>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      {lastBooking ? formatDate(lastBooking.startTime) : '-'}
                    </p>
                  </div>
                </div>

                {/* Notes */}
                {customer.notes && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl transition-colors duration-200">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">
                      {t('customers.customerNotes')}
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-300">{customer.notes}</p>
                  </div>
                )}

                {/* Storico prenotazioni */}
                {customerBookings.length > 0 && (
                  <div className="mt-5">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                      {t('customers.bookingHistory')}
                    </p>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {customerBookings
                        .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
                        .map(booking => (
                          <div
                            key={booking.id}
                            className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-xl px-3 py-2 transition-colors duration-200"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                {formatDate(booking.startTime)}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                {t(`bookings.statuses.${booking.status}`)}
                              </p>
                            </div>
                            <div className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl dark:shadow-gray-700/50 w-full max-w-md p-6 space-y-4 transition-colors duration-200">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              {editingCustomer ? t('customers.editTitle') : t('customers.newTitle')}
            </h2>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {t('customers.name')} *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('customers.namePlaceholder')}
              />
            </div>

            {/* Cognome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {t('customers.surname')}
              </label>
              <input
                type="text"
                value={form.surname}
                onChange={e => handleChange('surname', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('customers.surnamePlaceholder')}
              />
            </div>

            {/* Telefono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {t('customers.phone')} *
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => handleChange('phone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('customers.phonePlaceholder')}
              />
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {t('customers.notes')}
              </label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={e => handleChange('notes', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('customers.notesPlaceholder')}
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