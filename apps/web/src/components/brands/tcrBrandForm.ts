import {
  BRAND_ENTITY_TYPE,
  BRAND_VERTICAL_TYPE,
  type BrandRegistrationCountry,
} from "@/constants/brand";
import type { TcrBrandSummaryData } from "@/components/brands/TcrBrandRegistrationSummary";
import type { Brand } from "@/types/brand";

export type TcrBrandFormState = {
  legalName: string;
  dbaName: string;
  einOrTaxId: string;
  registrationCountry: BrandRegistrationCountry;
  taxIdIssuingCountry: BrandRegistrationCountry;
  legalAddressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  supportPhoneNumber: string;
  supportEmailAddress: string;
  websiteUrl: string;
};

export const emptyTcrBrandForm: TcrBrandFormState = {
  legalName: "",
  dbaName: "",
  einOrTaxId: "",
  registrationCountry: "United States",
  taxIdIssuingCountry: "United States",
  legalAddressLine1: "",
  city: "",
  state: "",
  postalCode: "",
  supportPhoneNumber: "",
  supportEmailAddress: "",
  websiteUrl: "",
};

export function toTcrBrandSummaryData(
  form: TcrBrandFormState,
): TcrBrandSummaryData {
  return {
    legalName: form.legalName,
    dbaName: form.dbaName,
    entityType: BRAND_ENTITY_TYPE,
    registrationCountry: form.registrationCountry,
    einOrTaxId: form.einOrTaxId,
    taxIdIssuingCountry: form.taxIdIssuingCountry,
    addressStreet: form.legalAddressLine1,
    city: form.city,
    state: form.state,
    postalCode: form.postalCode,
    country: form.registrationCountry,
    websiteUrl: form.websiteUrl,
    verticalType: BRAND_VERTICAL_TYPE,
    supportPhoneNumber: form.supportPhoneNumber,
    supportEmailAddress: form.supportEmailAddress,
  };
}

export function toBrandCreatePayload(form: TcrBrandFormState) {
  return {
    legalName: form.legalName,
    dbaName: form.dbaName || undefined,
    einOrTaxId: form.einOrTaxId,
    registrationCountry: form.registrationCountry,
    taxIdIssuingCountry: form.taxIdIssuingCountry,
    legalAddressLine1: form.legalAddressLine1,
    city: form.city,
    state: form.state,
    postalCode: form.postalCode,
    country: form.registrationCountry,
    supportPhoneNumber: form.supportPhoneNumber,
    supportEmailAddress: form.supportEmailAddress,
    websiteUrl: form.websiteUrl || undefined,
  };
}

export function toBrandUpdatePayload(form: TcrBrandFormState) {
  return {
    ...toBrandCreatePayload(form),
    legalAddressLine2: null,
  };
}

/** LW_BRAND_TCR_SUMMARY — datos para resumen copiable desde entidad Brand. */
export function brandToTcrSummaryData(brand: Brand): TcrBrandSummaryData {
  return {
    legalName: brand.legalName,
    dbaName: brand.dbaName ?? "",
    entityType: brand.entityType,
    registrationCountry: brand.registrationCountry,
    einOrTaxId: brand.einOrTaxId,
    taxIdIssuingCountry: brand.taxIdIssuingCountry,
    addressStreet: [brand.legalAddressLine1, brand.legalAddressLine2]
      .filter(Boolean)
      .join(", "),
    city: brand.city,
    state: brand.state,
    postalCode: brand.postalCode,
    country: brand.country,
    websiteUrl: brand.websiteUrl ?? "",
    verticalType: brand.verticalType,
    supportPhoneNumber: brand.supportPhoneNumber,
    supportEmailAddress: brand.supportEmailAddress,
  };
}
