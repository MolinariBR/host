import { env } from "./env.js";
import { buildApp } from "./app.js";

async function bootstrap() {
  const app = await buildApp();

  try {
    await app.listen({ host: env.HOST, port: env.PORT });
    app.log.info(`Server running at http://${env.HOST}:${env.PORT}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

bootstrap();
