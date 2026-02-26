import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  Star,
  Wifi,
  Coffee,
  Car,
  Shield,
  MapPin,
  Phone,
  Mail,
  Building2,
  ExternalLink,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import GoogleReviewsCarousel from '../components/GoogleReviewsCarousel'
import HomeSeo from '../components/HomeSeo'
import { useHotelProfile } from '../hooks/useHotelProfile'
import { appConfig } from '../config/app-config'
import { api, type PublicRoom } from '../lib/api'
import nossaHistoriaImage from '../assets/images/nossa-historia.webp'
import heroHotelSantoAntonioImage from '../assets/images/hero-hotel-santo-antonio.webp'

const roomTypeOrder: PublicRoom['type'][] = ['FAMILIA', 'CASAL', 'DUPLO', 'INDIVIDUAL', 'ECONOMICO']

function roomTypeLabel(type: PublicRoom['type']) {
  const labels: Record<PublicRoom['type'], string> = {
    FAMILIA: 'Quarto Família (Grupo/Excursão)',
    CASAL: 'Quarto Casal + Solteiro',
    DUPLO: 'Quarto Duplo (Solteiro)',
    INDIVIDUAL: 'Quarto Individual',
    ECONOMICO: 'Quarto Econômico',
  }
  return labels[type]
}

