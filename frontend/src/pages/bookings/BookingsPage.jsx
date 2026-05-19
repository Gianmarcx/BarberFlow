import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'

export default function BookingsPage() {
  const { t } = useTranslation()

  const [bookings, setBookings] = useState([])
  const [customers, setCustomers] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBooking, setEditingBooking] = useState(null)
  const [availableSlots, setAvailableSlots] = useState([])
  const [error, setError] = useState('')
  const [savingCustomer, setSavingCustomer] = useState(false)

  const [form, setForm] = useState({
    // Dati cliente
    customerName: '',
    customerSurname: '',
    customerPhone: '',
    customerId: null,
    // Dati prenotazione
    serviceId: '',
    date: '',
    startTime: '',
    status: 'PENDING',
    notes: ''
  })

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    try {
      const [bookingsRes, customersRes, servicesRes] = await Promise.all([
        api.get('/api/bookings'),
        api.get('/api/customers'),
        api.get('/api/services')
      ])
      setBookings(bookingsRes.data.sort((a, b) => b.startTime.localeCompare(a.startTime)))
      setCustomers(customersRes.data)
      setServices(servicesRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadSlots = async (date, serviceId) => {
    if (!date || !serviceId) return
    try {
      const res = await api.get('/api/bookings/available', {
        params: { date, serviceId }
      })
      setAvailableSlots(res.data)
    } catch (err) {
      setAvailableSlots([])
    }
  }

  const handleFormChange = (field, value) => {
    const updated = { ...form, [field]: value }
    setForm(updated)
    if (field === 'date' || field === 'serviceId') {
      loadSlots(updated.date, updated.serviceId)
    }
  }

  const openNew = () => {
    setForm({
      customerName: '',
      customerSurname: '',
      customerPhone: '',
      customerId: null,
      serviceId: '',
      date: '',
      startTime: '',
      status: 'PENDING',
      notes: ''
    })
    setEditingBooking(null)
    setAvailableSlots([])
    setError('')
    setShowForm(true)
  }

  const openEdit = (booking) => {
    const customer = customers.find(c => c.id === booking.customerId)
    const date = booking.startTime?.split('T')[0]
    const time = booking.startTime?.split('T')[1]?.slice(0, 5)
    setForm({
      customerName: customer?.name || '',
      customerSurname: customer?.surname || '',
      customerPhone: customer?.phone || '',
      customerId: booking.customerId,
      serviceId: booking.serviceId,
      date,
      startTime: time,
      status: booking.status,
      notes: booking.notes || ''
    })
    setEditingBooking(booking)
    loadSlots(date, booking.serviceId)
    setError('')
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.customerName || !form.serviceId || !form.date || !form.startTime) {
      setError('Compila tutti i campi obbligatori')
      return
    }

    try {
      setSavingCustomer(true)
      let customerId = form.customerId

      // Se è una nuova prenotazione crea prima il cliente
      if (!editingBooking) {
        const customerRes = await api.post('/api/customers', {
          name: form.customerName,
          surname: form.customerSurname,
          phone: form.customerPhone
        })
        customerId = customerRes.data.id
      }

      const payload = {
        customerId,
        serviceId: parseInt(form.serviceId),
        startTime: `${form.date}T${form.startTime}:00`,
        status: form.status,
        notes: form.notes
      }

      if (editingBooking) {
        await api.put(`/api/bookings/${editingBooking.id}`, payload)
      } else {
        await api.post('/api/bookings', payload)
      }

      setShowForm(false)
      loadAll()
    } catch (err) {
      setError(err.response?.data?.message || t('errors.serverError'))
    } finally {
      setSavingCustomer(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm(t('bookings.confirmDelete'))) return
    try {
      await api.delete(`/api/bookings/${id}`)
      loadAll()
    } catch (err) {
      console.error(err)
    }
  }

  const formatTime = (datetime) => {
    if (!datetime) return ''
    return datetime.split('T')[1]?.slice(0, 5)
  }

  const formatDate = (datetime) => {
    if (!datetime) return ''
    return new Date(datetime).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    })
  }

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-600',
    COMPLETED: 'bg-gray-100 text-gray-600'
  }

  const getCustomerName = (id) => {
    const c = customers.find(c => c.id === id)
    return c ? `${c.name} ${c.surname || ''}` : `#${id}`
  }

  const getServiceName = (id) => {
    const s = services.find(s => s.id === id)
    return s ? s.name : `#${id}`
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('bookings.title')}</h1>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('bookings.new')}
        </button>
      </div>

      {/* Lista */}
      {loading ? (
        <p className="text-gray-400">{t('common.loading')}</p>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <p className="text-5xl mb-4">📅</p>
          <p className="text-gray-400">{t('bookings.empty')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {bookings.map((booking, i) => (
            <div
              key={booking.id}
              className={`flex items-center justify-between p-4 hover:bg-gray-50 transition ${i !== bookings.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className="bg-gray-800 text-white text-sm font-bold px-3 py-2 rounded-lg text-center min-w-[60px]">
                  {formatTime(booking.startTime)}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {getCustomerName(booking.customerId)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {getServiceName(booking.serviceId)} · {formatDate(booking.startTime)}
                  </p>
                  {booking.notes && (
                    <p className="text-xs text-gray-400 italic">{booking.notes}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[booking.status]}`}>
                  {t(`bookings.statuses.${booking.status}`)}
                </span>
                <button
                  onClick={() => openEdit(booking)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {t('common.edit')}
                </button>
                <button
                  onClick={() => handleDelete(booking.id)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  {t('common.delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">

            <h2 className="text-xl font-bold text-gray-800">
              {editingBooking ? t('common.edit') : t('bookings.new')}
            </h2>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Dati cliente — solo per nuova prenotazione */}
            {!editingBooking && (
              <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm font-semibold text-gray-700">👤 {t('customers.title')}</p>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={form.customerName}
                    onChange={e => handleFormChange('customerName', e.target.value)}
                    placeholder={t('customers.name') + ' *'}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={form.customerSurname}
                    onChange={e => handleFormChange('customerSurname', e.target.value)}
                    placeholder={t('customers.surname')}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <input
                  type="tel"
                  value={form.customerPhone}
                  onChange={e => handleFormChange('customerPhone', e.target.value)}
                  placeholder={t('customers.phone')}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Servizio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('bookings.service')} *
              </label>
              <select
                value={form.serviceId}
                onChange={e => handleFormChange('serviceId', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- {t('bookings.service')} --</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.duration} min - €{s.price})
                  </option>
                ))}
              </select>
            </div>

            {/* Data */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('bookings.date')} *
              </label>
              <input
                type="date"
                value={form.date}
                onChange={e => handleFormChange('date', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Slot disponibili */}
            {availableSlots.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('bookings.time')} *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {availableSlots.map(slot => (
                    <button
                      key={slot}
                      onClick={() => handleFormChange('startTime', slot.slice(0, 5))}
                      className={`py-2 rounded-lg text-sm font-medium transition ${
                        form.startTime === slot.slice(0, 5)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {slot.slice(0, 5)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {availableSlots.length === 0 && form.date && form.serviceId && (
              <p className="text-sm text-red-500">
                Nessuno slot disponibile per questa data
              </p>
            )}

            {/* Status — solo in modifica */}
            {editingBooking && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('bookings.status')}
                </label>
                <select
                  value={form.status}
                  onChange={e => handleFormChange('status', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].map(s => (
                    <option key={s} value={s}>{t(`bookings.statuses.${s}`)}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('bookings.notes')}
              </label>
              <textarea
                value={form.notes}
                onChange={e => handleFormChange('notes', e.target.value)}
                rows={2}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('bookings.notesPlaceholder')}
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
                disabled={savingCustomer}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {savingCustomer ? t('common.loading') : t('common.save')}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}