import type { IntakeRequest } from "../../../infrastructure/db/schema.js";

export function toIntakeRequestDto(row: IntakeRequest) {
  return {
    id: row.id,
    brandName: row.brandName,
    contactName: row.contactName,
    contactEmail: row.contactEmail,
    status: row.status,
    emailSubject: row.emailSubject,
    emailBody: row.emailBody,
    requestedAt: row.requestedAt,
    notes: row.notes,
    convertedBrandId: row.convertedBrandId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
