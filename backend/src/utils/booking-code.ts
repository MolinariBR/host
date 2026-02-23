import type { DbClient } from "../repositories/types.js";
import { addDays, startOfUtcDay } from "./date.js";
import { businessConfig } from "../config/business.js";

export async function generateBookingCode(prisma: DbClient): Promise<string> {
  const now = new Date();
  const dayStart = startOfUtcDay(now);
  const dayEnd = addDays(dayStart, 1);

  const count = await prisma.booking.count({
    where: {
      createdAt: {
        gte: dayStart,
        lt: dayEnd,
      },
    },
  });

  const y = now.getUTCFullYear().toString();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  const sequence = String(count + 1).padStart(3, "0");

  return `${businessConfig.bookingCodePrefix}-${y}${m}${d}-${sequence}`;
}
