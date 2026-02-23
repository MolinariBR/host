import { Link, useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle, MessageCircle, Home, Calendar, User, Phone, Hash } from 'lucide-react'
import Navbar from '../components/Navbar'
import type { CreateBookingResponse, PublicRoom } from '../lib/api'

type ConfirmationState = {
  bookingRequest?: {
    guestName: string
    guestEmail: string
    guestPhone: string
    checkIn: string
    checkOut: string
    guestsCount: number
    notes?: string
  }
  bookingResponse?: CreateBookingResponse
  room?: PublicRoom | null
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR')
}

export default function BookingConfirmation() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state || {}) as ConfirmationState
  const bookingRequest = state.bookingRequest
  const bookingResponse = state.bookingResponse

  if (!bookingRequest || !bookingResponse) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-28 px-4">
          <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-3">Nenhuma reserva para exibir</h1>
            <p className="text-slate-600 mb-6">
              Faça uma nova reserva para visualizar a confirmação e o link de pagamento via WhatsApp.
            </p>
            <button
              onClick={() => navigate('/reservar')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold"
            >
              Fazer Reserva
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-100 rounded-full mb-6">
              <CheckCircle className="w-16 h-16 text-emerald-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Reserva Criada!</h1>
            <p className="text-xl text-slate-600">
              Sua reserva foi registrada. Agora finalize o pagamento no WhatsApp.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Detalhes da Reserva</h2>

            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                <Hash className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-1">Código da Reserva</p>
                  <p className="text-lg font-bold text-slate-900">{bookingResponse.bookingCode}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                <User className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-1">Hóspede</p>
                  <p className="text-lg font-bold text-slate-900">{bookingRequest.guestName}</p>
                  <p className="text-sm text-slate-600">{bookingRequest.guestEmail}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                <Calendar className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-600 mb-1">Check-in</p>
                      <p className="text-lg font-bold text-slate-900">
                        {formatDate(bookingRequest.checkIn)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-600 mb-1">Check-out</p>
                      <p className="text-lg font-bold text-slate-900">
                        {formatDate(bookingRequest.checkOut)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                <Home className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-1">Quarto</p>
                  <p className="text-lg font-bold text-slate-900">
                    {state.room?.number || '-'} {state.room?.name ? `• ${state.room.name}` : ''}
                  </p>
                  <p className="text-sm text-slate-600">{bookingRequest.guestsCount} hóspede(s)</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                <Phone className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-1">Contato</p>
                  <p className="text-lg font-bold text-slate-900">{bookingRequest.guestPhone}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <a
              href={bookingResponse.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center space-x-3 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-sm"
            >
              <MessageCircle className="w-6 h-6" />
              <span>Pagar via WhatsApp</span>
            </a>

            <Link
              to="/"
              className="flex items-center justify-center space-x-3 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-sm"
            >
              <Home className="w-6 h-6" />
              <span>Voltar ao Início</span>
            </Link>
          </div>

          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
            <h3 className="font-bold text-slate-900 mb-3">Próximos passos:</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>• Use o botão de WhatsApp para confirmar o pagamento.</li>
              <li>• Informe o código da reserva: {bookingResponse.bookingCode}.</li>
              <li>• Você pode consultar sua reserva depois pela tela "Acesso Hóspede".</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
