import "dotenv/config";

import {
  Worker,
  Job,
} from "bullmq";

import { Redis } from "ioredis";

import fs from "fs/promises";
import path from "path";

import {
  prisma,
} from "../config/prisma.js";

import {
  ParserService,
} from "../services/parser.service.js";

import {
  AIService,
} from "../services/ai.service.js";

import {
  ResumeStatus,
} from "@prisma/client";

/* ============================================================
   JOB TYPE
============================================================ */

interface ResumeProcessingJob {
  resumeId: string;
  userId: string;
  filePath: string;
  fileName: string;
  jobId?: string;
}

/* ============================================================
   REDIS URL
============================================================ */

const REDIS_URL =
  process.env.REDIS_URL?.trim();

if (!REDIS_URL) {
  throw new Error(
    "REDIS_URL is not configured in environment variables."
  );
}

/* ============================================================
   VALIDATE REDIS URL
============================================================ */

let redisUrl: URL;

try {
  redisUrl = new URL(
    REDIS_URL
  );
} catch {
  throw new Error(
    "REDIS_URL is invalid. Please use the Redis URL provided by Upstash."
  );
}

/* ============================================================
   REDIS CONFIGURATION LOGGING
============================================================ */

console.log(
  "================================================"
);

console.log(
  "🔴 RESUME WORKER REDIS CONFIGURATION"
);

console.log(
  "================================================"
);

console.log(
  "Host:",
  redisUrl.hostname
);

console.log(
  "Port:",
  redisUrl.port || "6379"
);

console.log(
  "Protocol:",
  redisUrl.protocol
);

console.log(
  "TLS:",
  redisUrl.protocol === "rediss:"
);

console.log(
  "================================================"
);

/* ============================================================
   PREVENT LOCAL REDIS
============================================================ */

if (
  redisUrl.hostname === "localhost" ||
  redisUrl.hostname === "127.0.0.1" ||
  redisUrl.hostname === "::1"
) {
  throw new Error(
    "Resume worker is configured to use localhost Redis. Configure REDIS_URL with your Upstash Redis URL."
  );
}

/* ============================================================
   BULLMQ REDIS CONNECTION
============================================================ */

/*
 * BullMQ workers require:
 *
 * maxRetriesPerRequest: null
 *
 * Upstash normally provides a rediss:// URL,
 * which enables TLS automatically.
 */

const workerRedis =
  new Redis(
    REDIS_URL,
    {
      maxRetriesPerRequest:
        null,

      enableReadyCheck:
        true,

      lazyConnect:
        false,

      retryStrategy(
        times: number
      ): number {
        const delay =
          Math.min(
            times * 1000,
            5000
          );

        console.log(
          `[RESUME WORKER REDIS] Reconnecting in ${delay}ms...`
        );

        return delay;
      },
    }
  );

/* ============================================================
   REDIS EVENTS
============================================================ */

workerRedis.on(
  "connect",
  () => {
    console.log(
      "🔌 Resume worker Redis connecting..."
    );
  }
);

workerRedis.on(
  "ready",
  () => {
    console.log(
      "✅ Resume worker Redis connected"
    );
  }
);

workerRedis.on(
  "error",
  (error: Error) => {
    console.error(
      "❌ Resume worker Redis error:",
      error.message
    );
  }
);

workerRedis.on(
  "close",
  () => {
    console.warn(
      "⚠️ Resume worker Redis connection closed"
    );
  }
);

workerRedis.on(
  "reconnecting",
  () => {
    console.log(
      "🔄 Resume worker Redis reconnecting..."
    );
  }
);

/* ============================================================
   PROCESS RESUME
============================================================ */

