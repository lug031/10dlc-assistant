import {
  BRAND_ENTITY_TYPE,
  BRAND_VERTICAL_TYPE,
  type BrandRegistrationCountry,
} from "@/constants/brand";

export const PRIMARY_LANGUAGES = ["EN", "ES"] as const;

export type PrimaryLanguage = (typeof PRIMARY_LANGUAGES)[number];

export const PRIMARY_LANGUAGE_OPTIONS: ReadonlyArray<{
  value: PrimaryLanguage;
  label: string;
}> = [
  { value: "EN", label: "Inglés" },
  { value: "ES", label: "Español" },
];

export const PRIMARY_LANGUAGE_LABELS: Record<PrimaryLanguage, string> = {
  EN: "Inglés",
  ES: "Español",
};

export type EntityType = typeof BRAND_ENTITY_TYPE;
export type VerticalType = typeof BRAND_VERTICAL_TYPE;

export interface Brand {
  id: string;
  internalAlias: string | null;
  legalName: string;
  dbaName: string | null;
  entityType: EntityType;
  einOrTaxId: string;
  registrationCountry: BrandRegistrationCountry;
  taxIdIssuingCountry: BrandRegistrationCountry;
  legalAddressLine1: string;
  legalAddressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  verticalType: VerticalType;
  businessDescription: string;
  supportPhoneNumber: string;
  supportEmailAddress: string;
  websiteUrl: string | null;
  primaryLanguage: PrimaryLanguage;
  intakeNotes: string | null;
  intakeStatus: string | null;
  brandRegistrationStatus: string;
  workflowStage: string;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BrandListItem {
  id: string;
  legalName: string;
  internalAlias: string | null;
  workflowStage: string;
  brandRegistrationStatus: string;
  updatedAt: string;
}

export interface BrandsListResponse {
  items: Brand[];
  total: number;
}

export interface CreateBrandPayload {
  internalAlias?: string;
  legalName: string;
  dbaName?: string;
  einOrTaxId: string;
  registrationCountry: BrandRegistrationCountry;
  taxIdIssuingCountry: BrandRegistrationCountry;
  legalAddressLine1: string;
  legalAddressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  supportPhoneNumber: string;
  supportEmailAddress: string;
  websiteUrl?: string;
}

export type UpdateBrandPayload = Partial<CreateBrandPayload> & {
  legalAddressLine2?: string | null;
};

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: Array<{ path: string; message: string }>;
  };
}
