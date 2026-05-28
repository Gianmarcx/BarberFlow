import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import api from './api/axios'
import { useIsMobile } from './hooks/useIsMobile'

export default function DashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const [bookings, setBookings] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [stats, setStats] = useState({
    totalBookingsToday: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    cancelledBookings: 0,
    totalRevenueToday: 0,
    currency: 'EUR'
  })

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [bookingsRes, statsRes, customersRes] = await Promise.all([
        api.get('/api/bookings'),
        api.get('/api/bookings/dashboard/stats'),
        api.get('/api/customers') 
      ])

      setCustomers(customersRes.data)

      const todayBookings = bookingsRes.data.filter(b => {
        const bookingDate = b.startTime?.split('T')[0]
        return bookingDate === today
      })
      
      todayBookings.sort((a, b) => a.startTime.localeCompare(b.startTime))
      
      setBookings(todayBookings)
      setStats(statsRes.data)
    } catch (err) {
      console.error('Error loading dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId)
    if (customer) {
      return `${customer.name} ${customer.surname || ''}`.trim()
    }
    return `#${customerId}`
  }

  const formatCurrency = (amount, currency = 'EUR') => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const formatTime = (datetime) => {
    if (!datetime) return ''
    return datetime.split('T')[1]?.slice(0, 5)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={`flex items-center ${isMobile ? 'justify-between' : 'justify-between'} gap-2`}>
        <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-800 dark:text-white`}>
          {t('dashboard.title')}
        </h1>
        
        {/* ✅ Bottone "Nuova Prenotazione" con hover effects premium */}
        <button
          onClick={() => navigate('/bookings')}
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
          {isMobile ? '+' : t('dashboard.newBooking')}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        
        {/* 💰 INCASSO TOTALE */}
        <div className="
          bg-white dark:bg-gray-800 
          rounded-xl p-3 
          shadow-sm dark:shadow-gray-700/50 
          border border-gray-100 dark:border-gray-700
          hover-card-premium hover:border-blue-200 dark:hover:border-blue-800
          cursor-default
        ">
          <p className="text-xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(stats.totalRevenueToday, stats.currency)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('dashboard.totalRevenue')}
          </p>
        </div>

        {/* Total Bookings */}
        <div className="
          bg-white dark:bg-gray-800 
          rounded-xl p-3 
          shadow-sm dark:shadow-gray-700/50 
          border border-gray-100 dark:border-gray-700
          hover-card-premium hover:border-blue-200 dark:hover:border-blue-800
          cursor-default
        ">
          <p className="text-xl font-bold text-gray-800 dark:text-white">
            {stats.totalBookingsToday}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('dashboard.totalToday')}
          </p>
        </div>

        {/* Confirmed */}
        <div className="
          bg-white dark:bg-gray-800 
          rounded-xl p-3 
          shadow-sm dark:shadow-gray-700/50 
          border border-gray-100 dark:border-gray-700
          hover-card-premium hover:border-blue-200 dark:hover:border-blue-800
          cursor-default
        ">
          <p className="text-xl font-bold text-green-600 dark:text-green-400">
            {stats.confirmedBookings}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('bookings.statuses.CONFIRMED')}
          </p>
        </div>

        {/* Pending */}
        <div className="
          bg-white dark:bg-gray-800 
          rounded-xl p-3 
          shadow-sm dark:shadow-gray-700/50 
          border border-gray-100 dark:border-gray-700
          hover-card-premium hover:border-blue-200 dark:hover:border-blue-800
          cursor-default
        ">
          <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
            {stats.pendingBookings}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('bookings.statuses.PENDING')}
          </p>
        </div>
      </div>

      {/* Lista prenotazioni */}
      <div className="
        bg-white dark:bg-gray-800 
        rounded-xl shadow-sm dark:shadow-gray-700/50 
        border border-gray-100 dark:border-gray-700
        p-4 md:p-6 
        hover-card-premium hover:border-blue-200 dark:hover:border-blue-800
        transition-all duration-200
      ">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
          {t('dashboard.title')}
        </h2>

        {loading ? (
          <p className="text-gray-400 dark:text-gray-500 text-sm">{t('common.loading')}</p>
        ) : bookings.length === 0 ? (
          <div className="text-center py-8 md:py-12">
            <p className="text-4xl md:text-5xl mb-4">📅</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">{t('dashboard.noBookings')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map(booking => (
              <div
                key={booking.id}
                className="
                  flex items-center justify-between 
                  p-3 md:p-4 
                  bg-gray-50 dark:bg-gray-700/50 
                  rounded-xl 
                  border border-transparent
                  hover-card-premium hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-blue-200 dark:hover:border-blue-800
                  cursor-pointer touch-pan-y
                "
                onClick={() => navigate('/bookings')}
              >
                <div className="flex items-center gap-3 md:gap-4 min-w-0">
                  <div className="bg-gray-800 dark:bg-gray-600 text-white text-xs md:text-sm font-bold px-2 md:px-3 py-1.5 md:py-2 rounded-lg flex-shrink-0">
                    {formatTime(booking.startTime)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">
                      {getCustomerName(booking.customerId)}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {formatTime(booking.startTime)} → {formatTime(booking.endTime)}
                    </p>
                    {booking.notes && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 italic truncate">{booking.notes}</p>
                    )}
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2 md:px-3 py-1 rounded-full flex-shrink-0 ${
                  booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  booking.status === 'CANCELLED' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                  'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {t(`bookings.statuses.${booking.status}`)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}