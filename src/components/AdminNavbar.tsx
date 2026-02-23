import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Bed, Calendar, Users, Wrench, BarChart3, ArrowLeft, LogOut } from 'lucide-react'
import { clearAdminToken } from '../lib/auth'

export default function AdminNavbar() {
  const location = useLocation()

  const links = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/quartos', label: 'Quartos', icon: Bed },
    { to: '/admin/reservas', label: 'Reservas', icon: Calendar },
    { to: '/admin/hospedes', label: 'Hóspedes', icon: Users },
    { to: '/admin/servicos', label: 'Serviços', icon: Wrench },
    { to: '/admin/relatorios', label: 'Relatórios', icon: BarChart3 },
  ]

  function handleLogout() {
    clearAdminToken()
  }

  return (
    <nav className="fixed top-16 left-0 right-0 bg-slate-900 shadow-lg z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center space-x-4 overflow-x-auto">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = location.pathname === link.to
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{link.label}</span>
                </Link>
              )
            })}
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">Voltar ao Site</span>
            </Link>
            <Link
              to="/admin/login"
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-slate-300 hover:bg-red-700/20 hover:text-red-200 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">Sair</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
