import "dotenv/config";
import { defineConfig } from "prisma/config";
import fs from "fs";
import path from "path";

const isProduction = fs.existsSync(path.resolve("dist/prisma/seed.js")) || process.env.NODE_ENV === "production";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: isProduction ? "node dist/prisma/seed.js" : "tsx prisma/seed.ts",
  },
});
