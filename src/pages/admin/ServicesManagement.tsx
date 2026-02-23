import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Navbar from '../../components/Navbar'
import AdminNavbar from '../../components/AdminNavbar'
import {
  Utensils,
  ChevronRight,
  Plus,
  X,
  Edit,
  Trash2,
  DollarSign,
  Clock,
  RefreshCw,
} from 'lucide-react'
import { api, type Service } from '../../lib/api'

type ServiceForm = {
  name: string
  description: string
  category: Service['category']
  price: number
  isActive: boolean
}

const emptyForm: ServiceForm = {
  name: '',
  description: '',
  category: 'OTHER',
  price: 0,
  isActive: true,
}

const categoryLabel: Record<Service['category'], string> = {
  FOOD: 'Alimentação',
  TRANSPORT: 'Transporte',
  WELLNESS: 'Bem-estar',
  LEISURE: 'Lazer',
  OTHER: 'Outros',
}

function getCategoryColor(category: Service['category']) {
  const colors: Record<Service['category'], string> = {
    FOOD: 'bg-orange-100 text-orange-700',
    TRANSPORT: 'bg-blue-100 text-blue-700',
    WELLNESS: 'bg-violet-100 text-violet-700',
    LEISURE: 'bg-emerald-100 text-emerald-700',
    OTHER: 'bg-gray-100 text-gray-700',
  }
  return colors[category]
}

