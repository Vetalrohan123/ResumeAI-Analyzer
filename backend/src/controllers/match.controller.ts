import type {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  MatchService,
} from "../services/match.service.js";

/*
|--------------------------------------------------------------------------
| AUTHENTICATED REQUEST
|--------------------------------------------------------------------------
*/

interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};

/*
|--------------------------------------------------------------------------
| MATCH CONTROLLER
|--------------------------------------------------------------------------
*/

export class MatchController {
  /*
  |--------------------------------------------------------------------------
  | CREATE MATCH
  |--------------------------------------------------------------------------
  |
  | POST /api/matches
  |
  | Body:
  |
  | {
  |   "jobId": "...",
  |   "resumeId": "..."
  | }
  |
  */

  static async createMatch(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      /*
      |--------------------------------------------------------------------------
      | AUTHENTICATION
      |--------------------------------------------------------------------------
      */

      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message:
            "User not authenticated.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | REQUEST BODY
      |--------------------------------------------------------------------------
      */

      const {
        jobId,
        resumeId,
      } = req.body;

      /*
      |--------------------------------------------------------------------------
      | VALIDATE JOB ID
      |--------------------------------------------------------------------------
      */

      if (
        typeof jobId !== "string" ||
        jobId.trim().length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Job ID is required.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | VALIDATE RESUME ID
      |--------------------------------------------------------------------------
      */

      if (
        typeof resumeId !== "string" ||
        resumeId.trim().length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Resume ID is required.",
        });
      }

      const cleanJobId =
        jobId.trim();

      const cleanResumeId =
        resumeId.trim();

      /*
      |--------------------------------------------------------------------------
      | LOG
      |--------------------------------------------------------------------------
      */

      console.log(
        "========================================"
      );

      console.log(
        "🤖 CREATE MATCH"
      );

      console.log(
        "💼 Job ID:",
        cleanJobId
      );

