import "dotenv/config";

import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

import { prisma } from "../config/prisma.js";
import { ParserService } from "./parser.service.js";
import { AIService } from "./ai.service.js";
import { ResumeStatus } from "@prisma/client";

export interface CurrentUser {
  id: string;
  email: string;
  role: string;
}

export interface ResumeAnalysisOptions {
  jobId?: string;
}

/* =========================================================================
   CONSTANTS
   ========================================================================= */

const MAX_FILE_SIZE =
  5 * 1024 * 1024;

const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".txt",
];

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

const UPLOAD_DIR = path.resolve(
  process.cwd(),
  "uploads",
  "resumes"
);

/* =========================================================================
   RESUME SERVICE
   ========================================================================= */

export class ResumeService {
  /* =========================================================================
     CREATE RESUME
     ========================================================================= */

  static async createResume(
    file: Express.Multer.File,
    user: CurrentUser,
    options?: ResumeAnalysisOptions
  ) {
    return this.uploadResume(
      file,
      user,
      options
    );
  }

  /* =========================================================================
     VALIDATE USER
     ========================================================================= */

  private static validateUser(
    user: CurrentUser
  ): void {
    if (!user || !user.id) {
      throw new Error(
        "User is not authenticated."
      );
    }
  }

  /* =========================================================================
     ENSURE UPLOAD DIRECTORY
     ========================================================================= */

  private static async ensureUploadDirectory(): Promise<void> {
    await fs.mkdir(
      UPLOAD_DIR,
      {
        recursive: true,
      }
    );
  }

  /* =========================================================================
     GET FILE PATH
     ========================================================================= */

  private static getFilePath(
    file: Express.Multer.File
  ): string {
    if (
      file.path &&
      typeof file.path === "string"
    ) {
      return path.resolve(
        file.path
      );
    }

    if (
      file.destination &&
      file.filename
    ) {
      return path.resolve(
        file.destination,
        file.filename
      );
    }

    throw new Error(
      "Resume file path is missing."
    );
  }

  /* =========================================================================
     GET SAFE EXTENSION
     ========================================================================= */

  private static getExtension(
    filename: string
  ): string {
    return path
      .extname(filename)
      .toLowerCase()
      .trim();
  }

  /* =========================================================================
     VALIDATE FILE NAME
     ========================================================================= */

  private static validateFileName(
    filename: string
  ): void {
    if (!filename) {
      throw new Error(
        "Resume filename is missing."
      );
    }

    const normalized =
      path.basename(filename);

    if (
      normalized !== filename
    ) {
      throw new Error(
        "Invalid resume filename."
      );
    }

    if (
      filename.includes("\0")
    ) {
      throw new Error(
        "Invalid characters in filename."
      );
    }

    if (
      filename.length > 255
    ) {
      throw new Error(
        "Resume filename is too long."
      );
    }
  }

  /* =========================================================================
     VALIDATE FILE METADATA
     ========================================================================= */

  private static validateFileMetadata(
    file: Express.Multer.File
  ): void {
    if (!file) {
      throw new Error(
        "Resume file is required."
      );
    }

    this.validateFileName(
      file.originalname
    );

    if (
      !file.size ||
      file.size <= 0
    ) {
      throw new Error(
        "Uploaded resume file is empty."
      );
    }

    if (
      file.size >
      MAX_FILE_SIZE
    ) {
      throw new Error(
        "Resume file must be smaller than 5 MB."
      );
    }

    const extension =
      this.getExtension(
        file.originalname
      );

    if (
      !ALLOWED_EXTENSIONS.includes(
        extension
      )
    ) {
      throw new Error(
        "Unsupported resume file type. Please upload PDF, DOC, DOCX, or TXT."
      );
    }

    if (
      !ALLOWED_MIME_TYPES.includes(
        file.mimetype
      )
    ) {
      throw new Error(
        "Invalid resume MIME type."
      );
    }
  }

  /* =========================================================================
     READ FILE BUFFER
     ========================================================================= */

  private static async readFileBuffer(
    filePath: string
  ): Promise<Buffer> {
    try {
      const buffer =
        await fs.readFile(
          filePath
        );

      if (
        !buffer ||
        buffer.length === 0
      ) {
        throw new Error(
          "Resume file is empty."
        );
      }

      return buffer;
    } catch (error) {
      console.error(
        "❌ Could not read uploaded file:",
        error
      );

      throw new Error(
        "Could not read uploaded resume file."
      );
    }
  }

