import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

import {
  ResumeController,
} from "../controllers/resume.controller.js";

import {
  authenticate,
} from "../middleware/auth.middleware.js";

const router = Router();

const uploadDir = path.resolve(
  process.cwd(),
  "uploads",
  "resumes"
);

await fs.mkdir(
  uploadDir,
  {
    recursive: true,
  }
);

const MAX_FILE_SIZE =
  5 * 1024 * 1024;

/*
 * Only formats that your current ParserService supports.
 *
 * PDF
 * DOCX
 *
 * NOTE:
 * We are NOT allowing .doc because mammoth/pdf-parse
 * do not parse legacy .doc files.
 */
const ALLOWED_EXTENSIONS =
  new Set([
    ".pdf",
    ".docx",
  ]);

/*
 * Allowed MIME types.
 *
 * MIME type alone is NOT trusted.
 * We also check the actual file signature below.
 */
const ALLOWED_MIME_TYPES =
  new Set([
    "application/pdf",

    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]);

/* ============================================================
   MIME TYPE VALIDATION
============================================================ */

function isAllowedMimeType(
  mimeType: string
): boolean {
  return ALLOWED_MIME_TYPES.has(
    mimeType.toLowerCase()
  );
}

/* ============================================================
   EXTENSION VALIDATION
============================================================ */

function getSafeExtension(
  originalName: string
): string {
  const extension =
    path
      .extname(originalName)
      .toLowerCase();

  if (
    !ALLOWED_EXTENSIONS.has(
      extension
    )
  ) {
    throw new Error(
      "Only PDF and DOCX files are allowed."
    );
  }

  return extension;
}

/* ============================================================
   SAFE RANDOM FILENAME
============================================================ */

function generateSafeFilename(
  originalName: string
): string {
  const extension =
    getSafeExtension(
      originalName
    );

  /*
   * Never use the original filename as the
   * actual storage filename.
   *
   * This prevents:
   *
   * - Path traversal
   * - Strange characters
   * - Duplicate filename problems
   * - Information leakage
   */
  return `${crypto.randomUUID()}${extension}`;
}

/* ============================================================
   MULTER STORAGE
============================================================ */

const storage =
  multer.diskStorage({
    destination: (
      _req,
      _file,
      callback
    ) => {
      callback(
        null,
        uploadDir
      );
    },

    filename: (
      _req,
      file,
      callback
    ) => {
      try {
        const safeFilename =
          generateSafeFilename(
            file.originalname
          );

        callback(
          null,
          safeFilename
        );
      } catch (error) {
        callback(
          error as Error,
          ""
        );
      }
    },
  });

/* ============================================================
   MULTER FILE FILTER
============================================================ */

const fileFilter:
  multer.Options["fileFilter"] = (
    _req,
    file,
    callback
  ) => {
    try {
      /*
       * Validate extension.
       */
      const extension =
        path
          .extname(
            file.originalname
          )
          .toLowerCase();

      if (
        !ALLOWED_EXTENSIONS.has(
          extension
        )
      ) {
        callback(
          new Error(
            "Invalid file extension. Only PDF and DOCX files are allowed."
          )
        );

        return;
      }

      /*
       * Validate MIME.
       *
       * IMPORTANT:
       * This is only the first layer.
       * We will validate the actual file signature
       * after Multer writes the file.
       */
      if (
        !isAllowedMimeType(
          file.mimetype
        )
      ) {
        callback(
          new Error(
            "Invalid file type."
          )
        );

        return;
      }

      callback(
        null,
        true
      );
    } catch (error) {
      callback(
        error as Error
      );
    }
  };

/* ============================================================
   MULTER CONFIGURATION
============================================================ */

const upload =
  multer({
    storage,

    limits: {
      /*
       * Maximum file size.
       */
      fileSize:
        MAX_FILE_SIZE,

      /*
       * Only one file.
       */
      files: 1,

      /*
       * Prevent excessive multipart fields.
       */
      fields: 10,

      /*
       * Prevent excessive field size.
       */
      fieldSize:
        100 * 1024,
    },

    fileFilter,
  });

/* ============================================================
   FILE SIGNATURE VALIDATION
============================================================ */

/*
 * MIME types can be forged.
 *
 * Example:
 *
 * malicious.exe
 *
 * renamed to:
 *
 * resume.pdf
 *
 * and sent with:
 *
 * application/pdf
 *
 * Therefore we inspect the actual bytes.
 */

/**
 * PDF signature:
 *
 * %PDF-
 */
function isPdfBuffer(
  buffer: Buffer
): boolean {
  if (
    buffer.length < 5
  ) {
    return false;
  }

  return (
    buffer
      .subarray(0, 5)
      .toString("ascii") ===
    "%PDF-"
  );
}

/**
 * DOCX files are ZIP containers.
 *
 * ZIP signature:
 *
 * PK
 *
 * Usually:
 *
 * 50 4B 03 04
 */
function isDocxBuffer(
  buffer: Buffer
): boolean {
  if (
    buffer.length < 4
  ) {
    return false;
  }

  return (
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    (
      buffer[2] === 0x03 ||
      buffer[2] === 0x05 ||
      buffer[2] === 0x07
    )
  );
}

/* ============================================================
   DOCX STRUCTURE VALIDATION
============================================================ */

async function validateDocxFile(
  filePath: string
): Promise<boolean> {
  try {
    const buffer =
      await fs.readFile(
        filePath
      );

    if (
      !isDocxBuffer(
        buffer
      )
    ) {
      return false;
    }

    /*
     * A DOCX should contain:
     *
     * word/document.xml
     *
     * We do a lightweight ZIP signature check here.
     *
     * Full extraction is still performed by Mammoth
     * inside ParserService.
     */
    const content =
      buffer.toString(
        "binary"
      );

    return (
      content.includes(
        "word/document.xml"
      )
    );
  } catch {
    return false;
  }
}

