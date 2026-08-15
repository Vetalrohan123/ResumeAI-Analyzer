import { Router } from "express";

import {
  ResumeBuilderAIController,
} from "../controllers/resume-builder-ai.controller.js";

import {
  authenticate,
} from "../middleware/auth.middleware.js";

const router = Router();

/* ============================================================================
   AI RESUME BUILDER
============================================================================ */

/*
 * POST /api/resume-builder/ai
 *
 * Generates AI-powered resume content.
 *
 * Authentication required.
 */
router.post(
  "/",
  authenticate,
  ResumeBuilderAIController.generate
);

export default router;