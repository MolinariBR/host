import { getAdminToken } from './auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3000'

type RequestOptions = RequestInit & {
  auth?: boolean
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers || {})
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (options.auth) {
    const token = getAdminToken()
    if (!token) {
      throw new Error('Sessão administrativa não encontrada.')
    }
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    const message = data?.message || `Erro HTTP ${response.status}`
    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export type PublicRoom = {
  id: string
  number: string
  name?: string | null
  type: 'STANDARD' | 'DELUXE' | 'PREMIUM' | 'SUITE'
  capacity: number
  basePriceCents: number
  seasonalPriceCents?: number | null
}

export type CreateBookingPayload = {
  guestName: string
  guestEmail: string
  guestPhone: string
  checkIn: string
  checkOut: string
  guestsCount: number
  roomId: string
  notes?: string
}

export type CreateBookingResponse = {
  bookingCode: string
  status: string
  paymentStatus: string
  whatsappUrl: string
}

export type PublicBookingItem = {
  bookingCode: string
  status: string
  paymentStatus: string
  checkIn: string
  checkOut: string
  roomNumber: string
  totalCents: number
  createdAt: string
}

export type Room = {
  id: string
  number: string
  name?: string | null
  type: 'STANDARD' | 'DELUXE' | 'PREMIUM' | 'SUITE'
  capacity: number
  description?: string | null
  basePriceCents: number
  seasonalPriceCents?: number | null
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'INACTIVE'
  createdAt: string
  updatedAt: string
}

export type Guest = {
  id: string
  name: string
  email: string
  phone: string
  document?: string | null
  address?: string | null
  createdAt: string
  updatedAt: string
}

export type Service = {
  id: string
  name: string
  description?: string | null
  category: 'FOOD' | 'TRANSPORT' | 'WELLNESS' | 'LEISURE' | 'OTHER'
  priceCents: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type Booking = {
  id: string
  bookingCode: string
  status: string
  paymentStatus: string
  checkIn: string
  checkOut: string
  guestsCount: number
  notes?: string | null
  totalCents: number
  createdAt: string
  guest: Guest
  room: Room
}

export type ReportSummary = {
  from: string
  to: string
  totalRevenueCents: number
  totalBookings: number
  occupancyRate: number
  byRoom: Array<{
    roomId: string
    roomNumber: string
    bookings: number
    revenueCents: number
    occupancyRate: number
  }>
}

export type HotelProfile = {
  id: string
  legalName: string
  tradeName: string
  cnpj: string
  phone: string
  email?: string | null
  city: string
  state: string
  addressLine?: string | null
  googleMapsUrl?: string | null
  googleBusinessUrl?: string | null
  createdAt: string
  updatedAt: string
}

export type PublicGoogleReviewItem = {
  authorName: string
  authorProfileUri?: string | null
  authorPhotoUri?: string | null
  rating: number
  relativePublishTimeDescription: string
  publishTime?: string | null
  text: string
  googleMapsUri?: string | null
}

export type PublicGoogleReviewsResponse = {
  source: 'GOOGLE'
  enabled: boolean
  placeName?: string | null
  placeGoogleMapsUri?: string | null
  rating?: number | null
  userRatingCount?: number | null
  items: PublicGoogleReviewItem[]
  updatedAt: string
}

export const api = {
  health: () => request<{ status: string; timestamp: string }>('/health'),
  getHotelProfile: () => request<HotelProfile>('/hotel-profile'),
  getGoogleReviews: () => request<PublicGoogleReviewsResponse>('/reviews/google'),

  getPublicRooms: () => request<{ items: PublicRoom[] }>('/rooms'),
  createBooking: (payload: CreateBookingPayload) =>
    request<CreateBookingResponse>('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  lookupBookings: (email: string, bookingCode?: string) => {
    const query = new URLSearchParams({ email })
    if (bookingCode) query.set('bookingCode', bookingCode)
    return request<{ items: PublicBookingItem[] }>(`/bookings/lookup?${query.toString()}`)
  },
  getBookingWhatsappLink: (bookingCode: string) =>
    request<{ url: string }>(`/bookings/${bookingCode}/whatsapp-link`),

  adminLogin: (payload: { email: string; password: string }) =>
    request<{ token: string; admin: { id: string; name: string; email: string; role: string } }>(
      '/admin/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    ),
  listRooms: () => request<{ items: Room[] }>('/admin/rooms', { auth: true }),
  createRoom: (payload: {
    number: string
    name?: string
    type: Room['type']
    capacity: number
    description?: string
    basePriceCents: number
    seasonalPriceCents?: number
  }) =>
    request<Room>('/admin/rooms', {
      method: 'POST',
      auth: true,
      body: JSON.stringify(payload),
    }),
  updateRoom: (
    roomId: string,
    payload: Partial<{
      name: string
      type: Room['type']
      capacity: number
      description: string
      basePriceCents: number
      seasonalPriceCents: number | null
      status: Room['status']
    }>
  ) =>
    request<Room>(`/admin/rooms/${roomId}`, {
      method: 'PATCH',
      auth: true,
      body: JSON.stringify(payload),
    }),
  deleteRoom: (roomId: string) =>
    request<void>(`/admin/rooms/${roomId}`, { method: 'DELETE', auth: true }),

  listGuests: (search?: string) => {
    const query = search ? `?search=${encodeURIComponent(search)}` : ''
    return request<{ items: Guest[] }>(`/admin/guests${query}`, { auth: true })
  },

  listServices: () => request<{ items: Service[] }>('/admin/services', { auth: true }),
  createService: (payload: {
    name: string
    description?: string
    category: Service['category']
    priceCents: number
    isActive?: boolean
  }) =>
    request<Service>('/admin/services', {
      method: 'POST',
      auth: true,
      body: JSON.stringify(payload),
    }),
  updateService: (
    serviceId: string,
    payload: Partial<{
      name: string
      description: string
      category: Service['category']
      priceCents: number
      isActive: boolean
    }>
  ) =>
    request<Service>(`/admin/services/${serviceId}`, {
      method: 'PATCH',
      auth: true,
      body: JSON.stringify(payload),
    }),
  deleteService: (serviceId: string) =>
    request<void>(`/admin/services/${serviceId}`, { method: 'DELETE', auth: true }),

  listBookings: (filters?: { status?: string; from?: string; to?: string }) => {
    const query = new URLSearchParams()
    if (filters?.status) query.set('status', filters.status)
    if (filters?.from) query.set('from', filters.from)
    if (filters?.to) query.set('to', filters.to)
    const suffix = query.toString() ? `?${query.toString()}` : ''
    return request<{ items: Booking[] }>(`/admin/bookings${suffix}`, { auth: true })
  },
  updateBooking: (
    bookingId: string,
    payload: Partial<{
      status: string
      paymentStatus: string
      notes: string
    }>
  ) =>
    request<Booking>(`/admin/bookings/${bookingId}`, {
      method: 'PATCH',
      auth: true,
      body: JSON.stringify(payload),
    }),

  getSummaryReport: (from: string, to: string) =>
    request<ReportSummary>(`/admin/reports/summary?from=${from}&to=${to}`, { auth: true }),
}
