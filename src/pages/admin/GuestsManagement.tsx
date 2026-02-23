import { type FormEvent, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Navbar from '../../components/Navbar'
import AdminNavbar from '../../components/AdminNavbar'
import { User, ChevronRight, Search, Mail, Phone, MapPin, Calendar, RotateCcw } from 'lucide-react'
import { api, type Guest } from '../../lib/api'

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('pt-BR')
}

export default function GuestsManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [guests, setGuests] = useState<Guest[]>([])

  async function loadGuests(search?: string) {
    setLoading(true)
    try {
      const response = await api.listGuests(search)
      setGuests(response.items)
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao carregar hóspedes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadGuests()
  }, [])

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const term = searchTerm.trim()
    await loadGuests(term || undefined)
  }

  async function handleReset() {
    setSearchTerm('')
    await loadGuests()
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
            <span className="text-gray-900 font-semibold">Gerenciar Hóspedes</span>
          </nav>

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Gerenciar Hóspedes</h1>
            <p className="text-gray-600">Consulta de hóspedes cadastrados e dados de contato</p>
          </div>

          <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Buscar por nome, email ou telefone..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D4745E] focus:outline-none transition-colors"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-3 bg-[#D4745E] hover:bg-[#B85A44] text-white rounded-xl font-semibold transition-colors"
              >
                Buscar
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Limpar</span>
              </button>
            </div>
          </form>

          {loading && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 text-sm text-gray-600">
              Carregando hóspedes...
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guests.map((guest) => (
              <div
                key={guest.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden"
              >
                <div className="bg-gradient-to-r from-[#8B9A7F] to-[#6B7A5F] p-6 text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                      <User className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{guest.name}</h3>
                      <p className="text-white/80 text-sm">ID: {guest.id.slice(0, 8)}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-start gap-3 text-sm">
                    <Mail className="w-4 h-4 text-[#D4745E] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 break-all">{guest.email}</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <Phone className="w-4 h-4 text-[#D4745E] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{guest.phone}</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-[#D4745E] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{guest.address || 'Endereço não informado'}</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-[#D4745E] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">Cadastro em {formatDate(guest.createdAt)}</span>
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold">
                      Documento: {guest.document || 'Não informado'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!loading && guests.length === 0 && (
            <div className="text-center py-20">
              <User className="w-24 h-24 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Nenhum hóspede encontrado</h2>
              <p className="text-gray-600">Tente ajustar a busca</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