async function processResume(
  job: Job<ResumeProcessingJob>
) {
  const {
    resumeId,
    userId,
    filePath,
  } = job.data;

  console.log(
    "========================================"
  );

  console.log(
    "🤖 RESUME WORKER STARTED"
  );

  console.log(
    "========================================"
  );

  console.log(
    "🆔 Job:",
    job.id
  );

  console.log(
    "📄 Resume:",
    resumeId
  );

  console.log(
    "👤 User:",
    userId
  );

  console.log(
    "📁 File:",
    filePath
  );

  try {
    /* ========================================================
       VALIDATE JOB DATA
    ======================================================== */

    if (!resumeId) {
      throw new Error(
        "Resume ID is missing from worker job."
      );
    }

    if (!userId) {
      throw new Error(
        "User ID is missing from worker job."
      );
    }

    if (!filePath) {
      throw new Error(
        "Resume file path is missing from worker job."
      );
    }

    /* ========================================================
       UPDATE PROCESSING STATUS
    ======================================================== */

    await prisma.resume.update({
      where: {
        id: resumeId,
      },

      data: {
        status:
          ResumeStatus.PROCESSING,
      },
    });

    console.log(
      "🔄 Resume status: PROCESSING"
    );

    /* ========================================================
       CHECK FILE PATH
    ======================================================== */

    const resolvedFilePath =
      path.resolve(
        filePath
      );

    console.log(
      "📁 Resolved file:",
      resolvedFilePath
    );

    await fs.access(
      resolvedFilePath
    );

    console.log(
      "✅ Resume file exists"
    );

    /* ========================================================
       GET RESUME DATABASE RECORD
    ======================================================== */

    const resume =
      await prisma.resume.findUnique({
        where: {
          id: resumeId,
        },
      });

    if (!resume) {
      throw new Error(
        "Resume database record not found."
      );
    }

    /* ========================================================
       READ FILE
    ======================================================== */

    const buffer =
      await fs.readFile(
        resolvedFilePath
      );

    if (
      !buffer ||
      buffer.length === 0
    ) {
      throw new Error(
        "Resume file is empty."
      );
    }

    console.log(
      "📦 File size:",
      buffer.length,
      "bytes"
    );

    /* ========================================================
       CREATE MULTER-LIKE FILE
    ======================================================== */

    const destination =
      path.dirname(
        resolvedFilePath
      );

    const parserFile =
      {
        buffer,

        path:
          resolvedFilePath,

        originalname:
          resume.fileName,

        filename:
          resume.storedName,

        mimetype:
          resume.mimeType,

        size:
          buffer.length,

        destination,

        fieldname:
          "resume",

        encoding:
          "7bit",
      } as Express.Multer.File;

    /* ========================================================
       EXTRACT TEXT
    ======================================================== */

    console.log(
      "========================================"
    );

    console.log(
      "📖 EXTRACTING RESUME TEXT"
    );

    console.log(
      "========================================"
    );

    const extractedText =
      await ParserService.extractText(
        parserFile
      );

    if (
      !extractedText ||
      !extractedText.trim()
    ) {
      throw new Error(
        "No text could be extracted from resume."
      );
    }

    if (
      !ParserService.validateText(
        extractedText
      )
    ) {
      throw new Error(
        "No valid text could be extracted from resume."
      );
    }

    /* ========================================================
       CLEAN TEXT
    ======================================================== */

    const cleanedText =
      extractedText
        .replace(
          /\r\n/g,
          "\n"
        )
        .replace(
          /[ \t]+/g,
          " "
        )
        .replace(
          /\n{3,}/g,
          "\n\n"
        )
        .trim();

    if (
      !cleanedText
    ) {
      throw new Error(
        "Resume text is empty after cleaning."
      );
    }

    console.log(
      "✅ Text extracted:",
      cleanedText.length,
      "characters"
    );

    console.log(
      "📝 Preview:",
      cleanedText.substring(
        0,
        300
      )
    );

    /* ========================================================
       SAVE EXTRACTED TEXT
    ======================================================== */

    await prisma.resume.update({
      where: {
        id: resumeId,
      },

      data: {
        extractedText:
          cleanedText,

        status:
          ResumeStatus.PROCESSING,
      },
    });

    console.log(
      "💾 Extracted text saved"
    );

    /* ========================================================
       AI ANALYSIS
    ======================================================== */

    console.log(
      "========================================"
    );

    console.log(
      "🤖 STARTING AI ANALYSIS"
    );

    console.log(
      "========================================"
    );

    const analysis =
      await AIService.analyzeResume(
        cleanedText
      );

    console.log(
      "========================================"
    );

    console.log(
      "✅ AI ANALYSIS COMPLETED"
    );

    console.log(
      "========================================"
    );

    console.log(
      "📊 ATS Score:",
      analysis.score
    );

    console.log(
      "👤 Name:",
      analysis.name
    );

    console.log(
      "📧 Email:",
      analysis.email
    );

    console.log(
      "🛠️ Skills:",
      analysis.skills?.length ??
        0
    );

    console.log(
      "💼 Experience:",
      analysis.experience?.length ??
        0
    );

    console.log(
      "🎓 Education:",
      analysis.education?.length ??
        0
    );

    console.log(
      "🚀 Projects:",
      analysis.projects?.length ??
        0
    );

    /* ========================================================
       SAVE AI ANALYSIS
    ======================================================== */

    console.log(
      "💾 Saving AI analysis..."
    );

    const updatedResume =
      await prisma.resume.update({
        where: {
          id: resumeId,
        },

        data: {
          candidateName:
            analysis.name,

          candidateEmail:
            analysis.email,

          candidatePhone:
            analysis.phone,

          extractedText:
            cleanedText,

          aiScore:
            analysis.score,

          summary:
            analysis.summary,

          skills:
            analysis.skills,

          experience:
            analysis.experience,

          education:
            analysis.education,

          projects:
            analysis.projects,

          certifications:
            analysis.certifications,

          strengths:
            analysis.strengths,

          weaknesses:
            analysis.weaknesses,

          suggestions:
            analysis.suggestions,

          status:
            ResumeStatus.ANALYZED,
        },
      });

    console.log(
      "✅ Resume analysis saved"
    );

    /* ========================================================
       DELETE TEMPORARY FILE
    ======================================================== */

    try {
      await fs.unlink(
        resolvedFilePath
      );

      console.log(
        "🗑️ Temporary resume file deleted"
      );
    } catch (
      error: unknown
    ) {
      const errorCode =
        error instanceof Error
          ? undefined
          : (
              error as {
                code?: string;
              }
            ).code;

      if (
        errorCode ===
        "ENOENT"
      ) {
        console.log(
          "ℹ️ Temporary file already deleted"
        );
      } else {
        console.warn(
          "⚠️ Could not delete temporary file:",
          error
        );
      }
    }

    /* ========================================================
       COMPLETE
    ======================================================== */

    console.log(
      "========================================"
    );

    console.log(
      "🎉 RESUME JOB COMPLETED"
    );

    console.log(
      "========================================"
    );

    return {
      success:
        true,

      resumeId:
        updatedResume.id,

      score:
        updatedResume.aiScore,
    };
  } catch (
    error: unknown
  ) {
    console.error(
      "========================================"
    );

    console.error(
      "❌ RESUME WORKER FAILED"
    );

    console.error(
      "========================================"
    );

    console.error(
      error instanceof Error
        ? error.message
        : error
    );

    /* ========================================================
       MARK FAILED
    ======================================================== */

    try {
      await prisma.resume.update({
        where: {
          id: resumeId,
        },

        data: {
          status:
            ResumeStatus.FAILED,
        },
      });

      console.log(
        "⚠️ Resume marked as FAILED"
      );
    } catch (
      dbError: unknown
    ) {
      console.error(
        "❌ Failed to update resume status:",
        dbError
      );
    }

    throw error;
  }
}

