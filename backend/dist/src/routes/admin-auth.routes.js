import { loginAdminController } from "../controllers/admin-auth.controller.js";
export async function adminAuthRoutes(app) {
    app.post("/admin/auth/login", loginAdminController);
}
