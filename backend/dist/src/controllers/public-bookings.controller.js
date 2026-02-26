import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { createPublicBooking, getPublicBookingWhatsappLink, lookupPublicBookings, } from "../services/public-bookings.service.js";
import { sendZodError } from "../utils/errors.js";
const createBookingSchema = z.object({
    guestName: z.string().min(2),
    guestEmail: z.string().email(),
    guestPhone: z.string().min(8),
    guestDocument: z
        .string()
        .min(1)
        .transform((value) => value.replace(/\D/g, ""))
        .refine((value) => value.length === 11 || value.length === 14, {
        message: "Must be a valid CPF or CNPJ.",
    }),
    roomId: z.string().min(1),
    checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    guestsCount: z.number().int().min(1),
    notes: z.string().optional(),
    serviceItems: z
        .array(z.object({
        serviceId: z.string().min(1),
        quantity: z.number().int().min(1),
    }))
        .optional(),
});
const lookupSchema = z.object({
    email: z.string().email(),
    bookingCode: z.string().optional(),
});
const codeSchema = z.object({
    bookingCode: z.string().min(1),
});
export async function createPublicBookingController(request, reply) {
    const parsed = createBookingSchema.safeParse(request.body);
    if (!parsed.success)
        return sendZodError(reply, parsed.error);
    try {
        const result = await createPublicBooking(prisma, parsed.data);
        return reply.code(201).send(result);
    }
    catch (error) {
        return reply.code(400).send({ message: error.message });
    }
}
export async function lookupPublicBookingsController(request, reply) {
    const parsed = lookupSchema.safeParse(request.query);
    if (!parsed.success)
        return sendZodError(reply, parsed.error);
    try {
        const items = await lookupPublicBookings(prisma, parsed.data);
        return reply.code(200).send({ items });
    }
    catch (error) {
        return reply.code(400).send({ message: error.message });
    }
}
export async function getWhatsappLinkController(request, reply) {
    const parsed = codeSchema.safeParse(request.params);
    if (!parsed.success)
        return sendZodError(reply, parsed.error);
    try {
        const url = await getPublicBookingWhatsappLink(prisma, parsed.data.bookingCode);
        return reply.code(200).send(url);
    }
    catch (error) {
        const message = error.message;
        if (message === "Booking not found.") {
            return reply.code(404).send({ message });
        }
        return reply.code(400).send({ message });
    }
}
