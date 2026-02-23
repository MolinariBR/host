const bookingCodePrefix = import.meta.env.VITE_BOOKING_CODE_PREFIX || 'HSA'

export const appConfig = {
  bookingCodePrefix,
  bookingCodePlaceholder: `${bookingCodePrefix}-YYYYMMDD-001`,
  adminLoginHintEmail: import.meta.env.VITE_ADMIN_LOGIN_HINT_EMAIL || 'admin@example.com',
  guestPhonePlaceholder: import.meta.env.VITE_GUEST_PHONE_PLACEHOLDER || '+55 00 00000-0000',
  fallbackHotelName: import.meta.env.VITE_FALLBACK_HOTEL_NAME || 'Hotel Santo Antonio',
  fallbackCity: import.meta.env.VITE_FALLBACK_HOTEL_CITY || 'Itaguatins',
  fallbackState: import.meta.env.VITE_FALLBACK_HOTEL_STATE || 'TO',
}
