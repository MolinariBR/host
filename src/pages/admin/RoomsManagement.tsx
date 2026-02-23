import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Navbar from '../../components/Navbar'
import AdminNavbar from '../../components/AdminNavbar'
import {
  Bed,
  Plus,
  Edit,
  Trash2,
  Wrench,
  DollarSign,
  Users,
  ChevronRight,
  X,
} from 'lucide-react'
import { api, type Room } from '../../lib/api'

type RoomForm = {
  number: string
  name: string
  type: Room['type']
  capacity: number
  description: string
  basePrice: number
  seasonalPrice: number
  status: Room['status']
}

const emptyForm: RoomForm = {
  number: '',
  name: '',
  type: 'STANDARD',
  capacity: 1,
  description: '',
  basePrice: 0,
  seasonalPrice: 0,
  status: 'AVAILABLE',
}

function toCurrency(cents: number | null | undefined) {
  if (!cents) return 'R$ 0,00'
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function statusLabel(status: Room['status']) {
  const labels: Record<Room['status'], string> = {
    AVAILABLE: 'Disponível',
    OCCUPIED: 'Ocupado',
    MAINTENANCE: 'Manutenção',
    INACTIVE: 'Inativo',
  }
  return labels[status]
}

function statusColor(status: Room['status']) {
  const colors: Record<Room['status'], string> = {
    AVAILABLE: 'bg-emerald-100 text-emerald-700',
    OCCUPIED: 'bg-blue-100 text-blue-700',
    MAINTENANCE: 'bg-amber-100 text-amber-700',
    INACTIVE: 'bg-gray-100 text-gray-700',
  }
  return colors[status]
}

export default function RoomsManagement() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [formData, setFormData] = useState<RoomForm>(emptyForm)

  async function loadRooms() {
    setLoading(true)
    try {
      const response = await api.listRooms()
      setRooms(response.items)
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao carregar quartos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadRooms()
  }, [])

  function openAddModal() {
    setFormData(emptyForm)
    setShowAddModal(true)
  }

  function openEditModal(room: Room) {
    setSelectedRoom(room)
    setFormData({
      number: room.number,
      name: room.name || '',
      type: room.type,
      capacity: room.capacity,
      description: room.description || '',
      basePrice: room.basePriceCents / 100,
      seasonalPrice: (room.seasonalPriceCents || 0) / 100,
      status: room.status,
    })
    setShowEditModal(true)
  }

  async function handleAddRoom() {
    try {
      await api.createRoom({
        number: formData.number,
        name: formData.name || undefined,
        type: formData.type,
        capacity: formData.capacity,
        description: formData.description || undefined,
        basePriceCents: Math.round(formData.basePrice * 100),
        seasonalPriceCents: formData.seasonalPrice > 0 ? Math.round(formData.seasonalPrice * 100) : undefined,
      })
      toast.success('Quarto adicionado com sucesso.')
      setShowAddModal(false)
      await loadRooms()
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao adicionar quarto.')
    }
  }

  async function handleEditRoom() {
    if (!selectedRoom) return
    try {
      await api.updateRoom(selectedRoom.id, {
        name: formData.name || undefined,
        type: formData.type,
        capacity: formData.capacity,
        description: formData.description || undefined,
        basePriceCents: Math.round(formData.basePrice * 100),
        seasonalPriceCents: formData.seasonalPrice > 0 ? Math.round(formData.seasonalPrice * 100) : null,
        status: formData.status,
      })
      toast.success('Quarto atualizado com sucesso.')
      setShowEditModal(false)
      setSelectedRoom(null)
      await loadRooms()
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao atualizar quarto.')
    }
  }

  async function handleDeleteRoom(id: string) {
    if (!confirm('Tem certeza que deseja excluir este quarto?')) return
    try {
      await api.deleteRoom(id)
      toast.success('Quarto removido com sucesso.')
      await loadRooms()
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao excluir quarto.')
    }
  }

  async function handleToggleMaintenance(room: Room) {
    try {
      await api.updateRoom(room.id, {
        status: room.status === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE',
      })
      await loadRooms()
    } catch (error) {
      toast.error((error as Error).message || 'Erro ao atualizar status.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <AdminNavbar />

      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center space-x-2 text-sm text-slate-600 mb-6" aria-label="Breadcrumb">
            <a href="/admin" className="hover:text-blue-500 transition-colors">
              Dashboard
            </a>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900 font-semibold">Gerenciar Quartos</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Gerenciar Quartos</h1>
              <p className="text-slate-600">Adicione, edite e controle o status dos quartos</p>
            </div>
            <button
              onClick={openAddModal}
              className="mt-4 md:mt-0 inline-flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span>Adicionar Quarto</span>
            </button>
          </div>

          {loading && (
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-slate-600 mb-6">
              Carregando quartos...
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all overflow-hidden"
              >
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center">
                        <Bed className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">Quarto {room.number}</h3>
                        <p className="text-white/80 text-sm">{room.name || room.type}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(room.status)}`}>
                      {statusLabel(room.status)}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-blue-500" />
                      <span className="text-sm font-semibold text-slate-600">Diária Base</span>
                    </div>
                    <span className="text-lg font-bold text-slate-900">{toCurrency(room.basePriceCents)}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm font-semibold text-slate-600">Preço Sazonal</span>
                    </div>
                    <span className="text-lg font-bold text-emerald-600">
                      {toCurrency(room.seasonalPriceCents)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl">
                    <Users className="w-5 h-5 text-blue-500" />
                    <span className="text-sm text-slate-600">
                      Capacidade: <span className="font-bold text-slate-900">{room.capacity} pessoas</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-4">
                    <button
                      onClick={() => openEditModal(room)}
                      className="flex items-center justify-center space-x-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => handleToggleMaintenance(room)}
                      className="flex items-center justify-center space-x-1 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold transition-colors"
                    >
                      <Wrench className="w-4 h-4" />
                      <span>{room.status === 'MAINTENANCE' ? 'Disponível' : 'Manutenção'}</span>
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(room.id)}
                      className="col-span-2 flex items-center justify-center space-x-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Excluir</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white flex items-center justify-between">
              <h2 className="text-2xl font-bold">Adicionar Novo Quarto</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Número</label>
                  <input
                    type="text"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nome</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Room['type'] })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                  >
                    <option value="STANDARD">STANDARD</option>
                    <option value="DELUXE">DELUXE</option>
                    <option value="PREMIUM">PREMIUM</option>
                    <option value="SUITE">SUITE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Capacidade</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Diária (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Sazonal (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={formData.seasonalPrice}
                    onChange={(e) => setFormData({ ...formData, seasonalPrice: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddRoom}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold transition-colors"
                >
                  Adicionar Quarto
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-slate-700 py-3 rounded-xl font-semibold transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedRoom && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white flex items-center justify-between">
              <h2 className="text-2xl font-bold">Editar Quarto {selectedRoom.number}</h2>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nome</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Room['type'] })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                  >
                    <option value="STANDARD">STANDARD</option>
                    <option value="DELUXE">DELUXE</option>
                    <option value="PREMIUM">PREMIUM</option>
                    <option value="SUITE">SUITE</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Capacidade</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Room['status'] })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                  >
                    <option value="AVAILABLE">Disponível</option>
                    <option value="OCCUPIED">Ocupado</option>
                    <option value="MAINTENANCE">Manutenção</option>
                    <option value="INACTIVE">Inativo</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Diária (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Sazonal (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={formData.seasonalPrice}
                    onChange={(e) => setFormData({ ...formData, seasonalPrice: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleEditRoom}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold transition-colors"
                >
                  Salvar Alterações
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-slate-700 py-3 rounded-xl font-semibold transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
