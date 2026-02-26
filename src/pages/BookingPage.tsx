import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Users, Bed, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import PageSeo from '../components/PageSeo'
import { useHotelProfile } from '../hooks/useHotelProfile'
import { api, type PublicRoom } from '../lib/api'
import { appConfig } from '../config/app-config'
import { buildCanonicalUrl } from '../lib/seo'

type BookingForm = {
  guestName: string
  guestEmail: string
  guestPhone: string
  guestDocument: string
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
    FAMILIA: 'Família',
    CASAL: 'Casal + Solteiro',
    DUPLO: 'Duplo',
    INDIVIDUAL: 'Individual',
    ECONOMICO: 'Econômico',
  }
  return labels[type]
}

function climatizacaoLabel(climatizacao: PublicRoom['climatizacao']) {
  if (climatizacao === 'CENTRAL_AR') return 'Central de Ar'
  if (climatizacao === 'VENTILADOR') return 'Ventilador'
  return 'Não informado'
}

function roomPriceCents(room: PublicRoom) {
  return room.seasonalPriceCents || room.basePriceCents
}

function roomBedSummary(description?: string | null) {
  if (!description) return 'Configuração de camas sob consulta.'
  const summary = description.split('Todos os quartos')[0]?.trim()
  if (!summary) return 'Configuração de camas sob consulta.'
  return summary
}

function normalizeDocumentDigits(value: string) {
  return value.replace(/\D/g, '').slice(0, 14)
}

