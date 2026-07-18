import type {
  OperationalOutcome,
  PrivacyEmailFlowStatus,
  PrivacyPolicyLanguage,
} from "@/types/privacy";
import type { LeadwireCommunicationTemplateKey } from "@/constants/leadwireCommunicationTemplates";

export const OPERATIONAL_OUTCOME_LABELS: Record<OperationalOutcome, string> = {
  NO_POLICY: "CASO 1 — Sin política de privacidad",
  HARD_TO_FIND: "CASO 2 — Política difícil de encontrar",
  ACCESSIBLE_EN: "CASO 3 — Política accesible (inglés)",
  ACCESSIBLE_ES: "CASO 3 — Política accesible (español)",
};

export const OPERATIONAL_OUTCOME_SHORT_LABELS: Record<
  OperationalOutcome,
  string
> = {
  NO_POLICY: "Sin política",
  HARD_TO_FIND: "Difícil de encontrar",
  ACCESSIBLE_EN: "Accesible (EN)",
  ACCESSIBLE_ES: "Accesible (ES)",
};

export const OPERATIONAL_OUTCOME_DESCRIPTIONS: Record<
  OperationalOutcome,
  string
> = {
  NO_POLICY:
    "Bloquea el registro de campañas. Use Communications para solicitar la política al cliente.",
  HARD_TO_FIND:
    "Permite campañas con evidencia (screenshots) y CTA según idioma de la política.",
  ACCESSIBLE_EN:
    "Flujo normal. CTA asignado: LW_CTA_SAMPLE_FLOW_3.",
  ACCESSIBLE_ES:
    "Flujo normal. CTA asignado: LW_CTA_SAMPLE_FLOW_4.",
};

/** Tres casos en el formulario; CASO 3 usa el idioma del paso Idioma. */
export const OPERATIONAL_CASE_FORM_TYPES = [
  "NO_POLICY",
  "HARD_TO_FIND",
  "ACCESSIBLE",
] as const;

export type OperationalCaseFormType =
  (typeof OPERATIONAL_CASE_FORM_TYPES)[number];

export const OPERATIONAL_CASE_FORM_LABELS: Record<
  OperationalCaseFormType,
  string
> = {
  NO_POLICY: "CASO 1 — Sin política de privacidad",
  HARD_TO_FIND: "CASO 2 — Política difícil de encontrar",
  ACCESSIBLE: "CASO 3 — Política accesible",
};

export const OPERATIONAL_CASE_FORM_DESCRIPTIONS: Record<
  OperationalCaseFormType,
  string
> = {
  NO_POLICY:
    "Bloquea el registro de campañas. Use Communications para solicitar la política al cliente.",
  HARD_TO_FIND:
    "Permite campañas con evidencia (screenshots). El CTA usa el idioma del paso Idioma.",
  ACCESSIBLE:
    "Flujo normal. El CTA se asigna automáticamente según el idioma del paso Idioma.",
};

export function operationalOutcomeToFormCase(
  outcome: OperationalOutcome | null | "",
): OperationalCaseFormType | "" {
  if (!outcome) return "";
  if (outcome === "ACCESSIBLE_EN" || outcome === "ACCESSIBLE_ES") {
    return "ACCESSIBLE";
  }
  return outcome;
}

export function formCaseToOperationalOutcome(
  caseType: OperationalCaseFormType,
  policyLanguage: PrivacyPolicyLanguage,
): OperationalOutcome {
  if (caseType === "ACCESSIBLE") {
    return policyLanguage === "ES" ? "ACCESSIBLE_ES" : "ACCESSIBLE_EN";
  }
  return caseType;
}

export function operationalCasesForAccessibility(
  accessibilityStatus: "ACCESSIBLE" | "INACCESSIBLE" | "",
): OperationalCaseFormType[] {
  if (accessibilityStatus === "ACCESSIBLE") {
    return ["HARD_TO_FIND", "ACCESSIBLE"];
  }
  if (accessibilityStatus === "INACCESSIBLE") {
    return ["NO_POLICY"];
  }
  return [];
}

export function isOperationalCaseAllowedForAccessibility(
  accessibilityStatus: "ACCESSIBLE" | "INACCESSIBLE" | "",
  operationalCase: OperationalCaseFormType | "",
): boolean {
  if (!operationalCase) return false;
  return operationalCasesForAccessibility(accessibilityStatus).includes(
    operationalCase,
  );
}

export function accessibleCtaTemplateForLanguage(
  policyLanguage: PrivacyPolicyLanguage,
): LeadwireCtaTemplateKey {
  return policyLanguage === "ES"
    ? "LW_CTA_SAMPLE_FLOW_4"
    : "LW_CTA_SAMPLE_FLOW_3";
}

export const PRIVACY_EMAIL_FLOW_LABELS: Record<PrivacyEmailFlowStatus, string> =
  {
    NOT_STARTED: "Sin correos enviados",
    WAITING_RESPONSE: "Esperando respuesta del cliente",
    FOLLOWUP_SENT: "Follow-up enviado — esperando respuesta",
    CLIENT_RESPONDED: "Cliente respondió",
  };

export const PRIVACY_POLICY_LANGUAGE_LABELS: Record<
  PrivacyPolicyLanguage,
  string
> = {
  EN: "Inglés",
  ES: "Español",
};

export type LeadwireCtaTemplateKey =
  | "LW_CTA_SAMPLE_FLOW_3"
  | "LW_CTA_SAMPLE_FLOW_4";

export interface CtaAssignment {
  templateKey: LeadwireCtaTemplateKey | null;
  policyLanguage: PrivacyPolicyLanguage | null;
  ambiguousLanguage: boolean;
}

export function getRecommendedPrivacyEmailTemplate(
  flowStatus: PrivacyEmailFlowStatus,
): LeadwireCommunicationTemplateKey | null {
  if (flowStatus === "NOT_STARTED") {
    return "LW_EMAIL_PRIVACY_NOT_FOUND";
  }
  if (
    flowStatus === "WAITING_RESPONSE" ||
    flowStatus === "FOLLOWUP_SENT"
  ) {
    return "LW_EMAIL_PRIVACY_FOLLOWUP";
  }
  return null;
}

export function resolveCtaPolicyLanguage(
  operationalOutcome: OperationalOutcome | null | undefined,
  policyLanguages: PrivacyPolicyLanguage[],
): PrivacyPolicyLanguage | null {
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
      return policyLanguages[0];
    }
    return null;
  }

  return null;
}

export function resolveCtaAssignment(
  operationalOutcome: OperationalOutcome | null | undefined,
  policyLanguages: PrivacyPolicyLanguage[],
): CtaAssignment {
  const policyLanguage = resolveCtaPolicyLanguage(
    operationalOutcome,
    policyLanguages,
  );
  const ambiguousLanguage =
    operationalOutcome === "HARD_TO_FIND" && policyLanguages.length > 1;

  let templateKey: LeadwireCtaTemplateKey | null = null;
  if (policyLanguage === "EN") {
    templateKey = "LW_CTA_SAMPLE_FLOW_3";
  } else if (policyLanguage === "ES") {
    templateKey = "LW_CTA_SAMPLE_FLOW_4";
  }

  return { templateKey, policyLanguage, ambiguousLanguage };
}

export function isSubmissionBlockedByOutcome(
  operationalOutcome: OperationalOutcome | null | undefined,
): boolean {
  return !operationalOutcome || operationalOutcome === "NO_POLICY";
}
