export const INTAKE_REQUEST_STATUSES = [
  "DRAFT",
  "SENT",
  "RESPONDED",
  "CONVERTED",
  "CANCELLED",
] as const;

export type IntakeRequestStatus = (typeof INTAKE_REQUEST_STATUSES)[number];

export interface IntakeRequest {
  id: string;
  brandName: string;
  contactName: string;
  contactEmail: string;
  status: IntakeRequestStatus;
  emailSubject: string | null;
  emailBody: string | null;
  requestedAt: string | null;
  notes: string | null;
  convertedBrandId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IntakeSummary {
  draft: number;
  sent: number;
  responded: number;
  converted: number;
  cancelled: number;
  total: number;
}

export interface CreateIntakePayload {
  brandName: string;
  contactName?: string;
  contactEmail: string;
  notes?: string;
}

export type UpdateIntakePayload = {
  brandName?: string;
  contactName?: string;
  contactEmail?: string;
  notes?: string | null;
};

export const INTAKE_STATUS_LABELS: Record<IntakeRequestStatus, string> = {
  DRAFT: "Borrador",
  SENT: "Enviado",
  RESPONDED: "Respondido",
  CONVERTED: "Convertido",
  CANCELLED: "Cancelado",
};
