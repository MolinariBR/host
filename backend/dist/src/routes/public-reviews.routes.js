import { getPublicGoogleReviewsController } from "../controllers/public-reviews.controller.js";
export async function publicReviewRoutes(app) {
    app.get("/reviews/google", getPublicGoogleReviewsController);
}
