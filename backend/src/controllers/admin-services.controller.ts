import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import * as servicesService from "../services/services.service.js";
import { sendPrismaError, sendZodError } from "../utils/errors.js";

const categorySchema = z.enum(["FOOD", "TRANSPORT", "WELLNESS", "LEISURE", "OTHER"]);

const createServiceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: categorySchema,
  priceCents: z.number().int().min(0),
  isActive: z.boolean().optional(),
});

const updateServiceSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  category: categorySchema.optional(),
  priceCents: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

const paramsSchema = z.object({
  serviceId: z.string().min(1),
});

export async function listServicesController(_request: FastifyRequest, reply: FastifyReply) {
  const items = await servicesService.listServices(prisma);
  return reply.code(200).send({ items });
}

export async function createServiceController(request: FastifyRequest, reply: FastifyReply) {
  const parsed = createServiceSchema.safeParse(request.body);
  if (!parsed.success) return sendZodError(reply, parsed.error);

  try {
    const created = await servicesService.createService(prisma, parsed.data);
    return reply.code(201).send(created);
  } catch (error) {
    return sendPrismaError(reply, error);
  }
}

export async function updateServiceController(request: FastifyRequest, reply: FastifyReply) {
  const parsedParams = paramsSchema.safeParse(request.params);
  if (!parsedParams.success) return sendZodError(reply, parsedParams.error);
  const parsedBody = updateServiceSchema.safeParse(request.body);
  if (!parsedBody.success) return sendZodError(reply, parsedBody.error);

  try {
    const updated = await servicesService.updateService(
      prisma,
      parsedParams.data.serviceId,
      parsedBody.data
    );
    return reply.code(200).send(updated);
  } catch (error) {
    return sendPrismaError(reply, error);
  }
}

export async function deleteServiceController(request: FastifyRequest, reply: FastifyReply) {
  const parsed = paramsSchema.safeParse(request.params);
  if (!parsed.success) return sendZodError(reply, parsed.error);

  try {
    await servicesService.deleteService(prisma, parsed.data.serviceId);
    return reply.code(204).send();
  } catch (error) {
    return sendPrismaError(reply, error);
  }
}
