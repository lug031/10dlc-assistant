export const CAMPAIGN_USE_CASES = [
  "MARKETING",
  "MIXED",
  "LOW_VOLUME",
  "CUSTOMER_CARE",
  "ACCOUNT_NOTIFICATION",
  "DELIVERY_NOTIFICATION",
  "FRAUD_ALERT",
  "PUBLIC_SERVICE_ANNOUNCEMENT",
  "OTHER",
] as const;

export const CAMPAIGN_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "APPROVED",
  "ARCHIVED",
] as const;

export const SUBMISSION_STATUSES = [
  "DRAFT",
  "READY",
  "SUBMITTED",
  "APPROVED",
  "REJECTED",
  "SUPERSEDED",
] as const;

export type CampaignUseCase = (typeof CAMPAIGN_USE_CASES)[number];
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

export const CAMPAIGN_PRIMARY_LANGUAGES = ["EN", "ES"] as const;
export type CampaignPrimaryLanguage =
  (typeof CAMPAIGN_PRIMARY_LANGUAGES)[number];

export const CAMPAIGN_PRIMARY_LANGUAGE_OPTIONS: ReadonlyArray<{
  value: CampaignPrimaryLanguage;
  label: string;
}> = [
  { value: "EN", label: "Inglés" },
  { value: "ES", label: "Español" },
];

export const CAMPAIGN_PRIMARY_LANGUAGE_LABELS: Record<
  CampaignPrimaryLanguage,
  string
> = {
  EN: "Inglés",
  ES: "Español",
};

import type { SampleMultimediaConfirmation } from "@/types/sampleMultimedia";

export interface ContentAttributes {
  embeddedLinks: boolean;
  phoneNumbers: boolean;
  ageGated: boolean;
  affiliateMarketing: boolean;
}

export interface BrandSnapshot {
  legalName: string;
  dbaName: string | null;
  einOrTaxId: string;
  entityType: string;
  registrationCountry: string;
  taxIdIssuingCountry: string;
  verticalType: string;
  websiteUrl: string | null;
  supportPhoneNumber: string;
  businessDescription: string;
}

export interface Campaign {
  id: string;
  brandId: string;
  internalName: string;
  useCase: CampaignUseCase;
  subUseCases: string[] | null;
  defaultOptOutKeyword: string;
  primaryLanguage: CampaignPrimaryLanguage;
  currentStatus: CampaignStatus;
  notes: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignSubmission {
  id: string;
  campaignId: string;
  submissionNumber: number;
  privacyReviewId: string | null;
  brandSnapshot: BrandSnapshot;
  campaignDescription: string | null;
  ctaMessageFlow: string | null;
  optInDescription: string | null;
  optOutDescription: string | null;
  helpResponse: string | null;
  sampleMessages: string[];
  contentAttributes: ContentAttributes;
  estimatedSubscriberVolume: string | null;
  status: SubmissionStatus;
  submittedAt: string | null;
  approvedAt: string | null;
  externalPortalReference: string | null;
  sampleMultimediaConfirmation: SampleMultimediaConfirmation | null;
  resubmissionOfSubmissionId: string | null;
  changeSummary: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionValidationResult {
  valid: boolean;
  blocking: Array<{ code: string; message: string; field: string }>;
  warnings: Array<{ code: string; message: string; field: string }>;
}

export interface CreateCampaignPayload {
  internalName: string;
  useCase: CampaignUseCase;
  primaryLanguage?: CampaignPrimaryLanguage;
  subUseCases?: string[];
  defaultOptOutKeyword?: string;
  notes?: string;
}

export interface CreateSubmissionPayload {
  privacyReviewId?: string;
  resubmissionOfSubmissionId?: string;
  changeSummary?: string;
  copyFromLatest?: boolean;
}

export interface UpdateSubmissionPayload {
  privacyReviewId?: string;
  campaignDescription?: string;
  ctaMessageFlow?: string;
  optInDescription?: string;
  optOutDescription?: string;
  helpResponse?: string;
  sampleMessages?: string[];
  contentAttributes?: Partial<ContentAttributes>;
  estimatedSubscriberVolume?: string;
  externalPortalReference?: string;
  sampleMultimediaConfirmation?: SampleMultimediaConfirmation | null;
}
