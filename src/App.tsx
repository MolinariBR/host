import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import LandingPage from './pages/LandingPage'
import BookingPage from './pages/BookingPage'
import AdminDashboard from './pages/AdminDashboard'
import RoomsManagement from './pages/admin/RoomsManagement'
import ReservationsManagement from './pages/admin/ReservationsManagement'
import GuestsManagement from './pages/admin/GuestsManagement'
import ServicesManagement from './pages/admin/ServicesManagement'
import ReportsPage from './pages/admin/ReportsPage'
import BookingConfirmation from './pages/BookingConfirmation'
import UserLogin from './pages/UserLogin'
import AdminLogin from './pages/AdminLogin'
import AboutPage from './pages/AboutPage'
import RequireAdminAuth from './components/RequireAdminAuth'

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/sobre" element={<AboutPage />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/reservar" element={<BookingPage />} />
        <Route path="/confirmacao" element={<BookingConfirmation />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<RequireAdminAuth />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/quartos" element={<RoomsManagement />} />
          <Route path="/admin/reservas" element={<ReservationsManagement />} />
          <Route path="/admin/hospedes" element={<GuestsManagement />} />
          <Route path="/admin/servicos" element={<ServicesManagement />} />
          <Route path="/admin/relatorios" element={<ReportsPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
