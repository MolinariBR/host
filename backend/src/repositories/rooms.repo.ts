import type { Room, Prisma } from "@prisma/client";
import type { DbClient } from "./types.js";

export async function listRooms(prisma: DbClient): Promise<Room[]> {
  return prisma.room.findMany({
    orderBy: { number: "asc" },
  });
}

export async function listBookableRooms(prisma: DbClient): Promise<Room[]> {
  return prisma.room.findMany({
    where: {
      status: "AVAILABLE",
    },
    orderBy: { number: "asc" },
  });
}

export async function getRoomById(prisma: DbClient, id: string): Promise<Room | null> {
  return prisma.room.findUnique({ where: { id } });
}

export async function createRoom(
  prisma: DbClient,
  data: Prisma.RoomCreateInput
): Promise<Room> {
  return prisma.room.create({ data });
}

export async function updateRoom(
  prisma: DbClient,
  id: string,
  data: Prisma.RoomUpdateInput
): Promise<Room> {
  return prisma.room.update({
    where: { id },
    data,
  });
}

export async function deleteRoom(prisma: DbClient, id: string): Promise<void> {
  await prisma.room.delete({ where: { id } });
}

export async function countActiveRooms(prisma: DbClient): Promise<number> {
  return prisma.room.count({
    where: {
      status: {
        not: "INACTIVE",
      },
    },
  });
}
