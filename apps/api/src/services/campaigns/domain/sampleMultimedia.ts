export interface SampleMultimediaConfirmation {
  items: Record<string, boolean>;
  updatedAt: string | null;
}

export function buildSampleMultimediaFilenames(
  operationalOutcome: string | null | undefined,
  optInKeyword: string,
): string[] {
  const files = ["leadmagnet.png", "qrcode.png"];

  if (operationalOutcome === "HARD_TO_FIND") {
    const keyword = optInKeyword.trim().toUpperCase() || "BRAND";
    files.push(
      `first-step-${keyword}.png`,
      `second-step-${keyword}.png`,
      `last-step-${keyword}.png`,
    );
  }

  return files;
}

export function parseOptInKeywordFromCta(ctaMessageFlow: string | null | undefined): string {
  if (!ctaMessageFlow?.trim()) return "";
  const match = ctaMessageFlow.match(/opt-in keyword "([^"]+)"/i);
  return match?.[1]?.trim() ?? "";
}

export function parseSampleMultimediaConfirmation(
  json: string | null | undefined,
): SampleMultimediaConfirmation | null {
  if (!json?.trim()) return null;

  try {
    const parsed = JSON.parse(json) as SampleMultimediaConfirmation;
    if (!parsed?.items || typeof parsed.items !== "object") return null;
    return {
      items: parsed.items,
      updatedAt: parsed.updatedAt ?? null,
    };
  } catch {
    return null;
  }
}

export function isSampleMultimediaComplete(
  confirmation: SampleMultimediaConfirmation | null,
  requiredFiles: string[],
): boolean {
  if (!confirmation) return false;
  return requiredFiles.every((file) => confirmation.items[file] === true);
}

export function serializeSampleMultimediaConfirmation(
  confirmation: SampleMultimediaConfirmation,
): string {
  return JSON.stringify(confirmation);
}
