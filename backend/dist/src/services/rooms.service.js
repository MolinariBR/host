import * as roomsRepo from "../repositories/rooms.repo.js";
export function listRooms(prisma) {
    return roomsRepo.listRooms(prisma);
}
export function listBookableRooms(prisma) {
    return roomsRepo.listBookableRooms(prisma);
}
export function getRoomById(prisma, roomId) {
    return roomsRepo.getRoomById(prisma, roomId);
}
export function createRoom(prisma, data) {
    return roomsRepo.createRoom(prisma, data);
}
export function updateRoom(prisma, roomId, data) {
    return roomsRepo.updateRoom(prisma, roomId, data);
}
export function deleteRoom(prisma, roomId) {
    return roomsRepo.deleteRoom(prisma, roomId);
}
