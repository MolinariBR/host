import type { FastifyReply, FastifyRequest } from "fastify";

export async function healthController(_request: FastifyRequest, reply: FastifyReply) {
  return reply.code(200).send({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
