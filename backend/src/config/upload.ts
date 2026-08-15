import multer from "multer";


const MAX_FILE_SIZE =
  5 * 1024 * 1024; // 5 MB

const MAX_FILES = 1;

/* ============================================================================
   ALLOWED MIME TYPES
   ========================================================================== */

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",

  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  "text/plain",
]);

/* ============================================================================
   ALLOWED EXTENSIONS
   ========================================================================== */

const ALLOWED_EXTENSIONS = new Set([
  ".pdf",
  ".docx",
  ".txt",
]);

/* ============================================================================
   STORAGE
   ========================================================================== */

/*
 * memoryStorage is recommended for your current parser because
 * ParserService already supports file.buffer.
 *
 * The uploaded file stays in memory while processing.
 *
 * IMPORTANT:
 * Keep the 5 MB limit to prevent excessive memory usage.
 */

const storage =
  multer.memoryStorage();

/* ============================================================================
   FILE FILTER
   ========================================================================== */

const fileFilter: multer.Options["fileFilter"] = (
  _req,
  file,
  callback
) => {
  const extension =
    file.originalname
      .toLowerCase()
      .substring(
        file.originalname.lastIndexOf(".")
      );

  /* --------------------------------------------------------------------------
     Validate extension
     ------------------------------------------------------------------------ */

  if (
    !ALLOWED_EXTENSIONS.has(
      extension
    )
  ) {
    console.warn(
      "[UPLOAD] Rejected file extension:",
      file.originalname
    );

    callback(
      new Error(
        "Invalid file type. Only PDF, DOCX, and TXT files are allowed."
      )
    );

    return;
  }

  /* --------------------------------------------------------------------------
     Validate MIME type
     ------------------------------------------------------------------------ */

  if (
    !ALLOWED_MIME_TYPES.has(
      file.mimetype
    )
  ) {
    console.warn(
      "[UPLOAD] Rejected MIME type:",
      file.mimetype
    );

    callback(
      new Error(
        "Invalid file format. Only PDF, DOCX, and TXT files are allowed."
      )
    );

    return;
  }

  /* --------------------------------------------------------------------------
     Accept
     ------------------------------------------------------------------------ */

  callback(
    null,
    true
  );
};

/* ============================================================================
   MULTER UPLOAD
   ========================================================================== */

export const resumeUpload =
  multer({
    storage,

    limits: {
      fileSize:
        MAX_FILE_SIZE,

      files:
        MAX_FILES,

      fields: 10,

      parts: 11,

      fieldNameSize: 100,

      fieldSize:
        100 * 1024,
    },

    fileFilter,
  });

/* ============================================================================
   CONSTANTS
   ========================================================================== */

export {
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
};

