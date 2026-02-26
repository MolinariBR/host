import { summaryReportController } from "../controllers/admin-reports.controller.js";
export async function adminReportRoutes(app) {
    app.get("/admin/reports/summary", { preHandler: app.authenticate }, summaryReportController);
}
