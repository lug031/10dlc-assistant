import { Hono } from "hono";
import { jsonValidator } from "../../../middleware/validate.js";
import { NotFoundError } from "../../../utils/errors.js";
import {
  getPrivacyReviewById,
  markPrivacyClientResponded,
  markPrivacyFollowupSent,
  markPrivacyInitialEmailSent,
  setCurrentPrivacyReview,
  updatePrivacyReview,
  validatePrivacyReview,
} from "../domain/privacyReviewService.js";
import { toPrivacyReviewDto } from "./mappers.js";
import { updatePrivacyReviewSchema } from "./schemas.js";

export const privacyReviewRoutes = new Hono();

privacyReviewRoutes.get("/:reviewId", async (c) => {
  const review = await getPrivacyReviewById(c.req.param("reviewId"));
  if (!review) throw new NotFoundError("Revision de privacidad no encontrada");
  return c.json(toPrivacyReviewDto(review));
});

privacyReviewRoutes.patch(
  "/:reviewId",
  jsonValidator(updatePrivacyReviewSchema),
  async (c) => {
    const body = c.req.valid("json");
    const review = await updatePrivacyReview(c.req.param("reviewId"), body);
    return c.json(toPrivacyReviewDto(review));
  },
);

privacyReviewRoutes.post("/:reviewId/set-current", async (c) => {
  const review = await setCurrentPrivacyReview(c.req.param("reviewId"));
  return c.json(toPrivacyReviewDto(review));
});

privacyReviewRoutes.post("/:reviewId/validate", async (c) => {
  const result = await validatePrivacyReview(c.req.param("reviewId"));
  if (!result) {
    throw new NotFoundError("Revision de privacidad no encontrada");
  }
  return c.json(result);
});

privacyReviewRoutes.post("/:reviewId/privacy-email/initial-sent", async (c) => {
  const review = await markPrivacyInitialEmailSent(c.req.param("reviewId"));
  return c.json(toPrivacyReviewDto(review));
});

privacyReviewRoutes.post("/:reviewId/privacy-email/followup-sent", async (c) => {
  const review = await markPrivacyFollowupSent(c.req.param("reviewId"));
  return c.json(toPrivacyReviewDto(review));
});

privacyReviewRoutes.post("/:reviewId/privacy-email/client-responded", async (c) => {
  const review = await markPrivacyClientResponded(c.req.param("reviewId"));
  return c.json(toPrivacyReviewDto(review));
});
