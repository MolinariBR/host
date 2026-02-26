import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import * as adminBookingsService from "../services/admin-bookings.service.js";
import { sendPrismaError, sendZodError } from "../utils/errors.js";
const statusSchema = z.enum([
    "PENDING",
    "CONFIRMED",
    "CHECKED_IN",
    "CHECKED_OUT",
    "CANCELED",
    "NO_SHOW",
]);
const paymentStatusSchema = z.enum(["PENDING_WHATSAPP", "PAID", "CANCELED", "REFUNDED"]);
const querySchema = z.object({
    status: statusSchema.optional(),
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});
const paramsSchema = z.object({
    bookingId: z.string().min(1),
});
const updateSchema = z.object({
    status: statusSchema.optional(),
    paymentStatus: paymentStatusSchema.optional(),
    notes: z.string().optional(),
});
export async function listBookingsController(request, reply) {
    const parsed = querySchema.safeParse(request.query);
    if (!parsed.success)
        return sendZodError(reply, parsed.error);
    try {
        const items = await adminBookingsService.listAdminBookings(prisma, parsed.data);
        return reply.code(200).send({ items });
    }
    catch (error) {
        return reply.code(400).send({ message: error.message });
    }
}
export async function getBookingByIdController(request, reply) {
    const parsed = paramsSchema.safeParse(request.params);
    if (!parsed.success)
        return sendZodError(reply, parsed.error);
    const booking = await adminBookingsService.getAdminBookingById(prisma, parsed.data.bookingId);
    if (!booking)
        return reply.code(404).send({ message: "Resource not found." });
    return reply.code(200).send(booking);
}
export async function updateBookingController(request, reply) {
    const parsedParams = paramsSchema.safeParse(request.params);
    if (!parsedParams.success)
        return sendZodError(reply, parsedParams.error);
    const parsedBody = updateSchema.safeParse(request.body);
    if (!parsedBody.success)
        return sendZodError(reply, parsedBody.error);
    try {
        const booking = await adminBookingsService.updateAdminBooking(prisma, parsedParams.data.bookingId, parsedBody.data);
        return reply.code(200).send(booking);
    }
    catch (error) {
        if (error instanceof adminBookingsService.BookingNotFoundError) {
            return reply.code(404).send({ message: error.message });
        }
        if (error instanceof adminBookingsService.InvalidBookingStatusTransitionError) {
            return reply.code(400).send({ message: error.message });
        }
        return sendPrismaError(reply, error);
    }
}
