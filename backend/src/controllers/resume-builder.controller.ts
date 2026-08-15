import type {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  ResumeBuilderService,
  type ResumeBuilderInput,
} from "../services/resume-builder.service.js";

import {
  ResumePDFService,
  type ResumeTemplate,
} from "../services/resume-pdf.service.js";

function getResumeId(
  req: Request
): string | null {
  const value = req.params.id;

  if (typeof value === "string") {
    const id = value.trim();

    return id || null;
  }

  if (Array.isArray(value)) {
    const id =
      value[0]?.trim() || "";

    return id || null;
  }

  return null;
}

export class ResumeBuilderController {
  
  static async createResume(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      console.log(
        "========================================"
      );

      console.log(
        "[RESUME BUILDER] Create resume"
      );

      
      if (!req.user) {
        res.status(401).json({
          success: false,
          message:
            "User not authenticated.",
        });

        return;
      }

      
      const data =
        req.body as ResumeBuilderInput;

      
      if (
        !data ||
        typeof data !== "object"
      ) {
        res.status(400).json({
          success: false,
          message:
            "Resume data is required.",
        });

        return;
      }

      
      const resume =
        await ResumeBuilderService.createResume(
          data,
          req.user
        );

      console.log(
        "[RESUME BUILDER] Resume created:",
        resume.id
      );

      console.log(
        "========================================"
      );

      res.status(201).json({
        success: true,
        message:
          "Resume created successfully.",
        data: resume,
      });
    } catch (error) {
      console.error(
        "[RESUME BUILDER] Create error:",
        error
      );

      next(error);
    }
  }

  
  static async getResumes(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      console.log(
        "[RESUME BUILDER] Get all resumes"
      );

      if (!req.user) {
        res.status(401).json({
          success: false,
          message:
            "User not authenticated.",
        });

        return;
      }

      const resumes =
        await ResumeBuilderService.getResumes(
          req.user
        );

      console.log(
        "[RESUME BUILDER] Resumes found:",
        resumes.length
      );

      res.status(200).json({
        success: true,
        message:
          "Builder resumes fetched successfully.",
        data: resumes,
      });
    } catch (error) {
      console.error(
        "[RESUME BUILDER] Get resumes error:",
        error
      );

      next(error);
    }
  }

  static async getResume(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      console.log(
        "[RESUME BUILDER] Get single resume"
      );

      /* ----------------------------------------------------------------------
         AUTHENTICATION
         ---------------------------------------------------------------------- */

      if (!req.user) {
        res.status(401).json({
          success: false,
          message:
            "User not authenticated.",
        });

        return;
      }

      /* ----------------------------------------------------------------------
         RESUME ID
         ---------------------------------------------------------------------- */

      const id =
        getResumeId(req);

      if (!id) {
        res.status(400).json({
          success: false,
          message:
            "Resume ID is required.",
        });

        return;
      }

      /* ----------------------------------------------------------------------
         FETCH
         ---------------------------------------------------------------------- */

      const resume =
        await ResumeBuilderService.getResumeById(
          id,
          req.user
        );

      res.status(200).json({
        success: true,
        message:
          "Resume fetched successfully.",
        data: resume,
      });
    } catch (error) {
      console.error(
        "[RESUME BUILDER] Get resume error:",
        error
      );

      next(error);
    }
  }

  /* ==========================================================================
     UPDATE RESUME
     PUT /api/resume-builder/:id
     ========================================================================== */

  static async updateResume(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      console.log(
        "[RESUME BUILDER] Update resume"
      );

      /* ----------------------------------------------------------------------
         AUTHENTICATION
         ---------------------------------------------------------------------- */

      if (!req.user) {
        res.status(401).json({
          success: false,
          message:
            "User not authenticated.",
        });

        return;
      }

      /* ----------------------------------------------------------------------
         RESUME ID
         ---------------------------------------------------------------------- */

      const id =
        getResumeId(req);

      if (!id) {
        res.status(400).json({
          success: false,
          message:
            "Resume ID is required.",
        });

        return;
      }

      /* ----------------------------------------------------------------------
         REQUEST DATA
         ---------------------------------------------------------------------- */

      const data =
        req.body as Partial<ResumeBuilderInput>;

      if (
        !data ||
        typeof data !== "object"
      ) {
        res.status(400).json({
          success: false,
          message:
            "Resume data is required.",
        });

        return;
      }

      /* ----------------------------------------------------------------------
         UPDATE
         ---------------------------------------------------------------------- */

      const resume =
        await ResumeBuilderService.updateResume(
          id,
          data,
          req.user
        );

      console.log(
        "[RESUME BUILDER] Resume updated:",
        resume.id
      );

      res.status(200).json({
        success: true,
        message:
          "Resume updated successfully.",
        data: resume,
      });
    } catch (error) {
      console.error(
        "[RESUME BUILDER] Update error:",
        error
      );

      next(error);
    }
  }

  /* ==========================================================================
     DELETE RESUME
     DELETE /api/resume-builder/:id
     ========================================================================== */

  static async deleteResume(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      console.log(
        "[RESUME BUILDER] Delete resume"
      );

      /* ----------------------------------------------------------------------
         AUTHENTICATION
         ---------------------------------------------------------------------- */

      if (!req.user) {
        res.status(401).json({
          success: false,
          message:
            "User not authenticated.",
        });

        return;
      }

      /* ----------------------------------------------------------------------
         RESUME ID
         ---------------------------------------------------------------------- */

      const id =
        getResumeId(req);

      if (!id) {
        res.status(400).json({
          success: false,
          message:
            "Resume ID is required.",
        });

        return;
      }

      /* ----------------------------------------------------------------------
         DELETE
         ---------------------------------------------------------------------- */

      const result =
        await ResumeBuilderService.deleteResume(
          id,
          req.user
        );

      console.log(
        "[RESUME BUILDER] Resume deleted:",
        id
      );

      res.status(200).json({
        success: true,
        message:
          result.message ||
          "Resume deleted successfully.",
      });
    } catch (error) {
      console.error(
        "[RESUME BUILDER] Delete error:",
        error
      );

      next(error);
    }
  }

  /* ==========================================================================
     DUPLICATE RESUME
     POST /api/resume-builder/:id/duplicate
     ========================================================================== */

  static async duplicateResume(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      console.log(
        "[RESUME BUILDER] Duplicate resume"
      );

      /* ----------------------------------------------------------------------
         AUTHENTICATION
         ---------------------------------------------------------------------- */

      if (!req.user) {
        res.status(401).json({
          success: false,
          message:
            "User not authenticated.",
        });

        return;
      }

      /* ----------------------------------------------------------------------
         RESUME ID
         ---------------------------------------------------------------------- */

      const id =
        getResumeId(req);

      if (!id) {
        res.status(400).json({
          success: false,
          message:
            "Resume ID is required.",
        });

        return;
      }

      /* ----------------------------------------------------------------------
         DUPLICATE
         ---------------------------------------------------------------------- */

      const resume =
        await ResumeBuilderService.duplicateResume(
          id,
          req.user
        );

      console.log(
        "[RESUME BUILDER] Resume duplicated:",
        resume.id
      );

      res.status(201).json({
        success: true,
        message:
          "Resume duplicated successfully.",
        data: resume,
      });
    } catch (error) {
      console.error(
        "[RESUME BUILDER] Duplicate error:",
        error
      );

      next(error);
    }
  }

  
  static async generatePDF(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      console.log(
        "========================================"
      );

      console.log(
        "[RESUME BUILDER] Generate PDF"
      );

      
      if (!req.user) {
        res.status(401).json({
          success: false,
          message:
            "User not authenticated.",
        });

        return;
      }

      /* ----------------------------------------------------------------------
         RESUME ID
         ---------------------------------------------------------------------- */

      const id =
        getResumeId(req);

      if (!id) {
        res.status(400).json({
          success: false,
          message:
            "Resume ID is required.",
        });

        return;
      }

      console.log(
        "[RESUME BUILDER] PDF resume ID:",
        id
      );

      /* ----------------------------------------------------------------------
         TEMPLATE
         ---------------------------------------------------------------------- */

      const templateQuery =
        req.query.template;

      let template: ResumeTemplate =
        "modern";

      if (
        typeof templateQuery ===
        "string"
      ) {
        const normalized =
          templateQuery
            .trim()
            .toLowerCase();

        if (
          normalized ===
          "modern"
        ) {
          template = "modern";
        } else if (
          normalized ===
          "professional"
        ) {
          template =
            "professional";
        } else if (
          normalized ===
          "minimal"
        ) {
          template = "minimal";
        } else {
          res.status(400).json({
            success: false,
            message:
              "Invalid template. Use modern, professional, or minimal.",
          });

          return;
        }
      }

      console.log(
        "[RESUME BUILDER] PDF template:",
        template
      );

      /* ----------------------------------------------------------------------
         GENERATE PDF
         ---------------------------------------------------------------------- */

      const pdfBuffer =
        await ResumePDFService.generatePDF(
          id,
          req.user,
          template
        );

      console.log(
        "[RESUME BUILDER] PDF buffer generated:",
        pdfBuffer.length,
        "bytes"
      );

      /* ----------------------------------------------------------------------
         FILE NAME
         ---------------------------------------------------------------------- */

      let fileName =
        "resume.pdf";

      try {
        const resume =
          await ResumeBuilderService.getResumeById(
            id,
            req.user
          );

        const candidateName =
          resume.candidateName ||
          "resume";

        const safeName =
          candidateName
            .trim()
            .replace(
              /[^a-zA-Z0-9-_]/g,
              "-"
            )
            .replace(
              /-+/g,
              "-"
            )
            .replace(
              /^-+|-+$/g,
              ""
            )
            .toLowerCase();

        fileName =
          `${safeName || "resume"}-resume.pdf`;
      } catch (error) {
        console.warn(
          "[RESUME BUILDER] Could not generate candidate filename. Using fallback.",
          error
        );
      }

      /* ----------------------------------------------------------------------
         PDF HEADERS
         ---------------------------------------------------------------------- */

      res.status(200);

      res.setHeader(
        "Content-Type",
        "application/pdf"
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
      );

      res.setHeader(
        "Content-Length",
        pdfBuffer.length.toString()
      );

      res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
      );

      res.setHeader(
        "Pragma",
        "no-cache"
      );

      res.setHeader(
        "Expires",
        "0"
      );

      /* ----------------------------------------------------------------------
         SEND PDF
         ---------------------------------------------------------------------- */

      res.end(pdfBuffer);

      console.log(
        "[RESUME BUILDER] PDF sent successfully:",
        fileName
      );

      console.log(
        "========================================"
      );
    } catch (error) {
      console.error(
        "[RESUME BUILDER] Generate PDF error:",
        error
      );

      if (!res.headersSent) {
        next(error);
      }
    }
  }
}