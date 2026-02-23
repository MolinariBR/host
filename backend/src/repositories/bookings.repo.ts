import type {
  Booking,
  BookingService,
  Prisma,
  BookingStatus,
  PaymentStatus,
} from "@prisma/client";
import type { DbClient } from "./types.js";

type BookingWithRelations = Prisma.BookingGetPayload<{
  include: {
    guest: true;
    room: true;
    services: {
      include: {
        service: true;
      };
    };
  };
}>;

export async function createBooking(
  prisma: DbClient,
  data: Prisma.BookingCreateInput
): Promise<Booking> {
  return prisma.booking.create({ data });
}

export async function createBookingServices(
  prisma: DbClient,
  data: Prisma.BookingServiceCreateManyInput[]
): Promise<void> {
  if (data.length === 0) return;
  await prisma.bookingService.createMany({ data });
}

export async function listPublicBookingsByEmail(
  prisma: DbClient,
  email: string,
  bookingCode?: string
): Promise<BookingWithRelations[]> {
  return prisma.booking.findMany({
    where: {
      bookingCode: bookingCode ?? undefined,
      guest: { email },
    },
    include: {
      guest: true,
      room: true,
      services: { include: { service: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function findBookingByCode(
  prisma: DbClient,
  bookingCode: string
): Promise<BookingWithRelations | null> {
  return prisma.booking.findUnique({
    where: { bookingCode },
    include: {
      guest: true,
      room: true,
      services: { include: { service: true } },
    },
  });
}

export async function listAdminBookings(
  prisma: DbClient,
  filters: {
    status?: BookingStatus;
    from?: Date;
    to?: Date;
  }
): Promise<BookingWithRelations[]> {
  return prisma.booking.findMany({
    where: {
      status: filters.status,
      checkIn: filters.from ? { gte: filters.from } : undefined,
      checkOut: filters.to ? { lte: filters.to } : undefined,
    },
    include: {
      guest: true,
      room: true,
      services: { include: { service: true } },
    },
    orderBy: { checkIn: "desc" },
  });
}

export async function getAdminBookingById(
  prisma: DbClient,
  bookingId: string
): Promise<BookingWithRelations | null> {
  return prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      guest: true,
      room: true,
      services: { include: { service: true } },
    },
  });
}

export async function updateBookingById(
  prisma: DbClient,
  bookingId: string,
  data: {
    status?: BookingStatus;
    paymentStatus?: PaymentStatus;
    notes?: string;
  }
): Promise<BookingWithRelations> {
  return prisma.booking.update({
    where: { id: bookingId },
    data,
    include: {
      guest: true,
      room: true,
      services: { include: { service: true } },
    },
  });
}

export async function listBookingsForReportRange(
  prisma: DbClient,
  from: Date,
  toExclusive: Date
): Promise<
  (Booking & {
    room: { id: string; number: string };
    services: BookingService[];
  })[]
> {
  return prisma.booking.findMany({
    where: {
      status: {
        notIn: ["CANCELED", "NO_SHOW"],
      },
      checkOut: { gt: from },
      checkIn: { lt: toExclusive },
    },
    include: {
      room: {
        select: { id: true, number: true },
      },
      services: true,
    },
  });
}
