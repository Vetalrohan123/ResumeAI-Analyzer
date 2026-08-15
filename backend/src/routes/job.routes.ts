
import { Router } from "express";

import {
  JobController,
} from "../controllers/job.controller.js";

import {
  authenticate,
} from "../middleware/auth.middleware.js";

const router = Router();

/**
 * ============================================================
 * JOB ROUTES
 * Base URL:
 * /api/jobs
 * ============================================================
 */

/**
 * ============================================================
 * CREATE JOB
 * POST /api/jobs
 * ============================================================
 */
router.post(
  "/",
  authenticate,
  JobController.createJob
);

/**
 * ============================================================
 * GET ALL JOBS
 * GET /api/jobs
 * ============================================================
 */
router.get(
  "/",
  authenticate,
  JobController.getJobs
);

/**
 * ============================================================
 * GET JOB BY ID
 * GET /api/jobs/:id
 * ============================================================
 */
router.get(
  "/:id",
  authenticate,
  JobController.getJobById
);

/**
 * ============================================================
 * UPDATE JOB
 * PUT /api/jobs/:id
 * ============================================================
 */
router.put(
  "/:id",
  authenticate,
  JobController.updateJob
);

/**
 * ============================================================
 * DELETE JOB
 * DELETE /api/jobs/:id
 * ============================================================
 */
router.delete(
  "/:id",
  authenticate,
  JobController.deleteJob
);

export default router;

