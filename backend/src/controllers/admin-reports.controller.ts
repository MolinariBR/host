import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { getSummaryReport } from "../services/reports.service.js";
import { sendZodError } from "../utils/errors.js";

const querySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function summaryReportController(request: FastifyRequest, reply: FastifyReply) {
  const parsed = querySchema.safeParse(request.query);
  if (!parsed.success) return sendZodError(reply, parsed.error);

  try {
    const report = await getSummaryReport(prisma, parsed.data);
    return reply.code(200).send(report);
  } catch (error) {
    return reply.code(400).send({ message: (error as Error).message });
  }
}
