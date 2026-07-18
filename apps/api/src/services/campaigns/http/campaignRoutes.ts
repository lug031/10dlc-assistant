import { Hono } from "hono";
import { jsonValidator } from "../../../middleware/validate.js";
import { NotFoundError, ValidationError } from "../../../utils/errors.js";
import {
  archiveCampaign,
  getCampaignById,
  updateCampaign,
} from "../domain/campaignService.js";
import { campaignSubmissionNestedRoutes } from "./campaignSubmissionNestedRoutes.js";
import { toCampaignDto } from "./mappers.js";
import { updateCampaignSchema } from "./schemas.js";

export const campaignRoutes = new Hono();

campaignRoutes.get("/:campaignId", async (c) => {
  const campaign = await getCampaignById(c.req.param("campaignId"));
  if (!campaign || campaign.archivedAt) {
    throw new NotFoundError("Campana no encontrada");
  }
  return c.json(toCampaignDto(campaign));
});

campaignRoutes.patch(
  "/:campaignId",
  jsonValidator(updateCampaignSchema),
  async (c) => {
    const body = c.req.valid("json");
    const campaign = await updateCampaign(c.req.param("campaignId"), body);
    return c.json(toCampaignDto(campaign));
  },
);

campaignRoutes.delete("/:campaignId", async (c) => {
  const campaign = await archiveCampaign(c.req.param("campaignId"));
  return c.json({ id: campaign.id, archivedAt: campaign.archivedAt });
});

campaignRoutes.route(
  "/:campaignId/submissions",
  campaignSubmissionNestedRoutes,
);
