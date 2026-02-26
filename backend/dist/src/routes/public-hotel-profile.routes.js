import { getPublicHotelProfileController } from "../controllers/public-hotel-profile.controller.js";
export async function publicHotelProfileRoutes(app) {
    app.get("/hotel-profile", getPublicHotelProfileController);
}
