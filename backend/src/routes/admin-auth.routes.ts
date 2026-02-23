import type { FastifyInstance } from "fastify";
import { loginAdminController } from "../controllers/admin-auth.controller.js";

export async function adminAuthRoutes(app: FastifyInstance) {
  app.post("/admin/auth/login", loginAdminController);
}
