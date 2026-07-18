import type { Brand } from "../../../infrastructure/db/schema.js";



export function toBrandDto(brand: Brand) {

  return {

    id: brand.id,

    internalAlias: brand.internalAlias,

    legalName: brand.legalName,

    dbaName: brand.dbaName,

    entityType: brand.entityType,

    einOrTaxId: brand.einOrTaxId,

    registrationCountry: brand.registrationCountry,

    taxIdIssuingCountry: brand.taxIdIssuingCountry,

    legalAddressLine1: brand.legalAddressLine1,

    legalAddressLine2: brand.legalAddressLine2,

    city: brand.city,

    state: brand.state,

    postalCode: brand.postalCode,

    country: brand.country,

    verticalType: brand.verticalType,

    businessDescription: brand.businessDescription,

    supportPhoneNumber: brand.supportPhoneNumber,

    supportEmailAddress: brand.supportEmailAddress,

    websiteUrl: brand.websiteUrl,

    primaryLanguage: brand.primaryLanguage,

    intakeNotes: brand.intakeNotes,

    intakeStatus: brand.intakeStatus,

    brandRegistrationStatus: brand.brandRegistrationStatus,

    workflowStage: brand.workflowStage,

    archivedAt: brand.archivedAt,

    createdAt: brand.createdAt,

    updatedAt: brand.updatedAt,

  };

}

