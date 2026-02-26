import { createServiceController, deleteServiceController, listServicesController, updateServiceController, } from "../controllers/admin-services.controller.js";
export async function adminServiceRoutes(app) {
    app.get("/admin/services", { preHandler: app.authenticate }, listServicesController);
    app.post("/admin/services", { preHandler: app.authenticate }, createServiceController);
    app.patch("/admin/services/:serviceId", { preHandler: app.authenticate }, updateServiceController);
    app.delete("/admin/services/:serviceId", { preHandler: app.authenticate }, deleteServiceController);
}
