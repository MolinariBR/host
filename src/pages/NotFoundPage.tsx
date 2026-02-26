import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import PageSeo from '../components/PageSeo'
import { appConfig } from '../config/app-config'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <PageSeo
        title={`Pagina nao encontrada | ${appConfig.fallbackHotelName}`}
        description="A pagina solicitada nao foi encontrada."
        pathname="/404"
        robots="noindex, nofollow"
      />
      <Navbar />
      <main id="main-content" className="pt-28 pb-16 px-4">
        <div className="max-w-xl mx-auto rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-3">Pagina nao encontrada</h1>
          <p className="text-slate-600 mb-6">
            O link acessado nao existe ou foi movido.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Ir para inicio
            </Link>
            <Link
              to="/reservar"
              className="inline-flex items-center justify-center rounded-xl bg-slate-200 px-5 py-3 font-semibold text-slate-800 hover:bg-slate-300"
            >
              Fazer reserva
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
