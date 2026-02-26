export async function listRooms(prisma) {
    return prisma.room.findMany({
        orderBy: { number: "asc" },
    });
}
export async function listBookableRooms(prisma) {
    return prisma.room.findMany({
        where: {
            status: "AVAILABLE",
        },
        orderBy: { number: "asc" },
    });
}
export async function getRoomById(prisma, id) {
    return prisma.room.findUnique({ where: { id } });
}
export async function createRoom(prisma, data) {
    return prisma.room.create({ data });
}
export async function updateRoom(prisma, id, data) {
    return prisma.room.update({
        where: { id },
        data,
    });
}
export async function deleteRoom(prisma, id) {
    await prisma.room.delete({ where: { id } });
}
export async function countActiveRooms(prisma) {
    return prisma.room.count({
        where: {
            status: {
                not: "INACTIVE",
            },
        },
    });
}
