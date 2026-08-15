import { Router } from "express";

import {
  HistoryController,
} from "../controllers/history.controller.js";

import {
  authenticate,
} from "../middleware/auth.middleware.js";

const router =
  Router();

router.get(
  "/",
  authenticate,
  HistoryController.getHistory
);

export default router;