import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // Na nuvem rodará o node compilado, em desenvolvimento usa tsx
    seed: process.env.NODE_ENV === "production" ? "node dist/prisma/seed.js" : "tsx prisma/seed.ts",
  },
});
