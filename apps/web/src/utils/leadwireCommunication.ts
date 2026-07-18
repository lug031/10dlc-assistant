import {
  LEADWIRE_COMMUNICATION_TEMPLATES,
  type LeadwireCommunicationTemplateKey,
} from "@/constants/leadwireCommunicationTemplates";
import { PENDING_LEADWIRE_TEXT } from "@/constants/leadwireCatalog";
import type { Brand } from "@/types/brand";

export interface CommunicationRenderContext {
  brand: Brand;
  contactName?: string;
}

function brandDisplayName(brand: Brand): string {
  return brand.dbaName?.trim() || brand.legalName;
}

function substituteCommunicationText(
  template: string,
  context: CommunicationRenderContext,
): string {
  const { brand } = context;
  const displayName = brandDisplayName(brand);

  return template
    .replaceAll("<Brand Name>", displayName)
    .replaceAll("<Legal Entity Name>", brand.legalName)
    .replaceAll("<Website URL>", brand.websiteUrl ?? "")
    .replaceAll("<Customer Name>", context.contactName?.trim() || displayName);
}

export function renderLeadwireCommunication(
  key: LeadwireCommunicationTemplateKey,
  context: CommunicationRenderContext,
): { subject: string; body: string } | null {
  const template = LEADWIRE_COMMUNICATION_TEMPLATES[key];

  if (!template.body) {
    return null;
  }

  const body = substituteCommunicationText(template.body, context);
  const subject = template.subject
    ? substituteCommunicationText(template.subject, context)
    : "";

  return { subject, body };
}

export function getCommunicationPendingMessage(): string {
  return PENDING_LEADWIRE_TEXT;
}
