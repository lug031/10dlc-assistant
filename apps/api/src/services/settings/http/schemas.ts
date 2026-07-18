import { z } from "zod";
import { PRIMARY_LANGUAGES } from "../../../constants/enums.js";

export const patchSettingsSchema = z.object({
  uiLocale: z.enum(["es", "en"]).optional(),
  defaultOptOutKeyword: z.string().min(2).max(10).optional(),
  defaultPrimaryLanguage: z.enum(PRIMARY_LANGUAGES).optional(),
  showValidationWarnings: z.boolean().optional(),
});

export type PatchSettingsDto = z.infer<typeof patchSettingsSchema>;
