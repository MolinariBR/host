import { prisma as globalPrisma } from "../lib/prisma.js";
import { parseDateOnly, ensureCheckoutAfterCheckin, nightsBetween } from "../utils/date.js";
import { generateBookingCode } from "../utils/booking-code.js";
import { buildWhatsappUrl } from "../utils/whatsapp.js";
import { env } from "../env.js";
import { businessConfig } from "../config/business.js";
import { getHotelProfile } from "../repositories/hotel-profile.repo.js";
import { getRoomById } from "../repositories/rooms.repo.js";
import { upsertGuestByEmail } from "../repositories/guests.repo.js";
import { createBooking, createBookingServices, findBookingByCode, listPublicBookingsByEmail, } from "../repositories/bookings.repo.js";
import { listActiveServicesByIds } from "../repositories/services.repo.js";
function resolveHotelWhatsappPhone(profilePhone) {
    return profilePhone || env.WHATSAPP_PHONE;
}
function createWhatsappBookingMessage(params) {
    const total = (params.totalCents / 100).toFixed(2);
    return [
        "Ola! Gostaria de confirmar o pagamento da minha reserva.",
        `Codigo: ${params.bookingCode}`,
        `Hospede: ${params.guestName}`,
        `Email: ${params.guestEmail}`,
        `Quarto: ${params.roomNumber}`,
        `Check-in: ${params.checkIn}`,
        `Check-out: ${params.checkOut}`,
        `Total: R$ ${total}`,
    ].join("\n");
}
export async function createPublicBooking(prisma, input) {
    const guestDocument = input.guestDocument.replace(/\D/g, "");
    if (guestDocument.length !== 11 && guestDocument.length !== 14) {
        throw new Error("Guest document must be a valid CPF or CNPJ.");
    }
    const checkIn = parseDateOnly(input.checkIn);
    const checkOut = parseDateOnly(input.checkOut);
    ensureCheckoutAfterCheckin(checkIn, checkOut);
    const room = await getRoomById(prisma, input.roomId);
    if (!room)
        throw new Error("Room not found.");
    if (businessConfig.unavailablePublicRoomStatuses.has(room.status)) {
        throw new Error("Room is unavailable.");
    }
    if (input.guestsCount > room.capacity) {
        throw new Error("Guests count exceeds room capacity.");
    }
    const nights = nightsBetween(checkIn, checkOut);
    const nightlyRateCents = room.seasonalPriceCents ?? room.basePriceCents;
    const lodgingCents = nights * nightlyRateCents;
    const normalizedItems = (input.serviceItems || []).filter((item) => item.quantity > 0);
    const serviceIds = [...new Set(normalizedItems.map((item) => item.serviceId))];
    const services = serviceIds.length
        ? await listActiveServicesByIds(prisma, serviceIds)
        : [];
    if (serviceIds.length !== services.length) {
        throw new Error("One or more services are invalid or inactive.");
    }
    const serviceMap = new Map(services.map((service) => [service.id, service]));
    const serviceTotals = normalizedItems.map((item) => {
        const service = serviceMap.get(item.serviceId);
        if (!service)
            throw new Error("Service not found.");
        const lineTotal = service.priceCents * item.quantity;
        return {
            serviceId: item.serviceId,
            quantity: item.quantity,
            unitPriceCents: service.priceCents,
            totalCents: lineTotal,
        };
    });
    const extraServicesCents = serviceTotals.reduce((sum, item) => sum + item.totalCents, 0);
    const totalCents = lodgingCents + extraServicesCents;
    const booking = await prisma.$transaction(async (tx) => {
        const guest = await upsertGuestByEmail(tx, {
            name: input.guestName,
            email: input.guestEmail,
            phone: input.guestPhone,
            document: guestDocument,
        });
        const bookingCode = await generateBookingCode(tx);
        const created = await createBooking(tx, {
            bookingCode,
            guest: { connect: { id: guest.id } },
            room: { connect: { id: room.id } },
            status: businessConfig.initialBookingStatus,
            paymentStatus: businessConfig.initialPaymentStatus,
            source: "WEB",
            checkIn,
            checkOut,
            guestsCount: input.guestsCount,
            nightlyRateCents,
            extraServicesCents,
            totalCents,
            notes: input.notes,
        });
        await createBookingServices(tx, serviceTotals.map((item) => ({
            bookingId: created.id,
            serviceId: item.serviceId,
            quantity: item.quantity,
            unitPriceCents: item.unitPriceCents,
            totalCents: item.totalCents,
        })));
        return created;
    });
    const profile = await getHotelProfile(prisma);
    const phone = resolveHotelWhatsappPhone(profile?.phone);
    const message = createWhatsappBookingMessage({
        bookingCode: booking.bookingCode,
        guestName: input.guestName,
        guestEmail: input.guestEmail,
        roomNumber: room.number,
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        totalCents,
    });
    return {
        bookingCode: booking.bookingCode,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        whatsappUrl: buildWhatsappUrl(phone, message),
    };
}
export async function lookupPublicBookings(prisma, input) {
    const bookings = await listPublicBookingsByEmail(prisma, input.email, input.bookingCode);
    return bookings.map((booking) => ({
        bookingCode: booking.bookingCode,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        checkIn: booking.checkIn.toISOString().slice(0, 10),
        checkOut: booking.checkOut.toISOString().slice(0, 10),
        roomNumber: booking.room.number,
        totalCents: booking.totalCents,
        createdAt: booking.createdAt.toISOString(),
    }));
}
export async function getPublicBookingWhatsappLink(prisma, bookingCode) {
    const booking = await findBookingByCode(prisma, bookingCode);
    if (!booking)
        throw new Error("Booking not found.");
    const profile = await getHotelProfile(prisma);
    const phone = resolveHotelWhatsappPhone(profile?.phone);
    const message = createWhatsappBookingMessage({
        bookingCode: booking.bookingCode,
        guestName: booking.guest.name,
        guestEmail: booking.guest.email,
        roomNumber: booking.room.number,
        checkIn: booking.checkIn.toISOString().slice(0, 10),
        checkOut: booking.checkOut.toISOString().slice(0, 10),
        totalCents: booking.totalCents,
    });
    return { url: buildWhatsappUrl(phone, message) };
}
// Exported only for seed/debug flows where a client is not injected.
export async function createPublicBookingWithGlobalClient(input) {
    return createPublicBooking(globalPrisma, input);
}
