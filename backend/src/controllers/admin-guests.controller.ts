import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import * as guestsService from "../services/guests.service.js";
import { sendZodError } from "../utils/errors.js";

const querySchema = z.object({
  search: z.string().optional(),
});

const paramsSchema = z.object({
  guestId: z.string().min(1),
});

export async function listGuestsController(request: FastifyRequest, reply: FastifyReply) {
  const parsed = querySchema.safeParse(request.query);
  if (!parsed.success) return sendZodError(reply, parsed.error);

  const items = await guestsService.listGuests(prisma, parsed.data.search);
  return reply.code(200).send({ items });
}

export async function getGuestByIdController(request: FastifyRequest, reply: FastifyReply) {
  const parsed = paramsSchema.safeParse(request.params);
  if (!parsed.success) return sendZodError(reply, parsed.error);

  const guest = await guestsService.getGuestById(prisma, parsed.data.guestId);
  if (!guest) return reply.code(404).send({ message: "Resource not found." });

  return reply.code(200).send(guest);
}
