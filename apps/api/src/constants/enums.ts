export const BRAND_ENTITY_TYPE = "PRIVATE_PROFIT" as const;
export const BRAND_VERTICAL_TYPE = "Retail and Consumer Products" as const;

export const BRAND_REGISTRATION_COUNTRIES = [
  "United States",
  "Puerto Rico",
] as const;

export type BrandRegistrationCountry =
  (typeof BRAND_REGISTRATION_COUNTRIES)[number];
export const ENTITY_TYPES = [BRAND_ENTITY_TYPE] as const;
export const BRAND_REGISTRATION_STATUSES = [
  "DRAFT",
  "READY",
  "SUBMITTED",
  "APPROVED",
  "REJECTED",
] as const;

export const WORKFLOW_STAGES = [
  "INFO_REQUEST",
  "LEGAL_COLLECTION",
  "WEBSITE_REVIEW",
  "PRIVACY_REVIEW",
  "BRAND_REGISTRATION",
  "BRAND_APPROVED",
] as const;

export const PRIMARY_LANGUAGES = ["EN", "ES"] as const;

export const INTAKE_STATUSES = ["PENDING", "PARTIAL", "COMPLETE"] as const;

export const PRIVACY_SCENARIO_TYPES = [
  "OWN_WEBSITE",
  "FACEBOOK",
  "EXTERNAL_HOSTING",
  "COMBINED",
] as const;

export const PRIVACY_ACCESSIBILITY_STATUSES = [
  "ACCESSIBLE",
  "INACCESSIBLE",
  "UNKNOWN",
  "PENDING_FIX",
] as const;

export const PRIVACY_INACCESSIBLE_REASONS = [
  "NO_URL",
  "DEAD_LINK",
  "PLACEHOLDER",
  "OTHER",
] as const;

export const PRIVACY_POLICY_LANGUAGES = ["EN", "ES"] as const;

export const PRIVACY_REVIEW_STATUSES = [
  "DRAFT",
  "IN_REVIEW",
  "PASSED",
  "FAILED",
  "SUPERSEDED",
] as const;

export const OPERATIONAL_OUTCOMES = [
  "NO_POLICY",
  "HARD_TO_FIND",
  "ACCESSIBLE_EN",
  "ACCESSIBLE_ES",
] as const;

export const PRIVACY_EMAIL_FLOW_STATUSES = [
  "NOT_STARTED",
  "WAITING_RESPONSE",
  "FOLLOWUP_SENT",
  "CLIENT_RESPONDED",
] as const;

export type PrivacyScenarioType = (typeof PRIVACY_SCENARIO_TYPES)[number];
export type PrivacyAccessibilityStatus =
  (typeof PRIVACY_ACCESSIBILITY_STATUSES)[number];
export type PrivacyInaccessibleReason =
  (typeof PRIVACY_INACCESSIBLE_REASONS)[number];
export type PrivacyPolicyLanguage = (typeof PRIVACY_POLICY_LANGUAGES)[number];
export type PrivacyReviewStatus = (typeof PRIVACY_REVIEW_STATUSES)[number];
export type OperationalOutcome = (typeof OPERATIONAL_OUTCOMES)[number];
export type PrivacyEmailFlowStatus =
  (typeof PRIVACY_EMAIL_FLOW_STATUSES)[number];

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

export const INTAKE_REQUEST_STATUSES = [
  "DRAFT",
  "SENT",
  "RESPONDED",
  "CONVERTED",
  "CANCELLED",
] as const;

export type IntakeRequestStatus = (typeof INTAKE_REQUEST_STATUSES)[number];

export type EntityType = (typeof ENTITY_TYPES)[number];
export type BrandRegistrationStatus =
  (typeof BRAND_REGISTRATION_STATUSES)[number];
export type WorkflowStage = (typeof WORKFLOW_STAGES)[number];
export type PrimaryLanguage = (typeof PRIMARY_LANGUAGES)[number];
export type IntakeStatus = (typeof INTAKE_STATUSES)[number];

export interface AppSettingsDto {
  uiLocale: "es" | "en";
  defaultOptOutKeyword: string;
  defaultPrimaryLanguage: PrimaryLanguage;
  showValidationWarnings: boolean;
}

export const DEFAULT_APP_SETTINGS: AppSettingsDto = {
  uiLocale: "es",
  defaultOptOutKeyword: "STOP",
  defaultPrimaryLanguage: "EN",
  showValidationWarnings: true,
};
