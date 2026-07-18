import { randomUUID } from "node:crypto";
import { and, desc, eq, max } from "drizzle-orm";
import { db } from "../../../infrastructure/db/client.js";
import {
  brands,
  campaignSubmissions,
  campaigns,
  privacyReviews,
  type CampaignSubmission,
} from "../../../infrastructure/db/schema.js";
import { NotFoundError, ValidationError } from "../../../utils/errors.js";
import { campaignRepository } from "./campaignRepository.js";
import { privacyReviewRepository } from "../../privacy/data-access/privacyReviewRepository.js";
import {
  buildBrandSnapshot,
  DEFAULT_CONTENT_ATTRIBUTES,
} from "../domain/submissionHelpers.js";
import { buildDefaultSubmissionContent } from "../domain/submissionDefaults.js";
import { serializeSampleMultimediaConfirmation } from "../domain/sampleMultimedia.js";
import {
  canPrepareSubmission,
  evaluateCampaignGate,
} from "../domain/campaignGate.js";
import type {
  CloneSubmissionDto,
  CreateSubmissionDto,
  UpdateSubmissionDto,
} from "../http/schemas.js";

async function resolvePrivacyReviewId(
  brandId: string,
  privacyReviewId?: string,
) {
  if (privacyReviewId) {
    const [review] = await db
      .select()
      .from(privacyReviews)
      .where(eq(privacyReviews.id, privacyReviewId))
      .limit(1);

    if (!review || review.brandId !== brandId) {
      throw new ValidationError("privacyReviewId invalido para esta marca");
    }

    return review.id;
  }

  const [current] = await db
    .select()
    .from(privacyReviews)
    .where(
      and(
        eq(privacyReviews.brandId, brandId),
        eq(privacyReviews.isCurrent, true),
      ),
    )
    .limit(1);

  return current?.id ?? null;
}

async function getNextSubmissionNumber(campaignId: string) {
  const [row] = await db
    .select({ maxNumber: max(campaignSubmissions.submissionNumber) })
    .from(campaignSubmissions)
    .where(eq(campaignSubmissions.campaignId, campaignId));

  return (row?.maxNumber ?? 0) + 1;
}

function submissionContentFromSource(source: CampaignSubmission | null) {
  if (!source) {
    return {
      campaignDescription: null,
      ctaMessageFlow: null,
      optInDescription: null,
      optOutDescription: null,
      helpResponse: null,
      sampleMessagesJson: "[]",
      contentAttributesJson: JSON.stringify(DEFAULT_CONTENT_ATTRIBUTES),
      estimatedSubscriberVolume: null,
      privacyReviewId: null as string | null,
      sampleMultimediaJson: null as string | null,
    };
  }

  return {
    campaignDescription: source.campaignDescription,
    ctaMessageFlow: source.ctaMessageFlow,
    optInDescription: source.optInDescription,
    optOutDescription: source.optOutDescription,
    helpResponse: source.helpResponse,
    sampleMessagesJson: source.sampleMessagesJson,
    contentAttributesJson: source.contentAttributesJson,
    estimatedSubscriberVolume: source.estimatedSubscriberVolume,
    privacyReviewId: source.privacyReviewId,
    sampleMultimediaJson: source.sampleMultimediaJson,
  };
}

