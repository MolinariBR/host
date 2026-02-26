export async function findActiveAdminByEmail(prisma, email) {
    return prisma.adminUser.findFirst({
        where: {
            email,
            isActive: true,
        },
    });
}
