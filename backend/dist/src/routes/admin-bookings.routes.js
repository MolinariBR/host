import { getBookingByIdController, listBookingsController, updateBookingController, } from "../controllers/admin-bookings.controller.js";
export async function adminBookingRoutes(app) {
    app.get("/admin/bookings", { preHandler: app.authenticate }, listBookingsController);
    app.get("/admin/bookings/:bookingId", { preHandler: app.authenticate }, getBookingByIdController);
    app.patch("/admin/bookings/:bookingId", { preHandler: app.authenticate }, updateBookingController);
}
