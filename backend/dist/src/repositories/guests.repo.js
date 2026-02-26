export async function listGuests(prisma, search) {
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
export async function getGuestById(prisma, id) {
    return prisma.guest.findUnique({
        where: { id },
    });
}
export async function upsertGuestByEmail(prisma, data) {
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
export async function createGuest(prisma, data) {
    return prisma.guest.create({ data });
}
