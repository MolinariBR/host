import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Users, Bed, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import { api, type PublicRoom } from '../lib/api'
import { appConfig } from '../config/app-config'

type BookingForm = {
  guestName: string
  guestEmail: string
  guestPhone: string
  checkIn: string
  checkOut: string
  guestsCount: number
  roomId: string
  notes: string
}

function formatCents(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function roomTypeLabel(type: PublicRoom['type']) {
  const labels: Record<PublicRoom['type'], string> = {
    STANDARD: 'Standard',
    DELUXE: 'Deluxe',
    PREMIUM: 'Premium',
    SUITE: 'Suíte',
  }
  return labels[type]
}

export default function BookingPage() {
  const navigate = useNavigate()
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [rooms, setRooms] = useState<PublicRoom[]>([])
  const [formData, setFormData] = useState<BookingForm>({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    checkIn: '',
    checkOut: '',
    guestsCount: 1,
    roomId: '',
    notes: '',
  })

  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === formData.roomId),
    [rooms, formData.roomId]
  )

  useEffect(() => {
    async function loadRooms() {
      try {
        const response = await api.getPublicRooms()
        setRooms(response.items)
        if (response.items.length > 0) {
          setFormData((prev) => ({ ...prev, roomId: response.items[0].id }))
        }
      } catch (error) {
        toast.error((error as Error).message || 'Erro ao carregar quartos.')
      } finally {
        setLoadingRooms(false)
      }
    }
    void loadRooms()
  }, [])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    if (name === 'guestsCount') {
      setFormData((prev) => ({ ...prev, guestsCount: Number(value) }))
      return
    }
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.roomId) {
      toast.error('Selecione um quarto.')
      return
    }
    setSubmitting(true)
    try {
      const bookingResponse = await api.createBooking({
        guestName: formData.guestName,
        guestEmail: formData.guestEmail,
        guestPhone: formData.guestPhone,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        guestsCount: formData.guestsCount,
        roomId: formData.roomId,
        notes: formData.notes || undefined,
      })

      navigate('/confirmacao', {
        state: {
          bookingRequest: formData,
          bookingResponse,
          room: selectedRoom || null,
        },
      })
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao criar reserva.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Fazer Reserva</h1>
            <p className="text-xl text-slate-600">Preencha os dados para garantir sua estadia</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6"
          >
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
                <Users className="w-6 h-6 text-blue-500" />
                <span>Dados do Hóspede</span>
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="guestName" className="block text-sm font-semibold text-slate-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    id="guestName"
                    name="guestName"
                    value={formData.guestName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder="Seu nome completo"
                  />
                </div>

                <div>
                  <label htmlFor="guestEmail" className="block text-sm font-semibold text-slate-700 mb-2">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    id="guestEmail"
                    name="guestEmail"
                    value={formData.guestEmail}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="guestPhone" className="block text-sm font-semibold text-slate-700 mb-2">
                    Telefone/WhatsApp *
                  </label>
                  <input
                    type="tel"
                    id="guestPhone"
                    name="guestPhone"
                    value={formData.guestPhone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder={appConfig.guestPhonePlaceholder}
                  />
                </div>

                <div>
                  <label htmlFor="guestsCount" className="block text-sm font-semibold text-slate-700 mb-2">
                    Número de Hóspedes *
                  </label>
                  <input
                    type="number"
                    id="guestsCount"
                    name="guestsCount"
                    min="1"
                    max="10"
                    value={formData.guestsCount}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
                <Calendar className="w-6 h-6 text-blue-500" />
                <span>Detalhes da Reserva</span>
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="checkIn" className="block text-sm font-semibold text-slate-700 mb-2">
                    Check-in *
                  </label>
                  <input
                    type="date"
                    id="checkIn"
                    name="checkIn"
                    value={formData.checkIn}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="checkOut" className="block text-sm font-semibold text-slate-700 mb-2">
                    Check-out *
                  </label>
                  <input
                    type="date"
                    id="checkOut"
                    name="checkOut"
                    value={formData.checkOut}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="roomId"
                  className="block text-sm font-semibold text-slate-700 mb-2 flex items-center space-x-2"
                >
                  <Bed className="w-5 h-5 text-blue-500" />
                  <span>Quarto *</span>
                </label>
                <select
                  id="roomId"
                  name="roomId"
                  value={formData.roomId}
                  onChange={handleChange}
                  required
                  disabled={loadingRooms || rooms.length === 0}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white disabled:bg-gray-100"
                >
                  {rooms.length === 0 ? (
                    <option value="">Nenhum quarto disponível</option>
                  ) : (
                    rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.number} - {room.name || roomTypeLabel(room.type)} -{' '}
                        {formatCents(room.seasonalPriceCents || room.basePriceCents)}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-semibold text-slate-700 mb-2 flex items-center space-x-2"
                >
                  <MessageSquare className="w-5 h-5 text-blue-500" />
                  <span>Observações</span>
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                  placeholder="Pedidos especiais, horário de chegada estimado, etc."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || loadingRooms || rooms.length === 0}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-sm disabled:bg-gray-400"
            >
              {submitting ? 'Confirmando...' : 'Confirmar Reserva'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
