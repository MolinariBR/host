import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import AdminNavbar from '../components/AdminNavbar'
import { Bed, Calendar, Users, TrendingUp, DollarSign, AlertCircle } from 'lucide-react'
import { api, type Booking, type Room } from '../lib/api'

function toDateRangeForCurrentMonth() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const toIsoDate = (date: Date) => date.toISOString().slice(0, 10)
  return { from: toIsoDate(first), to: toIsoDate(last) }
}

function formatMoney(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [guestCount, setGuestCount] = useState(0)
  const [report, setReport] = useState<{
    totalRevenueCents: number
    occupancyRate: number
  }>({
    totalRevenueCents: 0,
    occupancyRate: 0,
  })

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true)
      try {
        const range = toDateRangeForCurrentMonth()
        const [bookingsResponse, roomsResponse, guestsResponse, reportResponse] = await Promise.all([
          api.listBookings(),
          api.listRooms(),
          api.listGuests(),
          api.getSummaryReport(range.from, range.to),
        ])

        setBookings(bookingsResponse.items)
        setRooms(roomsResponse.items)
        setGuestCount(guestsResponse.items.length)
        setReport({
          totalRevenueCents: reportResponse.totalRevenueCents,
          occupancyRate: reportResponse.occupancyRate,
        })
      } catch (error) {
        toast.error((error as Error).message || 'Erro ao carregar dashboard.')
      } finally {
        setLoading(false)
      }
    }
    void loadDashboard()
  }, [])

  const roomsAvailable = rooms.filter((room) => room.status === 'AVAILABLE').length
  const maintenanceRooms = rooms.filter((room) => room.status === 'MAINTENANCE')
  const recentBookings = bookings.slice(0, 5)

  const stats = [
    { label: 'Quartos Disponíveis', value: String(roomsAvailable), icon: Bed, color: 'bg-emerald-500' },
    { label: 'Reservas', value: String(bookings.length), icon: Calendar, color: 'bg-blue-500' },
    { label: 'Total de Hóspedes', value: String(guestCount), icon: Users, color: 'bg-violet-500' },
    {
      label: 'Taxa de Ocupação',
      value: `${report.occupancyRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'bg-amber-500',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <AdminNavbar />

      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {loading && (
            <div className="mb-8 text-sm text-slate-600 bg-white border border-gray-200 rounded-xl px-4 py-3">
              Carregando dados do painel...
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-3xl font-bold text-slate-900">{stat.value}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                </div>
              )
            })}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
              <DollarSign className="w-6 h-6 text-emerald-600" />
              <span>Resumo Financeiro (mês atual)</span>
            </h2>
            <div className="text-center p-6 bg-emerald-50 rounded-xl">
              <p className="text-sm font-semibold text-slate-600 mb-2">Receita Total</p>
              <p className="text-3xl font-bold text-emerald-600">{formatMoney(report.totalRevenueCents)}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
                <Calendar className="w-6 h-6 text-blue-500" />
                <span>Reservas Recentes</span>
              </h2>
              <div className="space-y-4">
                {recentBookings.length === 0 && (
                  <p className="text-sm text-slate-600">Nenhuma reserva encontrada.</p>
                )}
                {recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{booking.guest.name}</p>
                      <p className="text-sm text-slate-600">
                        Quarto {booking.room.number} • {booking.checkIn}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                      {booking.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
                <AlertCircle className="w-6 h-6 text-amber-500" />
                <span>Quartos em Manutenção</span>
              </h2>
              <div className="space-y-4">
                {maintenanceRooms.length === 0 && (
                  <p className="text-sm text-slate-600">Nenhum quarto em manutenção.</p>
                )}
                {maintenanceRooms.map((room) => (
                  <div key={room.id} className="p-4 border-l-4 border-amber-500 bg-amber-50 rounded-r-xl">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold text-slate-900">Quarto {room.number}</p>
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                        manutenção
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{room.name || room.type}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
