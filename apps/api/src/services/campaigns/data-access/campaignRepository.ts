import { randomUUID } from "node:crypto";
import { and, desc, eq, isNull, max } from "drizzle-orm";
import { db } from "../../../infrastructure/db/client.js";
import {
  campaigns,
  type Campaign,
} from "../../../infrastructure/db/schema.js";
import { DEFAULT_APP_SETTINGS } from "../../../constants/enums.js";
import { brandRepository } from "../../brands/data-access/brandRepository.js";
import { NotFoundError } from "../../../utils/errors.js";
import type { CreateCampaignDto, UpdateCampaignDto } from "../http/schemas.js";

export const campaignRepository = {
  async assertBrandExists(brandId: string) {
    return brandRepository.requireById(brandId);
  },

  async create(brandId: string, data: CreateCampaignDto) {
    await brandRepository.requireActiveById(brandId);

    const now = new Date().toISOString();
    const id = randomUUID();

    const [campaign] = await db
      .insert(campaigns)
      .values({
        id,
        brandId,
        internalName: data.internalName,
        useCase: data.useCase,
        subUseCasesJson: data.subUseCases
          ? JSON.stringify(data.subUseCases)
          : null,
        defaultOptOutKeyword:
          data.defaultOptOutKeyword ?? DEFAULT_APP_SETTINGS.defaultOptOutKeyword,
        primaryLanguage: data.primaryLanguage ?? "EN",
        currentStatus: "DRAFT",
        notes: data.notes ?? null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return campaign;
  },

  async findById(campaignId: string) {
    const [campaign] = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.id, campaignId))
      .limit(1);

    return campaign ?? null;
  },

  async listByBrand(brandId: string) {
    await campaignRepository.assertBrandExists(brandId);

    return db
      .select()
      .from(campaigns)
      .where(
        and(eq(campaigns.brandId, brandId), isNull(campaigns.archivedAt)),
      )
      .orderBy(desc(campaigns.updatedAt));
  },

  async update(campaignId: string, data: UpdateCampaignDto) {
    const existing = await campaignRepository.findById(campaignId);
    if (!existing || existing.archivedAt) {
      throw new NotFoundError("Campana no encontrada");
    }

    const now = new Date().toISOString();
    const patch: Record<string, unknown> = { updatedAt: now };

    if (data.internalName !== undefined) patch.internalName = data.internalName;
    if (data.useCase !== undefined) patch.useCase = data.useCase;
    if (data.subUseCases !== undefined) {
      patch.subUseCasesJson = JSON.stringify(data.subUseCases);
    }
    if (data.defaultOptOutKeyword !== undefined) {
      patch.defaultOptOutKeyword = data.defaultOptOutKeyword;
    }
    if (data.primaryLanguage !== undefined) {
      patch.primaryLanguage = data.primaryLanguage;
    }
    if (data.notes !== undefined) patch.notes = data.notes ?? null;
    if (data.currentStatus !== undefined) patch.currentStatus = data.currentStatus;

    const [campaign] = await db
      .update(campaigns)
      .set(patch)
      .where(eq(campaigns.id, campaignId))
      .returning();

    return campaign;
  },

  async archive(campaignId: string) {
    const existing = await campaignRepository.findById(campaignId);
    if (!existing || existing.archivedAt) {
      throw new NotFoundError("Campana no encontrada");
    }

    const now = new Date().toISOString();
    const [campaign] = await db
      .update(campaigns)
      .set({ archivedAt: now, currentStatus: "ARCHIVED", updatedAt: now })
      .where(eq(campaigns.id, campaignId))
      .returning();

    return campaign;
  },

  async getBrandForCampaign(campaign: Campaign) {
    return campaignRepository.assertBrandExists(campaign.brandId);
  },
};
