import { randomUUID } from "node:crypto";
import { and, desc, eq, max } from "drizzle-orm";
import { db } from "../../../infrastructure/db/client.js";
import {
  brands,
  privacyReviews,
  type PrivacyReview,
} from "../../../infrastructure/db/schema.js";
import { brandRepository } from "../../brands/data-access/brandRepository.js";
import { NotFoundError, ValidationError } from "../../../utils/errors.js";
import type {
  CreatePrivacyReviewDto,
  UpdatePrivacyReviewDto,
} from "../http/schemas.js";

function serializeLanguages(languages: string[]) {
  return JSON.stringify(languages);
}

export const privacyReviewRepository = {
  async assertBrandExists(brandId: string) {
    return brandRepository.requireById(brandId);
  },

  async getNextReviewNumber(brandId: string) {
    const [row] = await db
      .select({ maxNumber: max(privacyReviews.reviewNumber) })
      .from(privacyReviews)
      .where(eq(privacyReviews.brandId, brandId));

    return (row?.maxNumber ?? 0) + 1;
  },

  async create(brandId: string, data: CreatePrivacyReviewDto) {
    await brandRepository.requireActiveById(brandId);

    const now = new Date().toISOString();
    const id = randomUUID();
    const reviewNumber =
      await privacyReviewRepository.getNextReviewNumber(brandId);

    const [review] = await db
      .insert(privacyReviews)
      .values({
        id,
        brandId,
        reviewNumber,
        scenarioType: data.scenarioType,
        privacyPolicyUrl: data.privacyPolicyUrl ?? null,
        facebookPageUrl: data.facebookPageUrl ?? null,
        externalHostingProvider: data.externalHostingProvider ?? null,
        policyLanguagesJson: serializeLanguages(data.policyLanguages),
        accessibilityStatus: data.accessibilityStatus ?? "UNKNOWN",
        inaccessibleReason: data.inaccessibleReason ?? null,
        policyLastUpdatedDate: data.policyLastUpdatedDate ?? null,
        findings: data.findings ?? null,
        remediationActions: data.remediationActions ?? null,
        operationalOutcome: data.operationalOutcome ?? null,
        privacyEmailFlowStatus: "NOT_STARTED",
        privacyInitialEmailSentAt: null,
        privacyFollowupSentAt: null,
        privacyClientRespondedAt: null,
        status: data.status ?? "DRAFT",
        isCurrent: false,
        reviewedAt: null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    await db
      .update(brands)
      .set({ workflowStage: "PRIVACY_REVIEW", updatedAt: now })
      .where(eq(brands.id, brandId));

    return review;
  },

  async findById(reviewId: string) {
    const [review] = await db
      .select()
      .from(privacyReviews)
      .where(eq(privacyReviews.id, reviewId))
      .limit(1);

    return review ?? null;
  },

  async listByBrand(brandId: string) {
    await privacyReviewRepository.assertBrandExists(brandId);

    return db
      .select()
      .from(privacyReviews)
      .where(eq(privacyReviews.brandId, brandId))
      .orderBy(desc(privacyReviews.reviewNumber));
  },

  async getCurrentByBrand(brandId: string) {
    await privacyReviewRepository.assertBrandExists(brandId);

    const [review] = await db
      .select()
      .from(privacyReviews)
      .where(
        and(
          eq(privacyReviews.brandId, brandId),
          eq(privacyReviews.isCurrent, true),
        ),
      )
      .limit(1);

    return review ?? null;
  },

  async update(reviewId: string, data: UpdatePrivacyReviewDto) {
    const existing = await privacyReviewRepository.findById(reviewId);
    if (!existing) throw new NotFoundError("Revision de privacidad no encontrada");

    await brandRepository.requireActiveById(existing.brandId);

    if (existing.status === "SUPERSEDED") {
      throw new ValidationError(
        "No se puede editar una revision con estado SUPERSEDED",
      );
    }

    const now = new Date().toISOString();
    const patch: Record<string, unknown> = { updatedAt: now };

    if (data.scenarioType !== undefined) patch.scenarioType = data.scenarioType;
    if (data.privacyPolicyUrl !== undefined) {
      patch.privacyPolicyUrl = data.privacyPolicyUrl ?? null;
    }
    if (data.facebookPageUrl !== undefined) {
      patch.facebookPageUrl = data.facebookPageUrl ?? null;
    }
    if (data.externalHostingProvider !== undefined) {
      patch.externalHostingProvider = data.externalHostingProvider ?? null;
    }
    if (data.policyLanguages !== undefined) {
      patch.policyLanguagesJson = serializeLanguages(data.policyLanguages);
    }
    if (data.accessibilityStatus !== undefined) {
      patch.accessibilityStatus = data.accessibilityStatus;
    }
    if (data.inaccessibleReason !== undefined) {
      patch.inaccessibleReason = data.inaccessibleReason ?? null;
    }
    if (data.policyLastUpdatedDate !== undefined) {
      patch.policyLastUpdatedDate = data.policyLastUpdatedDate ?? null;
    }
    if (data.findings !== undefined) patch.findings = data.findings ?? null;
    if (data.remediationActions !== undefined) {
      patch.remediationActions = data.remediationActions ?? null;
    }
    if (data.operationalOutcome !== undefined) {
      patch.operationalOutcome = data.operationalOutcome ?? null;
      if (
        data.operationalOutcome &&
        data.operationalOutcome !== "NO_POLICY"
      ) {
        patch.privacyEmailFlowStatus = "NOT_STARTED";
        patch.privacyInitialEmailSentAt = null;
        patch.privacyFollowupSentAt = null;
        patch.privacyClientRespondedAt = null;
      }
    }
    if (data.status !== undefined) patch.status = data.status;

    const [review] = await db
      .update(privacyReviews)
      .set(patch)
      .where(eq(privacyReviews.id, reviewId))
      .returning();

    return review;
  },

  async setCurrent(reviewId: string) {
    const review = await privacyReviewRepository.findById(reviewId);
    if (!review) throw new NotFoundError("Revision de privacidad no encontrada");

    await brandRepository.requireActiveById(review.brandId);

    if (review.status === "SUPERSEDED") {
      throw new ValidationError(
        "No se puede marcar como vigente una revision SUPERSEDED",
      );
    }

    if (!review.operationalOutcome?.trim()) {
      throw new ValidationError(
        "No se puede marcar como vigente sin outcome operativo definido",
      );
    }

    const now = new Date().toISOString();

    await db
      .update(privacyReviews)
      .set({ isCurrent: false, updatedAt: now })
      .where(eq(privacyReviews.brandId, review.brandId));

    const [updated] = await db
      .update(privacyReviews)
      .set({
        isCurrent: true,
        status: review.status === "DRAFT" ? "IN_REVIEW" : review.status,
        reviewedAt: now,
        updatedAt: now,
      })
      .where(eq(privacyReviews.id, reviewId))
      .returning();

    await db
      .update(brands)
      .set({ workflowStage: "PRIVACY_REVIEW", updatedAt: now })
      .where(eq(brands.id, review.brandId));

    return updated;
  },

  async getBrandForReview(review: PrivacyReview) {
    return privacyReviewRepository.assertBrandExists(review.brandId);
  },

  async updateEmailFlow(
    reviewId: string,
    patch: {
      privacyEmailFlowStatus: string;
      privacyInitialEmailSentAt?: string | null;
      privacyFollowupSentAt?: string | null;
      privacyClientRespondedAt?: string | null;
    },
  ) {
    const existing = await privacyReviewRepository.findById(reviewId);
    if (!existing) {
      throw new NotFoundError("Revision de privacidad no encontrada");
    }

    await brandRepository.requireActiveById(existing.brandId);

    const now = new Date().toISOString();
    const [review] = await db
      .update(privacyReviews)
      .set({
        ...patch,
        updatedAt: now,
      })
      .where(eq(privacyReviews.id, reviewId))
      .returning();

    return review;
  },
};
