import type {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  ResumeStatus,
} from "@prisma/client";

import {
  ResumeService,
} from "../services/resume.service.js";

/*
|--------------------------------------------------------------------------
| RESUME CONTROLLER
|--------------------------------------------------------------------------
*/

export class ResumeController {
  /*
  |--------------------------------------------------------------------------
  | HELPER: GET STRING PARAMETER
  |--------------------------------------------------------------------------
  |
  | Express can expose params as string | string[] depending on typings.
  | This helper guarantees that we pass a string to our services.
  |
  |--------------------------------------------------------------------------
  */

  private static getParam(
    value: string | string[] | undefined
  ): string | undefined {
    if (Array.isArray(value)) {
      return value[0];
    }

    return value;
  }

  /*
  |--------------------------------------------------------------------------
  | UPLOAD RESUME
  |--------------------------------------------------------------------------
  |
  | POST /api/resumes/upload
  |
  | FormData:
  | resume = File
  |
  |--------------------------------------------------------------------------
  */

  static async uploadResume(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      /*
      |--------------------------------------------------------------------------
      | AUTHENTICATION
      |--------------------------------------------------------------------------
      */

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | FILE VALIDATION
      |--------------------------------------------------------------------------
      */

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Resume file is required.",
        });
      }

      console.log(
        "========================================"
      );

      console.log(
        "📄 Resume Upload Request"
      );

      console.log(
        "👤 User ID:",
        req.user.id
      );

      console.log(
        "📄 Original filename:",
        req.file.originalname
      );

      console.log(
        "📦 Stored filename:",
        req.file.filename
      );

      console.log(
        "📍 File path:",
        req.file.path
      );

      console.log(
        "📏 File size:",
        req.file.size
      );

      console.log(
        "========================================"
      );

      /*
      |--------------------------------------------------------------------------
      | CREATE RESUME
      |--------------------------------------------------------------------------
      */

      const resume =
        await ResumeService.createResume(
          req.file,
          req.user
        );

      /*
      |--------------------------------------------------------------------------
      | RESPONSE
      |--------------------------------------------------------------------------
      */

      return res.status(201).json({
        success: true,

        message:
          "Resume uploaded successfully.",

        data: resume,
      });
    } catch (error) {
      console.error(
        "❌ Upload resume controller error:",
        error
      );

      next(error);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | GET ALL RESUMES
  |--------------------------------------------------------------------------
  |
  | GET /api/resumes
  |
  |--------------------------------------------------------------------------
  */

  static async getResumes(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      /*
      |--------------------------------------------------------------------------
      | AUTHENTICATION
      |--------------------------------------------------------------------------
      */

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | GET RESUMES
      |--------------------------------------------------------------------------
      */

      const resumes =
        await ResumeService.getAllResumes(
          req.user
        );

      /*
      |--------------------------------------------------------------------------
      | RESPONSE
      |--------------------------------------------------------------------------
      */

      return res.status(200).json({
        success: true,

        message:
          "Resumes fetched successfully.",

        data: resumes,
      });
    } catch (error) {
      console.error(
        "❌ Get resumes controller error:",
        error
      );

      next(error);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | GET RESUME BY ID
  |--------------------------------------------------------------------------
  |
  | GET /api/resumes/:id
  |
  |--------------------------------------------------------------------------
  */

  static async getResume(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      /*
      |--------------------------------------------------------------------------
      | AUTHENTICATION
      |--------------------------------------------------------------------------
      */

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | GET ID
      |--------------------------------------------------------------------------
      */

      const id =
        ResumeController.getParam(
          req.params.id
        );

      /*
      |--------------------------------------------------------------------------
      | VALIDATE ID
      |--------------------------------------------------------------------------
      */

      if (!id) {
        return res.status(400).json({
          success: false,
          message:
            "Resume ID is required.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | GET RESUME
      |--------------------------------------------------------------------------
      */

      const resume =
        await ResumeService.getResumeById(
          id,
          req.user
        );

      /*
      |--------------------------------------------------------------------------
      | RESPONSE
      |--------------------------------------------------------------------------
      */

      return res.status(200).json({
        success: true,

        message:
          "Resume fetched successfully.",

        data: resume,
      });
    } catch (error) {
      console.error(
        "❌ Get resume controller error:",
        error
      );

      next(error);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | DELETE RESUME
  |--------------------------------------------------------------------------
  |
  | DELETE /api/resumes/:id
  |
  |--------------------------------------------------------------------------
  */

  static async deleteResume(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      /*
      |--------------------------------------------------------------------------
      | AUTHENTICATION
      |--------------------------------------------------------------------------
      */

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | GET ID
      |--------------------------------------------------------------------------
      */

      const id =
        ResumeController.getParam(
          req.params.id
        );

      /*
      |--------------------------------------------------------------------------
      | VALIDATE ID
      |--------------------------------------------------------------------------
      */

      if (!id) {
        return res.status(400).json({
          success: false,
          message:
            "Resume ID is required.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | DELETE
      |--------------------------------------------------------------------------
      */

      const result =
        await ResumeService.deleteResume(
          id,
          req.user
        );

      /*
      |--------------------------------------------------------------------------
      | RESPONSE
      |--------------------------------------------------------------------------
      |
      | We intentionally do NOT use:
      |
      | success: true,
      | ...result
      |
      | because result may already contain success.
      |
      |--------------------------------------------------------------------------
      */

      return res.status(200).json({
        success: true,

        message:
          "Resume deleted successfully.",

        data: result,
      });
    } catch (error) {
      console.error(
        "❌ Delete resume controller error:",
        error
      );

      next(error);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | SEARCH RESUMES
  |--------------------------------------------------------------------------
  |
  | GET /api/resumes/search?keyword=react
  |
  |--------------------------------------------------------------------------
  */

  static async searchResumes(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      /*
      |--------------------------------------------------------------------------
      | AUTHENTICATION
      |--------------------------------------------------------------------------
      */

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | KEYWORD
      |--------------------------------------------------------------------------
      */

      const keyword =
        typeof req.query.keyword === "string"
          ? req.query.keyword.trim()
          : "";

      console.log(
        "🔎 Searching resumes:",
        keyword || "(empty)"
      );

      /*
      |--------------------------------------------------------------------------
      | SEARCH
      |--------------------------------------------------------------------------
      */

      const resumes =
        await ResumeService.searchResumes(
          req.user,
          keyword
        );

      /*
      |--------------------------------------------------------------------------
      | RESPONSE
      |--------------------------------------------------------------------------
      */

      return res.status(200).json({
        success: true,

        message:
          "Resume search completed successfully.",

        data: resumes,
      });
    } catch (error) {
      console.error(
        "❌ Search resumes controller error:",
        error
      );

      next(error);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | GET RESUME STATISTICS
  |--------------------------------------------------------------------------
  |
  | GET /api/resumes/stats
  |
  |--------------------------------------------------------------------------
  */

  static async getResumeStats(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      /*
      |--------------------------------------------------------------------------
      | AUTHENTICATION
      |--------------------------------------------------------------------------
      */

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | GET STATS
      |--------------------------------------------------------------------------
      */

      const stats =
        await ResumeService.getResumeStats(
          req.user
        );

      /*
      |--------------------------------------------------------------------------
      | RESPONSE
      |--------------------------------------------------------------------------
      */

      return res.status(200).json({
        success: true,

        message:
          "Resume statistics fetched successfully.",

        data: stats,
      });
    } catch (error) {
      console.error(
        "❌ Resume statistics controller error:",
        error
      );

      next(error);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | RE-ANALYZE RESUME
  |--------------------------------------------------------------------------
  |
  | POST /api/resumes/:id/analyze
  |
  | Body:
  |
  | {
  |   "jobId": "cmxxxxxxxx"
  | }
  |
  |--------------------------------------------------------------------------
  */

  static async analyzeResume(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      /*
      |--------------------------------------------------------------------------
      | AUTHENTICATION
      |--------------------------------------------------------------------------
      */

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | RESUME ID
      |--------------------------------------------------------------------------
      */

      const id =
        ResumeController.getParam(
          req.params.id
        );

      /*
      |--------------------------------------------------------------------------
      | VALIDATE RESUME ID
      |--------------------------------------------------------------------------
      */

      if (!id) {
        return res.status(400).json({
          success: false,
          message:
            "Resume ID is required.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | JOB ID
      |--------------------------------------------------------------------------
      */

      const jobId =
        typeof req.body?.jobId === "string"
          ? req.body.jobId.trim()
          : undefined;

      /*
      |--------------------------------------------------------------------------
      | LOG
      |--------------------------------------------------------------------------
      */

      console.log(
        "========================================"
      );

      console.log(
        "🤖 Resume Re-analysis Started"
      );

      console.log(
        "🆔 Resume ID:",
        id
      );

      console.log(
        "💼 Job ID:",
        jobId || "Not provided"
      );

      console.log(
        "👤 User ID:",
        req.user.id
      );

      console.log(
        "========================================"
      );

      /*
      |--------------------------------------------------------------------------
      | ANALYZE
      |--------------------------------------------------------------------------
      */

      const result =
        await ResumeService.analyzeResume(
          id,
          req.user,
          jobId
        );

      /*
      |--------------------------------------------------------------------------
      | RESPONSE
      |--------------------------------------------------------------------------
      */

      return res.status(200).json({
        success: true,

        message:
          "Resume analyzed successfully.",

        data: result,
      });
    } catch (error) {
      console.error(
        "❌ Resume re-analysis controller error:",
        error
      );

      next(error);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | UPLOAD MULTIPLE RESUMES
  |--------------------------------------------------------------------------
  |
  | POST /api/resumes/upload-multiple
  |
  | FormData:
  |
  | resumes = multiple files
  |
  |--------------------------------------------------------------------------
  */

  static async uploadMultipleResumes(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      /*
      |--------------------------------------------------------------------------
      | AUTHENTICATION
      |--------------------------------------------------------------------------
      */

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | CHECK FILES
      |--------------------------------------------------------------------------
      */

      if (
        !req.files ||
        !Array.isArray(req.files) ||
        req.files.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please upload at least one resume.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | CONVERT FILES
      |--------------------------------------------------------------------------
      */

      const files =
        req.files as Express.Multer.File[];

      /*
      |--------------------------------------------------------------------------
      | LOG
      |--------------------------------------------------------------------------
      */

      console.log(
        "========================================"
      );

      console.log(
        "📚 Multiple Resume Upload Started"
      );

      console.log(
        "👤 User ID:",
        req.user.id
      );

      console.log(
        "📄 Number of files:",
        files.length
      );

      console.log(
        "========================================"
      );

      /*
      |--------------------------------------------------------------------------
      | UPLOAD
      |--------------------------------------------------------------------------
      */

      const results =
        await ResumeService.uploadMultipleResumes(
          files,
          req.user
        );

      /*
      |--------------------------------------------------------------------------
      | RESULT COUNTS
      |--------------------------------------------------------------------------
      */

      const successful =
        results.filter(
          (result) => result.success
        ).length;

      const failed =
        results.filter(
          (result) => !result.success
        ).length;

      /*
      |--------------------------------------------------------------------------
      | RESPONSE
      |--------------------------------------------------------------------------
      */

      return res.status(201).json({
        success: true,

        message:
          "Multiple resume upload completed.",

        data: {
          total: results.length,

          successful,

          failed,

          results,
        },
      });
    } catch (error) {
      console.error(
        "❌ Multiple resume upload controller error:",
        error
      );

      next(error);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | UPDATE RESUME STATUS
  |--------------------------------------------------------------------------
  |
  | PATCH /api/resumes/:id/status
  |
  | Body:
  |
  | {
  |   "status": "ANALYZED"
  | }
  |
  |--------------------------------------------------------------------------
  */

  static async updateResumeStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      /*
      |--------------------------------------------------------------------------
      | AUTHENTICATION
      |--------------------------------------------------------------------------
      */

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | RESUME ID
      |--------------------------------------------------------------------------
      */

      const id =
        ResumeController.getParam(
          req.params.id
        );

      /*
      |--------------------------------------------------------------------------
      | STATUS
      |--------------------------------------------------------------------------
      */

      const status =
        req.body?.status;

      /*
      |--------------------------------------------------------------------------
      | VALIDATE ID
      |--------------------------------------------------------------------------
      */

      if (!id) {
        return res.status(400).json({
          success: false,
          message:
            "Resume ID is required.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | VALIDATE STATUS
      |--------------------------------------------------------------------------
      */

      if (
        typeof status !== "string" ||
        !status.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Resume status is required.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | NORMALIZE STATUS
      |--------------------------------------------------------------------------
      */

      const normalizedStatus =
        status
          .trim()
          .toUpperCase();

      /*
      |--------------------------------------------------------------------------
      | VALIDATE AGAINST PRISMA ENUM
      |--------------------------------------------------------------------------
      */

      if (
        !Object.values(
          ResumeStatus
        ).includes(
          normalizedStatus as ResumeStatus
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid resume status.",

          allowedStatuses:
            Object.values(
              ResumeStatus
            ),
        });
      }

      const validStatus =
        normalizedStatus as ResumeStatus;

      /*
      |--------------------------------------------------------------------------
      | UPDATE
      |--------------------------------------------------------------------------
      */

      const resume =
        await ResumeService.updateResumeStatus(
          id,
          validStatus,
          req.user
        );

      /*
      |--------------------------------------------------------------------------
      | RESPONSE
      |--------------------------------------------------------------------------
      */

      return res.status(200).json({
        success: true,

        message:
          "Resume status updated successfully.",

        data: resume,
      });
    } catch (error) {
      console.error(
        "❌ Update resume status controller error:",
        error
      );

      next(error);
    }
  }
}