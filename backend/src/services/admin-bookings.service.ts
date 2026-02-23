import type { BookingStatus, PaymentStatus, PrismaClient } from "@prisma/client";
import { parseDateOnly, addDays } from "../utils/date.js";
import * as bookingsRepo from "../repositories/bookings.repo.js";
import { isValidBookingStatusTransition } from "../config/business.js";

export class BookingNotFoundError extends Error {}
export class InvalidBookingStatusTransitionError extends Error {}

export async function listAdminBookings(
  prisma: PrismaClient,
  filters: { status?: BookingStatus; from?: string; to?: string }
) {
  const from = filters.from ? parseDateOnly(filters.from) : undefined;
  const to = filters.to ? addDays(parseDateOnly(filters.to), 1) : undefined;

  const bookings = await bookingsRepo.listAdminBookings(prisma, {
    status: filters.status,
    from,
    to,
  });

  return bookings.map((booking) => ({
    ...booking,
    checkIn: booking.checkIn.toISOString().slice(0, 10),
    checkOut: booking.checkOut.toISOString().slice(0, 10),
    createdAt: booking.createdAt.toISOString(),
  }));
}

export async function getAdminBookingById(prisma: PrismaClient, bookingId: string) {
  const booking = await bookingsRepo.getAdminBookingById(prisma, bookingId);
  if (!booking) return null;
  return {
    ...booking,
    checkIn: booking.checkIn.toISOString().slice(0, 10),
    checkOut: booking.checkOut.toISOString().slice(0, 10),
    createdAt: booking.createdAt.toISOString(),
  };
}

export async function updateAdminBooking(
  prisma: PrismaClient,
  bookingId: string,
  input: { status?: BookingStatus; paymentStatus?: PaymentStatus; notes?: string }
) {
  const current = await bookingsRepo.getAdminBookingById(prisma, bookingId);
  if (!current) throw new BookingNotFoundError("Resource not found.");

  if (
    input.status &&
    !isValidBookingStatusTransition(current.status, input.status)
  ) {
    throw new InvalidBookingStatusTransitionError(
      `Invalid status transition from ${current.status} to ${input.status}.`
    );
  }

  const booking = await bookingsRepo.updateBookingById(prisma, bookingId, input);
  return {
    ...booking,
    checkIn: booking.checkIn.toISOString().slice(0, 10),
    checkOut: booking.checkOut.toISOString().slice(0, 10),
    createdAt: booking.createdAt.toISOString(),
  };
}