/* ============================================================
   CREATE WORKER
============================================================ */

export const resumeWorker =
  new Worker<ResumeProcessingJob>(
    "resume-processing",

    processResume,

    {
      connection:
        workerRedis,

      concurrency:
        2,

      limiter: {
        max:
          5,

        duration:
          60 * 1000,
      },

      lockDuration:
        5 * 60 * 1000,

      stalledInterval:
        30 * 1000,

      maxStalledCount:
        1,
    }
  );

/* ============================================================
   WORKER EVENTS
============================================================ */

resumeWorker.on(
  "ready",
  () => {
    console.log(
      "========================================"
    );

    console.log(
      "👷 RESUME WORKER READY"
    );

    console.log(
      "========================================"
    );
  }
);

resumeWorker.on(
  "active",
  (
    job: Job<ResumeProcessingJob>
  ) => {
    console.log(
      `▶️ Resume job started: ${job.id}`
    );
  }
);

resumeWorker.on(
  "completed",
  (
    job: Job<ResumeProcessingJob>,
    result: unknown
  ) => {
    console.log(
      `✅ Resume job completed: ${job.id}`
    );

    console.log(
      "Result:",
      result
    );
  }
);

resumeWorker.on(
  "failed",
  (
    job:
      | Job<ResumeProcessingJob>
      | undefined,
    error: Error
  ) => {
    console.error(
      `❌ Resume job failed: ${job?.id}`
    );

    console.error(
      error
    );
  }
);

