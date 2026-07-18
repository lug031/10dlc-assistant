import { z } from "zod";
import {
  OPERATIONAL_OUTCOMES,
  PRIVACY_ACCESSIBILITY_STATUSES,
  PRIVACY_INACCESSIBLE_REASONS,
  PRIVACY_POLICY_LANGUAGES,
  PRIVACY_REVIEW_STATUSES,
  PRIVACY_SCENARIO_TYPES,
} from "../../../constants/enums.js";

const optionalUrl = z
  .string()
  .url("URL invalida")
  .or(z.literal(""))
  .optional()
  .transform((v) => (v === "" ? undefined : v));

const privacyFieldsSchema = z.object({
  scenarioType: z.enum(PRIVACY_SCENARIO_TYPES),
  privacyPolicyUrl: optionalUrl,
  facebookPageUrl: optionalUrl,
  externalHostingProvider: z.string().max(120).optional(),
  policyLanguages: z
    .array(z.enum(PRIVACY_POLICY_LANGUAGES))
    .min(1, "Selecciona al menos un idioma")
    .max(1, "Selecciona solo un idioma"),
  accessibilityStatus: z
    .enum(PRIVACY_ACCESSIBILITY_STATUSES)
    .optional()
    .default("UNKNOWN"),
  inaccessibleReason: z.enum(PRIVACY_INACCESSIBLE_REASONS).optional(),
  policyLastUpdatedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato YYYY-MM-DD")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  findings: z.string().max(5000).optional().nullable(),
  remediationActions: z.string().max(5000).optional(),
  operationalOutcome: z.enum(OPERATIONAL_OUTCOMES),
  status: z.enum(PRIVACY_REVIEW_STATUSES).optional(),
});

function refineScenarioRules(
  data: z.infer<typeof privacyFieldsSchema>,
  ctx: z.RefinementCtx,
) {
  const needsPrivacyUrl =
    data.scenarioType === "OWN_WEBSITE" ||
    data.scenarioType === "EXTERNAL_HOSTING" ||
    data.scenarioType === "COMBINED";

  const needsFacebookUrl =
    data.scenarioType === "FACEBOOK" || data.scenarioType === "COMBINED";

  if (needsPrivacyUrl && !data.privacyPolicyUrl) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "privacyPolicyUrl es obligatorio para este escenario",
      path: ["privacyPolicyUrl"],
    });
  }

  if (needsFacebookUrl && !data.facebookPageUrl) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "facebookPageUrl es obligatorio para este escenario",
      path: ["facebookPageUrl"],
    });
  }

  if (
    data.accessibilityStatus === "INACCESSIBLE" &&
    !data.inaccessibleReason
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "inaccessibleReason es obligatorio cuando accessibilityStatus es INACCESSIBLE",
      path: ["inaccessibleReason"],
    });
  }

  if (
    data.accessibilityStatus === "INACCESSIBLE" &&
    data.inaccessibleReason === "OTHER" &&
    !data.findings?.trim()
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "findings es obligatorio cuando inaccessibleReason es OTHER",
      path: ["findings"],
    });
  }
}

export const createPrivacyReviewSchema = privacyFieldsSchema.superRefine(
  refineScenarioRules,
);

export const updatePrivacyReviewSchema = privacyFieldsSchema.partial();

export type CreatePrivacyReviewDto = z.infer<typeof createPrivacyReviewSchema>;
export type UpdatePrivacyReviewDto = z.infer<typeof updatePrivacyReviewSchema>;
