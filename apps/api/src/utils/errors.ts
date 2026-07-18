export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number = 400,
    public readonly details?: Array<{ path: string; message: string }>,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Recurso no encontrado") {
    super("NOT_FOUND", message, 404);
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    details?: Array<{ path: string; message: string }>,
  ) {
    super("VALIDATION_ERROR", message, 400, details);
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
