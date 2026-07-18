import type { OperationalOutcome } from "../../../constants/enums.js";
import type { PrivacyReview } from "../../../infrastructure/db/schema.js";
import { parsePolicyLanguages } from "../../privacy/http/mappers.js";

export type CampaignGateReasonCode =
  | "PRIVACY_REVIEW_NOT_CURRENT"
  | "OPERATIONAL_OUTCOME_UNDEFINED"
  | "OPERATIONAL_OUTCOME_NO_POLICY";

export type LeadwireCtaTemplateKey =
  | "LW_CTA_SAMPLE_FLOW_3"
  | "LW_CTA_SAMPLE_FLOW_4";

export interface CampaignGateResult {
  allowed: boolean;
  reasonCode: CampaignGateReasonCode | null;
  operationalOutcome: OperationalOutcome | null;
  ctaTemplate: LeadwireCtaTemplateKey | null;
  privacyLanguage: "EN" | "ES" | null;
  ambiguousLanguage: boolean;
}

function resolveCtaPolicyLanguage(
  operationalOutcome: string | null,
  policyLanguages: string[],
): "EN" | "ES" | null {
  if (!operationalOutcome || operationalOutcome === "NO_POLICY") {
    return null;
  }

  if (operationalOutcome === "ACCESSIBLE_EN") {
    return "EN";
  }

  if (operationalOutcome === "ACCESSIBLE_ES") {
    return "ES";
  }

  if (operationalOutcome === "HARD_TO_FIND") {
    if (policyLanguages.length === 1) {
      const lang = policyLanguages[0];
      return lang === "EN" || lang === "ES" ? lang : null;
    }
    return null;
  }

  return null;
}

export function evaluateCampaignGate(
  privacyReview: PrivacyReview | null,
): CampaignGateResult {
  if (!privacyReview || !privacyReview.isCurrent) {
    return {
      allowed: false,
      reasonCode: "PRIVACY_REVIEW_NOT_CURRENT",
      operationalOutcome: null,
      ctaTemplate: null,
      privacyLanguage: null,
      ambiguousLanguage: false,
    };
  }

  const outcome = privacyReview.operationalOutcome as OperationalOutcome | null;
  const policyLanguages = parsePolicyLanguages(privacyReview.policyLanguagesJson);
  const ambiguousLanguage =
    outcome === "HARD_TO_FIND" && policyLanguages.length > 1;
  const privacyLanguage = resolveCtaPolicyLanguage(outcome, policyLanguages);

  let ctaTemplate: LeadwireCtaTemplateKey | null = null;
  if (privacyLanguage === "EN") {
    ctaTemplate = "LW_CTA_SAMPLE_FLOW_3";
  } else if (privacyLanguage === "ES") {
    ctaTemplate = "LW_CTA_SAMPLE_FLOW_4";
  }

  if (!outcome) {
    return {
      allowed: false,
      reasonCode: "OPERATIONAL_OUTCOME_UNDEFINED",
      operationalOutcome: null,
      ctaTemplate,
      privacyLanguage,
      ambiguousLanguage,
    };
  }

  if (outcome === "NO_POLICY") {
    return {
      allowed: false,
      reasonCode: "OPERATIONAL_OUTCOME_NO_POLICY",
      operationalOutcome: outcome,
      ctaTemplate: null,
      privacyLanguage: null,
      ambiguousLanguage: false,
    };
  }

  return {
    allowed: true,
    reasonCode: null,
    operationalOutcome: outcome,
    ctaTemplate,
    privacyLanguage,
    ambiguousLanguage,
  };
}

export function canCreateCampaign(gate: CampaignGateResult): boolean {
  return gate.allowed;
}

export function canPrepareSubmission(gate: CampaignGateResult): boolean {
  return gate.allowed;
}
