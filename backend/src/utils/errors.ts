import { Prisma } from "@prisma/client";
import type { FastifyReply } from "fastify";
import type { ZodError } from "zod";

export function sendZodError(reply: FastifyReply, error: ZodError) {
  return reply.code(400).send({
    message: "Validation error",
    details: error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`),
  });
}

export function sendPrismaError(reply: FastifyReply, error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return reply.code(409).send({ message: "Conflict: unique field already exists." });
    }
    if (error.code === "P2003") {
      return reply.code(409).send({ message: "Conflict: related records prevent this action." });
    }
    if (error.code === "P2025") {
      return reply.code(404).send({ message: "Resource not found." });
    }
    if (error.code === "P2022") {
      return reply.code(500).send({
        message:
          "Database schema is out of sync with the application. Run Prisma sync/migrations.",
      });
    }
  }
  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    return reply.code(500).send({
      message:
        "Database request failed. Verify Prisma schema/data consistency and run migrations/seed.",
    });
  }
  return reply.code(500).send({ message: "Internal server error." });
}
