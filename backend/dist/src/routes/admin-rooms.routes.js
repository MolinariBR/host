import { createRoomController, deleteRoomController, getRoomByIdController, listRoomsController, updateRoomController, } from "../controllers/admin-rooms.controller.js";
export async function adminRoomRoutes(app) {
    app.get("/admin/rooms", { preHandler: app.authenticate }, listRoomsController);
    app.post("/admin/rooms", { preHandler: app.authenticate }, createRoomController);
    app.get("/admin/rooms/:roomId", { preHandler: app.authenticate }, getRoomByIdController);
    app.patch("/admin/rooms/:roomId", { preHandler: app.authenticate }, updateRoomController);
    app.delete("/admin/rooms/:roomId", { preHandler: app.authenticate }, deleteRoomController);
}
