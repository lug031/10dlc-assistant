import type { Brand, Campaign, CampaignSubmission } from "../../../infrastructure/db/schema.js";

export interface BrandSnapshot {
  legalName: string;
  dbaName: string | null;
  einOrTaxId: string;
  entityType: string;
  registrationCountry: string;
  taxIdIssuingCountry: string;
  verticalType: string;
  websiteUrl: string | null;
  supportPhoneNumber: string;
  businessDescription: string;
}

export interface ContentAttributes {
  embeddedLinks: boolean;
  phoneNumbers: boolean;
  ageGated: boolean;
  affiliateMarketing: boolean;
}

export const DEFAULT_CONTENT_ATTRIBUTES: ContentAttributes = {
  embeddedLinks: false,
  phoneNumbers: false,
  ageGated: false,
  affiliateMarketing: false,
};

export function buildBrandSnapshot(brand: Brand): BrandSnapshot {
  return {
    legalName: brand.legalName,
    dbaName: brand.dbaName,
    einOrTaxId: brand.einOrTaxId,
    entityType: brand.entityType,
    registrationCountry: brand.registrationCountry,
    taxIdIssuingCountry: brand.taxIdIssuingCountry,
    verticalType: brand.verticalType,
    websiteUrl: brand.websiteUrl,
    supportPhoneNumber: brand.supportPhoneNumber,
    businessDescription: brand.businessDescription,
  };
}

export function parseSampleMessages(json: string): string[] {
  try {
    const parsed = JSON.parse(json) as unknown;
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

export function parseContentAttributes(json: string): ContentAttributes {
  try {
    const parsed = JSON.parse(json) as Partial<ContentAttributes>;
    return { ...DEFAULT_CONTENT_ATTRIBUTES, ...parsed };
  } catch {
    return { ...DEFAULT_CONTENT_ATTRIBUTES };
  }
}

export function parseBrandSnapshot(json: string): BrandSnapshot {
  return JSON.parse(json) as BrandSnapshot;
}
