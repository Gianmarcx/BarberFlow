import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

const parseJwtPayload = (token) => {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null

  try {
    let payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    payloadBase64 += '='.repeat((4 - payloadBase64.length % 4) % 4)
    const decoded = decodeURIComponent(
      atob(payloadBase64)
        .split('')
        .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join('')
    )
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

const getStoredToken = () => {
  const token = localStorage.getItem('token')
  const payload = parseJwtPayload(token)
  if (!payload || typeof payload.exp !== 'number') {
    localStorage.removeItem('token')
    return null
  }

  const isExpired = Date.now() / 1000 > payload.exp
  if (isExpired) {
    localStorage.removeItem('token')
    return null
  }

  return token
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getStoredToken)

  const login = (newToken) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: Boolean(token), login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}