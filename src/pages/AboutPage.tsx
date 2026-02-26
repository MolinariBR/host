import { Link } from 'react-router-dom'
import { ExternalLink, Landmark, MapPin, UserRound, CalendarDays } from 'lucide-react'
import Navbar from '../components/Navbar'
import PageSeo from '../components/PageSeo'
import { useHotelProfile } from '../hooks/useHotelProfile'
import { appConfig } from '../config/app-config'
import { buildCanonicalUrl } from '../lib/seo'
import nossaHistoriaImage from '../assets/images/nossa-historia.webp'

const newsLinks = [
  {
    title: 'Itaguatins Notícias - Hotel Santo Antônio em Itaguatins: Um Destino de Charme e Tranquilidade',
    url: 'https://itaguatinsnoticias.com.br/noticia/3510/hotel-santo-antonio-em-itaguatins-um-destino-de-charme-e-tranquilidade',
  },
]

export default function AboutPage() {
  const { profile } = useHotelProfile()
  const hotelName = profile?.tradeName || appConfig.fallbackHotelName
  const hotelCity = profile?.city || appConfig.fallbackCity
  const hotelState = profile?.state || appConfig.fallbackState
  const aboutJsonLd = [
    {
      id: 'seo-about-webpage',
      data: {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        '@id': `${buildCanonicalUrl('/sobre')}#aboutpage`,
        name: `Sobre o ${hotelName}`,
        url: buildCanonicalUrl('/sobre'),
        isPartOf: {
          '@type': 'WebSite',
          name: hotelName,
          url: buildCanonicalUrl('/'),
        },
      },
    },
    {
      id: 'seo-about-breadcrumb',
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
            name: 'Sobre',
            item: buildCanonicalUrl('/sobre'),
          },
        ],
      },
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <PageSeo
        title={`Sobre a Hospedaria | ${hotelName}`}
        description={`Conheca a historia, localizacao e perfil da hospedaria ${hotelName} em ${hotelCity}-${hotelState}.`}
        pathname="/sobre"
        imageUrl={nossaHistoriaImage}
        imageAlt={`Historia da hospedaria ${hotelName}`}
        siteName={hotelName}
        jsonLd={aboutJsonLd}
      />
      <Navbar />

      <main id="main-content" className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <section className="grid lg:grid-cols-2 gap-10 items-center mb-16">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Sobre a Hospedaria</h1>
              <p className="text-lg text-slate-600 leading-relaxed mb-4">
                Em {hotelCity}-{hotelState}, o {hotelName} nasceu como uma hospedaria familiar com foco
                em conforto, atendimento próximo e tranquilidade para quem visita o norte do Tocantins.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed">
                A história local destaca a proximidade com a Praia Tio Claro e o Remanso dos Botos, além
                do nome em homenagem a Santo Antônio, padroeiro da cidade.
              </p>
            </div>
            <div className="relative h-[26rem] rounded-2xl overflow-hidden shadow-xl">
              <img
                src={nossaHistoriaImage}
                alt={`História do ${hotelName}`}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl p-8 mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-5 flex items-center gap-2">
              <Landmark className="w-6 h-6 text-blue-600" />
              <span>Nossa História</span>
            </h2>
            <div className="space-y-4 text-slate-700 leading-relaxed">
              <p>
                A trajetória do hotel está ligada ao crescimento de Itaguatins como destino de descanso e
                natureza. Com ambiente acolhedor, café da manhã e estrutura voltada para estadias tranquilas,
                a hospedaria atende famílias, viajantes e visitantes da região.
              </p>
              <p>
                Segundo os documentos do projeto, o estabelecimento possui tradição de décadas na cidade e
                mantém o perfil de pousada familiar, com área externa, jardim e localização estratégica próxima
                ao Rio Tocantins.
              </p>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl p-8 mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-5 flex items-center gap-2">
              <UserRound className="w-6 h-6 text-blue-600" />
              <span>Sobre a Dona</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3 text-slate-700">
                <p>
                  O registro empresarial do hotel está vinculado a <strong>Teresinha de Jesus Santos Noleto</strong>,
                  reconhecida como a dona do empreendimento e peça central da história da hospedaria.
                </p>
                <p>
                  A gestão do espaço preserva o estilo familiar, a hospitalidade local e o cuidado com a
                  experiência dos hóspedes em Itaguatins.
                </p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
                <p className="flex items-start gap-2 text-slate-700">
                  <CalendarDays className="w-5 h-5 text-blue-600 mt-0.5" />
                  <span>
                    <strong>Fundação:</strong> 9 de maio de 1990
                  </span>
                </p>
                <p className="flex items-start gap-2 text-slate-700">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                  <span>
                    <strong>Local:</strong> {hotelCity}-{hotelState}
                  </span>
                </p>
                <p className="text-slate-700">
                  <strong>CNPJ:</strong> {profile?.cnpj || '33.568.908/0001-55'}
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-5">Notícias e Referências</h2>
            <div className="space-y-3">
              {newsLinks.map((item) => (
                <a
                  key={item.url}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-start justify-between gap-3 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <span className="text-slate-800 group-hover:text-blue-700">{item.title}</span>
                  <ExternalLink className="w-5 h-5 text-slate-500 group-hover:text-blue-700 flex-shrink-0 mt-0.5" />
                </a>
              ))}
            </div>
          </section>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/reservar"
              className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Fazer Reserva
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center bg-slate-200 hover:bg-slate-300 text-slate-800 px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Voltar ao Início
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
