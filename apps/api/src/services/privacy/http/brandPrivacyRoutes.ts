import { Hono } from "hono";
import { jsonValidator } from "../../../middleware/validate.js";
import { NotFoundError } from "../../../utils/errors.js";
import {
  createPrivacyReview,
  getCurrentPrivacyReview,
  listPrivacyReviewsByBrand,
} from "../domain/privacyReviewService.js";
import { toPrivacyReviewDto } from "./mappers.js";
import { createPrivacyReviewSchema } from "./schemas.js";

function getBrandId(c: { req: { param: (key: string) => string | undefined } }) {
  const brandId = c.req.param("brandId");
  if (!brandId) throw new NotFoundError("Marca no encontrada");
  return brandId;
}

export const brandPrivacyRoutes = new Hono();

brandPrivacyRoutes.get("/", async (c) => {
  const brandId = getBrandId(c);
  const reviews = await listPrivacyReviewsByBrand(brandId);
  return c.json({ items: reviews.map(toPrivacyReviewDto) });
});

brandPrivacyRoutes.get("/current", async (c) => {
  const brandId = getBrandId(c);
  const review = await getCurrentPrivacyReview(brandId);
  if (!review) {
    return c.json(null);
  }
  return c.json(toPrivacyReviewDto(review));
});

brandPrivacyRoutes.post(
  "/",
  jsonValidator(createPrivacyReviewSchema),
  async (c) => {
    const brandId = getBrandId(c);
    const body = c.req.valid("json");
    const review = await createPrivacyReview(brandId, body);
    return c.json(toPrivacyReviewDto(review), 201);
  },
);
