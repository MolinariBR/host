import type { FastifyInstance } from "fastify";
import { healthRoutes } from "./health.routes.js";
import { publicHotelProfileRoutes } from "./public-hotel-profile.routes.js";
import { publicReviewRoutes } from "./public-reviews.routes.js";
import { publicBookingRoutes } from "./public-bookings.routes.js";
import { publicRoomRoutes } from "./public-rooms.routes.js";
import { adminAuthRoutes } from "./admin-auth.routes.js";
import { adminRoomRoutes } from "./admin-rooms.routes.js";
import { adminGuestRoutes } from "./admin-guests.routes.js";
import { adminServiceRoutes } from "./admin-services.routes.js";
import { adminBookingRoutes } from "./admin-bookings.routes.js";
import { adminReportRoutes } from "./admin-reports.routes.js";

export async function registerRoutes(app: FastifyInstance) {
  await healthRoutes(app);
  await publicHotelProfileRoutes(app);
  await publicReviewRoutes(app);
  await publicRoomRoutes(app);
  await publicBookingRoutes(app);
  await adminAuthRoutes(app);
  await adminRoomRoutes(app);
  await adminGuestRoutes(app);
  await adminServiceRoutes(app);
  await adminBookingRoutes(app);
  await adminReportRoutes(app);
}
