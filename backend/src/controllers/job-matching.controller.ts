import type {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  JobMatchingService,
} from "../services/job-matching.service.js";


type AuthenticatedUser = NonNullable<Request["user"]>;

interface AuthenticatedRequest
  extends Request {
  user?: AuthenticatedUser;
}


export class JobMatchingController {
  
  static async matchResume(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated.",
        });
      }

      
      const resumeIdParam =
        req.params.resumeId;

      const jobIdParam =
        req.params.jobId;

      
      if (
        typeof resumeIdParam !== "string" ||
        resumeIdParam.trim().length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Resume ID is required.",
        });
      }

      
      if (
        typeof jobIdParam !== "string" ||
        jobIdParam.trim().length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Job ID is required.",
        });
      }

      const resumeId =
        resumeIdParam.trim();

      const jobId =
        jobIdParam.trim();

      
      console.log(
        "========================================"
      );

      console.log(
        "🤖 JOB MATCHING STARTED"
      );

      console.log(
        "========================================"
      );

      console.log(
        "📄 Resume ID:",
        resumeId
      );

      console.log(
        "💼 Job ID:",
        jobId
      );

      console.log(
        "👤 User ID:",
        req.user.id
      );

      console.log(
        "========================================"
      );

      /* ======================================================================
         MATCH RESUME WITH JOB
      ====================================================================== */

      const result =
        await JobMatchingService.matchResumeWithJob(
          resumeId,
          jobId,
          req.user
        );

      /* ======================================================================
         RESPONSE
      ====================================================================== */

      return res.status(200).json({
        success: true,

        message:
          "Resume matched with job successfully.",

        data: result,
      });
    } catch (error) {
      /* ======================================================================
         ERROR LOGGING
      ====================================================================== */

      console.error(
        "❌ Resume matching controller error:",
        error
      );

      /* ======================================================================
         ERROR MESSAGE
      ====================================================================== */

      const message =
        error instanceof Error
          ? error.message
          : "Failed to match resume with job.";

      const normalizedMessage =
        message.toLowerCase();

      /* ======================================================================
         NOT FOUND
      ====================================================================== */

      if (
        normalizedMessage.includes(
          "not found"
        )
      ) {
        return res.status(404).json({
          success: false,
          message,
        });
      }

      /* ======================================================================
         AUTHENTICATION
      ====================================================================== */

      if (
        normalizedMessage.includes(
          "not authenticated"
        ) ||
        normalizedMessage.includes(
          "unauthorized"
        ) ||
        normalizedMessage.includes(
          "authentication"
        )
      ) {
        return res.status(401).json({
          success: false,
          message,
        });
      }

      /* ======================================================================
         FORBIDDEN
      ====================================================================== */

      if (
        normalizedMessage.includes(
          "forbidden"
        ) ||
        normalizedMessage.includes(
          "permission"
        ) ||
        normalizedMessage.includes(
          "access denied"
        )
      ) {
        return res.status(403).json({
          success: false,
          message,
        });
      }

      /* ======================================================================
         BAD REQUEST
      ====================================================================== */

      if (
        normalizedMessage.includes(
          "required"
        ) ||
        normalizedMessage.includes(
          "invalid"
        )
      ) {
        return res.status(400).json({
          success: false,
          message,
        });
      }

      /* ======================================================================
         NEXT ERROR MIDDLEWARE
      ====================================================================== */

      return next(error);
    }
  }
}