import { Router } from "express";

import { MatchController } from "../controllers/match.controller.js";

import {
  authenticate,
} from "../middleware/auth.middleware.js";

const router = Router();

/* ============================================================
   CREATE MATCH
============================================================ */

router.post(
  "/",
  authenticate,
  MatchController.createMatch
);

/* ============================================================
   GET MATCHES FOR JOB
============================================================ */

router.get(
  "/job/:jobId",
  authenticate,
  MatchController.getJobMatches
);

/* ============================================================
   GET SINGLE MATCH
============================================================ */

router.get(
  "/:matchId",
  authenticate,
  MatchController.getMatchById
);

/* ============================================================
   DELETE MATCH
============================================================ */

router.delete(
  "/:matchId",
  authenticate,
  MatchController.deleteMatch
);

export default router;