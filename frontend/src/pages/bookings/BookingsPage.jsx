import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { useIsMobile } from '../../hooks/useIsMobile'

const HOUR_HEIGHT = 130
const START_HOUR = 8
const END_HOUR = 21

const statusColors = {
  PENDING: 'bg-yellow-100 border-yellow-400 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-600 dark:text-yellow-400',
  CONFIRMED: 'bg-green-100 border-green-400 text-green-800 dark:bg-green-900/30 dark:border-green-600 dark:text-green-400',
  CANCELLED: 'bg-red-100 border-red-400 text-red-600 line-through dark:bg-red-900/30 dark:border-red-600 dark:text-red-400',
  COMPLETED: 'bg-gray-100 border-gray-400 text-gray-600 dark:bg-gray-700 dark:border-gray-500 dark:text-gray-300'
}

function getWeekDays(date) {
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(date.setDate(diff))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function getTopPosition(startTime) {
  const time = startTime.split('T')[1]?.slice(0, 5) || '00:00'
  const minutes = timeToMinutes(time)
  return ((minutes - START_HOUR * 60) / 60) * HOUR_HEIGHT
}

function getHeight(startTime, endTime) {
  const startMin = timeToMinutes(startTime.split('T')[1]?.slice(0, 5) || '00:00')
  const endMin = timeToMinutes(endTime.split('T')[1]?.slice(0, 5) || '00:00')
  return ((endMin - startMin) / 60) * HOUR_HEIGHT
}

export default function BookingsPage() {
  const { t, i18n } = useTranslation()  // ✅ Aggiunto i18n
  const isMobile = useIsMobile()

  const [hoveredBooking, setHoveredBooking] = useState(null)
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 })
  const [bookings, setBookings] = useState([])
  const [customers, setCustomers] = useState([])
  const [services, setServices] = useState([])
  const [barbers, setBarbers] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [weekDays, setWeekDays] = useState([])
  const [selectedBarber, setSelectedBarber] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingBooking, setEditingBooking] = useState(null)
  const [availableSlots, setAvailableSlots] = useState([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const scrollRef = useRef(null)
  const [whatsappReminders, setWhatsappReminders] = useState(true)

  // ✅ RIMOSSO customMessage dallo stato
  const [form, setForm] = useState({
    customerName: '', customerSurname: '', customerPhone: '',
    customerId: null, barberId: '', serviceId: '',
    date: '', startTime: '', status: 'PENDING', notes: ''
  })

  useEffect(() => { loadAll() }, [])
  useEffect(() => { setWeekDays(getWeekDays(new Date(currentDate))) }, [currentDate])
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [])

  const loadAll = async () => {
    try {
      const [bookingsRes, customersRes, servicesRes, barbersRes] = await Promise.all([
        api.get('/api/bookings'),
        api.get('/api/customers'),
        api.get('/api/services'),
        api.get('/api/barbers')
      ])
      setBookings(bookingsRes.data)
      setCustomers(customersRes.data)
      setServices(servicesRes.data)
      setBarbers(barbersRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadSlots = async (date, serviceId, barberId) => {
    if (!date || !serviceId || !barberId) return
    try {
      const res = await api.get('/api/bookings/available', {
        params: { date, serviceId, barberId }
      })
      setAvailableSlots(res.data)
    } catch {
      setAvailableSlots([])
    }
  }

  const handleFormChange = (field, value) => {
    const updated = { ...form, [field]: value }
    setForm(updated)
    if (['date', 'serviceId', 'barberId'].includes(field)) {
      loadSlots(updated.date, updated.serviceId, updated.barberId)
    }
  }

  const prevWeek = () => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() - 7)
    setCurrentDate(d)
  }

  const nextWeek = () => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() + 7)
    setCurrentDate(d)
  }

  const prevDay = () => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() - 1)
    setCurrentDate(d)
  }

  const nextDay = () => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() + 1)
    setCurrentDate(d)
  }

  const goToToday = () => setCurrentDate(new Date())

  const openNew = (date = '', time = '') => {
    setForm({
      customerName: '', customerSurname: '', customerPhone: '',
      customerId: null, barberId: '', serviceId: '',
      date, startTime: time, status: 'PENDING', notes: ''
    })
    setEditingBooking(null)
    setAvailableSlots([])
    setError('')
    setShowForm(true)
  }

  const openEdit = (booking, e) => {
    e.stopPropagation()
    const customer = customers.find(c => c.id === booking.customerId)
    const date = booking.startTime?.split('T')[0]
    const time = booking.startTime?.split('T')[1]?.slice(0, 5)
    setForm({
      customerName: customer?.name || '',
      customerSurname: customer?.surname || '',
      customerPhone: customer?.phone || '',
      customerId: booking.customerId,
      barberId: booking.barberId?.toString() || '',
      serviceId: booking.serviceId?.toString() || '',
      date, startTime: time,
      status: booking.status,
      notes: booking.notes || ''
    })
    setEditingBooking(booking)
    loadSlots(date, booking.serviceId, booking.barberId)
    setError('')
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.customerName || !form.serviceId || !form.date || !form.startTime || !form.barberId) {
      const msg = t('errors.required')
      setError(msg)
      toast.error(msg)
      return
    }
    try {
      setSaving(true)
      let customerId = form.customerId
      if (!editingBooking) {
        const customerRes = await api.post('/api/customers', {
          name: form.customerName,
          surname: form.customerSurname,
          phone: form.customerPhone
        })
        customerId = customerRes.data.id
      }

      // ✅ Costruisci messaggio strutturato tradotto automaticamente
      const formattedDate = new Date(form.date).toLocaleDateString(i18n.language, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      })
      const formattedTime = form.startTime

      const whatsappMessage = t('whatsapp.defaultConfirmation', {
        name: form.customerName,
        date: formattedDate,
        time: formattedTime
      })

      const payload = {
        customerId,
        barberId: parseInt(form.barberId),
        serviceId: parseInt(form.serviceId),
        startTime: `${form.date}T${form.startTime}:00`,
        status: form.status,
        notes: form.notes,
        whatsappMessage  // ✅ Invia il messaggio strutturato
      }

      if (editingBooking) {
        await api.put(`/api/bookings/${editingBooking.id}`, payload)
      } else {
        await api.post('/api/bookings', payload)
      }

      // ✅ Invia WhatsApp se abilitato
      if (whatsappReminders && form.customerPhone) {
        api.post('/api/bookings/whatsapp', {
          customerId,
          phone: form.customerPhone,
          message: whatsappMessage
        }).catch(err => console.warn('WhatsApp send failed:', err))
      }

      toast.success(t('common.saveSuccess'))
      setShowForm(false)
      loadAll()
    } catch (err) {
      const msg = err.response?.data?.message || t('common.saveError')
      setError(msg)
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm(t('bookings.confirmDelete'))) return
    try {
      await api.delete(`/api/bookings/${id}`)
      toast.success(t('common.deleteSuccess'))
      loadAll()
    } catch (err) {
      toast.error(t('common.deleteError'))
      console.error(err)
    }
  }

  const getCustomerName = (id) => {
    const c = customers.find(c => c.id === id)
    return c ? `${c.name} ${c.surname || ''}`.trim() : `#${id}`
  }

  const getServiceName = (id) => {
    const s = services.find(s => s.id === id)
    return s ? s.name : `#${id}`
  }

  const getBarberName = (id) => {
    const b = barbers.find(b => b.id === id)
    return b ? b.name : `#${id}`
  }

  const isToday = (date) => new Date().toDateString() === date.toDateString()

  const getBookingsForDay = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return bookings.filter(b => {
      const matchesDate = b.startTime?.split('T')[0] === dateStr
      const matchesBarber = selectedBarber === 'all' || b.barberId === parseInt(selectedBarber)
      return matchesDate && matchesBarber
    })
  }

  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)
  const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

  const formatWeekRange = () => {
    if (weekDays.length === 0) return ''
    const first = weekDays[0]
    const last = weekDays[6]
    return `${first.getDate()} ${first.toLocaleString('en', { month: 'short' })} – ${last.getDate()} ${last.toLocaleString('en', { month: 'short' })} ${last.getFullYear()}`
  }

  const formatDayMobile = () => {
    return currentDate.toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long'
    })
  }

  const renderDayColumn = (day, showClick = true) => {
    const dayBookings = getBookingsForDay(day)
    const dateStr = day.toISOString().split('T')[0]

    return (
      <div
        className={`flex-1 border-l border-gray-100 dark:border-gray-700 relative ${showClick ? 'cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-700/30' : ''} transition-colors`}
        onClick={showClick ? () => openNew(dateStr, '') : undefined}
      >
        {hours.map(hour => (
          <div key={hour} className="border-t border-gray-100 dark:border-gray-700" style={{ height: `${HOUR_HEIGHT}px` }} />
        ))}

        {isToday(day) && (() => {
          const now = new Date()
          const minutes = now.getHours() * 60 + now.getMinutes()
          const startMinutes = START_HOUR * 60
          if (minutes < startMinutes || minutes > END_HOUR * 60) return null
          const top = ((minutes - startMinutes) / 60) * HOUR_HEIGHT
          return (
            <div className="absolute left-0 right-0 z-10 flex items-center pointer-events-none" style={{ top: `${top}px` }}>
              <div className="w-2 h-2 rounded-full bg-red-500 -ml-1" />
              <div className="flex-1 h-px bg-red-500" />
            </div>
          )
        })()}

        {dayBookings.map(booking => {
          const top = getTopPosition(booking.startTime)
          const height = getHeight(booking.startTime, booking.endTime)
          const colorClass = statusColors[booking.status] || statusColors.PENDING
          const startTime = booking.startTime?.split('T')[1]?.slice(0, 5)
          const endTime = booking.endTime?.split('T')[1]?.slice(0, 5)

          return (
            <div
              key={booking.id}
              className={`absolute left-1 right-1 rounded-lg border-l-4 px-2 py-1 overflow-hidden cursor-pointer hover:opacity-90 transition ${colorClass}`}
              style={{ top: `${top}px`, height: `${Math.max(height, 32)}px` }}
              onClick={e => openEdit(booking, e)}
              onMouseEnter={(e) => { setHoveredBooking(booking); setHoverPos({ x: e.clientX, y: e.clientY }) }}
              onMouseMove={(e) => setHoverPos({ x: e.clientX, y: e.clientY })}
              onMouseLeave={() => setHoveredBooking(null)}
            >
              <p className="text-xs font-bold leading-tight truncate">
                {startTime} - {endTime} · {getCustomerName(booking.customerId)}
              </p>
              <p className="text-xs leading-tight truncate opacity-80">✂️ {getServiceName(booking.serviceId)}</p>
              <p className="text-xs leading-tight truncate opacity-70">👤 {getBarberName(booking.barberId)}</p>
              {booking.notes && <p className="text-xs leading-tight truncate opacity-60 italic">📝 {booking.notes}</p>}
              <span className="text-xs font-medium opacity-80">{t(`bookings.statuses.${booking.status}`)}</span>
            </div>
          )
        })}
      </div>
    )
  }

  if (loading) return <p className="text-gray-400 dark:text-gray-500">{t('common.loading')}</p>

  return (
    <div className={`flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow dark:shadow-gray-700/50 overflow-hidden transition-colors duration-200 ${
      isMobile ? 'h-[calc(100vh-10rem)]' : 'h-[calc(100vh-6rem)]'
    }`}>

      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            {t('bookings.today')}
          </button>
          <div className="flex items-center gap-1">
            <button 
              onClick={isMobile ? prevDay : prevWeek} 
              aria-label={isMobile ? t('bookings.prevDay') : t('bookings.prevWeek')}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={isMobile ? nextDay : nextWeek}
              aria-label={isMobile ? t('bookings.nextDay') : t('bookings.nextWeek')}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <span className="text-sm font-semibold text-gray-800 dark:text-white">
            {isMobile ? formatDayMobile() : formatWeekRange()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedBarber}
            onChange={e => setSelectedBarber(e.target.value)}
            className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-xs text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t('bookings.allBarbers')}</option>
            {barbers.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <button
            onClick={() => openNew(currentDate.toISOString().split('T')[0], '')}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs font-medium shadow"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {!isMobile && t('bookings.new')}
          </button>
        </div>
      </div>

      {!isMobile && (
        <div className="flex border-b border-gray-100 dark:border-gray-700">
          <div className="w-16 flex-shrink-0" />
          {weekDays.map((day, i) => (
            <div key={i} className="flex-1 text-center py-3 border-l border-gray-100 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                {t(`schedule.days.${dayNames[i]}`)}
              </p>
              <p className={`text-lg font-semibold mt-0.5 w-8 h-8 mx-auto flex items-center justify-center rounded-full ${
                isToday(day) ? 'bg-blue-600 text-white' : 'text-gray-800 dark:text-white'
              }`}>
                {day.getDate()}
              </p>
            </div>
          ))}
        </div>
      )}

      {isMobile && (
        <div className="flex border-b border-gray-100 dark:border-gray-700">
          <div className="w-12 flex-shrink-0" />
          <div className="flex-1 text-center py-2 border-l border-gray-100 dark:border-gray-700">
            <p className={`text-lg font-semibold w-8 h-8 mx-auto flex items-center justify-center rounded-full ${
              isToday(currentDate) ? 'bg-blue-600 text-white' : 'text-gray-800 dark:text-white'
            }`}>
              {currentDate.getDate()}
            </p>
          </div>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-auto touch-pan-y">
        <div className="flex" style={{ height: `${HOUR_HEIGHT * (END_HOUR - START_HOUR)}px` }}>

          <div className={`${isMobile ? 'w-12' : 'w-16'} flex-shrink-0 relative`}>
            {hours.map(hour => (
              <div
                key={hour}
                className="absolute w-full text-right pr-1"
                style={{ top: `${(hour - START_HOUR) * HOUR_HEIGHT - 8}px` }}
              >
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                </span>
              </div>
            ))}
          </div>

          {!isMobile && weekDays.map((day, i) => (
            <div key={i} className="flex-1">
              {renderDayColumn(day)}
            </div>
          ))}

          {isMobile && renderDayColumn(currentDate)}

        </div>
      </div>

      {!isMobile && hoveredBooking && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl dark:shadow-gray-700/50 border border-gray-100 dark:border-gray-700 p-4 w-64 pointer-events-none transition-colors duration-200"
          style={{
            left: hoverPos.x + 16,
            top: hoverPos.y - 8,
            transform: hoverPos.x > window.innerWidth - 280 ? 'translateX(-110%)' : 'none'
          }}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="font-bold text-gray-800 dark:text-white text-sm truncate">
                {getCustomerName(hoveredBooking.customerId)}
              </p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${statusColors[hoveredBooking.status]}`}>
                {t(`bookings.statuses.${hoveredBooking.status}`)}
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <p>🕐 {hoveredBooking.startTime?.split('T')[1]?.slice(0, 5)} - {hoveredBooking.endTime?.split('T')[1]?.slice(0, 5)}</p>
              <p>✂️ {getServiceName(hoveredBooking.serviceId)}</p>
              <p>👤 {getBarberName(hoveredBooking.barberId)}</p>
              {hoveredBooking.notes && <p>📝 {hoveredBooking.notes}</p>}
              {hoveredBooking.priceSnapshot && <p>💶 €{hoveredBooking.priceSnapshot}</p>}
            </div>
          </div>
        </div>
      )}

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
              {editingBooking ? t('common.edit') : t('bookings.new')}
            </h2>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {!editingBooking && (
              <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">👤 {t('customers.title')}</p>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={form.customerName}
                    onChange={e => handleFormChange('customerName', e.target.value)}
                    placeholder={t('customers.name') + ' *'}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={form.customerSurname}
                    onChange={e => handleFormChange('customerSurname', e.target.value)}
                    placeholder={t('customers.surname')}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <input
                  type="tel"
                  value={form.customerPhone}
                  onChange={e => handleFormChange('customerPhone', e.target.value)}
                  placeholder={t('customers.phone')}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('bookings.barber')} *</label>
              <select value={form.barberId} onChange={e => handleFormChange('barberId', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">-- {t('bookings.selectBarber')} --</option>
                {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('bookings.service')} *</label>
              <select value={form.serviceId} onChange={e => handleFormChange('serviceId', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">-- {t('bookings.service')} --</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.duration} min - €{s.price})</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('bookings.date')} *</label>
              <input type="date" value={form.date} onChange={e => handleFormChange('date', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {availableSlots.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{t('bookings.time')} *</label>
                <div className="grid grid-cols-4 gap-2">
                  {availableSlots.map(slot => (
                    <button key={slot} onClick={() => handleFormChange('startTime', slot.slice(0, 5))}
                      className={`py-2 rounded-lg text-sm font-medium transition ${
                        form.startTime === slot.slice(0, 5)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}>
                      {slot.slice(0, 5)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {availableSlots.length === 0 && form.date && form.serviceId && form.barberId && (
              <p className="text-sm text-red-500 dark:text-red-400">{t('bookings.noSlotsAvailable')}</p>
            )}

            {editingBooking && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('bookings.status')}</label>
                <select value={form.status} onChange={e => handleFormChange('status', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].map(s => (
                    <option key={s} value={s}>{t(`bookings.statuses.${s}`)}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('bookings.notes')}</label>
              <textarea value={form.notes} onChange={e => handleFormChange('notes', e.target.value)} rows={2}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('bookings.notesPlaceholder')} />
            </div>

            {/* Toggle WhatsApp Reminder */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={whatsappReminders} 
                  onChange={(e) => setWhatsappReminders(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600"></div>
              </label>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {t('bookings.whatsappReminder')} 📱
              </span>
            </div>

            {/* ✅ RIMOSSO: textarea customMessage */}

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                {t('common.cancel')}
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50">
                {saving ? t('common.loading') : t('common.save')}
              </button>
            </div>

            {editingBooking && (
              <button
                onClick={(e) => { handleDelete(editingBooking.id, e); setShowForm(false) }}
                className="w-full py-2 text-red-500 dark:text-red-400 hover:text-red-700 text-sm font-medium transition">
                {t('common.delete')}
              </button>
            )}

          </div>
        </div>
      )}

    </div>
  )
}