function formatMoney(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function ServicesManagement() {
  const [loading, setLoading] = useState(true)
  const [services, setServices] = useState<Service[]>([])

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [formData, setFormData] = useState<ServiceForm>(emptyForm)

  async function loadServices() {
    setLoading(true)
    try {
      const response = await api.listServices()
      setServices(response.items)
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao carregar serviços.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadServices()
  }, [])

  function openAddModal() {
    setFormData(emptyForm)
    setShowAddModal(true)
  }

  function openEditModal(service: Service) {
    setSelectedService(service)
    setFormData({
      name: service.name,
      description: service.description || '',
      category: service.category,
      price: service.priceCents / 100,
      isActive: service.isActive,
    })
    setShowEditModal(true)
  }

  async function handleCreateService() {
    try {
      await api.createService({
        name: formData.name,
        description: formData.description || undefined,
        category: formData.category,
        priceCents: Math.round(formData.price * 100),
        isActive: formData.isActive,
      })
      toast.success('Serviço criado com sucesso.')
      setShowAddModal(false)
      await loadServices()
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao criar serviço.')
    }
  }

  async function handleUpdateService() {
    if (!selectedService) return
    try {
      await api.updateService(selectedService.id, {
        name: formData.name,
        description: formData.description || undefined,
        category: formData.category,
        priceCents: Math.round(formData.price * 100),
        isActive: formData.isActive,
      })
      toast.success('Serviço atualizado com sucesso.')
      setShowEditModal(false)
      setSelectedService(null)
      await loadServices()
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao atualizar serviço.')
    }
  }

  async function handleDeleteService(id: string) {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return
    try {
      await api.deleteService(id)
      toast.success('Serviço removido com sucesso.')
      await loadServices()
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao excluir serviço.')
    }
  }

  async function toggleAvailability(service: Service) {
    try {
      await api.updateService(service.id, { isActive: !service.isActive })
      await loadServices()
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao atualizar disponibilidade.')
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
            <span className="text-gray-900 font-semibold">Gerenciar Serviços</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Gerenciar Serviços</h1>
              <p className="text-gray-600">Adicione e gerencie serviços extras com dados reais</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              <button
                type="button"
                onClick={() => void loadServices()}
                className="inline-flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-3 rounded-xl font-semibold transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Atualizar</span>
              </button>
              <button
                onClick={openAddModal}
                className="inline-flex items-center space-x-2 bg-[#D4745E] hover:bg-[#B85A44] text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Adicionar Serviço</span>
              </button>
            </div>
          </div>

          {loading && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 text-sm text-gray-600">
              Carregando serviços...
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden"
              >
                <div className="bg-gradient-to-r from-[#D4745E] to-[#B85A44] p-6 text-white">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                      <Utensils className="w-6 h-6" />
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        service.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {service.isActive ? 'Disponível' : 'Indisponível'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{service.name}</h3>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getCategoryColor(
                      service.category
                    )}`}
                  >
                    {categoryLabel[service.category]}
                  </span>
                </div>

                <div className="p-6 space-y-4">
                  <p className="text-sm text-gray-600 min-h-[3rem]">
                    {service.description || 'Sem descrição cadastrada.'}
                  </p>

                  <div className="flex items-center justify-between p-3 bg-[#F5F1E8] rounded-xl">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-[#D4745E]" />
                      <span className="text-sm font-semibold text-gray-600">Preço</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{formatMoney(service.priceCents)}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <button
                      onClick={() => void toggleAvailability(service)}
                      className={`flex items-center justify-center px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        service.isActive
                          ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                          : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(service)}
                      className="flex items-center justify-center px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => void handleDeleteService(service.id)}
                      className="flex items-center justify-center px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!loading && services.length === 0 && (
            <div className="text-center py-20">
              <Utensils className="w-24 h-24 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Nenhum serviço cadastrado</h2>
              <p className="text-gray-600">Cadastre o primeiro serviço adicional.</p>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-[#D4745E] to-[#B85A44] p-6 text-white flex items-center justify-between">
              <h2 className="text-2xl font-bold">Adicionar Novo Serviço</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <ServiceFormFields formData={formData} setFormData={setFormData} />
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => void handleCreateService()}
                className="px-6 py-3 bg-[#D4745E] hover:bg-[#B85A44] text-white rounded-xl font-semibold transition-colors"
              >
                Salvar Serviço
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedService && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white flex items-center justify-between">
              <h2 className="text-2xl font-bold">Editar Serviço</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <ServiceFormFields formData={formData} setFormData={setFormData} />
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => void handleUpdateService()}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-colors"
              >
                Atualizar Serviço
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ServiceFormFields({
  formData,
  setFormData,
}: {
  formData: ServiceForm
  setFormData: (value: ServiceForm) => void
}) {
  return (
    <div className="p-6 space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Nome do Serviço</label>
        <input
          type="text"
          value={formData.name}
          onChange={(event) => setFormData({ ...formData, name: event.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D4745E] focus:outline-none transition-colors"
          placeholder="Ex: Café da Manhã"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição</label>
        <textarea
          value={formData.description}
          onChange={(event) => setFormData({ ...formData, description: event.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D4745E] focus:outline-none transition-colors"
          rows={3}
          placeholder="Descreva o serviço..."
        />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Preço (R$)</label>
          <input
            type="number"
            value={formData.price}
            onChange={(event) => setFormData({ ...formData, price: Number(event.target.value) || 0 })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D4745E] focus:outline-none transition-colors"
            min={0}
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Categoria</label>
          <select
            value={formData.category}
            onChange={(event) =>
              setFormData({ ...formData, category: event.target.value as Service['category'] })
            }
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D4745E] focus:outline-none transition-colors"
          >
            <option value="FOOD">Alimentação</option>
            <option value="TRANSPORT">Transporte</option>
            <option value="WELLNESS">Bem-estar</option>
            <option value="LEISURE">Lazer</option>
            <option value="OTHER">Outros</option>
          </select>
        </div>
      </div>
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={formData.isActive}
          onChange={(event) => setFormData({ ...formData, isActive: event.target.checked })}
          className="w-5 h-5 rounded border-gray-300 text-[#D4745E] focus:ring-[#D4745E]"
        />
        <span className="text-sm font-semibold text-gray-700">Serviço disponível para venda</span>
      </label>
    </div>
  )
}
