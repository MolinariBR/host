import type { FastifyInstance } from "fastify";
import { getPublicHotelProfileController } from "../controllers/public-hotel-profile.controller.js";

export async function publicHotelProfileRoutes(app: FastifyInstance) {
  app.get("/hotel-profile", getPublicHotelProfileController);
}
