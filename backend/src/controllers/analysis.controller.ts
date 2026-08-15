import type {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  AnalysisService,
} from "../services/analysis.service.js";


export class AnalysisController {
 
  static async createAnalysis(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message:
            "User not authenticated.",
        });
      }

      
      const {
        resumeId,
        jobId,
      } = req.body;

      
      if (
        typeof resumeId !== "string" ||
        !resumeId.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Resume ID is required.",
        });
      }

      
      if (
        typeof jobId !== "string" ||
        !jobId.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Job ID is required.",
        });
      }

      const cleanResumeId =
        resumeId.trim();

      const cleanJobId =
        jobId.trim();

      
      console.log(
        "========================================"
      );

      console.log(
        "🤖 Resume Analysis Started"
      );

      console.log(
        "📄 Resume ID:",
        cleanResumeId
      );

      console.log(
        "💼 Job ID:",
        cleanJobId
      );

      console.log(
        "👤 User ID:",
        req.user.id
      );

      console.log(
        "========================================"
      );

      
      const analysis =
        await AnalysisService.create({
          resumeId:
            cleanResumeId,

          jobId:
            cleanJobId,

          userId:
            req.user.id,
        });

      
      return res.status(201).json({
        success: true,

        message:
          "Resume analyzed against job successfully.",

        data: analysis,
      });
    } catch (error) {
      console.error(
        "❌ Create analysis controller error:",
        error
      );

      next(error);
    }
  }

  
  static async getAnalyses(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
     
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message:
            "User not authenticated.",
        });
      }

      
      const analyses =
        await AnalysisService.getAll(
          req.user.id
        );

     
      return res.status(200).json({
        success: true,

        message:
          "Analyses fetched successfully.",

        data: analyses,
      });
    } catch (error) {
      console.error(
        "❌ Get analyses controller error:",
        error
      );

      next(error);
    }
  }

  

  static async getAnalysisById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message:
            "User not authenticated.",
        });
      }

      
      const idParam =
        req.params.id;

      
      if (
        typeof idParam !== "string" ||
        !idParam.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Analysis ID is required.",
        });
      }

      const id =
        idParam.trim();

      
      const analysis =
        await AnalysisService.getById(
          id,
          req.user.id
        );

      
      return res.status(200).json({
        success: true,

        message:
          "Analysis fetched successfully.",

        data: analysis,
      });
    } catch (error) {
      console.error(
        "❌ Get analysis controller error:",
        error
      );

      next(error);
    }
  }


  static async deleteAnalysis(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message:
            "User not authenticated.",
        });
      }

      
      const idParam =
        req.params.id;

      
      if (
        typeof idParam !== "string" ||
        !idParam.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Analysis ID is required.",
        });
      }

      const id =
        idParam.trim();

      const result =
        await AnalysisService.delete(
          id,
          req.user.id
        );


      return res.status(200).json({
        ...result,
      });
    } catch (error) {
      console.error(
        "Delete analysis controller error:",
        error
      );

      next(error);
    }
  }
}