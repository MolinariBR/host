import type { FastifyInstance } from "fastify";
import {
  getGuestByIdController,
  listGuestsController,
} from "../controllers/admin-guests.controller.js";

export async function adminGuestRoutes(app: FastifyInstance) {
  app.get("/admin/guests", { preHandler: app.authenticate }, listGuestsController);
  app.get("/admin/guests/:guestId", { preHandler: app.authenticate }, getGuestByIdController);
}
