import {
  getLeadwireTemplateBody,
  type LeadwireCampaignTemplateKey,
} from "@/constants/leadwireCampaignTemplates";
import type { BrandSnapshot } from "@/types/campaign";
import type { LeadwireCtaTemplateKey } from "@/types/privacyOutcome";
import { substituteLeadwireTemplate } from "@/utils/leadwireTemplateSubstitution";
import type { OperationalOutcome } from "@/types/privacy";
import {
  composeSubmissionCtaMessageFlow,
  defaultCtaEditableParts,
  type CtaEditableParts,
} from "@/utils/ctaMessageFlow";
import { buildHardToFindPrivacyAccessGuide } from "@/utils/hardToFindPrivacyGuide";
import { buildDefaultSampleMessages } from "@/utils/sampleMessageDefaults";

export interface SubmissionContentDefaults {
  campaignDescription: string;
  ctaMessageFlow: string;
  ctaEditableParts: CtaEditableParts;
  optInDescription: string;
  optOutDescription: string;
  helpResponse: string;
  sampleMessages: [string, string];
}

function applyTemplate(
  key: LeadwireCampaignTemplateKey,
  brandSnapshot: BrandSnapshot,
): string {
  const body = getLeadwireTemplateBody(key);
  if (!body) return "";
  return substituteLeadwireTemplate(body, { brandSnapshot });
}

export function buildSubmissionContentDefaults(
  brandSnapshot: BrandSnapshot,
  ctaTemplateKey: LeadwireCtaTemplateKey | null,
  options?: {
    ctaParts?: Partial<CtaEditableParts>;
    operationalOutcome?: OperationalOutcome | null;
  },
): SubmissionContentDefaults {
  const templateKey = ctaTemplateKey ?? "LW_CTA_SAMPLE_FLOW_3";
  const ctaEditableParts = {
    ...defaultCtaEditableParts(brandSnapshot, templateKey),
    ...options?.ctaParts,
  };

  if (options?.operationalOutcome === "HARD_TO_FIND") {
    ctaEditableParts.hardToFindPrivacyGuide =
      ctaEditableParts.hardToFindPrivacyGuide.trim() ||
      buildHardToFindPrivacyAccessGuide(
        brandSnapshot,
        ctaEditableParts.optInKeyword,
      );
  }

  return {
    campaignDescription: applyTemplate(
      "LW_CAMPAIGN_DESCRIPTION_SAMPLE_1",
      brandSnapshot,
    ),
    ctaMessageFlow: composeSubmissionCtaMessageFlow(
      templateKey,
      brandSnapshot,
      ctaEditableParts,
      {
        operationalOutcome: options?.operationalOutcome,
      },
    ),
    ctaEditableParts,
    optInDescription: applyTemplate("LW_OPT_IN", brandSnapshot),
    optOutDescription: applyTemplate("LW_OPT_OUT_STOP", brandSnapshot),
    helpResponse: applyTemplate("LW_HELP", brandSnapshot),
    sampleMessages: buildDefaultSampleMessages(brandSnapshot),
  };
}
