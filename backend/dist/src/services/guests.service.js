import * as guestsRepo from "../repositories/guests.repo.js";
export function listGuests(prisma, search) {
    return guestsRepo.listGuests(prisma, search);
}
export function getGuestById(prisma, guestId) {
    return guestsRepo.getGuestById(prisma, guestId);
}
