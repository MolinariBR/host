import type { FastifyReply, FastifyRequest } from "fastify";
import { getPublicGoogleReviews } from "../services/google-reviews.service.js";

export async function getPublicGoogleReviewsController(
  _request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const data = await getPublicGoogleReviews();
    return reply.code(200).send(data);
  } catch (error) {
    return reply.code(502).send({ message: (error as Error).message });
  }
}
