import type { PrismaClient, Prisma } from "@prisma/client";
import * as roomsRepo from "../repositories/rooms.repo.js";

export function listRooms(prisma: PrismaClient) {
  return roomsRepo.listRooms(prisma);
}

export function listBookableRooms(prisma: PrismaClient) {
  return roomsRepo.listBookableRooms(prisma);
}

export function getRoomById(prisma: PrismaClient, roomId: string) {
  return roomsRepo.getRoomById(prisma, roomId);
}

export function createRoom(prisma: PrismaClient, data: Prisma.RoomCreateInput) {
  return roomsRepo.createRoom(prisma, data);
}

export function updateRoom(prisma: PrismaClient, roomId: string, data: Prisma.RoomUpdateInput) {
  return roomsRepo.updateRoom(prisma, roomId, data);
}

export function deleteRoom(prisma: PrismaClient, roomId: string) {
  return roomsRepo.deleteRoom(prisma, roomId);
}