export const submissionRepository = {
  async findById(submissionId: string) {
    const [submission] = await db
      .select()
      .from(campaignSubmissions)
      .where(eq(campaignSubmissions.id, submissionId))
      .limit(1);

    return submission ?? null;
  },

  async listByCampaign(campaignId: string) {
    const campaign = await campaignRepository.findById(campaignId);
    if (!campaign || campaign.archivedAt) {
      throw new NotFoundError("Campana no encontrada");
    }

    return db
      .select()
      .from(campaignSubmissions)
      .where(eq(campaignSubmissions.campaignId, campaignId))
      .orderBy(desc(campaignSubmissions.submissionNumber));
  },

  async getLatestByCampaign(campaignId: string) {
    const [submission] = await db
      .select()
      .from(campaignSubmissions)
      .where(eq(campaignSubmissions.campaignId, campaignId))
      .orderBy(desc(campaignSubmissions.submissionNumber))
      .limit(1);

    return submission ?? null;
  },

  async create(campaignId: string, data: CreateSubmissionDto) {
    const campaign = await campaignRepository.findById(campaignId);
    if (!campaign || campaign.archivedAt) {
      throw new NotFoundError("Campana no encontrada");
    }

    const brand = await campaignRepository.getBrandForCampaign(campaign);
    const now = new Date().toISOString();
    const id = randomUUID();
    const submissionNumber = await getNextSubmissionNumber(campaignId);

    let source: CampaignSubmission | null = null;
    if (data.resubmissionOfSubmissionId) {
      source = await submissionRepository.findById(data.resubmissionOfSubmissionId);
      if (!source || source.campaignId !== campaignId) {
        throw new ValidationError("resubmissionOfSubmissionId invalido");
      }
    } else if (data.copyFromLatest !== false) {
      source = await submissionRepository.getLatestByCampaign(campaignId);
    }

    const content = submissionContentFromSource(source);
    const privacyReviewId = await resolvePrivacyReviewId(
      brand.id,
      data.privacyReviewId ?? content.privacyReviewId ?? undefined,
    );

    let campaignDescription = content.campaignDescription;
    let ctaMessageFlow = content.ctaMessageFlow;
    let optInDescription = content.optInDescription;
    let optOutDescription = content.optOutDescription;
    let helpResponse = content.helpResponse;
    let sampleMessagesJson = content.sampleMessagesJson;
    let sampleMultimediaJson = content.sampleMultimediaJson;

    if (!source) {
      const privacyReview = privacyReviewId
        ? await privacyReviewRepository.findById(privacyReviewId)
        : await privacyReviewRepository.getCurrentByBrand(brand.id);

      const defaults = buildDefaultSubmissionContent(brand, privacyReview);
      campaignDescription = defaults.campaignDescription;
      ctaMessageFlow = defaults.ctaMessageFlow;
      optInDescription = defaults.optInDescription;
      optOutDescription = defaults.optOutDescription;
      helpResponse = defaults.helpResponse;
      sampleMessagesJson = JSON.stringify(defaults.sampleMessages);
    }

    const [submission] = await db
      .insert(campaignSubmissions)
      .values({
        id,
        campaignId,
        submissionNumber,
        privacyReviewId,
        brandSnapshotJson: JSON.stringify(buildBrandSnapshot(brand)),
        campaignDescription,
        ctaMessageFlow,
        optInDescription,
        optOutDescription,
        helpResponse,
        sampleMessagesJson,
        sampleMultimediaJson,
        contentAttributesJson: content.contentAttributesJson,
        estimatedSubscriberVolume: content.estimatedSubscriberVolume,
        status: "DRAFT",
        resubmissionOfSubmissionId: data.resubmissionOfSubmissionId ?? null,
        changeSummary: data.changeSummary ?? null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    await db
      .update(brands)
      .set({ workflowStage: "BRAND_REGISTRATION", updatedAt: now })
      .where(eq(brands.id, brand.id));

    await db
      .update(campaigns)
      .set({ currentStatus: "ACTIVE", updatedAt: now })
      .where(eq(campaigns.id, campaignId));

    return submission;
  },

  async update(submissionId: string, data: UpdateSubmissionDto) {
    const existing = await submissionRepository.findById(submissionId);
    if (!existing) throw new NotFoundError("Envio de campana no encontrado");

    if (!["DRAFT", "READY", "SUBMITTED", "REJECTED", "APPROVED"].includes(existing.status)) {
      throw new ValidationError(
        "Solo se pueden editar envios en estado DRAFT, READY, SUBMITTED, REJECTED o APPROVED",
      );
    }

    const campaign = await campaignRepository.findById(existing.campaignId);
    if (!campaign) throw new NotFoundError("Campana no encontrada");

    const brand = await campaignRepository.getBrandForCampaign(campaign);
    const currentReview = await privacyReviewRepository.getCurrentByBrand(
      brand.id,
    );
    const gate = evaluateCampaignGate(currentReview);
    if (!canPrepareSubmission(gate)) {
      throw new ValidationError(
        "No se puede editar el envio: compuerta operativa cerrada",
      );
    }

    const now = new Date().toISOString();
    const patch: Record<string, unknown> = {
      updatedAt: now,
      status: existing.status === "READY" ? "DRAFT" : existing.status,
      validationResultJson: null,
    };

    if (data.privacyReviewId !== undefined) {
      patch.privacyReviewId = await resolvePrivacyReviewId(
        brand.id,
        data.privacyReviewId,
      );
    }
    if (data.campaignDescription !== undefined) {
      patch.campaignDescription = data.campaignDescription;
    }
    if (data.ctaMessageFlow !== undefined) patch.ctaMessageFlow = data.ctaMessageFlow;
    if (data.optInDescription !== undefined) {
      patch.optInDescription = data.optInDescription;
    }
    if (data.optOutDescription !== undefined) {
      patch.optOutDescription = data.optOutDescription;
    }
    if (data.helpResponse !== undefined) patch.helpResponse = data.helpResponse;
    if (data.sampleMessages !== undefined) {
      patch.sampleMessagesJson = JSON.stringify(data.sampleMessages);
    }
    if (data.contentAttributes !== undefined) {
      patch.contentAttributesJson = JSON.stringify({
        ...DEFAULT_CONTENT_ATTRIBUTES,
        ...data.contentAttributes,
      });
    }
    if (data.estimatedSubscriberVolume !== undefined) {
      patch.estimatedSubscriberVolume = data.estimatedSubscriberVolume ?? null;
    }
    if (data.externalPortalReference !== undefined) {
      patch.externalPortalReference = data.externalPortalReference ?? null;
    }
    if (data.sampleMultimediaConfirmation !== undefined) {
      patch.sampleMultimediaJson = data.sampleMultimediaConfirmation
        ? serializeSampleMultimediaConfirmation(data.sampleMultimediaConfirmation)
        : null;
    }
    if (data.tcrEvidenceConfirmation !== undefined) {
      patch.tcrEvidenceConfirmationJson = null;
    }

    const [submission] = await db
      .update(campaignSubmissions)
      .set(patch)
      .where(eq(campaignSubmissions.id, submissionId))
      .returning();

    return submission;
  },

  async markReady(submissionId: string, validationJson: string) {
    const existing = await submissionRepository.findById(submissionId);
    if (!existing) throw new NotFoundError("Envio de campana no encontrado");

    const now = new Date().toISOString();
    const [submission] = await db
      .update(campaignSubmissions)
      .set({
        status: "READY",
        validationResultJson: validationJson,
        updatedAt: now,
      })
      .where(eq(campaignSubmissions.id, submissionId))
      .returning();

    return submission;
  },

  async markSubmitted(
    submissionId: string,
    submittedAt: string,
    externalPortalReference?: string,
    validationJson?: string,
  ) {
    const existing = await submissionRepository.findById(submissionId);
    if (!existing) throw new NotFoundError("Envio de campana no encontrado");

    if (existing.status !== "DRAFT" && existing.status !== "READY") {
      throw new ValidationError(
        "Solo se puede marcar como enviado desde DRAFT o READY",
      );
    }

    const now = new Date().toISOString();
    const [submission] = await db
      .update(campaignSubmissions)
      .set({
        status: "SUBMITTED",
        submittedAt,
        externalPortalReference: externalPortalReference ?? null,
        validationResultJson: validationJson ?? existing.validationResultJson,
        updatedAt: now,
      })
      .where(eq(campaignSubmissions.id, submissionId))
      .returning();

    return submission;
  },

  async markRejected(submissionId: string) {
    const existing = await submissionRepository.findById(submissionId);
    if (!existing) throw new NotFoundError("Envio de campana no encontrado");

    if (existing.status !== "SUBMITTED") {
      throw new ValidationError(
        "Solo se puede marcar como rechazado desde SUBMITTED",
      );
    }

    const now = new Date().toISOString();
    const [submission] = await db
      .update(campaignSubmissions)
      .set({
        status: "REJECTED",
        approvedAt: null,
        updatedAt: now,
      })
      .where(eq(campaignSubmissions.id, submissionId))
      .returning();

    return submission;
  },

  async markApproved(submissionId: string) {
    const existing = await submissionRepository.findById(submissionId);
    if (!existing) throw new NotFoundError("Envio de campana no encontrado");

    if (existing.status !== "REJECTED") {
      throw new ValidationError(
        "Solo se puede marcar como aprobado desde REJECTED",
      );
    }

    const now = new Date().toISOString();
    const [submission] = await db
      .update(campaignSubmissions)
      .set({
        status: "APPROVED",
        approvedAt: now,
        updatedAt: now,
      })
      .where(eq(campaignSubmissions.id, submissionId))
      .returning();

    return submission;
  },

  async clone(submissionId: string, data: CloneSubmissionDto) {
    const source = await submissionRepository.findById(submissionId);
    if (!source) throw new NotFoundError("Envio de campana no encontrado");

    return submissionRepository.create(source.campaignId, {
      resubmissionOfSubmissionId: data.resubmissionOfSubmissionId ?? submissionId,
      changeSummary: data.changeSummary,
      copyFromLatest: false,
      privacyReviewId: source.privacyReviewId ?? undefined,
    });
  },

  async getSubmissionContext(submissionId: string) {
    const submission = await submissionRepository.findById(submissionId);
    if (!submission) return null;

    const campaign = await campaignRepository.findById(submission.campaignId);
    if (!campaign) return null;

    const brand = await campaignRepository.getBrandForCampaign(campaign);

    const [privacyReview] = await db
      .select()
      .from(privacyReviews)
      .where(
        and(
          eq(privacyReviews.brandId, brand.id),
          eq(privacyReviews.isCurrent, true),
        ),
      )
      .limit(1);

    return {
      submission,
      campaign,
      brand,
      privacyReview: privacyReview ?? null,
    };
  },
};
