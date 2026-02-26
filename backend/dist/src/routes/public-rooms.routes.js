import { listPublicRoomsController } from "../controllers/public-rooms.controller.js";
export async function publicRoomRoutes(app) {
    app.get("/rooms", listPublicRoomsController);
}
