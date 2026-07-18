import type { BrandSnapshot } from "@/types/campaign";
import { brandDisplayName } from "@/utils/ctaMessageFlow";

export const SAMPLE_MESSAGE_COUNT = 2;

export function formatSampleMessage(brandSnapshot: BrandSnapshot, message: string): string {
  const name = brandDisplayName(brandSnapshot);
  return `${name}: ${message} Reply STOP to opt-out`;
}

export function buildDefaultSampleMessages(
  brandSnapshot: BrandSnapshot,
): [string, string] {
  return [
    formatSampleMessage(
      brandSnapshot,
      "¡Gracias por asistir a nuestro evento!",
    ),
    formatSampleMessage(
      brandSnapshot,
      "¡No te pierdas nuestras promociones especiales!",
    ),
  ];
}
