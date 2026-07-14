import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";

export type AppErrorOptions = {
  statusCode: number;
  message: string;
  code?: string;
  details?: unknown;
};

export class AppError extends Error {
  readonly statusCode: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor({ statusCode, message, code, details }: AppErrorOptions) {
    super(message);

    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    this.name = this.constructor.name;
  }
}

function isValidationError(error: FastifyError | Error): error is FastifyError {
  return "validation" in error && Array.isArray(error.validation);
}

export async function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  request.log.error(error);

  if (error instanceof AppError) {
    return reply.code(error.statusCode).send({
      success: false,
      code: error.code ?? "APP_ERROR",
      message: error.message,
      details: error.details,
    });
  }

  if (isValidationError(error)) {
    return reply.code(400).send({
      success: false,
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      errors: error.validation,
    });
  }

  return reply.code(500).send({
    success: false,
    code: "INTERNAL_SERVER_ERROR",
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : error.message,
  });
}
