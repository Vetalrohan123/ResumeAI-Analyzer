import type {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  JobService,
} from "../services/job.service.js";


export class JobController {
  

  static async createJob(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      /* ========================================================
         AUTHENTICATION
      ======================================================== */

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated.",
        });
      }

      /* ========================================================
         REQUEST BODY
      ======================================================== */

      const {
        title,
        company,
        location,
        employmentType,
        description,
        requirements,
        salary,
        requiredSkills,
      } = req.body;

      /* ========================================================
         BASIC VALIDATION
      ======================================================== */

      if (
        typeof title !== "string" ||
        title.trim().length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Job title is required.",
        });
      }

      if (
        typeof company !== "string" ||
        company.trim().length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Company name is required.",
        });
      }

      if (
        typeof description !== "string" ||
        description.trim().length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Job description is required.",
        });
      }

      if (
        typeof requirements !== "string" ||
        requirements.trim().length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Job requirements are required.",
        });
      }

      /* ========================================================
         CREATE JOB
      ======================================================== */

      const job =
        await JobService.createJob(
          {
            title: title.trim(),
            company: company.trim(),
            location,
            employmentType,
            description,
            requirements,
            salary,
            requiredSkills,
          },
          req.user.id
        );

      /* ========================================================
         RESPONSE
      ======================================================== */

      return res.status(201).json({
        success: true,
        message: "Job created successfully.",
        data: job,
      });
    } catch (error) {
      console.error(
        "❌ Create job controller error:",
        error
      );

      next(error);
    }
  }

  /**
   * ============================================================
   * GET ALL JOBS
   * GET /api/jobs
   * ============================================================
   */

  static async getJobs(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      /* ========================================================
         AUTHENTICATION
      ======================================================== */

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated.",
        });
      }

      /* ========================================================
         GET JOBS
      ======================================================== */

      const jobs =
        await JobService.getJobs(
          req.user.id
        );

      /* ========================================================
         RESPONSE
      ======================================================== */

      return res.status(200).json({
        success: true,
        message: "Jobs fetched successfully.",
        data: jobs,
      });
    } catch (error) {
      console.error(
        "❌ Get jobs controller error:",
        error
      );

      next(error);
    }
  }

  /**
   * ============================================================
   * GET JOB BY ID
   * GET /api/jobs/:id
   * ============================================================
   */

  static async getJobById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      /* ========================================================
         AUTHENTICATION
      ======================================================== */

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated.",
        });
      }

      /* ========================================================
         JOB ID
      ======================================================== */

      const idParam =
        req.params.id;

      if (
        typeof idParam !== "string" ||
        idParam.trim().length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Job ID is required.",
        });
      }

      const id =
        idParam.trim();

      /* ========================================================
         GET JOB
      ======================================================== */

      const job =
        await JobService.getJobById(
          id,
          req.user.id
        );

      /* ========================================================
         RESPONSE
      ======================================================== */

      return res.status(200).json({
        success: true,
        message: "Job fetched successfully.",
        data: job,
      });
    } catch (error) {
      console.error(
        "❌ Get job controller error:",
        error
      );

      next(error);
    }
  }

  /**
   * ============================================================
   * UPDATE JOB
   * PUT /api/jobs/:id
   * ============================================================
   */

  static async updateJob(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      /* ========================================================
         AUTHENTICATION
      ======================================================== */

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated.",
        });
      }

      /* ========================================================
         JOB ID
      ======================================================== */

      const idParam =
        req.params.id;

      if (
        typeof idParam !== "string" ||
        idParam.trim().length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Job ID is required.",
        });
      }

      const id =
        idParam.trim();

      /* ========================================================
         UPDATE JOB
      ======================================================== */

      const job =
        await JobService.updateJob(
          id,
          req.body,
          req.user.id
        );

      /* ========================================================
         RESPONSE
      ======================================================== */

      return res.status(200).json({
        success: true,
        message: "Job updated successfully.",
        data: job,
      });
    } catch (error) {
      console.error(
        "❌ Update job controller error:",
        error
      );

      next(error);
    }
  }

  /**
   * ============================================================
   * DELETE JOB
   * DELETE /api/jobs/:id
   * ============================================================
   */

  static async deleteJob(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      /* ========================================================
         AUTHENTICATION
      ======================================================== */

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated.",
        });
      }

      /* ========================================================
         JOB ID
      ======================================================== */

      const idParam =
        req.params.id;

      if (
        typeof idParam !== "string" ||
        idParam.trim().length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Job ID is required.",
        });
      }

      const id =
        idParam.trim();

      /* ========================================================
         DELETE JOB
      ======================================================== */

      const result =
        await JobService.deleteJob(
          id,
          req.user.id
        );

      /* ========================================================
         RESPONSE
         
         IMPORTANT:
         Do not use:
         
         {
           success: true,
           ...result
         }
         
         because if result contains `success`,
         TypeScript reports TS2783.
      ======================================================== */

      return res.status(200).json({
        ...result,
        success: true,
        message:
          result.message ??
          "Job deleted successfully.",
      });
    } catch (error) {
      console.error(
        "❌ Delete job controller error:",
        error
      );

      next(error);
    }
  }
}