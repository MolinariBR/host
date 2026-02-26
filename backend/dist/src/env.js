import { config } from "dotenv";
import { z } from "zod";
config();
const envSchema = z.object({
    DATABASE_URL: z.string().min(1),
    PORT: z.coerce.number().default(3000),
    HOST: z.string().default("0.0.0.0"),
    JWT_SECRET: z.string().min(8),
    JWT_EXPIRES_IN: z.string().default("8h"),
    WHATSAPP_PHONE: z.string().min(8),
    GOOGLE_MAPS_API_KEY: z.string().min(8).optional(),
    HOTEL_GOOGLE_PLACE_ID: z.string().min(1).optional(),
    GOOGLE_REVIEWS_LANGUAGE: z.string().default("pt-BR"),
    GOOGLE_REVIEWS_MAX_ITEMS: z.coerce.number().int().min(1).max(20).default(8),
    DEFAULT_ADMIN_EMAIL: z.string().email().default("admin@hotelsantoantonio.com.br"),
    DEFAULT_ADMIN_PASSWORD: z.string().min(8).optional(),
    BOOKING_CODE_PREFIX: z.string().min(2).max(8).default("HSA"),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
    process.exit(1);
}
export const env = parsed.data;
