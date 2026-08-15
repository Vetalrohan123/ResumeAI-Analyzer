import type {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  AdminService,
} from "../services/admin.service.js";

/* ==========================================================================
   ADMIN CONTROLLER
========================================================================== */

export class AdminController {
  /**
   * GET /api/admin/users
   */
  static async users(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data =
        await AdminService.getUsers();

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/resumes
   */
  static async resumes(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data =
        await AdminService.getResumes();

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/jobs
   */
  static async jobs(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data =
        await AdminService.getJobs();

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/matches
   */
  static async matches(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data =
        await AdminService.getMatches();

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/admin/users/:id
   */
  static async deleteUser(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      /* ================================================================
         GET USER ID
      ================================================================ */

      const idParam =
        req.params.id;

      /* ================================================================
         VALIDATE USER ID
      ================================================================ */

      if (
        typeof idParam !== "string" ||
        !idParam.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      const id =
        idParam.trim();

      /* ================================================================
         DELETE USER
      ================================================================ */

      const data =
        await AdminService.deleteUser(
          id
        );

      /* ================================================================
         RESPONSE
      ================================================================ */

      return res.status(200).json({
        success: true,
        message:
          "User deleted successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}