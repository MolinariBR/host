import type { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../lib/prisma.js";
import * as roomsService from "../services/rooms.service.js";

export async function listPublicRoomsController(_request: FastifyRequest, reply: FastifyReply) {
  const items = await roomsService.listBookableRooms(prisma);
  return reply.code(200).send({ items });
}
