import type { OperationalOutcome } from "@/types/privacy";
import type { SampleMultimediaConfirmation } from "@/types/sampleMultimedia";

export function buildSampleMultimediaFilenames(
  operationalOutcome: OperationalOutcome | null | undefined,
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

export function createEmptySampleMultimediaConfirmation(
  requiredFiles: string[],
): SampleMultimediaConfirmation {
  const items: Record<string, boolean> = {};
  for (const file of requiredFiles) {
    items[file] = false;
  }
  return { items, updatedAt: null };
}

export function mergeSampleMultimediaConfirmation(
  requiredFiles: string[],
  existing: SampleMultimediaConfirmation | null | undefined,
): SampleMultimediaConfirmation {
  const items: Record<string, boolean> = {};
  for (const file of requiredFiles) {
    items[file] = existing?.items[file] ?? false;
  }
  return {
    items,
    updatedAt: existing?.updatedAt ?? null,
  };
}

export function isSampleMultimediaComplete(
  confirmation: SampleMultimediaConfirmation | null | undefined,
  requiredFiles: string[],
): boolean {
  if (!confirmation) return false;
  return requiredFiles.every((file) => confirmation.items[file] === true);
}

export function toggleSampleMultimediaItem(
  confirmation: SampleMultimediaConfirmation,
  filename: string,
  checked: boolean,
): SampleMultimediaConfirmation {
  return {
    items: { ...confirmation.items, [filename]: checked },
    updatedAt: new Date().toISOString(),
  };
}
