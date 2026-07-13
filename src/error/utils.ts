import { AppError } from "./handler.js";

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication is required to access this resource.") {
    super({
      statusCode: 401,
      message,
      code: "UNAUTHORIZED",
    });
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super({
      statusCode: 403,
      message,
      code: "FORBIDDEN",
    });
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super({
      statusCode: 404,
      message,
      code: "NOT_FOUND",
    });
  }
}

export class BadRequestError extends AppError {
  constructor(
    message = "Bad request",
    details?: unknown,
    code = "BAD_REQUEST",
  ) {
    super({
      statusCode: 400,
      message,
      code,
      details,
    });
  }
}
