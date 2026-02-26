import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import path from "path";
import { fileURLToPath } from "url";
import { registerCors } from "./plugins/cors.js";
import { registerOpenApiRoute } from "./plugins/swagger.js";
import { registerAuth } from "./plugins/auth.js";
import { registerRoutes } from "./routes/index.js";
import { prisma } from "./lib/prisma.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function buildApp(options?: { logger?: boolean }) {
  const app = Fastify({ logger: options?.logger ?? true });

  await registerCors(app);
  await registerAuth(app);
  await registerOpenApiRoute(app);
  await registerRoutes(app);

  // Serve Single Page Application (FrontEnd)
  const distPath = path.join(__dirname, "../../../dist");
  app.register(fastifyStatic, {
    root: distPath,
    wildcard: false, // Só serve arquivos exatos
  });

  // Fallback pra enviar index.html do React em requisições de página que não são rotas de API
  app.setNotFoundHandler((request, reply) => {
    if (request.url.startsWith("/api")) {
      reply.status(404).send({ error: "Route not found" });
    } else {
      reply.sendFile("index.html", distPath);
    }
  });

  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });

  return app;
}
