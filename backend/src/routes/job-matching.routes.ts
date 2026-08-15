import {
  Router,
} from "express";

import {
  JobMatchingController,
} from "../controllers/job-matching.controller.js";

import {
  authenticate,
} from "../middleware/auth.middleware.js";

const router =
  Router();

/*
|--------------------------------------------------------------------------
| MATCH RESUME WITH JOB
|--------------------------------------------------------------------------
|
| POST
| /api/job-matching/resume/:resumeId/job/:jobId
|
*/

router.post(
  "/resume/:resumeId/job/:jobId",
  authenticate,
  JobMatchingController.matchResume
);

export default router;