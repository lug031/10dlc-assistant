import { Hono } from "hono";
import { jsonValidator } from "../../../middleware/validate.js";
import { NotFoundError } from "../../../utils/errors.js";
import {
  createCampaign,
  listCampaignsByBrand,
} from "../domain/campaignService.js";
import { toCampaignDto } from "./mappers.js";
import { createCampaignSchema } from "./schemas.js";

function getBrandId(c: { req: { param: (key: string) => string | undefined } }) {
  const brandId = c.req.param("brandId");
  if (!brandId) throw new NotFoundError("Marca no encontrada");
  return brandId;
}

export const brandCampaignRoutes = new Hono();

brandCampaignRoutes.get("/", async (c) => {
  const brandId = getBrandId(c);
  const items = await listCampaignsByBrand(brandId);
  return c.json({ items: items.map(toCampaignDto) });
});

brandCampaignRoutes.post(
  "/",
  jsonValidator(createCampaignSchema),
  async (c) => {
    const brandId = getBrandId(c);
    const body = c.req.valid("json");
    const campaign = await createCampaign(brandId, body);
    return c.json(toCampaignDto(campaign), 201);
  },
);
