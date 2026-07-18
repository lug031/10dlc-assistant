import type {
  TcrEvidenceConfirmation,
  TcrEvidenceItemKey,
} from "@/types/tcrEvidence";

const REQUIRED_CONFIRMED: TcrEvidenceItemKey[] = [
  "leadMagnet",
  "privacyPolicyAccess",
  "tcrRejectionEvidence",
  "manualUploadAcknowledged",
];

export function createEmptyTcrEvidenceItems() {
  return {
    leadMagnet: "pending" as const,
    qrCode: "pending" as const,
    privacyPolicyAccess: "pending" as const,
    tcrRejectionEvidence: "pending" as const,
    manualUploadAcknowledged: "pending" as const,
  };
}

export function isTcrEvidenceConfirmationComplete(
  confirmation: TcrEvidenceConfirmation | null | undefined,
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

export function tryBuildTcrEvidenceConfirmation(
  items: TcrEvidenceConfirmation["items"],
): TcrEvidenceConfirmation | null {
  const draft: TcrEvidenceConfirmation = {
    confirmedAt: new Date().toISOString(),
    confirmedBy: "operator",
    items,
  };

  if (!isTcrEvidenceConfirmationComplete(draft)) {
    return null;
  }

  return draft;
}
