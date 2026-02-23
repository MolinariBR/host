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
import { useHotelProfile } from '../hooks/useHotelProfile'
import { appConfig } from '../config/app-config'
import nossaHistoriaImage from '../assets/images/nossa-historia.png'
import heroHotelSantoAntonioImage from '../assets/images/hero-hotel-santo-antonio.png'

export default function LandingPage() {
  const { profile } = useHotelProfile()

  const amenities = [
    { icon: Wifi, label: 'Wi-Fi Grátis' },
    { icon: Coffee, label: 'Café da Manhã' },
    { icon: Car, label: 'Estacionamento' },
    { icon: Shield, label: 'Segurança' },
  ]

  const rooms = [
    {
      name: 'Quarto Standard',
      price: 'R$ 180',
      image: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800',
      features: ['2 Pessoas', 'Wi-Fi', 'Ar Condicionado'],
    },
    {
      name: 'Quarto Deluxe',
      price: 'R$ 280',
      image: 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=800',
      features: ['3 Pessoas', 'Varanda', 'Hidromassagem'],
    },
    {
      name: 'Suíte Premium',
      price: 'R$ 380',
      image: 'https://images.pexels.com/photos/1743231/pexels-photo-1743231.jpeg?auto=compress&cs=tinysrgb&w=800',
      features: ['4 Pessoas', 'Vista para o rio', 'Sala de Estar'],
    },
  ]

  const hotelName = profile?.tradeName || appConfig.fallbackHotelName
  const hotelLocation =
    profile?.addressLine ||
    `${profile?.city || appConfig.fallbackCity} - ${profile?.state || appConfig.fallbackState}`
  const currentYear = new Date().getFullYear()

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="relative pt-16 h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={heroHotelSantoAntonioImage}
            alt={hotelName}
            className="w-full h-full object-cover"
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

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

      <section id="rooms" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Nossos Quartos</h2>
            <p className="text-xl text-slate-600">Escolha o ambiente perfeito para sua estadia</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {rooms.map((room) => (
              <div
                key={room.name}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all transform hover:-translate-y-2 group border border-slate-200"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={room.image}
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-lg shadow-lg">
                    {room.price}/noite
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{room.name}</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {room.features.map((feature) => (
                      <span
                        key={feature}
                        className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  <Link
                    to="/reservar"
                    className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                  >
                    Reservar Agora
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Nossa História</h2>
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
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h3 className="text-2xl font-bold mb-4">{hotelName}</h3>
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
    </div>
  )
}