  /* =========================================================================
     VALIDATE FILE SIGNATURE / MAGIC BYTES
     ========================================================================= */

  private static validateFileSignature(
    buffer: Buffer,
    extension: string
  ): void {
    if (
      !buffer ||
      buffer.length === 0
    ) {
      throw new Error(
        "Resume file is empty."
      );
    }

    /* -----------------------------------------------------------------------
       PDF
       --------------------------------------------------------------------- */

    if (extension === ".pdf") {
      const header =
        buffer
          .subarray(0, 5)
          .toString("ascii");

      if (header !== "%PDF-") {
        throw new Error(
          "Invalid PDF file."
        );
      }

      return;
    }

    /* -----------------------------------------------------------------------
       DOCX
       --------------------------------------------------------------------- */

    if (extension === ".docx") {
      /*
       DOCX is a ZIP container.

       ZIP signatures:
       50 4B 03 04
       50 4B 05 06
       50 4B 07 08
      */

      const isZip =
        buffer.length >= 4 &&
        buffer[0] === 0x50 &&
        buffer[1] === 0x4b &&
        (
          (
            buffer[2] === 0x03 &&
            buffer[3] === 0x04
          ) ||
          (
            buffer[2] === 0x05 &&
            buffer[3] === 0x06
          ) ||
          (
            buffer[2] === 0x07 &&
            buffer[3] === 0x08
          )
        );

      if (!isZip) {
        throw new Error(
          "Invalid DOCX file."
        );
      }

      return;
    }

    /* -----------------------------------------------------------------------
       DOC
       --------------------------------------------------------------------- */

    if (extension === ".doc") {
      /*
       Old Microsoft Word .doc files use
       OLE Compound File format.

       D0 CF 11 E0 A1 B1 1A E1
      */

      const isOle =
        buffer.length >= 8 &&
        buffer[0] === 0xd0 &&
        buffer[1] === 0xcf &&
        buffer[2] === 0x11 &&
        buffer[3] === 0xe0 &&
        buffer[4] === 0xa1 &&
        buffer[5] === 0xb1 &&
        buffer[6] === 0x1a &&
        buffer[7] === 0xe1;

      if (!isOle) {
        throw new Error(
          "Invalid DOC file."
        );
      }

      return;
    }

    /* -----------------------------------------------------------------------
       TXT
       --------------------------------------------------------------------- */

    if (extension === ".txt") {
      /*
       TXT does not have a reliable magic signature.

       We therefore perform a basic binary/control-character check.
      */

      const sample =
        buffer.subarray(
          0,
          Math.min(
            buffer.length,
            4096
          )
        );

      let suspiciousBytes = 0;

      for (
        const byte of sample
      ) {
        const isAllowed =
          byte === 9 ||
          byte === 10 ||
          byte === 13 ||
          byte >= 32;

        if (!isAllowed) {
          suspiciousBytes++;
        }
      }

      if (
        suspiciousBytes >
        sample.length * 0.05
      ) {
        throw new Error(
          "Invalid text file."
        );
      }

      return;
    }

    throw new Error(
      "Unsupported resume file type."
    );
  }

  /* =========================================================================
     VALIDATE FILE COMPLETELY
     ========================================================================= */

  private static async validateFile(
    file: Express.Multer.File,
    filePath: string
  ): Promise<Buffer> {
    this.validateFileMetadata(
      file
    );

    const buffer =
      await this.readFileBuffer(
        filePath
      );

    if (
      buffer.length >
      MAX_FILE_SIZE
    ) {
      throw new Error(
        "Resume file must be smaller than 5 MB."
      );
    }

    const extension =
      this.getExtension(
        file.originalname
      );

    this.validateFileSignature(
      buffer,
      extension
    );

    return buffer;
  }

  /* =========================================================================
     GENERATE SAFE STORED NAME
     ========================================================================= */

  private static generateStoredName(
    originalName: string
  ): string {
    const extension =
      this.getExtension(
        originalName
      );

    return `${crypto.randomUUID()}${extension}`;
  }

  /* =========================================================================
     MOVE FILE TO SAFE UUID NAME
     ========================================================================= */

