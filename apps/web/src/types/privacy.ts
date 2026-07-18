export const PRIVACY_SCENARIO_TYPES = [
  "OWN_WEBSITE",
  "FACEBOOK",
  "EXTERNAL_HOSTING",
  "COMBINED",
] as const;

export type PrivacyScenarioType = (typeof PRIVACY_SCENARIO_TYPES)[number];

/** Escenarios visibles en el formulario (COMBINED queda oculto; solo para registros heredados). */
export const PRIVACY_SCENARIO_FORM_TYPES = [
  "OWN_WEBSITE",
  "FACEBOOK",
  "EXTERNAL_HOSTING",
] as const;

export const PRIVACY_SCENARIO_LABELS: Record<PrivacyScenarioType, string> = {
  OWN_WEBSITE: "Website propio",
  FACEBOOK: "Facebook",
  EXTERNAL_HOSTING: "Hosting externo",
  COMBINED: "Combinado (heredado)",
};

export const PRIVACY_ACCESSIBILITY_STATUSES = [
  "ACCESSIBLE",
  "INACCESSIBLE",
  "UNKNOWN",
  "PENDING_FIX",
] as const;

/** Opciones del paso Accesibilidad en el formulario. */
export const PRIVACY_ACCESSIBILITY_FORM_STATUSES = [
  "ACCESSIBLE",
  "INACCESSIBLE",
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

export type PrivacyAccessibilityStatus =
  (typeof PRIVACY_ACCESSIBILITY_STATUSES)[number];
export type PrivacyInaccessibleReason =
  (typeof PRIVACY_INACCESSIBLE_REASONS)[number];
export type PrivacyPolicyLanguage = (typeof PRIVACY_POLICY_LANGUAGES)[number];
export type PrivacyReviewStatus = (typeof PRIVACY_REVIEW_STATUSES)[number];
export type OperationalOutcome = (typeof OPERATIONAL_OUTCOMES)[number];
export type PrivacyEmailFlowStatus =
  (typeof PRIVACY_EMAIL_FLOW_STATUSES)[number];

export const PRIVACY_ACCESSIBILITY_LABELS: Record<
  PrivacyAccessibilityStatus,
  string
> = {
  ACCESSIBLE: "Accesible — la política se puede leer públicamente",
  INACCESSIBLE: "Inaccesible — no se puede consultar la política",
  UNKNOWN: "Sin revisar — aún no se ha verificado",
  PENDING_FIX: "Pendiente de corrección — hay un problema por resolver",
};

/** Etiquetas cortas para listas y chips. */
export const PRIVACY_ACCESSIBILITY_SHORT_LABELS: Record<
  PrivacyAccessibilityStatus,
  string
> = {
  ACCESSIBLE: "Accesible",
  INACCESSIBLE: "Inaccesible",
  UNKNOWN: "Sin revisar",
  PENDING_FIX: "Pendiente de corrección",
};

export const PRIVACY_INACCESSIBLE_REASON_LABELS: Record<
  PrivacyInaccessibleReason,
  string
> = {
  NO_URL: "No hay URL de política de privacidad",
  DEAD_LINK: "El enlace no funciona (404 u otro error)",
  PLACEHOLDER: "La página tiene contenido provisional o vacío",
  OTHER: "Otro",
};

/** Guía operativa: qué registrar según lo que encontró al abrir la URL. */
export const PRIVACY_ACCESSIBILITY_GUIDANCE: Record<
  PrivacyAccessibilityStatus,
  string
> = {
  UNKNOWN:
    "Aún no abrió el enlace. Use esto solo al empezar; cámbielo después de revisar.",
  ACCESSIBLE:
    "Abrió la URL y cualquier visitante puede leer la política.",
  INACCESSIBLE:
    "No puede consultar la política (sin URL, enlace roto, login, etc.).",
  PENDING_FIX:
    "Hay política o borrador, pero el cliente debe corregir algo antes de continuar.",
};

export interface PrivacyReview {
  id: string;
  brandId: string;
  reviewNumber: number;
  scenarioType: PrivacyScenarioType;
  privacyPolicyUrl: string | null;
  facebookPageUrl: string | null;
  externalHostingProvider: string | null;
  policyLanguages: PrivacyPolicyLanguage[];
  accessibilityStatus: PrivacyAccessibilityStatus;
  inaccessibleReason: PrivacyInaccessibleReason | null;
  policyLastUpdatedDate: string | null;
  findings: string | null;
  remediationActions: string | null;
  operationalOutcome: OperationalOutcome | null;
  privacyEmailFlowStatus: PrivacyEmailFlowStatus;
  privacyInitialEmailSentAt: string | null;
  privacyFollowupSentAt: string | null;
  privacyClientRespondedAt: string | null;
  status: PrivacyReviewStatus;
  isCurrent: boolean;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ValidationIssue {
  code: string;
  message: string;
  field: string;
}

export interface PrivacyValidationResult {
  valid: boolean;
  blocking: ValidationIssue[];
  warnings: ValidationIssue[];
}

export interface CreatePrivacyReviewPayload {
  scenarioType: PrivacyScenarioType;
  privacyPolicyUrl?: string;
  facebookPageUrl?: string;
  externalHostingProvider?: string;
  policyLanguages: PrivacyPolicyLanguage[];
  accessibilityStatus?: PrivacyAccessibilityStatus;
  inaccessibleReason?: PrivacyInaccessibleReason;
  policyLastUpdatedDate?: string;
  findings?: string | null;
  remediationActions?: string;
  operationalOutcome?: OperationalOutcome;
  status?: PrivacyReviewStatus;
}

export type UpdatePrivacyReviewPayload = Partial<CreatePrivacyReviewPayload>;
