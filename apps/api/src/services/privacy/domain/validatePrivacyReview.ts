import type { Brand, PrivacyReview } from "../../../infrastructure/db/schema.js";

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

function extractHostname(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function validatePrivacyReviewLogic(
  review: PrivacyReview,
  brand: Brand,
): PrivacyValidationResult {
  const blocking: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  const scenario = review.scenarioType;

  const needsPrivacyUrl =
    scenario === "OWN_WEBSITE" ||
    scenario === "EXTERNAL_HOSTING" ||
    scenario === "COMBINED";

  const needsFacebookUrl = scenario === "FACEBOOK" || scenario === "COMBINED";

  if (needsPrivacyUrl && !review.privacyPolicyUrl) {
    blocking.push({
      code: "PRIVACY_URL_REQUIRED",
      message: "privacyPolicyUrl es obligatorio para este escenario",
      field: "privacyPolicyUrl",
    });
  }

  if (needsFacebookUrl && !review.facebookPageUrl) {
    blocking.push({
      code: "FACEBOOK_URL_REQUIRED",
      message: "facebookPageUrl es obligatorio para este escenario",
      field: "facebookPageUrl",
    });
  }

  if (review.accessibilityStatus === "INACCESSIBLE") {
    warnings.push({
      code: "PRIVACY_INACCESSIBLE",
      message:
        "La politica esta marcada como inaccesible. Revisa antes de registrar campanas.",
      field: "accessibilityStatus",
    });
  }

  if (review.privacyPolicyUrl && !review.privacyPolicyUrl.startsWith("https://")) {
    warnings.push({
      code: "PRIVACY_URL_NOT_HTTPS",
      message: "Se recomienda usar HTTPS en la URL de privacidad",
      field: "privacyPolicyUrl",
    });
  }

  const brandHost = extractHostname(brand.websiteUrl);
  const privacyHost = extractHostname(review.privacyPolicyUrl);
  if (brandHost && privacyHost && brandHost !== privacyHost) {
    warnings.push({
      code: "PRIVACY_DOMAIN_MISMATCH",
      message:
        "El dominio de la politica no coincide con el website de la marca",
      field: "privacyPolicyUrl",
    });
  }

  return {
    valid: blocking.length === 0,
    blocking,
    warnings,
  };
}
