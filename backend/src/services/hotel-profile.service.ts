import type { PrismaClient } from "@prisma/client";
import { getHotelProfile } from "../repositories/hotel-profile.repo.js";

export function getPublicHotelProfile(prisma: PrismaClient) {
  return getHotelProfile(prisma);
}
