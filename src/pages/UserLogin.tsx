import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, ArrowLeft, Search, MessageCircle, Calendar, Hash } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import { api, type PublicBookingItem } from '../lib/api'
import { appConfig } from '../config/app-config'

function formatCents(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR')
}

export default function UserLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [bookingCode, setBookingCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<PublicBookingItem[]>([])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await api.lookupBookings(email, bookingCode || undefined)
      setItems(response.items)
      if (response.items.length === 0) {
        toast('Nenhuma reserva encontrada para os dados informados.')
      }
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao consultar reservas.')
    } finally {
      setLoading(false)
    }
  }

  async function openWhatsapp(bookingCodeValue: string) {
    try {
      const response = await api.getBookingWhatsappLink(bookingCodeValue)
      window.open(response.url, '_blank', 'noopener,noreferrer')
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao abrir WhatsApp.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Acesso Hóspede</h1>
            <p className="text-slate-600">Consulte suas reservas usando seu e-mail</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                  E-mail *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="bookingCode"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Código da reserva (opcional)
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="bookingCode"
                    value={bookingCode}
                    onChange={(e) => setBookingCode(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder={appConfig.bookingCodePlaceholder}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-bold text-lg transition-colors shadow-sm disabled:bg-gray-400 inline-flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                <span>{loading ? 'Consultando...' : 'Consultar Reservas'}</span>
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/reservar')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Não tem reserva? Fazer agora
              </button>
            </div>
          </div>

          {items.length > 0 && (
            <div className="space-y-4">
              {items.map((booking) => (
                <div key={booking.bookingCode} className="bg-white border border-gray-200 rounded-2xl p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Código</p>
                      <p className="font-bold text-slate-900">{booking.bookingCode}</p>
                      <div className="mt-2 text-sm text-slate-600 space-y-1">
                        <p className="inline-flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {formatDate(booking.checkIn)} até {formatDate(booking.checkOut)}
                        </p>
                        <p>Quarto {booking.roomNumber}</p>
                        <p>Total: {formatCents(booking.totalCents)}</p>
                        <p>Status: {booking.status}</p>
                        <p>Pagamento: {booking.paymentStatus}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => openWhatsapp(booking.bookingCode)}
                      className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-xl font-semibold"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao início</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
