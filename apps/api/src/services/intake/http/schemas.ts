import { z } from "zod";
import { INTAKE_REQUEST_STATUSES } from "../../../constants/enums.js";

export const createIntakeRequestSchema = z.object({
  brandName: z.string().min(2).max(200),
  contactName: z.string().max(200).optional(),
  contactEmail: z.string().email("Correo invalido"),
  notes: z.string().max(5000).optional(),
});

export const updateIntakeRequestSchema = createIntakeRequestSchema
  .partial()
  .extend({
    status: z.enum(INTAKE_REQUEST_STATUSES).optional(),
    notes: z.string().max(5000).optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debe enviar al menos un campo",
  });

export const listIntakeQuerySchema = z.object({
  status: z.enum(INTAKE_REQUEST_STATUSES).optional(),
  search: z.string().optional(),
});

export type CreateIntakeRequestDto = z.infer<typeof createIntakeRequestSchema>;
export type UpdateIntakeRequestDto = z.infer<typeof updateIntakeRequestSchema>;
