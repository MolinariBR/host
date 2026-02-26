import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { AuthError, loginAdmin } from "../services/admin-auth.service.js";
import { sendZodError } from "../utils/errors.js";
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});
export async function loginAdminController(request, reply) {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success)
        return sendZodError(reply, parsed.error);
    try {
        const result = await loginAdmin(prisma, parsed.data);
        return reply.code(200).send(result);
    }
    catch (error) {
        if (error instanceof AuthError) {
            return reply.code(401).send({ message: error.message });
        }
        return reply.code(500).send({ message: "Internal server error." });
    }
}
