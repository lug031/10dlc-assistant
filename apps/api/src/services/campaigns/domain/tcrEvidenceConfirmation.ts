export const TCR_EVIDENCE_ITEM_KEYS = [
  "leadMagnet",
  "qrCode",
  "privacyPolicyAccess",
  "tcrRejectionEvidence",
  "manualUploadAcknowledged",
] as const;

export type TcrEvidenceItemKey = (typeof TCR_EVIDENCE_ITEM_KEYS)[number];
export type TcrEvidenceItemStatus = "confirmed" | "not_applicable" | "pending";

export interface TcrEvidenceConfirmation {
  confirmedAt: string;
  confirmedBy: string;
  items: Record<TcrEvidenceItemKey, TcrEvidenceItemStatus>;
}

const REQUIRED_CONFIRMED: TcrEvidenceItemKey[] = [
  "leadMagnet",
  "privacyPolicyAccess",
  "tcrRejectionEvidence",
  "manualUploadAcknowledged",
];

export function parseTcrEvidenceConfirmation(
  json: string | null | undefined,
): TcrEvidenceConfirmation | null {
  if (!json?.trim()) return null;

  try {
    const parsed = JSON.parse(json) as TcrEvidenceConfirmation;
    if (!parsed?.confirmedAt || !parsed?.items) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function isTcrEvidenceConfirmationComplete(
  confirmation: TcrEvidenceConfirmation | null,
): boolean {
  if (!confirmation?.confirmedAt?.trim()) {
    return false;
  }

  for (const key of REQUIRED_CONFIRMED) {
    if (confirmation.items[key] !== "confirmed") {
      return false;
    }
  }

  const qrStatus = confirmation.items.qrCode;
  return qrStatus === "confirmed" || qrStatus === "not_applicable";
}

export function serializeTcrEvidenceConfirmation(
  confirmation: TcrEvidenceConfirmation,
): string {
  return JSON.stringify(confirmation);
}
