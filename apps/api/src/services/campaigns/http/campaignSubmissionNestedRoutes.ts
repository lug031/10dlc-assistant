import { Hono } from "hono";
import { jsonValidator } from "../../../middleware/validate.js";
import { NotFoundError } from "../../../utils/errors.js";
import {
  createSubmission,
  listSubmissionsByCampaign,
} from "../domain/campaignService.js";
import { toSubmissionDto } from "./mappers.js";
import { createSubmissionSchema } from "./schemas.js";

function getCampaignId(c: {
  req: { param: (key: string) => string | undefined };
}) {
  const campaignId = c.req.param("campaignId");
  if (!campaignId) throw new NotFoundError("Campana no encontrada");
  return campaignId;
}

export const campaignSubmissionNestedRoutes = new Hono();

campaignSubmissionNestedRoutes.get("/", async (c) => {
  const campaignId = getCampaignId(c);
  const items = await listSubmissionsByCampaign(campaignId);
  return c.json({ items: items.map(toSubmissionDto) });
});

campaignSubmissionNestedRoutes.post(
  "/",
  jsonValidator(createSubmissionSchema),
  async (c) => {
    const campaignId = getCampaignId(c);
    const body = c.req.valid("json");
    const submission = await createSubmission(campaignId, body);
    return c.json(toSubmissionDto(submission), 201);
  },
);
