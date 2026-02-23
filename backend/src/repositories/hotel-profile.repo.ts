import type { HotelProfile } from "@prisma/client";
import type { DbClient } from "./types.js";

export async function getHotelProfile(prisma: DbClient): Promise<HotelProfile | null> {
  return prisma.hotelProfile.findFirst();
}
