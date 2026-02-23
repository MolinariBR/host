import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { env } from "../env.js";

export type JwtPayload = {
  sub: string;
  email: string;
  role: string;
};

function extractBearerToken(header?: string): string | null {
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

export function signAdminToken(payload: JwtPayload): string {
  const expiresIn = env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"];
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn,
  });
}

export async function registerAuth(app: FastifyInstance): Promise<void> {
  app.decorate(
    "authenticate",
    async function authenticate(request: FastifyRequest, reply: FastifyReply) {
      const token = extractBearerToken(request.headers.authorization);

      if (!token) {
        reply.code(401).send({ message: "Missing bearer token." });
        return;
      }

      try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
        request.adminUser = decoded;
      } catch {
        reply.code(401).send({ message: "Invalid or expired token." });
      }
    }
  );
}
