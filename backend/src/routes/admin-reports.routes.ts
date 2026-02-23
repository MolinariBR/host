import type { FastifyInstance } from "fastify";
import { summaryReportController } from "../controllers/admin-reports.controller.js";

export async function adminReportRoutes(app: FastifyInstance) {
  app.get("/admin/reports/summary", { preHandler: app.authenticate }, summaryReportController);
}
