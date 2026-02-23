import Fastify from "fastify";
import { registerCors } from "./plugins/cors.js";
import { registerOpenApiRoute } from "./plugins/swagger.js";
import { registerAuth } from "./plugins/auth.js";
import { registerRoutes } from "./routes/index.js";
import { prisma } from "./lib/prisma.js";

export async function buildApp(options?: { logger?: boolean }) {
  const app = Fastify({ logger: options?.logger ?? true });

  await registerCors(app);
  await registerAuth(app);
  await registerOpenApiRoute(app);
  await registerRoutes(app);

  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });

  return app;
}
