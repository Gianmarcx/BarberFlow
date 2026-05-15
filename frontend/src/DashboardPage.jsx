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
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-600',
    COMPLETED: 'bg-gray-100 text-gray-600'
  }

  const formatTime = (datetime) => {
    if (!datetime) return ''
    return datetime.split('T')[1]?.slice(0, 5)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          onClick={() => navigate('/bookings')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          {t('dashboard.newBooking')}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="text-2xl font-bold text-gray-800">{bookings.length}</p>
          <p className="text-sm text-gray-500">Total Today</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="text-2xl font-bold text-green-600">{bookings.filter(b => b.status === 'CONFIRMED').length}</p>
          <p className="text-sm text-gray-500">{t('bookings.statuses.CONFIRMED')}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="text-2xl font-bold text-yellow-600">{bookings.filter(b => b.status === 'PENDING').length}</p>
          <p className="text-sm text-gray-500">{t('bookings.statuses.PENDING')}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="text-2xl font-bold text-red-600">{bookings.filter(b => b.status === 'CANCELLED').length}</p>
          <p className="text-sm text-gray-500">{t('bookings.statuses.CANCELLED')}</p>
        </div>
      </div>

      {/* Lista prenotazioni */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">{t('dashboard.title')}</h2>

        {loading ? (
          <p className="text-gray-400 text-sm">{t('common.loading')}</p>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-5xl mb-4">📅</p>
            <p className="text-gray-400">{t('dashboard.noBookings')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map(booking => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition cursor-pointer"
                onClick={() => navigate('/bookings')}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-gray-800 text-white text-sm font-bold px-3 py-2 rounded-lg">
                    {formatTime(booking.startTime)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      Cliente #{booking.customerId}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatTime(booking.startTime)} → {formatTime(booking.endTime)}
                    </p>
                    {booking.notes && (
                      <p className="text-xs text-gray-400 italic">{booking.notes}</p>
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