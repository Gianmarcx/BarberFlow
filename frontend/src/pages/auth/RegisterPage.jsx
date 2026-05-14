import { Link } from 'react-router-dom'

export default function RegisterPage() {
  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg mt-16">
      <h1 className="text-2xl font-bold mb-4">Registrazione</h1>
      <p className="mb-6 text-sm text-gray-600">
        Pagina di registrazione di prova. Implementala secondo le tue esigenze.
      </p>
      <Link
        to="/login"
        className="inline-block mt-4 text-blue-600 hover:underline"
      >
        Vai al login
      </Link>
    </div>
  )
}
