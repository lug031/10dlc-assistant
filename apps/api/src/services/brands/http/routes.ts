import { Hono } from "hono";
import {
  jsonValidator,
  queryValidator,
} from "../../../middleware/validate.js";
import { NotFoundError } from "../../../utils/errors.js";
import { brandPrivacyRoutes } from "../../privacy/http/brandPrivacyRoutes.js";
import { brandCampaignRoutes } from "../../campaigns/http/brandCampaignRoutes.js";
import { getCampaignGate } from "../../campaigns/domain/campaignService.js";
import {
  archiveBrand,
  createBrand,
  getBrandById,
  listBrands,
  unarchiveBrand,
  updateBrand,
} from "../domain/brandService.js";
import { toBrandDto } from "./mappers.js";
import {
  createBrandSchema,
  listBrandsQuerySchema,
  updateBrandSchema,
} from "./schemas.js";

export const brandRoutes = new Hono();

brandRoutes.get("/", queryValidator(listBrandsQuerySchema), async (c) => {
  const query = c.req.valid("query");
  const result = await listBrands({
    search: query.search,
    archived: query.archived,
    limit: query.limit,
    offset: query.offset,
  });

  return c.json({
    items: result.items.map(toBrandDto),
    total: result.total,
  });
});

brandRoutes.post("/", jsonValidator(createBrandSchema), async (c) => {
  const body = c.req.valid("json");
  const brand = await createBrand(body);
  return c.json(toBrandDto(brand), 201);
});

brandRoutes.route("/:brandId/privacy-reviews", brandPrivacyRoutes);
brandRoutes.route("/:brandId/campaigns", brandCampaignRoutes);

brandRoutes.get("/:brandId/campaign-gate", async (c) => {
  const brandId = c.req.param("brandId");
  if (!brandId) throw new NotFoundError("Marca no encontrada");
  const gate = await getCampaignGate(brandId);
  return c.json(gate);
});

brandRoutes.get("/:brandId", async (c) => {
  const brand = await getBrandById(c.req.param("brandId"));
  if (!brand) throw new NotFoundError("Marca no encontrada");
  return c.json(toBrandDto(brand));
});

brandRoutes.patch(
  "/:brandId",
  jsonValidator(updateBrandSchema),
  async (c) => {
    const body = c.req.valid("json");
    const brand = await updateBrand(c.req.param("brandId"), body);
    return c.json(toBrandDto(brand));
  },
);

brandRoutes.delete("/:brandId", async (c) => {
  const brand = await archiveBrand(c.req.param("brandId"));
  return c.json({ id: brand.id, archivedAt: brand.archivedAt });
});

brandRoutes.post("/:brandId/unarchive", async (c) => {
  const brand = await unarchiveBrand(c.req.param("brandId"));
  return c.json(toBrandDto(brand));
});
