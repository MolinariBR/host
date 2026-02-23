import type { PrismaClient } from "@prisma/client";
import * as guestsRepo from "../repositories/guests.repo.js";

export function listGuests(prisma: PrismaClient, search?: string) {
  return guestsRepo.listGuests(prisma, search);
}

export function getGuestById(prisma: PrismaClient, guestId: string) {
  return guestsRepo.getGuestById(prisma, guestId);
}