/* ============================================================
   ACTUAL FILE SIGNATURE VALIDATION
============================================================ */

async function validateUploadedFile(
  req: any,
  res: any,
  next: any
) {
  const file =
    req.file;

  if (!file) {
    return res.status(400).json({
      success: false,
      message:
        "Resume file is required.",
    });
  }

  try {
    /*
     * Make sure file is inside our upload directory.
     */
    const resolvedPath =
      path.resolve(
        file.path
      );

    const resolvedUploadDir =
      path.resolve(
        uploadDir
      );

    if (
      !resolvedPath.startsWith(
        `${resolvedUploadDir}${path.sep}`
      )
    ) {
      await fs.unlink(
        resolvedPath
      ).catch(() => {});

      return res.status(400).json({
        success: false,
        message:
          "Invalid upload path.",
      });
    }

    /*
     * Read file.
     */
    const buffer =
      await fs.readFile(
        resolvedPath
      );

    if (
      !buffer.length
    ) {
      await fs.unlink(
        resolvedPath
      ).catch(() => {});

      return res.status(400).json({
        success: false,
        message:
          "Uploaded file is empty.",
      });
    }

    /*
     * Get extension.
     */
    const extension =
      path
        .extname(
          file.originalname
        )
        .toLowerCase();

    /* ========================================================
       PDF
    ======================================================== */

    if (
      extension === ".pdf"
    ) {
      if (
        !isPdfBuffer(
          buffer
        )
      ) {
        await fs.unlink(
          resolvedPath
        ).catch(() => {});

        return res.status(400).json({
          success: false,
          message:
            "Invalid PDF file. The file signature does not match PDF format.",
        });
      }

      console.log(
        "✅ PDF file signature validated"
      );
    }

    /* ========================================================
       DOCX
    ======================================================== */

    else if (
      extension === ".docx"
    ) {
      const validDocx =
        await validateDocxFile(
          resolvedPath
        );

      if (
        !validDocx
      ) {
        await fs.unlink(
          resolvedPath
        ).catch(() => {});

        return res.status(400).json({
          success: false,
          message:
            "Invalid DOCX file.",
        });
      }

      console.log(
        "✅ DOCX file signature validated"
      );
    }

    /* ========================================================
       UNKNOWN
    ======================================================== */

    else {
      await fs.unlink(
        resolvedPath
      ).catch(() => {});

      return res.status(400).json({
        success: false,
        message:
          "Unsupported resume format.",
      });
    }

    /*
     * Store validated path.
     */
    req.resumeFilePath =
      resolvedPath;

    next();
  } catch (error) {
    console.error(
      "❌ File validation error:",
      error
    );

    if (file?.path) {
      await fs.unlink(
        file.path
      ).catch(() => {});
    }

    return res.status(400).json({
      success: false,
      message:
        "Uploaded file could not be validated.",
    });
  }
}

/* ============================================================
   MULTER ERROR HANDLER
============================================================ */

function handleUpload(
  req: any,
  res: any,
  next: any
) {
  upload.single(
    "resume"
  )(req, res, (error: any) => {
    if (!error) {
      return next();
    }

    console.error(
      "❌ Multer upload error:",
      error
    );

    /*
     * File too large.
     */
    if (
      error instanceof
        multer.MulterError &&
      error.code ===
        "LIMIT_FILE_SIZE"
    ) {
      return res.status(413).json({
        success: false,
        message:
          "Resume file is too large. Maximum allowed size is 5 MB.",
      });
    }

    /*
     * Too many files.
     */
    if (
      error instanceof
        multer.MulterError &&
      error.code ===
        "LIMIT_FILE_COUNT"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only one resume can be uploaded at a time.",
      });
    }

    /*
     * Unexpected field.
     */
    if (
      error instanceof
        multer.MulterError &&
      error.code ===
        "LIMIT_UNEXPECTED_FILE"
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid upload field. Use "resume".',
      });
    }

    /*
     * Custom fileFilter error.
     */
    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Invalid resume upload.",
    });
  });
}

/* ============================================================
   AUTHENTICATION
============================================================ */

/*
 * IMPORTANT:
 *
 * Authentication happens BEFORE file upload.
 *
 * This prevents unauthenticated users from
 * consuming disk space by uploading files.
 */
router.use(
  authenticate
);

/* ============================================================
   UPLOAD RESUME
============================================================ */

/*
 * POST /api/resumes/upload
 *
 * Content-Type:
 * multipart/form-data
 *
 * Field:
 *
 * resume = File
 */
router.post(
  "/upload",

  /*
   * Step 1:
   * Receive file.
   */
  handleUpload,

  /*
   * Step 2:
   * Verify actual file signature.
   */
  validateUploadedFile,

  /*
   * Step 3:
   * Process resume.
   */
  ResumeController.uploadResume
);

/* ============================================================
   GET ALL RESUMES
============================================================ */

router.get(
  "/",
  ResumeController.getResumes
);

/* ============================================================
   SEARCH RESUMES
============================================================ */

router.get(
  "/search",
  ResumeController.searchResumes
);

/* ============================================================
   RESUME STATISTICS
============================================================ */

router.get(
  "/stats",
  ResumeController.getResumeStats
);

/* ============================================================
   ANALYZE RESUME
============================================================ */

router.post(
  "/:id/analyze",
  ResumeController.analyzeResume
);

/* ============================================================
   GET SINGLE RESUME
============================================================ */

router.get(
  "/:id",
  ResumeController.getResume
);

/* ============================================================
   DELETE RESUME
============================================================ */

router.delete(
  "/:id",
  ResumeController.deleteResume
);


export default router;

