import type { Guest, Prisma } from "@prisma/client";
import type { DbClient } from "./types.js";

export async function listGuests(prisma: DbClient, search?: string): Promise<Guest[]> {
  return prisma.guest.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { phone: { contains: search } },
          ],
        }
      : undefined,
    orderBy: { name: "asc" },
  });
}

export async function getGuestById(prisma: DbClient, id: string): Promise<Guest | null> {
  return prisma.guest.findUnique({
    where: { id },
  });
}

export async function upsertGuestByEmail(
  prisma: DbClient,
  data: {
    name: string;
    email: string;
    phone: string;
    document?: string;
  }
): Promise<Guest> {
  return prisma.guest.upsert({
    where: { email: data.email },
    update: {
      name: data.name,
      phone: data.phone,
      document: data.document ?? undefined,
    },
    create: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      document: data.document,
    },
  });
}

export async function createGuest(
  prisma: DbClient,
  data: Prisma.GuestCreateInput
): Promise<Guest> {
  return prisma.guest.create({ data });
}
