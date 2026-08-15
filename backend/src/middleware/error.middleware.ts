import type {
  Request,
  Response,
  NextFunction,
} from "express";

import multer from "multer";

export function errorMiddleware(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {

  console.error(
    "================================="
  );

  console.error(
    "[ERROR]"
  );

  console.error(
    "Method:",
    req.method
  );

  console.error(
    "URL:",
    req.originalUrl
  );

  console.error(
    "Message:",
    error instanceof Error
      ? error.message
      : error
  );

  console.error(
    "================================="
  );


  if (
    error instanceof multer.MulterError
  ) {
    switch (error.code) {

      case "LIMIT_FILE_SIZE":
        res.status(400).json({
          success: false,
          message:
            "Resume file is too large. Maximum allowed size is 5 MB.",
        });

        return;


      case "LIMIT_FILE_COUNT":
        res.status(400).json({
          success: false,
          message:
            "Only one resume can be uploaded at a time.",
        });

        return;

      /*
      |--------------------------------------------------------------------------
      | UNEXPECTED FILE
      |--------------------------------------------------------------------------
      */

      case "LIMIT_UNEXPECTED_FILE":
        res.status(400).json({
          success: false,
          message:
            "Unexpected upload field. Use 'resume' as the file field.",
        });

        return;

      /*
      |--------------------------------------------------------------------------
      | DEFAULT MULTER ERROR
      |--------------------------------------------------------------------------
      */

      default:
        res.status(400).json({
          success: false,
          message:
            "Invalid file upload.",
        });

        return;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | FILE FILTER ERRORS
  |--------------------------------------------------------------------------
  */

  if (
    error instanceof Error &&
    (
      error.message.includes(
        "Invalid file type"
      ) ||
      error.message.includes(
        "Invalid file format"
      )
    )
  ) {
    res.status(400).json({
      success: false,
      message:
        error.message,
    });

    return;
  }

  /*
  |--------------------------------------------------------------------------
  | FILE TYPE / UPLOAD ERRORS
  |--------------------------------------------------------------------------
  */

  if (
    error instanceof Error &&
    (
      error.message.includes(
        "Only PDF files are allowed"
      ) ||
      error.message.includes(
        "Only PDF and DOCX files are allowed"
      ) ||
      error.message.includes(
        "Unsupported file type"
      ) ||
      error.message.includes(
        "Unsupported file format"
      )
    )
  ) {
    res.status(400).json({
      success: false,
      message:
        error.message,
    });

    return;
  }

  /*
  |--------------------------------------------------------------------------
  | VALIDATION ERRORS
  |--------------------------------------------------------------------------
  */

  if (
    error instanceof Error &&
    (
      error.message.includes(
        "required"
      ) ||
      error.message.includes(
        "Required"
      ) ||
      error.message.includes(
        "Invalid"
      ) ||
      error.message.includes(
        "invalid"
      )
    )
  ) {
    res.status(400).json({
      success: false,
      message:
        error.message,
    });

    return;
  }

  /*
  |--------------------------------------------------------------------------
  | PRISMA ERRORS
  |--------------------------------------------------------------------------
  |
  | Prisma errors are handled without importing Prisma error classes,
  | which keeps this middleware simple and avoids version/type issues.
  |
  |--------------------------------------------------------------------------
  */

  if (
    error instanceof Error &&
    (
      error.name ===
        "PrismaClientKnownRequestError" ||
      error.name ===
        "PrismaClientValidationError" ||
      error.name ===
        "PrismaClientInitializationError"
    )
  ) {
    console.error(
      "[PRISMA ERROR]",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Database operation failed.",
    });

    return;
  }

  /*
  |--------------------------------------------------------------------------
  | CUSTOM APPLICATION ERRORS
  |--------------------------------------------------------------------------
  */

  if (
    error instanceof Error
  ) {
    console.error(
      "[APPLICATION ERROR]",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Internal server error",
    });

    return;
  }

  /*
  |--------------------------------------------------------------------------
  | UNKNOWN ERROR
  |--------------------------------------------------------------------------
  */

  console.error(
    "[UNKNOWN ERROR]",
    error
  );

  res.status(500).json({
    success: false,
    message:
      "Internal server error",
  });
}