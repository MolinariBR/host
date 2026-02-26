import { createPublicBookingController, getWhatsappLinkController, lookupPublicBookingsController, } from "../controllers/public-bookings.controller.js";
export async function publicBookingRoutes(app) {
    app.post("/bookings", createPublicBookingController);
    app.get("/bookings/lookup", lookupPublicBookingsController);
    app.get("/bookings/:bookingCode/whatsapp-link", getWhatsappLinkController);
}
