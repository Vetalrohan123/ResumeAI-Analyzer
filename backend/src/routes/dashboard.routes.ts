import {
  Router,
} from "express";

import {
  DashboardController,
} from "../controllers/dashboard.controller.js";

import {
  authenticate,
} from "../middleware/auth.middleware.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
|
| GET /api/dashboard
|
*/

router.get(
  "/",
  authenticate,
  DashboardController.getDashboard
);

export default router;