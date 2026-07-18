import { getLeadwireTemplateBody } from "@/constants/leadwireCampaignTemplates";
import type { BrandSnapshot } from "@/types/campaign";
import { substituteLeadwireTemplate } from "@/utils/leadwireTemplateSubstitution";

const LEGACY_HARD_TO_FIND_GUIDE_MARKER =
  "Privacy Policy Access (difficult to find on website):";

export const HARD_TO_FIND_GUIDE_MARKER =
  "privacy policy is not directly linked from the homepage";

export function hardToFindStepFilenames(optInKeyword: string) {
  const keyword = optInKeyword.trim().toUpperCase() || "BRAND";
  return {
    first: `first-step-${keyword}.png`,
    second: `second-step-${keyword}.png`,
    last: `last-step-${keyword}.png`,
  };
}

export const SAMPLE_MULTIMEDIA_FILE_DESCRIPTIONS: Record<string, string> = {
  "leadmagnet.png": "Formulario de suscripción / lead magnet.",
  "qrcode.png": "Código QR en el punto de venta que lleva al formulario.",
};

export function sampleMultimediaFileDescription(
  filename: string,
  optInKeyword: string,
): string {
  if (SAMPLE_MULTIMEDIA_FILE_DESCRIPTIONS[filename]) {
    return SAMPLE_MULTIMEDIA_FILE_DESCRIPTIONS[filename];
  }

  const steps = hardToFindStepFilenames(optInKeyword);
  if (filename === steps.first) {
    return "Paso 1 — Navegación inicial en el sitio hacia la sección de privacidad.";
  }
  if (filename === steps.second) {
    return "Paso 2 — Continuación del recorrido hacia la política de privacidad.";
  }
  if (filename === steps.last) {
    return "Paso 3 — Página de política de privacidad visible.";
  }

  return "";
}

export function buildHardToFindPrivacyAccessGuide(
  brandSnapshot: BrandSnapshot,
  optInKeyword: string,
): string {
  const template = getLeadwireTemplateBody("LW_CTA_HARD_TO_FIND_INSTRUCTIONS");
  if (!template) return "";

  const keyword = optInKeyword.trim().toUpperCase() || "BRAND";
  const steps = hardToFindStepFilenames(optInKeyword);

  return substituteLeadwireTemplate(template, { brandSnapshot })
    .replaceAll("[KEYWORD]", keyword)
    .replaceAll("first-step-[KEYWORD].png", steps.first)
    .replaceAll("second-step-[KEYWORD].png", steps.second)
    .replaceAll("last-step-[KEYWORD].png", steps.last);
}

export function stripHardToFindGuideFromCta(text: string): string {
  const legacyIdx = text.indexOf(LEGACY_HARD_TO_FIND_GUIDE_MARKER);
  if (legacyIdx !== -1) {
    return text.slice(0, legacyIdx).trimEnd();
  }

  const idx = text.indexOf(HARD_TO_FIND_GUIDE_MARKER);
  if (idx === -1) return text;

  const before = text.slice(0, idx);
  const lastParaBreak = before.lastIndexOf("\n\n");
  return lastParaBreak === -1 ? before.trimEnd() : text.slice(0, lastParaBreak).trimEnd();
}