  private static async moveToSafeName(
    currentPath: string,
    storedName: string
  ): Promise<string> {
    await this.ensureUploadDirectory();

    const destination =
      path.resolve(
        UPLOAD_DIR,
        storedName
      );

    const normalizedUploadDir =
      path.resolve(
        UPLOAD_DIR
      );

    if (
      !destination.startsWith(
        `${normalizedUploadDir}${path.sep}`
      )
    ) {
      throw new Error(
        "Invalid destination path."
      );
    }

    await fs.rename(
      currentPath,
      destination
    );

    return destination;
  }

  /* =========================================================================
     EXTRACT TEXT
     ========================================================================= */

  private static async extractResumeText(
    file: Express.Multer.File,
    filePath: string
  ): Promise<string> {
    const parserFile = {
      ...file,

      path: filePath,

      destination:
        path.dirname(filePath),

      filename:
        path.basename(filePath),
    } as Express.Multer.File;

    try {
      const extractedText =
        await ParserService.extractText(
          parserFile
        );

      if (
        !extractedText ||
        !extractedText.trim()
      ) {
        throw new Error(
          "No text could be extracted from the resume. If this is a scanned/image PDF, OCR is required."
        );
      }

      const cleanedText =
        extractedText
          .replace(/\r\n/g, "\n")
          .replace(/\r/g, "\n")
          .replace(/[ \t]+/g, " ")
          .replace(/\n{3,}/g, "\n\n")
          .trim();

      if (
        !ParserService.validateText(
          cleanedText
        )
      ) {
        throw new Error(
          "Failed to extract valid text from the resume."
        );
      }

      return cleanedText;
    } catch (error) {
      console.error(
        "❌ Resume parser error:",
        error
      );

      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to extract text from resume."
      );
    }
  }

  /* =========================================================================
     UPLOAD + ANALYZE RESUME
     ========================================================================= */

  static async uploadResume(
    file: Express.Multer.File,
    user: CurrentUser,
    options?: ResumeAnalysisOptions
  ) {
    let filePath:
      string | null = null;

    let createdResumeId:
      string | null = null;

    try {
      /* ---------------------------------------------------------------------
         BASIC VALIDATION
         ------------------------------------------------------------------- */

      this.validateUser(user);

      if (!file) {
        throw new Error(
          "Resume file is required."
        );
      }

      /* ---------------------------------------------------------------------
         GET CURRENT MULTER FILE
         ------------------------------------------------------------------- */

      filePath =
        this.getFilePath(file);

      console.log(
        "========================================"
      );

      console.log(
        "📄 RESUME PROCESSING STARTED"
      );

      console.log(
        "========================================"
      );

      console.log(
        "👤 User:",
        user.id
      );

      console.log(
        "📄 Original file:",
        file.originalname
      );

      console.log(
        "📦 Size:",
        file.size
      );

      console.log(
        "📋 MIME:",
        file.mimetype
      );

      console.log(
        "📁 Temporary path:",
        filePath
      );

      /* ---------------------------------------------------------------------
         SECURITY: ENSURE FILE EXISTS
         ------------------------------------------------------------------- */

      await fs.access(
        filePath
      );

      /* ---------------------------------------------------------------------
         SECURITY: VALIDATE ACTUAL FILE
         ------------------------------------------------------------------- */

      await this.validateFile(
        file,
        filePath
      );

      console.log(
        "✅ File metadata validated"
      );

      console.log(
        "✅ File signature validated"
      );

      /* ---------------------------------------------------------------------
         GENERATE SAFE STORAGE NAME
         ------------------------------------------------------------------- */

      const storedName =
        this.generateStoredName(
          file.originalname
        );

      console.log(
        "🔐 Safe stored name:",
        storedName
      );

      /* ---------------------------------------------------------------------
         MOVE FILE TO UUID PATH
         ------------------------------------------------------------------- */

      const safeFilePath =
        await this.moveToSafeName(
          filePath,
          storedName
        );

      filePath =
        safeFilePath;

      console.log(
        "🔐 Secure file path:",
        safeFilePath
      );

      /* ---------------------------------------------------------------------
         EXTRACT TEXT
         ------------------------------------------------------------------- */

      console.log(
        "========================================"
      );

      console.log(
        "📖 EXTRACTING RESUME TEXT"
      );

      console.log(
        "========================================"
      );

      const cleanedText =
        await this.extractResumeText(
          file,
          safeFilePath
        );

      console.log(
        "✅ Resume text extracted"
      );

      console.log(
        "📝 Characters:",
        cleanedText.length
      );

      console.log(
        "📝 Preview:",
        cleanedText.substring(
          0,
          300
        )
      );

      /* ---------------------------------------------------------------------
         BASIC INFORMATION
         ------------------------------------------------------------------- */

      let basicInfo = {
        name:
          null as string | null,

        email:
          null as string | null,

        phone:
          null as string | null,
      };

      try {
        basicInfo =
          ParserService.extractBasicInfo(
            cleanedText
          );

        console.log(
          "========================================"
        );

        console.log(
          "👤 BASIC INFORMATION"
        );

        console.log(
          "========================================"
        );

        console.log(
          "Name:",
          basicInfo.name
        );

        console.log(
          "Email:",
          basicInfo.email
        );

        console.log(
          "Phone:",
          basicInfo.phone
        );
      } catch (error) {
        console.warn(
          "⚠️ Basic information extraction failed:",
          error
        );
      }

      /* ---------------------------------------------------------------------
         CREATE DATABASE RECORD
         ------------------------------------------------------------------- */

      console.log(
        "💾 Creating resume database record..."
      );

      const resume =
        await prisma.resume.create({
          data: {
            uploadedById:
              user.id,

            candidateName:
              basicInfo.name,

            candidateEmail:
              basicInfo.email,

            candidatePhone:
              basicInfo.phone,

            fileName:
              file.originalname,

            storedName,

            fileSize:
              file.size,

            mimeType:
              file.mimetype,

            extractedText:
              cleanedText,

            aiScore:
              0,

            summary:
              "",

            skills:
              [],

            experience:
              [],

            education:
              [],

            projects:
              [],

            certifications:
              [],

            strengths:
              [],

            weaknesses:
              [],

            suggestions:
              [],

            status:
              ResumeStatus.PROCESSING,
          },
        });

      createdResumeId =
        resume.id;

      console.log(
        "✅ Resume database record created:",
        resume.id
      );

      /* ---------------------------------------------------------------------
         AI ANALYSIS
         ------------------------------------------------------------------- */

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
        "✅ AI analysis completed"
      );

      console.log(
        "📊 ATS Score:",
        analysis.score
      );

      /* ---------------------------------------------------------------------
         JOB MATCHING
         ------------------------------------------------------------------- */

      let jobMatch:
        Awaited<
          ReturnType<
            typeof AIService.matchResumeToJob
          >
        > | null = null;

      if (options?.jobId) {
        console.log(
          "========================================"
        );

        console.log(
          "💼 STARTING JOB MATCHING"
        );

        console.log(
          "========================================"
        );

        const job =
          await prisma.job.findFirst({
            where: {
              id:
                options.jobId,

              createdById:
                user.id,
            },
          });

        if (!job) {
          throw new Error(
            "Job not found or you do not have access to this job."
          );
        }

        const jobDescription =
          [
            job.title,
            job.description,
          ]
            .filter(Boolean)
            .join("\n\n")
            .trim();

        if (
          !jobDescription
        ) {
          throw new Error(
            "Job description is empty."
          );
        }

        jobMatch =
          await AIService.matchResumeToJob(
            cleanedText,
            jobDescription
          );

        console.log(
          "🎯 Match score:",
          jobMatch.matchScore
        );
      }

      /* ---------------------------------------------------------------------
         SAVE AI ANALYSIS
         ------------------------------------------------------------------- */

      console.log(
        "💾 Saving AI analysis..."
      );

      const updatedResume =
        await prisma.resume.update({
          where: {
            id:
              resume.id,
          },

          data: {
            candidateName:
              analysis.name ??
              basicInfo.name,

            candidateEmail:
              analysis.email ??
              basicInfo.email,

            candidatePhone:
              analysis.phone ??
              basicInfo.phone,

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
        "========================================"
      );

      console.log(
        "🎉 RESUME PROCESSING COMPLETED"
      );

      console.log(
        "========================================"
      );

      console.log(
        "📄 Resume ID:",
        updatedResume.id
      );

      console.log(
        "📊 ATS Score:",
        updatedResume.aiScore
      );

      /* ---------------------------------------------------------------------
         DELETE LOCAL FILE
         ------------------------------------------------------------------- */

      await this.deleteLocalFile(
        filePath
      );

      filePath =
        null;

      return {
        ...updatedResume,

        jobMatch,
      };
    } catch (error) {
      console.error(
        "========================================"
      );

      console.error(
        "❌ RESUME PROCESSING FAILED"
      );

      console.error(
        "========================================"
      );

      console.error(
        "Error:",
        error
      );

      /* ---------------------------------------------------------------------
         MARK DATABASE RECORD AS FAILED
         ------------------------------------------------------------------- */

      if (
        createdResumeId
      ) {
        try {
          await prisma.resume.update({
            where: {
              id:
                createdResumeId,
            },

            data: {
              status:
                ResumeStatus.FAILED,
            },
          });
        } catch (statusError) {
          console.error(
            "❌ Could not mark resume as FAILED:",
            statusError
          );
        }
      }

      /* ---------------------------------------------------------------------
         DELETE FILE
         ------------------------------------------------------------------- */

      await this.deleteLocalFile(
        filePath
      );

      throw error;
    }
  }

  /* =========================================================================
     UPLOAD MULTIPLE RESUMES
     ========================================================================= */

  static async uploadMultipleResumes(
    files: Express.Multer.File[],
    user: CurrentUser
  ) {
    this.validateUser(
      user
    );

    if (
      !files ||
      files.length === 0
    ) {
      throw new Error(
        "Please upload at least one resume."
      );
    }

    const results: Array<{
      success: boolean;
      file: string;
      resume?: unknown;
      error?: string;
    }> = [];

    for (
      const file of files
    ) {
      try {
        const resume =
          await this.uploadResume(
            file,
            user
          );

        results.push({
          success: true,
          file:
            file.originalname,
          resume,
        });
      } catch (error) {
        results.push({
          success: false,
          file:
            file.originalname,
          error:
            error instanceof Error
              ? error.message
              : "Failed to process resume.",
        });
      }
    }

    return results;
  }

  /* =========================================================================
     GET ALL RESUMES
     ========================================================================= */

  static async getAllResumes(
    user: CurrentUser
  ) {
    this.validateUser(
      user
    );

    return prisma.resume.findMany({
      where: {
        uploadedById:
          user.id,
      },

      orderBy: {
        createdAt:
          "desc",
      },
    });
  }

  /* =========================================================================
     GET RESUME BY ID
     ========================================================================= */

  static async getResumeById(
    id: string,
    user: CurrentUser
  ) {
    if (!id) {
      throw new Error(
        "Resume ID is required."
      );
    }

    this.validateUser(
      user
    );

    const resume =
      await prisma.resume.findFirst({
        where: {
          id,

          uploadedById:
            user.id,
        },
      });

    if (!resume) {
      throw new Error(
        "Resume not found."
      );
    }

    return resume;
  }

  /* =========================================================================
     SEARCH RESUMES
     ========================================================================= */

  static async searchResumes(
    user: CurrentUser,
    keyword: string
  ) {
    this.validateUser(
      user
    );

    const searchKeyword =
      keyword?.trim() || "";

    if (!searchKeyword) {
      return this.getAllResumes(
        user
      );
    }

    return prisma.resume.findMany({
      where: {
        uploadedById:
          user.id,

        OR: [
          {
            candidateName: {
              contains:
                searchKeyword,

              mode:
                "insensitive",
            },
          },

          {
            candidateEmail: {
              contains:
                searchKeyword,

              mode:
                "insensitive",
            },
          },

          {
            fileName: {
              contains:
                searchKeyword,

              mode:
                "insensitive",
            },
          },

          {
            summary: {
              contains:
                searchKeyword,

              mode:
                "insensitive",
            },
          },
        ],
      },

      orderBy: {
        createdAt:
          "desc",
      },
    });
  }

  /* =========================================================================
     GET RESUME STATISTICS
     ========================================================================= */

  static async getResumeStats(
    user: CurrentUser
  ) {
    this.validateUser(
      user
    );

    const resumes =
      await prisma.resume.findMany({
        where: {
          uploadedById:
            user.id,
        },

        select: {
          status: true,
          aiScore: true,
        },
      });

    const total =
      resumes.length;

    const analyzed =
      resumes.filter(
        (resume) =>
          resume.status ===
          ResumeStatus.ANALYZED
      ).length;

    const processing =
      resumes.filter(
        (resume) =>
          resume.status ===
          ResumeStatus.PROCESSING
      ).length;

    const failed =
      resumes.filter(
        (resume) =>
          resume.status ===
          ResumeStatus.FAILED
      ).length;

    const scores =
      resumes
        .filter(
          (resume) =>
            resume.status ===
            ResumeStatus.ANALYZED
        )
        .map(
          (resume) =>
            Number(
              resume.aiScore
            )
        )
        .filter(
          (score) =>
            Number.isFinite(
              score
            )
        );

    const averageScore =
      scores.length === 0
        ? 0
        : Math.round(
            scores.reduce(
              (
                totalScore,
                score
              ) =>
                totalScore +
                score,
              0
            ) /
              scores.length
          );

    return {
      total,
      analyzed,
      processing,
      failed,
      averageScore,
    };
  }

  /* =========================================================================
     RE-ANALYZE RESUME
     ========================================================================= */

  static async analyzeResume(
    id: string,
    user: CurrentUser,
    jobId?: string
  ) {
    if (!id) {
      throw new Error(
        "Resume ID is required."
      );
    }

    this.validateUser(
      user
    );

    const resume =
      await prisma.resume.findFirst({
        where: {
          id,

          uploadedById:
            user.id,
        },
      });

    if (!resume) {
      throw new Error(
        "Resume not found."
      );
    }

    if (
      !resume.extractedText ||
      !resume.extractedText.trim()
    ) {
      throw new Error(
        "Resume text is not available."
      );
    }

    let jobMatch:
      Awaited<
        ReturnType<
          typeof AIService.matchResumeToJob
        >
      > | null = null;

    if (jobId) {
      const job =
        await prisma.job.findFirst({
          where: {
            id:
              jobId,

            createdById:
              user.id,
          },
        });

      if (!job) {
        throw new Error(
          "Job not found or you do not have access to this job."
        );
      }

      const jobDescription =
        [
          job.title,
          job.description,
        ]
          .filter(Boolean)
          .join("\n\n")
          .trim();

      if (
        !jobDescription
      ) {
        throw new Error(
          "Job description is empty."
        );
      }

      jobMatch =
        await AIService.matchResumeToJob(
          resume.extractedText,
          jobDescription
        );
    }

    await prisma.resume.update({
      where: {
        id:
          resume.id,
      },

      data: {
        status:
          ResumeStatus.PROCESSING,
      },
    });

    try {
      console.log(
        "🤖 Re-analyzing resume:",
        resume.id
      );

      const analysis =
        await AIService.analyzeResume(
          resume.extractedText
        );

      const updatedResume =
        await prisma.resume.update({
          where: {
            id:
              resume.id,
          },

          data: {
            candidateName:
              analysis.name,

            candidateEmail:
              analysis.email,

            candidatePhone:
              analysis.phone,

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

      return {
        success: true,

        message:
          "Resume re-analysis completed.",

        resume:
          updatedResume,

        jobMatch,
      };
    } catch (error) {
      await prisma.resume.update({
        where: {
          id:
            resume.id,
        },

        data: {
          status:
            ResumeStatus.FAILED,
        },
      });

      throw error;
    }
  }

  /* =========================================================================
     UPDATE RESUME
     ========================================================================= */

  static async updateResume(
    id: string,
    data: {
      candidateName?: string;
      candidateEmail?: string;
      candidatePhone?: string;
      summary?: string;
      skills?: unknown;
      experience?: unknown;
      education?: unknown;
      projects?: unknown;
      certifications?: unknown;
      strengths?: unknown;
      weaknesses?: unknown;
      suggestions?: unknown;
      status?: ResumeStatus;
    },
    user: CurrentUser
  ) {
    if (!id) {
      throw new Error(
        "Resume ID is required."
      );
    }

    this.validateUser(
      user
    );

    const resume =
      await prisma.resume.findFirst({
        where: {
          id,

          uploadedById:
            user.id,
        },
      });

    if (!resume) {
      throw new Error(
        "Resume not found."
      );
    }

    return prisma.resume.update({
      where: {
        id:
          resume.id,
      },

      data: {
        ...(data.candidateName !==
        undefined && {
          candidateName:
            data.candidateName,
        }),

        ...(data.candidateEmail !==
        undefined && {
          candidateEmail:
            data.candidateEmail,
        }),

        ...(data.candidatePhone !==
        undefined && {
          candidatePhone:
            data.candidatePhone,
        }),

        ...(data.summary !==
        undefined && {
          summary:
            data.summary,
        }),

        ...(data.skills !==
        undefined && {
          skills:
            data.skills as any,
        }),

        ...(data.experience !==
        undefined && {
          experience:
            data.experience as any,
        }),

        ...(data.education !==
        undefined && {
          education:
            data.education as any,
        }),

        ...(data.projects !==
        undefined && {
          projects:
            data.projects as any,
        }),

        ...(data.certifications !==
        undefined && {
          certifications:
            data.certifications as any,
        }),

        ...(data.strengths !==
        undefined && {
          strengths:
            data.strengths as any,
        }),

        ...(data.weaknesses !==
        undefined && {
          weaknesses:
            data.weaknesses as any,
        }),

        ...(data.suggestions !==
        undefined && {
          suggestions:
            data.suggestions as any,
        }),

        ...(data.status !==
        undefined && {
          status:
            data.status,
        }),
      },
    });
  }

  /* =========================================================================
     DELETE RESUME
     ========================================================================= */

  static async deleteResume(
    id: string,
    user: CurrentUser
  ) {
    if (!id) {
      throw new Error(
        "Resume ID is required."
      );
    }

    this.validateUser(
      user
    );

    const resume =
      await prisma.resume.findFirst({
        where: {
          id,

          uploadedById:
            user.id,
        },
      });

    if (!resume) {
      throw new Error(
        "Resume not found."
      );
    }

    const normalizedUploadDir =
      path.resolve(
        UPLOAD_DIR
      );

    const localFilePath =
      path.resolve(
        normalizedUploadDir,
        resume.storedName
      );

    if (
      !localFilePath.startsWith(
        `${normalizedUploadDir}${path.sep}`
      )
    ) {
      throw new Error(
        "Invalid resume file path."
      );
    }

    try {
      await fs.unlink(
        localFilePath
      );

      console.log(
        "🗑️ Local resume deleted:",
        localFilePath
      );
    } catch (error: any) {
      if (
        error?.code !==
        "ENOENT"
      ) {
        console.warn(
          "⚠️ Could not delete local resume:",
          error
        );
      }
    }

    await prisma.resume.delete({
      where: {
        id:
          resume.id,
      },
    });

    return {
      success: true,

      message:
        "Resume deleted successfully.",
    };
  }

  /* =========================================================================
     UPDATE STATUS
     ========================================================================= */

  static async updateResumeStatus(
    id: string,
    status: ResumeStatus,
    user: CurrentUser
  ) {
    if (!id) {
      throw new Error(
        "Resume ID is required."
      );
    }

    if (!status) {
      throw new Error(
        "Resume status is required."
      );
    }

    this.validateUser(
      user
    );

    const resume =
      await prisma.resume.findFirst({
        where: {
          id,

          uploadedById:
            user.id,
        },
      });

    if (!resume) {
      throw new Error(
        "Resume not found."
      );
    }

    return prisma.resume.update({
      where: {
        id:
          resume.id,
      },

      data: {
        status,
      },
    });
  }

  /* =========================================================================
     DELETE LOCAL FILE
     ========================================================================= */

  private static async deleteLocalFile(
    filePath: string | null
  ): Promise<void> {
    if (!filePath) {
      return;
    }

    try {
      const normalizedUploadDir =
        path.resolve(
          UPLOAD_DIR
        );

      const normalizedFilePath =
        path.resolve(
          filePath
        );

      if (
        !normalizedFilePath.startsWith(
          `${normalizedUploadDir}${path.sep}`
        )
      ) {
        console.warn(
          "⚠️ Refusing to delete file outside upload directory:",
          normalizedFilePath
        );

        return;
      }

      await fs.unlink(
        normalizedFilePath
      );

      console.log(
        "🗑️ Temporary file deleted:",
        normalizedFilePath
      );
    } catch (error: any) {
      if (
        error?.code !==
        "ENOENT"
      ) {
        console.warn(
          "⚠️ Could not delete local file:",
          error
        );
      }
    }
  }
}