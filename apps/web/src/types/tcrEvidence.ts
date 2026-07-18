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

export const TCR_EVIDENCE_ITEM_LABELS: Record<TcrEvidenceItemKey, string> = {
  leadMagnet: "Screenshots del Lead Magnet preparados para TCR",
  qrCode: "Screenshots del QR Code preparados para TCR (si aplica)",
  privacyPolicyAccess:
    "Screenshots de acceso a la Politica de Privacidad preparados para TCR",
  tcrRejectionEvidence:
    "Evidencia anti-rechazo TCR preparada para carga manual",
  manualUploadAcknowledged:
    "Confirmacion de carga manual en Campaign Registry",
};
