import type { FastifyInstance } from "fastify";
import { getPublicGoogleReviewsController } from "../controllers/public-reviews.controller.js";

export async function publicReviewRoutes(app: FastifyInstance) {
  app.get("/reviews/google", getPublicGoogleReviewsController);
}
