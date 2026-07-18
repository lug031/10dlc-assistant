import type { OperationalOutcome, PrivacyPolicyLanguage } from "@/types/privacy";
import type { LeadwireCtaTemplateKey } from "@/types/privacyOutcome";

export type CampaignGateReasonCode =
  | "PRIVACY_REVIEW_NOT_CURRENT"
  | "OPERATIONAL_OUTCOME_UNDEFINED"
  | "OPERATIONAL_OUTCOME_NO_POLICY";

export interface CampaignGateResult {
  allowed: boolean;
  reasonCode: CampaignGateReasonCode | null;
  operationalOutcome: OperationalOutcome | null;
  ctaTemplate: LeadwireCtaTemplateKey | null;
  privacyLanguage: PrivacyPolicyLanguage | null;
  ambiguousLanguage: boolean;
}

export const CAMPAIGN_GATE_MESSAGES: Record<CampaignGateReasonCode, string> = {
  PRIVACY_REVIEW_NOT_CURRENT:
    "No hay privacy review vigente. Complete el Privacy Assessment.",
  OPERATIONAL_OUTCOME_UNDEFINED:
    "El outcome operativo no esta definido en la privacy review vigente.",
  OPERATIONAL_OUTCOME_NO_POLICY:
    "El outcome NO_POLICY bloquea la creacion de campanas y envios.",
};
