const DAY_MS = 24 * 60 * 60 * 1000;

export function parseDateOnly(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("Invalid date format. Expected YYYY-MM-DD.");
  }
  return new Date(`${value}T00:00:00.000Z`);
}

export function ensureCheckoutAfterCheckin(checkIn: Date, checkOut: Date): void {
  if (checkOut.getTime() <= checkIn.getTime()) {
    throw new Error("checkOut must be greater than checkIn.");
  }
}

export function nightsBetween(checkIn: Date, checkOut: Date): number {
  return Math.round((checkOut.getTime() - checkIn.getTime()) / DAY_MS);
}

export function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

export function overlapNights(
  periodStart: Date,
  periodEndExclusive: Date,
  bookingStart: Date,
  bookingEndExclusive: Date
): number {
  const start = Math.max(periodStart.getTime(), bookingStart.getTime());
  const end = Math.min(periodEndExclusive.getTime(), bookingEndExclusive.getTime());
  if (end <= start) return 0;
  return Math.round((end - start) / DAY_MS);
}
