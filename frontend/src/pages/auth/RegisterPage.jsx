import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'

export default function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Le password non coincidono')
      return
    }

    if (password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri')
      return
    }

    setLoading(true)

    try {
      await api.post('/api/auth/register', { email, password })
      navigate('/login')
    } catch (err) {
      if (err.response?.status === 400) {
        setError('Email già registrata')
      } else {
        setError(t('errors.serverError'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm">

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* Header colorato */}
          <div
            className="px-8 pt-10 pb-16 text-white"
            style={{
              background: 'linear-gradient(135deg, #0a2a43 0%, #133c5a 50%, #b92b27 100%)'
            }}
          >
            <img
              src="/logo.png"
              alt="BarberFlow"
              className="h-12 mb-4 drop-shadow-md"
            />
            <h1 className="text-3xl font-extrabold leading-tight">
              Create<br />Account
            </h1>
            <p className="text-white/70 text-sm mt-2">
              Join BarberFlow today!
            </p>
          </div>

          {/* Form */}
          <div className="-mt-6 bg-white rounded-t-3xl px-8 pt-8 pb-8">

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder={t('auth.email')}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
              />

              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder={t('auth.password')}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
              />

              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                placeholder="Conferma Password"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 text-white font-semibold rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg hover:opacity-90 disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #0a2a43 0%, #133c5a 50%, #b92b27 100%)'
                }}
              >
                {loading ? t('common.loading') : t('auth.registerButton')}
              </button>

            </form>

            <p className="text-center text-sm text-gray-400 mt-6">
              {t('auth.hasAccount')}{' '}
              <Link
                to="/login"
                className="font-bold underline"
                style={{ color: '#b92b27' }}
              >
                {t('auth.loginButton')}
              </Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  )
}