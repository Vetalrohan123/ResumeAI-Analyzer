import { Router } from "express";

import { AuthController } from "../controllers/auth.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

import { validate } from "../middleware/validate.middleware.js";

import {
  registerSchema,
  loginSchema,
} from "../validations/auth.validation.js";

import {
  authRateLimiter,
} from "../middleware/security.middleware.js";

/* ==========================================================================
   ROUTER
   ========================================================================== */

const router = Router();

/* ==========================================================================
   TEST ROUTE
   ========================================================================== */

router.get(
  "/test",
  (_req, res) => {
    return res.status(200).json({
      success: true,
      message: "AUTH ROUTES ARE WORKING",
    });
  }
);

/* ==========================================================================
   PUBLIC ROUTES
   ========================================================================== */

/*
 * REGISTER
 *
 * POST /api/auth/register
 *
 * Public route.
 */

router.post(
  "/register",
  authRateLimiter,
  validate(registerSchema),
  AuthController.register
);

/*
 * LOGIN
 *
 * POST /api/auth/login
 *
 * Public route.
 *
 * AuthController.login()
 * creates the accessToken and refreshToken
 * and stores them in HTTP-only cookies.
 */

router.post(
  "/login",
  authRateLimiter,
  validate(loginSchema),
  AuthController.login
);

/* ==========================================================================
   PROTECTED ROUTES
   ========================================================================== */

/*
 * GET CURRENT USER
 *
 * GET /api/auth/me
 *
 * Requires:
 *
 * Cookie:
 * accessToken
 *
 * OR:
 *
 * Authorization:
 * Bearer <token>
 */

router.get(
  "/me",
  authenticate,
  AuthController.me
);

/* ==========================================================================
   LOGOUT
   ========================================================================== */

/*
 * POST /api/auth/logout
 *
 * Logout should NOT require authentication.
 *
 * Why?
 *
 * If accessToken is expired, the user should
 * still be able to clear the authentication
 * cookies.
 */

router.post(
  "/logout",
  AuthController.logout
);

/* ==========================================================================
   EXPORT
   ========================================================================== */

export default router;