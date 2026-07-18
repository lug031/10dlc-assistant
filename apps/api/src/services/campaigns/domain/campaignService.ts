import { brandRepository } from "../../brands/data-access/brandRepository.js";
import { campaignRepository } from "../data-access/campaignRepository.js";
import { submissionRepository } from "../data-access/submissionRepository.js";
import { privacyReviewRepository } from "../../privacy/data-access/privacyReviewRepository.js";
import { ValidationError } from "../../../utils/errors.js";
import {
  canCreateCampaign,
  evaluateCampaignGate,
} from "./campaignGate.js";
import type {
  CloneSubmissionDto,
  CreateCampaignDto,
  CreateSubmissionDto,
  MarkSubmittedDto,
  UpdateCampaignDto,
  UpdateSubmissionDto,
} from "../http/schemas.js";
import { validateSubmissionLogic } from "./validateSubmission.js";

const GATE_MESSAGES: Record<string, string> = {
  PRIVACY_REVIEW_NOT_CURRENT:
    "Se requiere una privacy review vigente para crear campanas o envios",
  OPERATIONAL_OUTCOME_UNDEFINED:
    "El outcome operativo debe definirse en el Privacy Assessment",
  OPERATIONAL_OUTCOME_NO_POLICY:
    "El outcome NO_POLICY bloquea la creacion de campanas y envios",
};

async function assertCampaignGateAllowed(brandId: string) {
  await brandRepository.requireActiveById(brandId);
  const review = await privacyReviewRepository.getCurrentByBrand(brandId);
  const gate = evaluateCampaignGate(review);
  if (!canCreateCampaign(gate)) {
    const code = gate.reasonCode ?? "CAMPAIGN_GATE_BLOCKED";
    throw new ValidationError(GATE_MESSAGES[code] ?? code);
  }
  return gate;
}

export async function getCampaignGate(brandId: string) {
  await privacyReviewRepository.assertBrandExists(brandId);
  const review = await privacyReviewRepository.getCurrentByBrand(brandId);
  return evaluateCampaignGate(review);
}

export async function createCampaign(brandId: string, data: CreateCampaignDto) {
  await assertCampaignGateAllowed(brandId);
  return campaignRepository.create(brandId, data);
}

export async function listCampaignsByBrand(brandId: string) {
  return campaignRepository.listByBrand(brandId);
}

export async function getCampaignById(campaignId: string) {
  return campaignRepository.findById(campaignId);
}

export async function updateCampaign(campaignId: string, data: UpdateCampaignDto) {
  return campaignRepository.update(campaignId, data);
}

export async function archiveCampaign(campaignId: string) {
  return campaignRepository.archive(campaignId);
}

export async function createSubmission(
  campaignId: string,
  data: CreateSubmissionDto,
) {
  const campaign = await campaignRepository.findById(campaignId);
  if (!campaign) {
    throw new ValidationError("Campana no encontrada");
  }
  await assertCampaignGateAllowed(campaign.brandId);
  return submissionRepository.create(campaignId, data);
}

export async function listSubmissionsByCampaign(campaignId: string) {
  return submissionRepository.listByCampaign(campaignId);
}

export async function getSubmissionById(submissionId: string) {
  return submissionRepository.findById(submissionId);
}

export async function updateSubmission(
  submissionId: string,
  data: UpdateSubmissionDto,
) {
  return submissionRepository.update(submissionId, data);
}

export async function validateSubmission(submissionId: string) {
  const ctx = await submissionRepository.getSubmissionContext(submissionId);
  if (!ctx) return null;

  return validateSubmissionLogic({
    submission: ctx.submission,
    campaign: ctx.campaign,
    brand: ctx.brand,
    privacyReview: ctx.privacyReview,
    linkedPrivacyReviewId: ctx.submission.privacyReviewId,
    optOutKeyword: ctx.campaign.defaultOptOutKeyword,
  });
}

export async function markSubmissionReady(submissionId: string) {
  const validation = await validateSubmission(submissionId);
  if (!validation) return { submission: null, validation: null };

  if (!validation.valid) {
    return { submission: null, validation };
  }

  const submission = await submissionRepository.markReady(
    submissionId,
    JSON.stringify(validation),
  );

  return { submission, validation };
}

export async function markSubmissionSubmitted(
  submissionId: string,
  data: MarkSubmittedDto,
) {
  const validation = await validateSubmission(submissionId);
  if (!validation) {
    return { submission: null, validation: null };
  }

  if (!validation.valid) {
    return { submission: null, validation };
  }

  const submittedAt = data.submittedAt ?? new Date().toISOString();
  const submission = await submissionRepository.markSubmitted(
    submissionId,
    submittedAt,
    data.externalPortalReference,
    JSON.stringify(validation),
  );

  return { submission, validation };
}

export async function markSubmissionRejected(submissionId: string) {
  return submissionRepository.markRejected(submissionId);
}

export async function markSubmissionApproved(submissionId: string) {
  return submissionRepository.markApproved(submissionId);
}

export async function cloneSubmission(
  submissionId: string,
  data: CloneSubmissionDto,
) {
  return submissionRepository.clone(submissionId, data);
}
