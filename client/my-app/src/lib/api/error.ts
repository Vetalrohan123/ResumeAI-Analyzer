import {
  ApiError,
} from "./client";

/* ============================================================
   GET USER-FRIENDLY ERROR
============================================================ */

export function getApiErrorMessage(
  error: unknown
): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

/* ============================================================
   CHECK AUTH ERROR
============================================================ */

export function isAuthError(
  error: unknown
): boolean {
  return (
    error instanceof ApiError &&
    error.status === 401
  );
}

/* ============================================================
   CHECK FORBIDDEN
============================================================ */

export function isForbiddenError(
  error: unknown
): boolean {
  return (
    error instanceof ApiError &&
    error.status === 403
  );
}

/* ============================================================
   CHECK VALIDATION
============================================================ */

export function isValidationError(
  error: unknown
): boolean {
  return (
    error instanceof ApiError &&
    (error.status === 400 ||
      error.status === 422)
  );
}