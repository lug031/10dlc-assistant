import type { Campaign, CampaignSubmission } from "../../../infrastructure/db/schema.js";
import {
  parseBrandSnapshot,
  parseContentAttributes,
  parseSampleMessages,
} from "../domain/submissionHelpers.js";
import { parseSampleMultimediaConfirmation } from "../domain/sampleMultimedia.js";

export function toCampaignDto(campaign: Campaign) {
  let subUseCases: string[] | null = null;
  if (campaign.subUseCasesJson) {
    try {
      subUseCases = JSON.parse(campaign.subUseCasesJson) as string[];
    } catch {
      subUseCases = null;
    }
  }

  return {
    id: campaign.id,
    brandId: campaign.brandId,
    internalName: campaign.internalName,
    useCase: campaign.useCase,
    subUseCases,
    defaultOptOutKeyword: campaign.defaultOptOutKeyword,
    primaryLanguage: campaign.primaryLanguage,
    currentStatus: campaign.currentStatus,
    notes: campaign.notes,
    archivedAt: campaign.archivedAt,
    createdAt: campaign.createdAt,
    updatedAt: campaign.updatedAt,
  };
}

export function toSubmissionDto(submission: CampaignSubmission) {
  return {
    id: submission.id,
    campaignId: submission.campaignId,
    submissionNumber: submission.submissionNumber,
    privacyReviewId: submission.privacyReviewId,
    brandSnapshot: parseBrandSnapshot(submission.brandSnapshotJson),
    campaignDescription: submission.campaignDescription,
    ctaMessageFlow: submission.ctaMessageFlow,
    optInDescription: submission.optInDescription,
    optOutDescription: submission.optOutDescription,
    helpResponse: submission.helpResponse,
    sampleMessages: parseSampleMessages(submission.sampleMessagesJson),
    contentAttributes: parseContentAttributes(submission.contentAttributesJson),
    estimatedSubscriberVolume: submission.estimatedSubscriberVolume,
    status: submission.status,
    submittedAt: submission.submittedAt,
    approvedAt: submission.approvedAt,
    externalPortalReference: submission.externalPortalReference,
    sampleMultimediaConfirmation: parseSampleMultimediaConfirmation(
      submission.sampleMultimediaJson,
    ),
    tcrEvidenceConfirmation: null,
    resubmissionOfSubmissionId: submission.resubmissionOfSubmissionId,
    changeSummary: submission.changeSummary,
    createdAt: submission.createdAt,
    updatedAt: submission.updatedAt,
  };
}
