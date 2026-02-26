import { addDays, overlapNights, parseDateOnly, nightsBetween } from "../utils/date.js";
import { countActiveRooms } from "../repositories/rooms.repo.js";
import { listBookingsForReportRange } from "../repositories/bookings.repo.js";
export async function getSummaryReport(prisma, input) {
    const from = parseDateOnly(input.from);
    const toInclusive = parseDateOnly(input.to);
    if (toInclusive.getTime() < from.getTime()) {
        throw new Error("to must be greater than or equal to from.");
    }
    const toExclusive = addDays(toInclusive, 1);
    const activeRooms = await countActiveRooms(prisma);
    const bookings = await listBookingsForReportRange(prisma, from, toExclusive);
    const totalRevenueCents = bookings.reduce((sum, booking) => sum + booking.totalCents, 0);
    const totalBookings = bookings.length;
    const periodNights = nightsBetween(from, toExclusive);
    const occupiedNights = bookings.reduce((sum, booking) => {
        return sum + overlapNights(from, toExclusive, booking.checkIn, booking.checkOut);
    }, 0);
    const totalCapacityNights = activeRooms * periodNights;
    const occupancyRate = totalCapacityNights > 0 ? Number(((occupiedNights / totalCapacityNights) * 100).toFixed(2)) : 0;
    const byRoomMap = new Map();
    for (const booking of bookings) {
        const occupied = overlapNights(from, toExclusive, booking.checkIn, booking.checkOut);
        const key = booking.room.id;
        const current = byRoomMap.get(key);
        if (!current) {
            byRoomMap.set(key, {
                roomId: booking.room.id,
                roomNumber: booking.room.number,
                bookings: 1,
                revenueCents: booking.totalCents,
                occupiedNights: occupied,
            });
        }
        else {
            current.bookings += 1;
            current.revenueCents += booking.totalCents;
            current.occupiedNights += occupied;
        }
    }
    const byRoom = [...byRoomMap.values()].map((room) => ({
        roomId: room.roomId,
        roomNumber: room.roomNumber,
        bookings: room.bookings,
        revenueCents: room.revenueCents,
        occupancyRate: periodNights > 0 ? Number(((room.occupiedNights / periodNights) * 100).toFixed(2)) : 0,
    }));
    return {
        from: input.from,
        to: input.to,
        totalRevenueCents,
        totalBookings,
        occupancyRate,
        byRoom,
    };
}
