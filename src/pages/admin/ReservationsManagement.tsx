import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import Navbar from '../../components/Navbar'
import AdminNavbar from '../../components/AdminNavbar'
import {
  Calendar,
  ChevronRight,
  Search,
  Filter,
  User,
  Bed,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import { api, type Booking } from '../../lib/api'

type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELED'
  | 'NO_SHOW'
  | 'ALL'

const statusOptions: Array<{ value: BookingStatus; label: string }> = [
  { value: 'ALL', label: 'Todos os Status' },
  { value: 'PENDING', label: 'Pendentes' },
  { value: 'CONFIRMED', label: 'Confirmadas' },
  { value: 'CHECKED_IN', label: 'Check-in Feito' },
  { value: 'CHECKED_OUT', label: 'Check-out Feito' },
  { value: 'CANCELED', label: 'Canceladas' },
  { value: 'NO_SHOW', label: 'No-show' },
]

function getStatusInfo(status: string) {
  const map = {
    CONFIRMED: { label: 'Confirmada', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
    CHECKED_IN: { label: 'Check-in Feito', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    CHECKED_OUT: { label: 'Check-out Feito', color: 'bg-cyan-100 text-cyan-700', icon: CheckCircle },
    PENDING: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
    CANCELED: { label: 'Cancelada', color: 'bg-red-100 text-red-700', icon: XCircle },
    NO_SHOW: { label: 'No-show', color: 'bg-gray-100 text-gray-700', icon: XCircle },
  } as const

  return map[status as keyof typeof map] || map.PENDING
}

function formatCents(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function ReservationsManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<BookingStatus>('ALL')
  const [loading, setLoading] = useState(true)
  const [reservations, setReservations] = useState<Booking[]>([])

  const loadReservations = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.listBookings({
        status: filterStatus === 'ALL' ? undefined : filterStatus,
      })
      setReservations(response.items)
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao carregar reservas.')
    } finally {
      setLoading(false)
    }
  }, [filterStatus])

  useEffect(() => {
    void loadReservations()
  }, [loadReservations])

  const filteredReservations = useMemo(
    () =>
      reservations.filter((reservation) => {
        const term = searchTerm.toLowerCase()
        return (
          reservation.guest.name.toLowerCase().includes(term) ||
          reservation.room.number.toLowerCase().includes(term) ||
          reservation.bookingCode.toLowerCase().includes(term)
        )
      }),
    [reservations, searchTerm]
  )

  async function updateReservationStatus(bookingId: string, status: string) {
    try {
      await api.updateBooking(bookingId, { status })
      await loadReservations()
      toast.success('Status da reserva atualizado.')
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao atualizar reserva.')
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      <Navbar />
      <AdminNavbar />

      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6" aria-label="Breadcrumb">
            <a href="/admin" className="hover:text-[#D4745E] transition-colors">
              Dashboard
            </a>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-semibold">Gerenciar Reservas</span>
          </nav>

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Gerenciar Reservas</h1>
            <p className="text-gray-600">Visualize e gerencie todas as reservas do hotel</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por hóspede, quarto ou código..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D4745E] focus:outline-none transition-colors"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as BookingStatus)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D4745E] focus:outline-none transition-colors appearance-none"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 text-sm text-gray-600">
              Carregando reservas...
            </div>
          )}

          <div className="space-y-4">
            {filteredReservations.map((reservation) => {
              const statusInfo = getStatusInfo(reservation.status)
              const StatusIcon = statusInfo.icon
              return (
                <div key={reservation.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-[#D4745E] to-[#B85A44] rounded-xl flex items-center justify-center text-white flex-shrink-0">
                            <User className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{reservation.guest.name}</h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Bed className="w-4 h-4" />
                                <span>Quarto {reservation.room.number}</span>
                              </div>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {reservation.checkIn} → {reservation.checkOut}
                                </span>
                              </div>
                            </div>
                            {reservation.notes && (
                              <p className="mt-2 text-sm text-gray-600 bg-yellow-50 border-l-4 border-yellow-400 p-2 rounded">
                                <span className="font-semibold">Obs:</span> {reservation.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-600 mb-1">Valor Total</p>
                          <p className="text-2xl font-bold text-[#D4745E]">{formatCents(reservation.totalCents)}</p>
                          <p className="text-xs text-gray-500">{reservation.bookingCode}</p>
                        </div>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${statusInfo.color} font-semibold`}>
                          <StatusIcon className="w-4 h-4" />
                          <span>{statusInfo.label}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                      {reservation.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => updateReservationStatus(reservation.id, 'CONFIRMED')}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => updateReservationStatus(reservation.id, 'CANCELED')}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors"
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                      {reservation.status === 'CONFIRMED' && (
                        <button
                          onClick={() => updateReservationStatus(reservation.id, 'CHECKED_IN')}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-semibold transition-colors"
                        >
                          Fazer Check-in
                        </button>
                      )}
                      {reservation.status === 'CHECKED_IN' && (
                        <button
                          onClick={() => updateReservationStatus(reservation.id, 'CHECKED_OUT')}
                          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-semibold transition-colors"
                        >
                          Fazer Check-out
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {!loading && filteredReservations.length === 0 && (
            <div className="text-center py-20">
              <Calendar className="w-24 h-24 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Nenhuma reserva encontrada</h2>
              <p className="text-gray-600">Tente ajustar os filtros de busca</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
