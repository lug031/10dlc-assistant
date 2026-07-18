export const BRAND_ENTITY_TYPE = "PRIVATE_PROFIT" as const;
export const BRAND_VERTICAL_TYPE = "Retail and Consumer Products" as const;

export const BRAND_REGISTRATION_COUNTRIES = [
  "United States",
  "Puerto Rico",
] as const;

export type BrandRegistrationCountry =
  (typeof BRAND_REGISTRATION_COUNTRIES)[number];

export function getTaxIdFieldLabels(
  taxIdIssuingCountry: BrandRegistrationCountry,
) {
  if (taxIdIssuingCountry === "United States") {
    return {
      taxIdLabel: "EIN",
      taxIdIssuingCountryLabel: "EIN Issuing Country",
    };
  }

  return {
    taxIdLabel: "Tax Number/ID",
    taxIdIssuingCountryLabel: "Tax Number/ID Issuing Country",
  };
}
