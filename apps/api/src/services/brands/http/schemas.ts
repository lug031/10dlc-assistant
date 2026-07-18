import { z } from "zod";
import {
  BRAND_ENTITY_TYPE,
  BRAND_REGISTRATION_COUNTRIES,
  BRAND_REGISTRATION_STATUSES,
  BRAND_VERTICAL_TYPE,
  INTAKE_STATUSES,
  PRIMARY_LANGUAGES,
  WORKFLOW_STAGES,
} from "../../../constants/enums.js";

const optionalUrl = z
  .string()
  .url("URL invalida")
  .or(z.literal(""))
  .optional()
  .transform((v) => (v === "" ? undefined : v));

const brandCountry = z.enum(BRAND_REGISTRATION_COUNTRIES, {
  errorMap: () => ({
    message: "Selecciona United States o Puerto Rico",
  }),
});

const brandFieldsSchema = z.object({
  internalAlias: z.string().max(120).optional(),
  legalName: z.string().min(2).max(200),
  dbaName: z.string().max(200).optional(),
  entityType: z.literal(BRAND_ENTITY_TYPE).optional().default(BRAND_ENTITY_TYPE),
  einOrTaxId: z.string().min(4).max(30),
  registrationCountry: brandCountry,
  taxIdIssuingCountry: brandCountry,
  legalAddressLine1: z.string().min(3),
  legalAddressLine2: z.string().optional().nullable(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: brandCountry,
  verticalType: z.literal(BRAND_VERTICAL_TYPE).optional().default(BRAND_VERTICAL_TYPE),
  businessDescription: z.string().max(2000).optional().default(""),
  supportPhoneNumber: z
    .string()
    .trim()
    .min(10, "Telefono de soporte invalido")
    .max(25, "Telefono de soporte invalido"),
  supportEmailAddress: z.string().trim().email("Correo de soporte invalido"),
  websiteUrl: optionalUrl,
  primaryLanguage: z.enum(PRIMARY_LANGUAGES).optional().default("EN"),
  intakeNotes: z.string().max(5000).optional(),
  intakeStatus: z.enum(INTAKE_STATUSES).optional(),
});

export const createBrandSchema = brandFieldsSchema;

export const updateBrandSchema = brandFieldsSchema
  .partial()
  .extend({
    brandRegistrationStatus: z.enum(BRAND_REGISTRATION_STATUSES).optional(),
    workflowStage: z.enum(WORKFLOW_STAGES).optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.entityType !== undefined &&
      data.entityType !== BRAND_ENTITY_TYPE
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "entityType debe ser PRIVATE_PROFIT",
        path: ["entityType"],
      });
    }
    if (
      data.verticalType !== undefined &&
      data.verticalType !== BRAND_VERTICAL_TYPE
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "verticalType debe ser Retail and Consumer Products",
        path: ["verticalType"],
      });
    }
  });

export const listBrandsQuerySchema = z.object({
  search: z.string().optional(),
  archived: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export type CreateBrandDto = z.infer<typeof createBrandSchema>;
export type UpdateBrandDto = z.infer<typeof updateBrandSchema>;
