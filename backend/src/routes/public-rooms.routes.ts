import type { FastifyInstance } from "fastify";
import { listPublicRoomsController } from "../controllers/public-rooms.controller.js";

export async function publicRoomRoutes(app: FastifyInstance) {
  app.get("/rooms", listPublicRoomsController);
}