      console.log(
        "📄 Resume ID:",
        cleanResumeId
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
      | CREATE MATCH
      |--------------------------------------------------------------------------
      */

      const match =
        await MatchService.createMatch(
          cleanJobId,
          cleanResumeId
        );

      /*
      |--------------------------------------------------------------------------
      | RESPONSE
      |--------------------------------------------------------------------------
      */

      return res.status(201).json({
        success: true,

        message:
          "Resume matched with job successfully.",

        data: match,
      });
    } catch (error) {
      console.error(
        "❌ Create match error:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Failed to create job match.";

      /*
      |--------------------------------------------------------------------------
      | NOT FOUND
      |--------------------------------------------------------------------------
      */

      if (
        message ===
          "Job not found." ||
        message ===
          "Resume not found."
      ) {
        return res.status(404).json({
          success: false,
          message,
        });
      }

      /*
      |--------------------------------------------------------------------------
      | INVALID RESUME
      |--------------------------------------------------------------------------
      */

      if (
        message ===
          "Resume text is not available."
      ) {
        return res.status(400).json({
          success: false,
          message,
        });
      }

      /*
      |--------------------------------------------------------------------------
      | INVALID JOB
      |--------------------------------------------------------------------------
      */

      if (
        message ===
          "Job description is not available."
      ) {
        return res.status(400).json({
          success: false,
          message,
        });
      }

      /*
      |--------------------------------------------------------------------------
      | INTERNAL ERROR
      |--------------------------------------------------------------------------
      */

      return next(error);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | GET JOB MATCHES
  |--------------------------------------------------------------------------
  |
  | GET /api/matches/job/:jobId
  |
  */

  static async getJobMatches(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      /*
      |--------------------------------------------------------------------------
      | AUTHENTICATION
      |--------------------------------------------------------------------------
      */

      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message:
            "User not authenticated.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | PARAM
      |--------------------------------------------------------------------------
      */

      const jobIdParam =
        req.params.jobId;

      /*
      |--------------------------------------------------------------------------
      | VALIDATE PARAM
      |--------------------------------------------------------------------------
      */

      if (
        typeof jobIdParam !== "string" ||
        jobIdParam.trim().length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Job ID is required.",
        });
      }

      const jobId =
        jobIdParam.trim();

      /*
      |--------------------------------------------------------------------------
      | LOG
      |--------------------------------------------------------------------------
      */

      console.log(
        "🔎 Fetching matches for job:",
        jobId
      );

      /*
      |--------------------------------------------------------------------------
      | GET MATCHES
      |--------------------------------------------------------------------------
      */

      const matches =
        await MatchService.getJobMatches(
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
          "Job matches fetched successfully.",

        data: matches,
      });
    } catch (error) {
      console.error(
        "❌ Get job matches error:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Failed to get job matches.";

      /*
      |--------------------------------------------------------------------------
      | NOT FOUND
      |--------------------------------------------------------------------------
      */

      if (
        message ===
        "Job not found."
      ) {
        return res.status(404).json({
          success: false,
          message,
        });
      }

      /*
      |--------------------------------------------------------------------------
      | INTERNAL ERROR
      |--------------------------------------------------------------------------
      */

      return next(error);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | GET SINGLE MATCH
  |--------------------------------------------------------------------------
  |
  | GET /api/matches/:id
  |
  */

  static async getMatchById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      /*
      |--------------------------------------------------------------------------
      | AUTHENTICATION
      |--------------------------------------------------------------------------
      */

      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message:
            "User not authenticated.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | PARAM
      |--------------------------------------------------------------------------
      */

      const idParam =
        req.params.id;

      /*
      |--------------------------------------------------------------------------
      | VALIDATE PARAM
      |--------------------------------------------------------------------------
      */

      if (
        typeof idParam !== "string" ||
        idParam.trim().length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Match ID is required.",
        });
      }

      const id =
        idParam.trim();

      /*
      |--------------------------------------------------------------------------
      | GET MATCH
      |--------------------------------------------------------------------------
      */

      const match =
        await MatchService.getMatchById(
          id
        );

      /*
      |--------------------------------------------------------------------------
      | RESPONSE
      |--------------------------------------------------------------------------
      */

      return res.status(200).json({
        success: true,

        message:
          "Match fetched successfully.",

        data: match,
      });
    } catch (error) {
      console.error(
        "❌ Get match error:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Failed to get match.";

      /*
      |--------------------------------------------------------------------------
      | NOT FOUND
      |--------------------------------------------------------------------------
      */

      if (
        message ===
        "Match not found."
      ) {
        return res.status(404).json({
          success: false,
          message,
        });
      }

      /*
      |--------------------------------------------------------------------------
      | INTERNAL ERROR
      |--------------------------------------------------------------------------
      */

      return next(error);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | DELETE MATCH
  |--------------------------------------------------------------------------
  |
  | DELETE /api/matches/:id
  |
  */

  static async deleteMatch(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      /*
      |--------------------------------------------------------------------------
      | AUTHENTICATION
      |--------------------------------------------------------------------------
      */

      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message:
            "User not authenticated.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | PARAM
      |--------------------------------------------------------------------------
      */

      const idParam =
        req.params.id;

      /*
      |--------------------------------------------------------------------------
      | VALIDATE PARAM
      |--------------------------------------------------------------------------
      */

      if (
        typeof idParam !== "string" ||
        idParam.trim().length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Match ID is required.",
        });
      }

      const id =
        idParam.trim();

      /*
      |--------------------------------------------------------------------------
      | DELETE MATCH
      |--------------------------------------------------------------------------
      */

      await MatchService.deleteMatch(
        id
      );

      /*
      |--------------------------------------------------------------------------
      | RESPONSE
      |--------------------------------------------------------------------------
      */

      return res.status(200).json({
        success: true,

        message:
          "Match deleted successfully.",
      });
    } catch (error) {
      console.error(
        "❌ Delete match error:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete match.";

      /*
      |--------------------------------------------------------------------------
      | NOT FOUND
      |--------------------------------------------------------------------------
      */

      if (
        message ===
        "Match not found."
      ) {
        return res.status(404).json({
          success: false,
          message,
        });
      }

      /*
      |--------------------------------------------------------------------------
      | INTERNAL ERROR
      |--------------------------------------------------------------------------
      */

      return next(error);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | REMATCH
  |--------------------------------------------------------------------------
  |
  | POST /api/matches/rematch
  |
  | Body:
  |
  | {
  |   "jobId": "...",
  |   "resumeId": "..."
  | }
  |
  */

  static async rematch(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      /*
      |--------------------------------------------------------------------------
      | AUTHENTICATION
      |--------------------------------------------------------------------------
      */

      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message:
            "User not authenticated.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | REQUEST BODY
      |--------------------------------------------------------------------------
      */

      const {
        jobId,
        resumeId,
      } = req.body;

      /*
      |--------------------------------------------------------------------------
      | VALIDATE JOB ID
      |--------------------------------------------------------------------------
      */

      if (
        typeof jobId !== "string" ||
        jobId.trim().length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Job ID is required.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | VALIDATE RESUME ID
      |--------------------------------------------------------------------------
      */

      if (
        typeof resumeId !== "string" ||
        resumeId.trim().length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Resume ID is required.",
        });
      }

      const cleanJobId =
        jobId.trim();

      const cleanResumeId =
        resumeId.trim();

      /*
      |--------------------------------------------------------------------------
      | LOG
      |--------------------------------------------------------------------------
      */

      console.log(
        "========================================"
      );

      console.log(
        "🔄 REMATCH STARTED"
      );

      console.log(
        "💼 Job ID:",
        cleanJobId
      );

      console.log(
        "📄 Resume ID:",
        cleanResumeId
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
      | REMATCH
      |--------------------------------------------------------------------------
      */

      const match =
        await MatchService.rematch(
          cleanJobId,
          cleanResumeId
        );

      /*
      |--------------------------------------------------------------------------
      | RESPONSE
      |--------------------------------------------------------------------------
      */

      return res.status(201).json({
        success: true,

        message:
          "Resume re-matched successfully.",

        data: match,
      });
    } catch (error) {
      console.error(
        "❌ Rematch error:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Failed to re-match resume.";

      /*
      |--------------------------------------------------------------------------
      | NOT FOUND
      |--------------------------------------------------------------------------
      */

      if (
        message ===
          "Job not found." ||
        message ===
          "Resume not found." ||
        message ===
          "Match not found."
      ) {
        return res.status(404).json({
          success: false,
          message,
        });
      }

      /*
      |--------------------------------------------------------------------------
      | BAD REQUEST
      |--------------------------------------------------------------------------
      */

      if (
        message
          .toLowerCase()
          .includes("not available")
      ) {
        return res.status(400).json({
          success: false,
          message,
        });
      }

      /*
      |--------------------------------------------------------------------------
      | INTERNAL ERROR
      |--------------------------------------------------------------------------
      */

      return next(error);
    }
  }
}