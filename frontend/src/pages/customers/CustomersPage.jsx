import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { useIsMobile } from '../../hooks/useIsMobile'

export default function CustomersPage() {
  const { t } = useTranslation()
  const isMobile = useIsMobile()

  const [customers, setCustomers] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [searchQuery, setSearchQuery] = useState('')

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
      const msg = t('errors.required')
      setError(msg)
      toast.error(msg)
      return
    }

    try {
      const existingCustomer = customers.find(
        c => c.phone === form.phone && c.id !== editingCustomer?.id
      )

      if (existingCustomer && !editingCustomer) {
        const msg = t('customers.phoneExists')
        setError(msg)
        toast.error(msg)
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

      toast.success(t('common.saveSuccess'))
      setShowForm(false)
      loadAll()
    } catch (err) {
      const msg = err.response?.data?.message || t('errors.serverError')
      setError(msg)
      toast.error(msg)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm(t('customers.confirmDelete'))) return

    try {
      await api.delete(`/api/customers/${id}`)
      toast.success(t('common.deleteSuccess'))
      loadAll()
    } catch (err) {
      toast.error(t('common.deleteError'))
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

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers
    
    const query = searchQuery.toLowerCase().trim()
    
    return customers.filter(customer => {
      const name = (customer.name || '').toLowerCase()
      const surname = (customer.surname || '').toLowerCase()
      const phone = (customer.phone || '').toLowerCase()
      const email = (customer.email || '').toLowerCase()
      
      return (
        name.includes(query) ||
        surname.includes(query) ||
        phone.includes(query) ||
        email.includes(query) ||
        `${name} ${surname}`.includes(query)
      )
    })
  }, [customers, searchQuery])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={`flex items-center ${isMobile ? 'justify-between' : 'justify-between'} gap-2 flex-wrap`}>
        <div>
          <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-800 dark:text-white`}>
            {t('customers.title')}
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            {t('customers.subtitle')}
          </p>
        </div>

        <button
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
          {isMobile ? '+' : t('customers.new')}
        </button>
      </div>

      {/* 🔍 Barra di ricerca */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('customers.searchPlaceholder')}
          className="
            w-full pl-10 pr-10 py-3 
            bg-white dark:bg-gray-800 
            border border-gray-200 dark:border-gray-700 
            rounded-xl text-sm 
            text-gray-800 dark:text-white 
            placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-blue-500
            transition-colors duration-200
          "
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Risultati ricerca */}
      {searchQuery && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('customers.searchResults', { 
            count: filteredCustomers.length, 
            total: customers.length 
          })}
        </p>
      )}

      {/* Lista clienti */}
      {loading ? (
        <p className="text-gray-400 dark:text-gray-500">{t('common.loading')}</p>
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow dark:shadow-gray-700/50 p-8 md:p-12 text-center transition-colors duration-200">
          <p className="text-4xl md:text-5xl mb-4">🔍</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            {searchQuery 
              ? t('customers.searchNoResults') 
              : t('customers.empty')
            }
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              {t('customers.clearSearch')}
            </button>
          )}
        </div>
      ) : (
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-2'}`}>
          {filteredCustomers.map(customer => {
            const customerBookings = getCustomerBookings(customer.id)
            const lastBooking = getLastBooking(customer.id)

            const highlightMatch = (text, query) => {
              if (!query || !text) return text
              const regex = new RegExp(`(${query})`, 'gi')
              return text.split(regex).map((part, i) => 
                regex.test(part) ? (
                  <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">
                    {part}
                  </mark>
                ) : part
              )
            }

            return (
              <div
                key={customer.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-700/50 border border-gray-100 dark:border-gray-700 p-4 md:p-5 hover:shadow-md dark:hover:shadow-lg transition-colors duration-200 touch-pan-y"
              >
                {/* Header card */}
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white truncate">
                      {searchQuery 
                        ? highlightMatch(`${customer.name} ${customer.surname}`, searchQuery)
                        : `${customer.name} ${customer.surname}`
                      }
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                      📞 <a href={`tel:${customer.phone}`} className="hover:underline">{customer.phone || t('customers.noPhone')}</a>
                    </p>
                    {customer.email && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                        ✉️ <a href={`mailto:${customer.email}`} className="hover:underline">{customer.email}</a>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 md:gap-3 ml-2">
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
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 md:p-4 transition-colors duration-200">
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
                      {t('customers.totalBookings')}
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
                      {customerBookings.length}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 md:p-4 transition-colors duration-200">
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
                  <div className="mt-4 p-3 md:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl transition-colors duration-200">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">
                      {t('customers.customerNotes')}
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-300">{customer.notes}</p>
                  </div>
                )}

                {/* Storico prenotazioni */}
                {customerBookings.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                      {t('customers.bookingHistory')}
                    </p>
                    <div className="space-y-2 max-h-40 md:max-h-48 overflow-y-auto pr-1">
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
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-0 md:p-4">
          <div className={`bg-white dark:bg-gray-800 w-full md:max-w-md p-6 space-y-4 overflow-y-auto transition-colors duration-200 ${
            isMobile
              ? 'rounded-t-3xl max-h-[90vh]'
              : 'rounded-2xl shadow-2xl max-h-[90vh]'
          }`}>

            {isMobile && (
              <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto -mt-2 mb-2" />
            )}

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