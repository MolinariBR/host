import cors from "@fastify/cors";
export async function registerCors(app) {
    await app.register(cors, {
        origin: true,
        methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    });
}
