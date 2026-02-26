import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import * as roomsService from "../services/rooms.service.js";
import { sendPrismaError, sendZodError } from "../utils/errors.js";
const roomType = z.enum(["FAMILIA", "CASAL", "DUPLO", "INDIVIDUAL", "ECONOMICO"]);
const climatizacaoType = z.enum(["CENTRAL_AR", "VENTILADOR"]);
const roomStatus = z.enum(["AVAILABLE", "OCCUPIED", "MAINTENANCE", "INACTIVE"]);
const createRoomSchema = z.object({
    number: z.string().min(1),
    name: z.string().optional(),
    type: roomType,
    climatizacao: climatizacaoType.optional(),
    hasBathroom: z.boolean().optional(),
    capacity: z.number().int().min(1),
    description: z.string().optional(),
    basePriceCents: z.number().int().min(0),
    seasonalPriceCents: z.number().int().min(0).optional(),
});
const updateRoomSchema = z.object({
    name: z.string().optional(),
    type: roomType.optional(),
    climatizacao: climatizacaoType.nullable().optional(),
    hasBathroom: z.boolean().optional(),
    capacity: z.number().int().min(1).optional(),
    description: z.string().optional(),
    basePriceCents: z.number().int().min(0).optional(),
    seasonalPriceCents: z.number().int().min(0).nullable().optional(),
    status: roomStatus.optional(),
});
const paramsSchema = z.object({
    roomId: z.string().min(1),
});
export async function listRoomsController(_request, reply) {
    const items = await roomsService.listRooms(prisma);
    return reply.code(200).send({ items });
}
export async function createRoomController(request, reply) {
    const parsed = createRoomSchema.safeParse(request.body);
    if (!parsed.success)
        return sendZodError(reply, parsed.error);
    try {
        const created = await roomsService.createRoom(prisma, parsed.data);
        return reply.code(201).send(created);
    }
    catch (error) {
        return sendPrismaError(reply, error);
    }
}
export async function getRoomByIdController(request, reply) {
    const parsed = paramsSchema.safeParse(request.params);
    if (!parsed.success)
        return sendZodError(reply, parsed.error);
    const room = await roomsService.getRoomById(prisma, parsed.data.roomId);
    if (!room)
        return reply.code(404).send({ message: "Resource not found." });
    return reply.code(200).send(room);
}
export async function updateRoomController(request, reply) {
    const parsedParams = paramsSchema.safeParse(request.params);
    if (!parsedParams.success)
        return sendZodError(reply, parsedParams.error);
    const parsedBody = updateRoomSchema.safeParse(request.body);
    if (!parsedBody.success)
        return sendZodError(reply, parsedBody.error);
    try {
        const updated = await roomsService.updateRoom(prisma, parsedParams.data.roomId, parsedBody.data);
        return reply.code(200).send(updated);
    }
    catch (error) {
        return sendPrismaError(reply, error);
    }
}
export async function deleteRoomController(request, reply) {
    const parsed = paramsSchema.safeParse(request.params);
    if (!parsed.success)
        return sendZodError(reply, parsed.error);
    try {
        await roomsService.deleteRoom(prisma, parsed.data.roomId);
        return reply.code(204).send();
    }
    catch (error) {
        return sendPrismaError(reply, error);
    }
}
