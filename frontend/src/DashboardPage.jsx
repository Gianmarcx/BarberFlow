import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import api from './api/axios'

export default function DashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    api.get('/api/bookings')
      .then(res => {
        const todayBookings = res.data.filter(b => {
          const bookingDate = b.startTime?.split('T')[0]
          return bookingDate === today
        })
        todayBookings.sort((a, b) => a.startTime.localeCompare(b.startTime))
        setBookings(todayBookings)
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    CONFIRMED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    CANCELLED: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    COMPLETED: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
  }

  const formatTime = (datetime) => {
    if (!datetime) return ''
    return datetime.split('T')[1]?.slice(0, 5)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          {t('dashboard.title')}
        </h1>
        <button
          onClick={() => navigate('/bookings')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition text-sm font-medium shadow dark:shadow-gray-700/50"
        >
          {t('dashboard.newBooking')}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Today */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow dark:shadow-gray-700/50 transition-colors duration-200">
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{bookings.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.totalToday')}</p>
        </div>
        {/* Confirmed */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow dark:shadow-gray-700/50 transition-colors duration-200">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {bookings.filter(b => b.status === 'CONFIRMED').length}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('bookings.statuses.CONFIRMED')}</p>
        </div>
        {/* Pending */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow dark:shadow-gray-700/50 transition-colors duration-200">
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {bookings.filter(b => b.status === 'PENDING').length}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('bookings.statuses.PENDING')}</p>
        </div>
        {/* Cancelled */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow dark:shadow-gray-700/50 transition-colors duration-200">
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {bookings.filter(b => b.status === 'CANCELLED').length}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('bookings.statuses.CANCELLED')}</p>
        </div>
      </div>

      {/* Lista prenotazioni */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-700/50 p-6 transition-colors duration-200">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
          {t('dashboard.title')}
        </h2>

        {loading ? (
          <p className="text-gray-400 dark:text-gray-500 text-sm">{t('common.loading')}</p>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-5xl mb-4">📅</p>
            <p className="text-gray-400 dark:text-gray-500">{t('dashboard.noBookings')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map(booking => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
                onClick={() => navigate('/bookings')}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-gray-800 dark:bg-gray-600 text-white text-sm font-bold px-3 py-2 rounded-lg">
                    {formatTime(booking.startTime)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white text-sm">
                      {t('dashboard.customer')} #{booking.customerId}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {formatTime(booking.startTime)} → {formatTime(booking.endTime)}
                    </p>
                    {booking.notes && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 italic">{booking.notes}</p>
                    )}
                  </div>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[booking.status]}`}>
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