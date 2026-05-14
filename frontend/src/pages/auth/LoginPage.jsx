import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = () => {
    login('demo-token')
    navigate('/')
  }

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg mt-16">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <p className="mb-6 text-sm text-gray-600">
        Usa il pulsante per accedere con un token di prova.
      </p>
      <button
        onClick={handleLogin}
        className="w-full py-2 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
      >
        Accedi
      </button>
    </div>
  )
}