function formatDocument(value: string) {
  const digits = normalizeDocumentDigits(value)
  if (digits.length <= 11) {
    return digits
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1-$2')
  }
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

const roomTypeOptions: Array<{ value: 'ALL' | PublicRoom['type']; label: string }> = [
  { value: 'ALL', label: 'Todos os tipos' },
  { value: 'FAMILIA', label: 'Família' },
  { value: 'CASAL', label: 'Casal + Solteiro' },
  { value: 'DUPLO', label: 'Duplo' },
  { value: 'INDIVIDUAL', label: 'Individual' },
  { value: 'ECONOMICO', label: 'Econômico' },
]

export default function BookingPage() {
  const navigate = useNavigate()
  const { profile } = useHotelProfile()
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [rooms, setRooms] = useState<PublicRoom[]>([])
  const [roomQuery, setRoomQuery] = useState('')
  const [roomTypeFilter, setRoomTypeFilter] = useState<'ALL' | PublicRoom['type']>('ALL')
  const [onlyCompatibleRooms, setOnlyCompatibleRooms] = useState(false)
  const [formData, setFormData] = useState<BookingForm>({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    guestDocument: '',
    checkIn: '',
    checkOut: '',
    guestsCount: 1,
    roomId: '',
    notes: '',
  })

  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === formData.roomId),
    [rooms, formData.roomId]
  )

  const visibleRooms = useMemo(() => {
    const query = roomQuery.trim().toLowerCase()

    return [...rooms]
      .filter((room) => {
        if (roomTypeFilter === 'ALL') return true
        return room.type === roomTypeFilter
      })
      .filter((room) => {
        if (!onlyCompatibleRooms) return true
        return room.capacity >= formData.guestsCount
      })
      .filter((room) => {
        if (!query) return true
        const name = room.name?.toLowerCase() || ''
        const type = roomTypeLabel(room.type).toLowerCase()
        return room.number.toLowerCase().includes(query) || name.includes(query) || type.includes(query)
      })
      .sort((a, b) => {
        const priceDiff = roomPriceCents(a) - roomPriceCents(b)
        if (priceDiff !== 0) return priceDiff
        return a.number.localeCompare(b.number)
      })
  }, [rooms, roomQuery, roomTypeFilter, onlyCompatibleRooms, formData.guestsCount])

  const selectedRoomIncompatible = !!selectedRoom && formData.guestsCount > selectedRoom.capacity
  const hotelName = profile?.tradeName || appConfig.fallbackHotelName
  const bookingJsonLd = useMemo(
    () => [
      {
        id: 'seo-booking-webpage',
        data: {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${buildCanonicalUrl('/reservar')}#webpage`,
          name: `Reserva Online | ${hotelName}`,
          url: buildCanonicalUrl('/reservar'),
          isPartOf: {
            '@type': 'WebSite',
            name: hotelName,
            url: buildCanonicalUrl('/'),
          },
        },
      },
      {
        id: 'seo-booking-breadcrumb',
        data: {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Inicio',
              item: buildCanonicalUrl('/'),
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Reservar',
              item: buildCanonicalUrl('/reservar'),
            },
          ],
        },
      },
    ],
    [hotelName]
  )

  useEffect(() => {
    async function loadRooms() {
      try {
        const response = await api.getPublicRooms()
        const orderedRooms = [...response.items].sort((a, b) => {
          const priceDiff = roomPriceCents(a) - roomPriceCents(b)
          if (priceDiff !== 0) return priceDiff
          return a.number.localeCompare(b.number)
        })
        setRooms(orderedRooms)
        if (orderedRooms.length > 0) {
          setFormData((prev) => ({ ...prev, roomId: orderedRooms[0].id }))
        }
      } catch (error) {
        toast.error((error as Error).message || 'Erro ao carregar quartos.')
      } finally {
        setLoadingRooms(false)
      }
    }
    void loadRooms()
  }, [])

  useEffect(() => {
    if (!onlyCompatibleRooms || !selectedRoom) return
    if (selectedRoom.capacity >= formData.guestsCount) return
    const nextRoom = visibleRooms[0]
    setFormData((prev) => ({ ...prev, roomId: nextRoom?.id || '' }))
  }, [onlyCompatibleRooms, selectedRoom, formData.guestsCount, visibleRooms])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    if (name === 'guestsCount') {
      setFormData((prev) => ({ ...prev, guestsCount: Math.max(1, Number(value) || 1) }))
      return
    }
    if (name === 'guestDocument') {
      setFormData((prev) => ({ ...prev, guestDocument: formatDocument(value) }))
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
    if (selectedRoom && formData.guestsCount > selectedRoom.capacity) {
      toast.error('A quantidade de hóspedes excede a capacidade do quarto selecionado.')
      return
    }
    const guestDocumentDigits = normalizeDocumentDigits(formData.guestDocument)
    if (guestDocumentDigits.length !== 11 && guestDocumentDigits.length !== 14) {
      toast.error('Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.')
      return
    }

    setSubmitting(true)
    try {
      const bookingResponse = await api.createBooking({
        guestName: formData.guestName,
        guestEmail: formData.guestEmail,
        guestPhone: formData.guestPhone,
        guestDocument: guestDocumentDigits,
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
      <PageSeo
        title={`Reservar Quarto | ${hotelName}`}
        description="Reserve seu quarto no Hotel Santo Antonio com clareza de capacidade, climatizacao, banheiro e valor da diaria."
        pathname="/reservar"
        imageUrl="/seo/hero-hotel-santo-antonio.webp"
        imageAlt={`Reserva de quartos no ${hotelName}`}
        siteName={hotelName}
        jsonLd={bookingJsonLd}
      />
      <Navbar />

      <main id="main-content" className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
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
                    autoComplete="name"
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
                    autoComplete="email"
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
                    autoComplete="tel"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder={appConfig.guestPhonePlaceholder}
                  />
                </div>

                <div>
                  <label htmlFor="guestDocument" className="block text-sm font-semibold text-slate-700 mb-2">
                    CPF/CNPJ *
                  </label>
                  <input
                    type="text"
                    id="guestDocument"
                    name="guestDocument"
                    value={formData.guestDocument}
                    onChange={handleChange}
                    inputMode="numeric"
                    autoComplete="off"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder="000.000.000-00 ou 00.000.000/0000-00"
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
                    min={today}
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
                    min={formData.checkIn || today}
                    value={formData.checkOut}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="block text-sm font-semibold text-slate-700 mb-2 flex items-center space-x-2">
                  <Bed className="w-5 h-5 text-blue-500" />
                  <span>Escolha do Quarto *</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                  <div className="grid md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={roomQuery}
                      onChange={(e) => setRoomQuery(e.target.value)}
                      placeholder="Buscar por número, tipo ou nome"
                      className="md:col-span-2 w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white"
                    />
                    <select
                      value={roomTypeFilter}
                      onChange={(e) => setRoomTypeFilter(e.target.value as 'ALL' | PublicRoom['type'])}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white"
                    >
                      {roomTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={onlyCompatibleRooms}
                      onChange={(e) => setOnlyCompatibleRooms(e.target.checked)}
                      className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                    />
                    Mostrar apenas quartos que comportam {formData.guestsCount} hóspede(s)
                  </label>

                  <div className="grid sm:grid-cols-2 gap-3">
                    {visibleRooms.map((room) => {
                      const isSelected = room.id === formData.roomId
                      const isCompatible = room.capacity >= formData.guestsCount

                      return (
                        <button
                          key={room.id}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, roomId: room.id }))}
                          className={`text-left w-full rounded-xl border p-4 transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 shadow-sm'
                              : 'border-gray-200 bg-white hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-600">Quarto {room.number}</p>
                              <p className="text-base font-bold text-slate-900">{room.name || roomTypeLabel(room.type)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-slate-500">Diária</p>
                              <p className="text-lg font-bold text-blue-600">{formatCents(roomPriceCents(room))}</p>
                            </div>
                          </div>

                          <p className="mt-2 text-sm text-slate-600">{roomBedSummary(room.description)}</p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                              Capacidade: {room.capacity}
                            </span>
                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                              {climatizacaoLabel(room.climatizacao)}
                            </span>
                            <span
                              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                room.hasBathroom ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {room.hasBathroom ? 'Com banheiro privativo' : 'Sem banheiro privativo'}
                            </span>
                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                              Café e internet inclusos
                            </span>
                          </div>

                          {!isCompatible && (
                            <p className="mt-3 text-xs font-semibold text-rose-600">
                              Não comporta {formData.guestsCount} hóspede(s).
                            </p>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {!loadingRooms && visibleRooms.length === 0 && (
                    <div className="text-sm text-slate-600 bg-white border border-dashed border-slate-300 rounded-xl p-4">
                      Nenhum quarto encontrado com os filtros atuais.
                    </div>
                  )}
                </div>
              </div>

              {selectedRoom && (
                <div
                  className={`rounded-xl border p-4 ${
                    selectedRoomIncompatible ? 'border-rose-200 bg-rose-50' : 'border-emerald-200 bg-emerald-50'
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-700 mb-1">Resumo do quarto selecionado</p>
                  <p className="text-lg font-bold text-slate-900">
                    Quarto {selectedRoom.number} - {selectedRoom.name || roomTypeLabel(selectedRoom.type)}
                  </p>
                  <div className="mt-2 grid md:grid-cols-2 gap-2 text-sm text-slate-700">
                    <p>Diária: <strong>{formatCents(roomPriceCents(selectedRoom))}</strong></p>
                    <p>Capacidade: <strong>{selectedRoom.capacity} hóspede(s)</strong></p>
                    <p>Climatização: <strong>{climatizacaoLabel(selectedRoom.climatizacao)}</strong></p>
                    <p>
                      Banheiro: <strong>{selectedRoom.hasBathroom ? 'Privativo' : 'Coletivo (sem banheiro privativo)'}</strong>
                    </p>
                    <p className="md:col-span-2">
                      Comodidades: <strong>armadores de redes, café da manhã e internet</strong>.
                    </p>
                  </div>
                  {selectedRoomIncompatible && (
                    <p className="mt-2 text-sm font-semibold text-rose-700">
                      Ajuste o número de hóspedes ou escolha um quarto com maior capacidade.
                    </p>
                  )}
                </div>
              )}

              {!selectedRoom && !loadingRooms && (
                <div className="text-sm font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3">
                  Selecione um quarto para continuar.
                </div>
              )}

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
              disabled={submitting || loadingRooms || rooms.length === 0 || !formData.roomId || selectedRoomIncompatible}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-sm disabled:bg-gray-400"
            >
              {submitting ? 'Confirmando...' : 'Confirmar Reserva'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
