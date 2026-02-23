import type { BookingStatus, PaymentStatus, RoomStatus } from "@prisma/client";
import { env } from "../env.js";

const bookingStatusTransitions: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELED", "NO_SHOW"],
  CONFIRMED: ["CHECKED_IN", "CANCELED", "NO_SHOW"],
  CHECKED_IN: ["CHECKED_OUT"],
  CHECKED_OUT: [],
  CANCELED: [],
  NO_SHOW: [],
};

export const businessConfig = {
  bookingCodePrefix: env.BOOKING_CODE_PREFIX,
  initialBookingStatus: "PENDING" as BookingStatus,
  initialPaymentStatus: "PENDING_WHATSAPP" as PaymentStatus,
  unavailablePublicRoomStatuses: new Set<RoomStatus>(["MAINTENANCE", "INACTIVE"]),
  bookingStatusTransitions,
};

export function isValidBookingStatusTransition(from: BookingStatus, to: BookingStatus): boolean {
  if (from === to) return true;
  return businessConfig.bookingStatusTransitions[from].includes(to);
}
