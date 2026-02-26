import { prisma } from "../lib/prisma.js";
import * as roomsService from "../services/rooms.service.js";
export async function listPublicRoomsController(_request, reply) {
    const items = await roomsService.listBookableRooms(prisma);
    return reply.code(200).send({ items });
}
