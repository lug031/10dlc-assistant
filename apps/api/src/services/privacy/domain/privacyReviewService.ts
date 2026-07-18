import { NotFoundError, ValidationError } from "../../../utils/errors.js";
import { privacyReviewRepository } from "../data-access/privacyReviewRepository.js";
import type {
  CreatePrivacyReviewDto,
  UpdatePrivacyReviewDto,
} from "../http/schemas.js";
import { validatePrivacyReviewLogic } from "./validatePrivacyReview.js";

export async function createPrivacyReview(
  brandId: string,
  data: CreatePrivacyReviewDto,
) {
  return privacyReviewRepository.create(brandId, data);
}

export async function listPrivacyReviewsByBrand(brandId: string) {
  return privacyReviewRepository.listByBrand(brandId);
}

export async function getCurrentPrivacyReview(brandId: string) {
  return privacyReviewRepository.getCurrentByBrand(brandId);
}

export async function getPrivacyReviewById(reviewId: string) {
  return privacyReviewRepository.findById(reviewId);
}

export async function updatePrivacyReview(
  reviewId: string,
  data: UpdatePrivacyReviewDto,
) {
  return privacyReviewRepository.update(reviewId, data);
}

export async function setCurrentPrivacyReview(reviewId: string) {
  return privacyReviewRepository.setCurrent(reviewId);
}

export async function validatePrivacyReview(reviewId: string) {
  const review = await privacyReviewRepository.findById(reviewId);
  if (!review) return null;

  const brand = await privacyReviewRepository.getBrandForReview(review);
  return validatePrivacyReviewLogic(review, brand);
}

function assertNoPolicyOutcome(review: { operationalOutcome: string | null }) {
  if (review.operationalOutcome !== "NO_POLICY") {
    throw new ValidationError(
      "El seguimiento de correos solo aplica cuando el outcome es NO_POLICY",
    );
  }
}

export async function markPrivacyInitialEmailSent(reviewId: string) {
  const review = await privacyReviewRepository.findById(reviewId);
  if (!review) throw new NotFoundError("Revision de privacidad no encontrada");

  assertNoPolicyOutcome(review);

  if (review.privacyEmailFlowStatus !== "NOT_STARTED") {
    throw new ValidationError(
      "El correo inicial solo puede marcarse cuando el flujo no ha comenzado",
    );
  }

  const now = new Date().toISOString();
  return privacyReviewRepository.updateEmailFlow(reviewId, {
    privacyEmailFlowStatus: "WAITING_RESPONSE",
    privacyInitialEmailSentAt: now,
  });
}

export async function markPrivacyFollowupSent(reviewId: string) {
  const review = await privacyReviewRepository.findById(reviewId);
  if (!review) throw new NotFoundError("Revision de privacidad no encontrada");

  assertNoPolicyOutcome(review);

  if (
    review.privacyEmailFlowStatus !== "WAITING_RESPONSE" &&
    review.privacyEmailFlowStatus !== "FOLLOWUP_SENT"
  ) {
    throw new ValidationError(
      "El follow-up requiere haber enviado el correo inicial y estar esperando respuesta",
    );
  }

  const now = new Date().toISOString();
  return privacyReviewRepository.updateEmailFlow(reviewId, {
    privacyEmailFlowStatus: "FOLLOWUP_SENT",
    privacyFollowupSentAt: now,
  });
}

export async function markPrivacyClientResponded(reviewId: string) {
  const review = await privacyReviewRepository.findById(reviewId);
  if (!review) throw new NotFoundError("Revision de privacidad no encontrada");

  assertNoPolicyOutcome(review);

  if (
    review.privacyEmailFlowStatus !== "WAITING_RESPONSE" &&
    review.privacyEmailFlowStatus !== "FOLLOWUP_SENT"
  ) {
    throw new ValidationError(
      "Solo puede marcar respuesta del cliente despues de enviar correos",
    );
  }

  const now = new Date().toISOString();
  return privacyReviewRepository.updateEmailFlow(reviewId, {
    privacyEmailFlowStatus: "CLIENT_RESPONDED",
    privacyClientRespondedAt: now,
  });
}