function formatCents(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function dailyPrice(room: PublicRoom) {
  return room.seasonalPriceCents || room.basePriceCents
}

function bedConfigFromDescription(description?: string | null) {
  if (!description) return 'Configuração de camas sob consulta.'
  const summary = description.split('Todos os quartos')[0]?.trim()
  return summary || 'Configuração de camas sob consulta.'
}

export default function LandingPage() {
  const { profile } = useHotelProfile()
  const [publicRooms, setPublicRooms] = useState<PublicRoom[]>([])
  const [loadingRooms, setLoadingRooms] = useState(true)

  const amenities = [
    { icon: Wifi, label: 'Wi-Fi Grátis' },
    { icon: Coffee, label: 'Café da Manhã' },
    { icon: Car, label: 'Estacionamento' },
    { icon: Shield, label: 'Segurança' },
  ]

  const roomSummaries = useMemo(() => {
    const grouped = new Map<
      PublicRoom['type'],
      {
        type: PublicRoom['type']
        quantity: number
        minPriceCents: number
        maxPriceCents: number
        minCapacity: number
        maxCapacity: number
        withBathroom: number
        withoutBathroom: number
        climatizacao: Set<'CENTRAL_AR' | 'VENTILADOR'>
        bedConfig: string
      }
    >()

    for (const room of publicRooms) {
      const priceCents = dailyPrice(room)
      const current = grouped.get(room.type)
      if (!current) {
        grouped.set(room.type, {
          type: room.type,
          quantity: 1,
          minPriceCents: priceCents,
          maxPriceCents: priceCents,
          minCapacity: room.capacity,
          maxCapacity: room.capacity,
          withBathroom: room.hasBathroom ? 1 : 0,
          withoutBathroom: room.hasBathroom ? 0 : 1,
          climatizacao: new Set(room.climatizacao ? [room.climatizacao] : []),
          bedConfig: bedConfigFromDescription(room.description),
        })
        continue
      }

      current.quantity += 1
      current.minPriceCents = Math.min(current.minPriceCents, priceCents)
      current.maxPriceCents = Math.max(current.maxPriceCents, priceCents)
      current.minCapacity = Math.min(current.minCapacity, room.capacity)
      current.maxCapacity = Math.max(current.maxCapacity, room.capacity)
      current.withBathroom += room.hasBathroom ? 1 : 0
      current.withoutBathroom += room.hasBathroom ? 0 : 1
      if (room.climatizacao) current.climatizacao.add(room.climatizacao)
    }

    return roomTypeOrder
      .map((type) => grouped.get(type))
      .filter((summary): summary is NonNullable<typeof summary> => Boolean(summary))
  }, [publicRooms])

  const featuredRoomSummaries = useMemo(() => roomSummaries.slice(0, 3), [roomSummaries])

  const hotelName = profile?.tradeName || appConfig.fallbackHotelName
  const hotelLocation =
    profile?.addressLine ||
    `${profile?.city || appConfig.fallbackCity} - ${profile?.state || appConfig.fallbackState}`
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    let active = true

    async function loadPublicRooms() {
      try {
        const response = await api.getPublicRooms()
        if (!active) return
        setPublicRooms(response.items)
      } catch {
        if (!active) return
        setPublicRooms([])
      } finally {
        if (active) setLoadingRooms(false)
      }
    }

    void loadPublicRooms()

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <HomeSeo profile={profile} heroImageUrl={heroHotelSantoAntonioImage} rooms={publicRooms} />
      <Navbar />

      <main id="main-content">
      <section className="relative pt-16 h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={heroHotelSantoAntonioImage}
            alt={hotelName}
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900/80" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
            Tranquilidade no<br />
            Norte do Tocantins
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
            Hospedagem acolhedora em Itaguatins, perto do Rio Tocantins
          </p>
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/reservar"
                className="inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-2xl"
              >
                <Calendar className="w-6 h-6" />
                <span>Fazer Reserva</span>
              </Link>
              <a
                href="#rooms"
                className="inline-flex items-center justify-center space-x-2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all border-2 border-white/40"
              >
                <span>Conhecer Quartos</span>
              </a>
            </div>
            <Link
              to="/sobre"
              className="inline-flex items-center justify-center bg-amber-400 hover:bg-amber-500 text-slate-900 px-8 py-3 rounded-xl font-bold text-lg transition-all shadow-xl"
            >
              Saiba Mais
            </Link>
          </div>
        </div>
      </section>

      <GoogleReviewsCarousel />

      <section className="py-20 bg-white" aria-labelledby="amenidades-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="amenidades-title" className="sr-only">
            Comodidades do Hotel
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {amenities.map((amenity) => {
              const Icon = amenity.icon
              return (
                <div
                  key={amenity.label}
                  className="flex flex-col items-center text-center group hover:transform hover:scale-110 transition-all"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mb-4 group-hover:shadow-xl transition-shadow">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-slate-800 font-medium">{amenity.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section id="rooms" className="py-20 bg-slate-50" aria-labelledby="rooms-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 id="rooms-title" className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Nossos Quartos
            </h2>
            <p className="text-xl text-slate-600">
              Tipos e faixas de diária baseados nos quartos disponíveis agora
            </p>
          </div>

          {loadingRooms ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-600 text-center">
              Carregando disponibilidade dos quartos...
            </div>
          ) : featuredRoomSummaries.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-600 text-center">
              Não foi possível carregar os quartos no momento.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredRoomSummaries.map((summary) => {
                const priceLabel =
                  summary.minPriceCents === summary.maxPriceCents
                    ? `${formatCents(summary.minPriceCents)}/diária`
                    : `${formatCents(summary.minPriceCents)} a ${formatCents(summary.maxPriceCents)}/diária`

                const capacityLabel =
                  summary.minCapacity === summary.maxCapacity
                    ? `${summary.maxCapacity} hóspede(s)`
                    : `${summary.minCapacity} a ${summary.maxCapacity} hóspede(s)`

                const climatizacaoLabel =
                  summary.climatizacao.size <= 1
                    ? summary.climatizacao.has('VENTILADOR')
                      ? 'Ventilador'
                      : 'Central de Ar'
                    : 'Central de Ar e Ventilador'

                const bathroomLabel =
                  summary.withoutBathroom === 0
                    ? 'Todos com banheiro privativo'
                    : summary.withBathroom === 0
                      ? 'Sem banheiro privativo'
                      : `${summary.withBathroom} com banheiro e ${summary.withoutBathroom} sem banheiro`

                return (
                  <div
                    key={summary.type}
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 border border-slate-200"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <h3 className="text-xl font-bold text-slate-900 leading-tight">
                          {roomTypeLabel(summary.type)}
                        </h3>
                        <span className="shrink-0 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                          {summary.quantity} disponível(is)
                        </span>
                      </div>

                      <p className="text-2xl font-extrabold text-blue-700 mb-3">{priceLabel}</p>
                      <p className="text-sm text-slate-600 mb-5">{summary.bedConfig}</p>

                      <div className="flex flex-wrap gap-2 mb-6">
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                          {capacityLabel}
                        </span>
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                          {climatizacaoLabel}
                        </span>
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                          {bathroomLabel}
                        </span>
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                          Armadores de redes
                        </span>
                      </div>

                      <Link
                        to="/reservar"
                        className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                      >
                        Reservar Agora
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-white" aria-labelledby="historia-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 id="historia-title" className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                Nossa História
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                O {hotelName} nasceu como uma hospedaria familiar em Itaguatins-TO e se tornou um
                ponto de descanso para quem busca conforto, simplicidade e hospitalidade.
              </p>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                A poucos metros da Praia Tio Claro e do Remanso dos Botos, o hotel oferece
                tranquilidade e acesso à paisagem do Rio Tocantins, com ambiente acolhedor para
                famílias, viajantes e turistas da região.
              </p>
              <div className="flex items-center space-x-4 text-slate-700">
                <div className="flex">
                  {[...Array(5)].map((_, index) => (
                    <Star key={index} className="w-5 h-5 fill-blue-600 text-blue-600" />
                  ))}
                </div>
                {profile?.googleBusinessUrl ? (
                  <a
                    href={profile.googleBusinessUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold inline-flex items-center gap-1 hover:text-blue-700"
                  >
                    Ver avaliações no Google
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <span className="font-semibold">Avaliações disponíveis no Google Negócios</span>
                )}
              </div>
            </div>
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={nossaHistoriaImage}
                alt={hotelName}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-900 text-white" aria-labelledby="footer-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h3 id="footer-title" className="text-2xl font-bold mb-4">{hotelName}</h3>
              <p className="text-slate-400 leading-relaxed">
                Hospedagem tradicional em {profile?.city || appConfig.fallbackCity} para quem busca
                conforto e tranquilidade.
              </p>
              <p className="text-slate-400 mt-3 inline-flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>CNPJ: {profile?.cnpj || 'Não informado'}</span>
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contato</h4>
              <div className="space-y-3 text-slate-400">
                <div className="flex items-center space-x-3 justify-center md:justify-start">
                  <Phone className="w-5 h-5" />
                  <span>{profile?.phone || 'Telefone não informado'}</span>
                </div>
                <div className="flex items-center space-x-3 justify-center md:justify-start">
                  <Mail className="w-5 h-5" />
                  <span>{profile?.email || 'E-mail não informado'}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Localização</h4>
              <div className="flex items-start space-x-3 text-slate-400 justify-center md:justify-start mb-4">
                <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                <span>{hotelLocation}</span>
              </div>
              <div className="flex flex-col gap-2 text-sm">
                {profile?.googleMapsUrl && (
                  <a
                    href={profile.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-blue-300 hover:text-blue-200"
                  >
                    Ver no Google Maps
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {profile?.googleBusinessUrl && (
                  <a
                    href={profile.googleBusinessUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-blue-300 hover:text-blue-200"
                  >
                    Google Negócios e avaliações
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-800 text-center text-slate-400">
            <p>
              &copy; {currentYear} {hotelName}. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </section>
      </main>
    </div>
  )
}
