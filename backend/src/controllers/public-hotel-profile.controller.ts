import type { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../lib/prisma.js";
import { getPublicHotelProfile } from "../services/hotel-profile.service.js";

export async function getPublicHotelProfileController(
  _request: FastifyRequest,
  reply: FastifyReply
) {
  const profile = await getPublicHotelProfile(prisma);
  if (!profile) return reply.code(404).send({ message: "Resource not found." });

  return reply.code(200).send(profile);
}
