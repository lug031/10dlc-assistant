import { LEADWIRE_CAMPAIGN_TEMPLATES } from "@/constants/leadwireCampaignTemplates";
import { LEADWIRE_COMMUNICATION_TEMPLATES } from "@/constants/leadwireCommunicationTemplates";

export const PENDING_LEADWIRE_TEXT = "PENDIENTE DE TEXTO OPERATIVO LEADWIRE";

export type LeadwireCatalogCategory =
  | "COMMUNICATION"
  | "CAMPAIGN"
  | "BRAND_UI"
  | "COMPLIANCE"
  | "OTHER";

export interface LeadwireCatalogEntry {
  id: string;
  category: LeadwireCatalogCategory;
  description: string;
  hasApprovedText: boolean;
}

function campaignHasText(id: keyof typeof LEADWIRE_CAMPAIGN_TEMPLATES): boolean {
  return LEADWIRE_CAMPAIGN_TEMPLATES[id] !== null;
}

function commHasText(id: keyof typeof LEADWIRE_COMMUNICATION_TEMPLATES): boolean {
  return LEADWIRE_COMMUNICATION_TEMPLATES[id] !== null;
}

/** Catálogo operativo LW_* — solo lectura; sin migración a base de datos. */
export const LEADWIRE_CATALOG: LeadwireCatalogEntry[] = [
  {
    id: "LW_EMAIL_BRAND_REQUEST",
    category: "COMMUNICATION",
    description: "PASO 1 — solicitud de información (solo Intake, pre-marca)",
    hasApprovedText: commHasText("LW_EMAIL_BRAND_REQUEST"),
  },
  {
    id: "LW_EMAIL_PRIVACY_SITE_IDENTIFIED",
    category: "COMMUNICATION",
    description: "Correo — sitio identificado, falta política en web",
    hasApprovedText: commHasText("LW_EMAIL_PRIVACY_SITE_IDENTIFIED"),
  },
  {
    id: "LW_EMAIL_PRIVACY_NOT_FOUND",
    category: "COMMUNICATION",
    description: "Correo — no se encontró política de privacidad",
    hasApprovedText: commHasText("LW_EMAIL_PRIVACY_NOT_FOUND"),
  },
  {
    id: "LW_EMAIL_PRIVACY_FOLLOWUP",
    category: "COMMUNICATION",
    description: "Follow-up exclusivo de política de privacidad",
    hasApprovedText: commHasText("LW_EMAIL_PRIVACY_FOLLOWUP"),
  },
  {
    id: "LW_EMAIL_DOC_FOLLOWUP",
    category: "COMMUNICATION",
    description: "Follow-up de documentación 10DLC",
    hasApprovedText: false,
  },
  {
    id: "LW_EMAIL_BRAND_REQUEST_FACEBOOK",
    category: "COMMUNICATION",
    description: "Solicitud de registro de marca usando Facebook",
    hasApprovedText: false,
  },
  {
    id: "LW_BRAND_TCR_SUMMARY",
    category: "BRAND_UI",
    description: "Resumen TCR copiable (comportamiento de UI)",
    hasApprovedText: true,
  },
  {
    id: "LW_CAMPAIGN_DESCRIPTION_SAMPLE_1",
    category: "CAMPAIGN",
    description: "Campaign Description — Sample 1",
    hasApprovedText: campaignHasText("LW_CAMPAIGN_DESCRIPTION_SAMPLE_1"),
  },
  {
    id: "LW_CTA_SAMPLE_FLOW_3",
    category: "CAMPAIGN",
    description: "CTA / Message Flow — política en inglés",
    hasApprovedText: campaignHasText("LW_CTA_SAMPLE_FLOW_3"),
  },
  {
    id: "LW_CTA_SAMPLE_FLOW_4",
    category: "CAMPAIGN",
    description: "CTA / Message Flow — política en español",
    hasApprovedText: campaignHasText("LW_CTA_SAMPLE_FLOW_4"),
  },
  {
    id: "LW_CTA_HARD_TO_FIND_INSTRUCTIONS",
    category: "CAMPAIGN",
    description: "Instrucciones CTA para HARD_TO_FIND",
    hasApprovedText: false,
  },
  {
    id: "LW_OPT_IN",
    category: "CAMPAIGN",
    description: "Opt-In Message",
    hasApprovedText: campaignHasText("LW_OPT_IN"),
  },
  {
    id: "LW_OPT_OUT_STOP",
    category: "CAMPAIGN",
    description: "Opt-Out Message (STOP)",
    hasApprovedText: campaignHasText("LW_OPT_OUT_STOP"),
  },
  {
    id: "LW_HELP",
    category: "CAMPAIGN",
    description: "HELP Response",
    hasApprovedText: campaignHasText("LW_HELP"),
  },
  {
    id: "LW_SAMPLE_MESSAGE_FORMAT",
    category: "CAMPAIGN",
    description: "Comportamiento de validación de sample messages (UI)",
    hasApprovedText: true,
  },
  {
    id: "LW_PRIVACY_POLICY_ATTACHMENT",
    category: "COMMUNICATION",
    description: "Política de privacidad adjunta para cliente",
    hasApprovedText: false,
  },
];

export const DEPRECATED_TEMPLATE_KEYS = [
  "campaign_description_default_en",
  "cta_message_flow_default_en",
  "opt_in_default_en",
  "opt_out_default_en",
  "help_default_en",
  "client_info_request_standard_es",
  "client_info_request_facebook_es",
  "client_info_followup_es",
  "privacy_policy_request_es",
  "privacy_policy_facebook_es",
  "appeal_generic_en",
] as const;
