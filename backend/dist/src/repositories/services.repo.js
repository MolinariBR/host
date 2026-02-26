export async function listServices(prisma) {
    return prisma.service.findMany({
        orderBy: { name: "asc" },
    });
}
export async function listActiveServicesByIds(prisma, ids) {
    return prisma.service.findMany({
        where: {
            id: { in: ids },
            isActive: true,
        },
    });
}
export async function createService(prisma, data) {
    return prisma.service.create({ data });
}
export async function updateService(prisma, id, data) {
    return prisma.service.update({
        where: { id },
        data,
    });
}
export async function deleteService(prisma, id) {
    await prisma.service.delete({
        where: { id },
    });
}
