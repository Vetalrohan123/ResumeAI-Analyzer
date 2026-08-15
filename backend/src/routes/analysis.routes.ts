
import { Router } from "express";

import {
  AnalysisController,
} from "../controllers/analysis.controller.js";

import {
  authenticate,
} from "../middleware/auth.middleware.js";

const router = Router();

/**
 * ============================================================
 * ANALYSIS ROUTES
 * ============================================================
 *
 * Base URL:
 * /api/analyses
 *
 */

/**
 * ============================================================
 * CREATE / RUN ANALYSIS
 * ============================================================
 *
 * POST /api/analyses
 *
 * Body:
 * {
 *   "resumeId": "resume_id",
 *   "jobId": "job_id"
 * }
 *
 */
router.post(
  "/",
  authenticate,
  AnalysisController.createAnalysis
);

/**
 * ============================================================
 * GET ALL ANALYSES
 * ============================================================
 *
 * GET /api/analyses
 *
 */
router.get(
  "/",
  authenticate,
  AnalysisController.getAnalyses
);

/**
 * ============================================================
 * GET ANALYSIS BY ID
 * ============================================================
 *
 * GET /api/analyses/:id
 *
 */
router.get(
  "/:id",
  authenticate,
  AnalysisController.getAnalysisById
);

/**
 * ============================================================
 * DELETE ANALYSIS
 * ============================================================
 *
 * DELETE /api/analyses/:id
 *
 */
router.delete(
  "/:id",
  authenticate,
  AnalysisController.deleteAnalysis
);

export default router;
