export async function createBooking(prisma, data) {
    return prisma.booking.create({ data });
}
export async function createBookingServices(prisma, data) {
    if (data.length === 0)
        return;
    await prisma.bookingService.createMany({ data });
}
export async function listPublicBookingsByEmail(prisma, email, bookingCode) {
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
export async function findBookingByCode(prisma, bookingCode) {
    return prisma.booking.findUnique({
        where: { bookingCode },
        include: {
            guest: true,
            room: true,
            services: { include: { service: true } },
        },
    });
}
export async function listAdminBookings(prisma, filters) {
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
export async function getAdminBookingById(prisma, bookingId) {
    return prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
            guest: true,
            room: true,
            services: { include: { service: true } },
        },
    });
}
export async function updateBookingById(prisma, bookingId, data) {
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
export async function listBookingsForReportRange(prisma, from, toExclusive) {
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
