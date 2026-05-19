import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardPage from './DashboardPage'
import BookingsPage from './pages/bookings/BookingsPage'
import CustomersPage from './pages/customers/CustomersPage'
import ServicesPage from './pages/services/ServicesPage'
import SchedulePage from './pages/schedule/SchedulePage'
import BarberPage from './pages/barber/BarberPage'
import Layout from './components/Layout'

function PrivateRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      <Route path="/" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route index element={<DashboardPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="services" element={<ServicesPage />} />
        
        
        <Route path="barbers" element={<BarberPage />} />
        
        <Route path="schedule" element={<SchedulePage />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}