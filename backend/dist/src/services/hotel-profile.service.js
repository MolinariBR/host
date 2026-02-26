import { getHotelProfile } from "../repositories/hotel-profile.repo.js";
export function getPublicHotelProfile(prisma) {
    return getHotelProfile(prisma);
}
