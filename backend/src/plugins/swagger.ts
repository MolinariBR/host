import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { FastifyInstance } from "fastify";

export async function registerOpenApiRoute(app: FastifyInstance): Promise<void> {
  app.get("/openapi.yaml", async (_request, reply) => {
    const filePath = join(process.cwd(), "openapi", "openapi.yaml");
    const content = await readFile(filePath, "utf-8");
    reply.type("application/yaml");
    return content;
  });
}
