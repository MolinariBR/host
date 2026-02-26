import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, Menu, X, CircleHelp, CalendarDays } from 'lucide-react'
import { useHotelProfile } from '../hooks/useHotelProfile'
import { appConfig } from '../config/app-config'

export default function Navbar() {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { profile } = useHotelProfile()
  const isHome = location.pathname === '/'
  const useTransparentStyle = isHome && !isScrolled && !mobileMenuOpen

  useEffect(() => {
    if (!isHome) {
      setIsScrolled(true)
      return
    }

    const onScroll = () => {
      setIsScrolled(window.scrollY > 24)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isHome])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const links = [
    { to: '/sobre', label: 'Sobre', icon: CircleHelp },
    { to: '/reservar', label: 'Reservar', icon: CalendarDays },
    { to: '/login', label: 'Consultar Reserva', icon: Search },
  ]

  const hotelName = profile?.tradeName || appConfig.fallbackHotelName
  const hotelNameTail = hotelName.toLowerCase().startsWith('h') ? hotelName.slice(1) : hotelName

  return (
    <nav
      aria-label="Navegacao principal"
      className={`fixed top-0 left-0 right-0 z-50 transition-all ${
        useTransparentStyle
          ? 'bg-transparent border-b border-transparent shadow-none'
          : 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200'
      }`}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-white focus:text-slate-900 focus:shadow-md"
      >
        Ir para o conteudo principal
      </a>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-0.5 group">
            <span
              className={`text-2xl font-black leading-none ${
                useTransparentStyle ? 'text-white' : 'text-blue-700'
              }`}
            >
              H
            </span>
            <span className={`text-xl font-bold ${useTransparentStyle ? 'text-white' : 'text-slate-900'}`}>
              {hotelNameTail}
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = location.pathname === link.to
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? useTransparentStyle
                        ? 'bg-white text-slate-900 shadow-md'
                        : 'bg-blue-600 text-white shadow-md'
                      : useTransparentStyle
                        ? 'text-white hover:bg-white/20'
                        : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              )
            })}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              useTransparentStyle ? 'hover:bg-white/20' : 'hover:bg-slate-100'
            }`}
            aria-label="Menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-primary-nav"
          >
            {mobileMenuOpen ? (
              <X className={`w-6 h-6 ${useTransparentStyle ? 'text-white' : 'text-slate-700'}`} />
            ) : (
              <Menu className={`w-6 h-6 ${useTransparentStyle ? 'text-white' : 'text-slate-700'}`} />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div id="mobile-primary-nav" className="md:hidden bg-white border-t border-slate-200">
          <div className="px-4 py-3 space-y-2">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = location.pathname === link.to
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    isActive ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}
