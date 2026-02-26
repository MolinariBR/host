export async function getHotelProfile(prisma) {
    return prisma.hotelProfile.findFirst();
}
