import { zValidator } from "@hono/zod-validator";
import type { Context } from "hono";
import type { ZodSchema } from "zod";
import { ValidationError } from "../utils/errors.js";

type ZodHookResult = {
  success: boolean;
  error?: {
    issues: Array<{ path: (string | number)[]; message: string }>;
  };
};

function zodValidationHook(result: ZodHookResult, _c: Context) {
  if (!result.success) {
    const issues = result.error?.issues ?? [];
    const details = issues.map((issue) => ({
      path: issue.path.length > 0 ? issue.path.join(".") : "body",
      message: issue.message,
    }));
    throw new ValidationError("Error de validación", details);
  }
}

export function jsonValidator<T extends ZodSchema>(schema: T) {
  return zValidator("json", schema, zodValidationHook);
}

export function queryValidator<T extends ZodSchema>(schema: T) {
  return zValidator("query", schema, zodValidationHook);
}
