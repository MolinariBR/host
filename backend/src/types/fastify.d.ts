import "fastify";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { JwtPayload } from "../plugins/auth.js";

declare module "fastify" {
  interface FastifyRequest {
    adminUser?: JwtPayload;
  }

  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
  }
}
