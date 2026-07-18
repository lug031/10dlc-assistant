import { z } from "zod";
import {
  CAMPAIGN_STATUSES,
  CAMPAIGN_USE_CASES,
  PRIMARY_LANGUAGES,
} from "../../../constants/enums.js";

const tcrEvidenceItemStatusSchema = z.enum([
  "confirmed",
  "not_applicable",
  "pending",
]);

export const tcrEvidenceConfirmationSchema = z.object({
  confirmedAt: z.string().datetime(),
  confirmedBy: z.string().min(1).max(120),
  items: z.object({
    leadMagnet: tcrEvidenceItemStatusSchema,
    qrCode: tcrEvidenceItemStatusSchema,
    privacyPolicyAccess: tcrEvidenceItemStatusSchema,
    tcrRejectionEvidence: tcrEvidenceItemStatusSchema,
    manualUploadAcknowledged: tcrEvidenceItemStatusSchema,
  }),
});

export const createCampaignSchema = z.object({
  internalName: z.string().min(2).max(120),
  useCase: z.enum(CAMPAIGN_USE_CASES),
  primaryLanguage: z.enum(PRIMARY_LANGUAGES).optional().default("EN"),
  subUseCases: z.array(z.string()).optional(),
  defaultOptOutKeyword: z.string().min(2).max(10).optional(),
  notes: z.string().max(5000).optional(),
});

export const updateCampaignSchema = createCampaignSchema.partial().extend({
  currentStatus: z.enum(CAMPAIGN_STATUSES).optional(),
});

export const contentAttributesSchema = z.object({
  embeddedLinks: z.boolean().optional().default(false),
  phoneNumbers: z.boolean().optional().default(false),
  ageGated: z.boolean().optional().default(false),
  affiliateMarketing: z.boolean().optional().default(false),
});

export const sampleMultimediaConfirmationSchema = z.object({
  items: z.record(z.string(), z.boolean()),
  updatedAt: z.string().nullable(),
});

export const updateSubmissionSchema = z.object({
  privacyReviewId: z.string().uuid().optional(),
  campaignDescription: z.string().min(40).max(4000).optional(),
  ctaMessageFlow: z.string().min(20).max(4000).optional(),
  optInDescription: z.string().min(1).max(4000).optional(),
  optOutDescription: z.string().min(1).max(2000).optional(),
  helpResponse: z.string().min(1).max(2000).optional(),
  sampleMessages: z.array(z.string().min(10).max(480)).length(2).optional(),
  contentAttributes: contentAttributesSchema.optional(),
  estimatedSubscriberVolume: z.string().max(120).optional(),
  externalPortalReference: z.string().max(200).optional(),
  sampleMultimediaConfirmation: sampleMultimediaConfirmationSchema.nullable().optional(),
  tcrEvidenceConfirmation: tcrEvidenceConfirmationSchema.nullable().optional(),
});

export const createSubmissionSchema = z.object({
  privacyReviewId: z.string().uuid().optional(),
  resubmissionOfSubmissionId: z.string().uuid().optional(),
  changeSummary: z.string().max(2000).optional(),
  copyFromLatest: z.boolean().optional().default(true),
});

export const cloneSubmissionSchema = z.object({
  resubmissionOfSubmissionId: z.string().uuid().optional(),
  changeSummary: z.string().max(2000).optional(),
});

export const markSubmittedSchema = z.object({
  submittedAt: z.string().datetime().optional(),
  externalPortalReference: z.string().max(200).optional(),
});

export type CreateCampaignDto = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignDto = z.infer<typeof updateCampaignSchema>;
export type CreateSubmissionDto = z.infer<typeof createSubmissionSchema>;
export type UpdateSubmissionDto = z.infer<typeof updateSubmissionSchema>;
export type CloneSubmissionDto = z.infer<typeof cloneSubmissionSchema>;
export type MarkSubmittedDto = z.infer<typeof markSubmittedSchema>;