resumeWorker.on(
  "error",
  (
    error: Error
  ) => {
    console.error(
      "❌ Resume worker error:",
      error
    );
  }
);

resumeWorker.on(
  "stalled",
  (
    jobId: string
  ) => {
    console.warn(
      `⚠️ Resume job stalled: ${jobId}`
    );
  }
);

/* ============================================================
   GRACEFUL SHUTDOWN
============================================================ */

let isShuttingDown =
  false;

async function shutdown(
  signal: string
): Promise<void> {
  if (
    isShuttingDown
  ) {
    return;
  }

  isShuttingDown =
    true;

  console.log(
    "========================================"
  );

  console.log(
    `🛑 ${signal} received`
  );

  console.log(
    "🛑 Closing resume worker..."
  );

  console.log(
    "========================================"
  );

  try {
    await resumeWorker.close();

    console.log(
      "✅ Resume worker closed"
    );
  } catch (
    error: unknown
  ) {
    console.error(
      "❌ Error closing resume worker:",
      error
    );
  }

  try {
    if (
      workerRedis.status !==
      "end"
    ) {
      await workerRedis.quit();
    }

    console.log(
      "✅ Worker Redis connection closed"
    );
  } catch (
    error: unknown
  ) {
    console.error(
      "❌ Error closing worker Redis:",
      error
    );
  }

  try {
    await prisma.$disconnect();

    console.log(
      "✅ Prisma connection closed"
    );
  } catch (
    error: unknown
  ) {
    console.error(
      "❌ Error closing Prisma:",
      error
    );
  }

  console.log(
    "👋 Resume worker shutdown complete"
  );

  process.exit(0);
}

/* ============================================================
   SIGTERM
============================================================ */

process.on(
  "SIGTERM",
  () => {
    void shutdown(
      "SIGTERM"
    );
  }
);

/* ============================================================
   SIGINT
============================================================ */

process.on(
  "SIGINT",
  () => {
    void shutdown(
      "SIGINT"
    );
  }
);

/* ============================================================
   UNHANDLED REJECTION
============================================================ */

process.on(
  "unhandledRejection",
  (
    reason: unknown
  ) => {
    console.error(
      "❌ Unhandled Promise Rejection:",
      reason
    );
  }
);

/* ============================================================
   UNCAUGHT EXCEPTION
============================================================ */

process.on(
  "uncaughtException",
  (
    error: Error
  ) => {
    console.error(
      "❌ Uncaught Exception:",
      error
    );

    void shutdown(
      "UNCAUGHT_EXCEPTION"
    );
  }
);