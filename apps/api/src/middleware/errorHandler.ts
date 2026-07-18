import type { Context } from "hono";
import { ZodError } from "zod";
import { AppError, isAppError } from "../utils/errors.js";

function zodToDetails(error: ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.length > 0 ? issue.path.join(".") : "body",
    message: issue.message,
  }));
}

export function errorHandler(err: Error, c: Context) {
  if (isAppError(err)) {
    return c.json(
      {
        error: {
          code: err.code,
          message: err.message,
          ...(err.details ? { details: err.details } : {}),
        },
      },
      err.status as 400 | 404 | 409 | 500,
    );
  }

  if (err instanceof ZodError) {
    return c.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Error de validación",
          details: zodToDetails(err),
        },
      },
      400,
    );
  }

  console.error(err);
  return c.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "Error interno del servidor",
      },
    },
    500,
  );
}
