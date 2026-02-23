import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import Navbar from '../../components/Navbar'
import AdminNavbar from '../../components/AdminNavbar'
import {
  BarChart,
  ChevronRight,
  DollarSign,
  Users,
  Calendar,
  Percent,
  LoaderCircle,
} from 'lucide-react'
import { api, type ReportSummary } from '../../lib/api'

type PeriodOption = 'week' | 'month' | 'quarter' | 'year'

type TrendItem = {
  label: string
  occupancyRate: number
  revenueCents: number
}

function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatMoney(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function getSelectedPeriodRange(period: PeriodOption) {
  const today = new Date()
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  let start = new Date(end)

  if (period === 'week') {
    start.setDate(start.getDate() - 6)
  } else if (period === 'month') {
    start = new Date(end.getFullYear(), end.getMonth(), 1)
  } else if (period === 'quarter') {
    const quarterStartMonth = Math.floor(end.getMonth() / 3) * 3
    start = new Date(end.getFullYear(), quarterStartMonth, 1)
  } else if (period === 'year') {
    start = new Date(end.getFullYear(), 0, 1)
  }

  return {
    from: toIsoDate(start),
    to: toIsoDate(end),
  }
}

function getLastMonthRanges(amount: number) {
  const today = new Date()
  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)

  return Array.from({ length: amount }, (_, index) => {
    const offset = amount - 1 - index
    const start = new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth() - offset, 1)
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0)
    const label = start.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')

    return {
      label,
      from: toIsoDate(start),
      to: toIsoDate(end),
    }
  })
}

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>('month')
  const [loading, setLoading] = useState(true)
  const [guestCount, setGuestCount] = useState(0)
  const [report, setReport] = useState<ReportSummary | null>(null)
  const [trend, setTrend] = useState<TrendItem[]>([])

  useEffect(() => {
    async function loadReports() {
      setLoading(true)
      try {
        const selectedRange = getSelectedPeriodRange(selectedPeriod)
        const monthRanges = getLastMonthRanges(6)

        const [summary, guestsResponse, monthlyReports] = await Promise.all([
          api.getSummaryReport(selectedRange.from, selectedRange.to),
          api.listGuests(),
          Promise.all(
            monthRanges.map(async (range) => {
              const monthSummary = await api.getSummaryReport(range.from, range.to)
              return {
                label: range.label,
                occupancyRate: monthSummary.occupancyRate,
                revenueCents: monthSummary.totalRevenueCents,
              }
            })
          ),
        ])

        setReport(summary)
        setGuestCount(guestsResponse.items.length)
        setTrend(monthlyReports)
      } catch (error) {
        toast.error((error as Error).message || 'Erro ao carregar relatórios.')
      } finally {
        setLoading(false)
      }
    }

    void loadReports()
  }, [selectedPeriod])

  const maxRevenueCents = useMemo(() => {
    return Math.max(...trend.map((item) => item.revenueCents), 1)
  }, [trend])

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
            <span className="text-gray-900 font-semibold">Relatórios</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Relatórios de Ocupação</h1>
              <p className="text-gray-600">Dados reais de receita e performance por período</p>
            </div>
            <select
              value={selectedPeriod}
              onChange={(event) => setSelectedPeriod(event.target.value as PeriodOption)}
              className="mt-4 md:mt-0 px-6 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D4745E] focus:outline-none transition-colors bg-white font-semibold"
            >
              <option value="week">Últimos 7 dias</option>
              <option value="month">Mês atual</option>
              <option value="quarter">Trimestre atual</option>
              <option value="year">Ano atual</option>
            </select>
          </div>

          {loading && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 text-sm text-gray-600 flex items-center gap-2">
              <LoaderCircle className="w-4 h-4 animate-spin" />
              <span>Carregando relatório...</span>
            </div>
          )}

          {report && (
            <>
              <div className="bg-white rounded-2xl shadow-lg p-4 mb-8 text-sm text-gray-600">
                Período consultado: <strong>{report.from}</strong> até <strong>{report.to}</strong>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Receita Total</p>
                  <p className="text-3xl font-bold text-gray-900">{formatMoney(report.totalRevenueCents)}</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Percent className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Taxa de Ocupação</p>
                  <p className="text-3xl font-bold text-gray-900">{report.occupancyRate.toFixed(2)}%</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-violet-600 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Total de Hóspedes</p>
                  <p className="text-3xl font-bold text-gray-900">{guestCount}</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Total de Reservas</p>
                  <p className="text-3xl font-bold text-gray-900">{report.totalBookings}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Últimos 6 meses</h2>
                <div className="space-y-4">
                  {trend.map((data) => (
                    <div key={data.label} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-gray-700 capitalize">{data.label}</span>
                        <div className="flex items-center gap-6">
                          <span className="text-blue-600 font-semibold">{data.occupancyRate.toFixed(1)}%</span>
                          <span className="text-green-600 font-semibold">{formatMoney(data.revenueCents)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg transition-all"
                            style={{ width: `${Math.max(0, Math.min(data.occupancyRate, 100))}%` }}
                          />
                        </div>
                        <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-lg transition-all"
                            style={{ width: `${(data.revenueCents / maxRevenueCents) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded" />
                    <span className="text-gray-600">Taxa de Ocupação</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-green-600 rounded" />
                    <span className="text-gray-600">Receita</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Desempenho por Quarto</h2>
                {report.byRoom.length === 0 && (
                  <p className="text-sm text-gray-600">Nenhum dado por quarto para o período selecionado.</p>
                )}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {report.byRoom.map((room) => (
                    <div
                      key={room.roomId}
                      className="bg-gradient-to-br from-[#F5F1E8] to-white rounded-xl p-6 border-2 border-gray-100"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900">Quarto {room.roomNumber}</h3>
                        <div className="w-10 h-10 bg-[#D4745E] rounded-lg flex items-center justify-center">
                          <BarChart className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Ocupação</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#D4745E] to-[#B85A44] rounded-full"
                                style={{ width: `${Math.max(0, Math.min(room.occupancyRate, 100))}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold text-gray-900">{room.occupancyRate.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Reservas</p>
                          <p className="text-lg font-bold text-gray-900">{room.bookings}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Receita</p>
                          <p className="text-2xl font-bold text-[#D4745E]">{formatMoney(room.revenueCents)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
