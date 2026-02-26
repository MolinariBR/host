const DAY_MS = 24 * 60 * 60 * 1000;
export function parseDateOnly(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw new Error("Invalid date format. Expected YYYY-MM-DD.");
    }
    return new Date(`${value}T00:00:00.000Z`);
}
export function ensureCheckoutAfterCheckin(checkIn, checkOut) {
    if (checkOut.getTime() <= checkIn.getTime()) {
        throw new Error("checkOut must be greater than checkIn.");
    }
}
export function nightsBetween(checkIn, checkOut) {
    return Math.round((checkOut.getTime() - checkIn.getTime()) / DAY_MS);
}
export function startOfUtcDay(date) {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}
export function addDays(date, days) {
    return new Date(date.getTime() + days * DAY_MS);
}
export function overlapNights(periodStart, periodEndExclusive, bookingStart, bookingEndExclusive) {
    const start = Math.max(periodStart.getTime(), bookingStart.getTime());
    const end = Math.min(periodEndExclusive.getTime(), bookingEndExclusive.getTime());
    if (end <= start)
        return 0;
    return Math.round((end - start) / DAY_MS);
}
