import type { PrivacyReview } from "../../../infrastructure/db/schema.js";

export function parsePolicyLanguages(json: string): string[] {
  try {
    const parsed = JSON.parse(json) as unknown;
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

export function toPrivacyReviewDto(review: PrivacyReview) {
  return {
    id: review.id,
    brandId: review.brandId,
    reviewNumber: review.reviewNumber,
    scenarioType: review.scenarioType,
    privacyPolicyUrl: review.privacyPolicyUrl,
    facebookPageUrl: review.facebookPageUrl,
    externalHostingProvider: review.externalHostingProvider,
    policyLanguages: parsePolicyLanguages(review.policyLanguagesJson),
    accessibilityStatus: review.accessibilityStatus,
    inaccessibleReason: review.inaccessibleReason,
    policyLastUpdatedDate: review.policyLastUpdatedDate,
    findings: review.findings,
    remediationActions: review.remediationActions,
    operationalOutcome: review.operationalOutcome,
    privacyEmailFlowStatus: review.privacyEmailFlowStatus ?? "NOT_STARTED",
    privacyInitialEmailSentAt: review.privacyInitialEmailSentAt,
    privacyFollowupSentAt: review.privacyFollowupSentAt,
    privacyClientRespondedAt: review.privacyClientRespondedAt,
    status: review.status,
    isCurrent: review.isCurrent,
    reviewedAt: review.reviewedAt,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
}
