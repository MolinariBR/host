import { env } from "../env.js";
const bookingStatusTransitions = {
    PENDING: ["CONFIRMED", "CANCELED", "NO_SHOW"],
    CONFIRMED: ["CHECKED_IN", "CANCELED", "NO_SHOW"],
    CHECKED_IN: ["CHECKED_OUT"],
    CHECKED_OUT: [],
    CANCELED: [],
    NO_SHOW: [],
};
export const businessConfig = {
    bookingCodePrefix: env.BOOKING_CODE_PREFIX,
    initialBookingStatus: "PENDING",
    initialPaymentStatus: "PENDING_WHATSAPP",
    unavailablePublicRoomStatuses: new Set(["MAINTENANCE", "INACTIVE"]),
    bookingStatusTransitions,
};
export function isValidBookingStatusTransition(from, to) {
    if (from === to)
        return true;
    return businessConfig.bookingStatusTransitions[from].includes(to);
}
