import type {
  Request,
  Response,
  NextFunction,
} from "express";

import { AuthService } from "../services/auth.service.js";

/* ============================================================================
   ENVIRONMENT
============================================================================ */

const isProduction =
  process.env.NODE_ENV === "production";

/* ============================================================================
   COOKIE OPTIONS
============================================================================ */

/*
 * Production:
 *
 * Frontend:
 *   https://your-frontend-domain.com
 *
 * Backend:
 *   https://your-backend.onrender.com
 *
 * Because these are different origins, the browser needs:
 *
 *   secure: true
 *   sameSite: "none"
 *
 * Development:
 *
 *   secure: false
 *   sameSite: "lax"
 */

const accessTokenCookieOptions = {
  httpOnly: true,

  secure: isProduction,

  sameSite: isProduction
    ? ("none" as const)
    : ("lax" as const),

  maxAge:
    15 * 60 * 1000,

  path: "/",
};

const refreshTokenCookieOptions = {
  httpOnly: true,

  secure: isProduction,

  sameSite: isProduction
    ? ("none" as const)
    : ("lax" as const),

  maxAge:
    7 * 24 * 60 * 60 * 1000,

  path: "/",
};

/* ============================================================================
   AUTH CONTROLLER
============================================================================ */

export class AuthController {
  /* ==========================================================================
     REGISTER
  ========================================================================== */

  static async register(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      console.log(
        "[AUTH] Registration started"
      );

      console.log(
        "[AUTH] Email:",
        req.body?.email
      );

      /* ----------------------------------------------------------------------
         Validate request body
      ---------------------------------------------------------------------- */

      const email =
        req.body?.email
          ?.trim()
          ?.toLowerCase();

      const password =
        req.body?.password;

      if (!email) {
        return res.status(400).json({
          success: false,
          message:
            "Email is required.",
        });
      }

      if (!password) {
        return res.status(400).json({
          success: false,
          message:
            "Password is required.",
        });
      }

      /* ----------------------------------------------------------------------
         Register user
      ---------------------------------------------------------------------- */

      const result =
        await AuthService.register({
          ...req.body,
          email,
        });

      /* ----------------------------------------------------------------------
         Validate access token
      ---------------------------------------------------------------------- */

      if (!result.accessToken) {
        console.error(
          "[AUTH] No access token returned during registration"
        );

        return res.status(500).json({
          success: false,
          message:
            "Access token was not generated.",
        });
      }

      /* ----------------------------------------------------------------------
         Validate refresh token
      ---------------------------------------------------------------------- */

      if (!result.refreshToken) {
        console.error(
          "[AUTH] No refresh token returned during registration"
        );

        return res.status(500).json({
          success: false,
          message:
            "Refresh token was not generated.",
        });
      }

      /* ----------------------------------------------------------------------
         Set access token cookie
      ---------------------------------------------------------------------- */

      res.cookie(
        "accessToken",
        result.accessToken,
        accessTokenCookieOptions
      );

      console.log(
        "[AUTH] accessToken cookie set"
      );

      /* ----------------------------------------------------------------------
         Set refresh token cookie
      ---------------------------------------------------------------------- */

      res.cookie(
        "refreshToken",
        result.refreshToken,
        refreshTokenCookieOptions
      );

      console.log(
        "[AUTH] refreshToken cookie set"
      );

      /* ----------------------------------------------------------------------
         Registration successful
      ---------------------------------------------------------------------- */

      console.log(
        "[AUTH] Registration successful"
      );

      return res.status(201).json({
        success: true,

        message:
          "Account created successfully.",

        user: result.user,
      });
    } catch (error: unknown) {
      console.error(
        "[AUTH] Registration error:",
        error
      );

      return next(error);
    }
  }

  /* ==========================================================================
     LOGIN
  ========================================================================== */

  static async login(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      console.log(
        "[AUTH] Login started"
      );

      console.log(
        "[AUTH] Email:",
        req.body?.email
      );

      /* ----------------------------------------------------------------------
         Validate email
      ---------------------------------------------------------------------- */

      const email =
        req.body?.email
          ?.trim()
          ?.toLowerCase();

      /* ----------------------------------------------------------------------
         Validate password
      ---------------------------------------------------------------------- */

      const password =
        req.body?.password;

      if (!email) {
        console.warn(
          "[AUTH] Login rejected: email missing"
        );

        return res.status(400).json({
          success: false,

          message:
            "Email is required.",
        });
      }

      if (!password) {
        console.warn(
          "[AUTH] Login rejected: password missing"
        );

        return res.status(400).json({
          success: false,

          message:
            "Password is required.",
        });
      }

      /* ----------------------------------------------------------------------
         Login through AuthService
      ---------------------------------------------------------------------- */

      const result =
        await AuthService.login({
          ...req.body,

          email,

          password,
        });

      /* ----------------------------------------------------------------------
         Validate access token
      ---------------------------------------------------------------------- */

      if (!result.accessToken) {
        console.error(
          "[AUTH] No access token returned"
        );

        return res.status(500).json({
          success: false,

          message:
            "Access token was not generated.",
        });
      }

      /* ----------------------------------------------------------------------
         Validate refresh token
      ---------------------------------------------------------------------- */

      if (!result.refreshToken) {
        console.error(
          "[AUTH] No refresh token returned"
        );

        return res.status(500).json({
          success: false,

          message:
            "Refresh token was not generated.",
        });
      }

      /* ----------------------------------------------------------------------
         Set access token cookie
      ---------------------------------------------------------------------- */

      res.cookie(
        "accessToken",
        result.accessToken,
        accessTokenCookieOptions
      );

      console.log(
        "[AUTH] accessToken cookie set"
      );

      /* ----------------------------------------------------------------------
         Set refresh token cookie
      ---------------------------------------------------------------------- */

      res.cookie(
        "refreshToken",
        result.refreshToken,
        refreshTokenCookieOptions
      );

      console.log(
        "[AUTH] refreshToken cookie set"
      );

      /* ----------------------------------------------------------------------
         Login successful
      ---------------------------------------------------------------------- */

      console.log(
        "[AUTH] Login successful"
      );

      /*
       * IMPORTANT:
       *
       * Do NOT return accessToken or refreshToken
       * in JSON.
       *
       * They are stored in HTTP-only cookies.
       */

      return res.status(200).json({
        success: true,

        message:
          "Login successful.",

        user: result.user,
      });
    } catch (error: unknown) {
      console.error(
        "[AUTH] Login error:",
        error
      );

      return next(error);
    }
  }

  /* ==========================================================================
     GET CURRENT USER
  ========================================================================== */

  static async me(
    req: Request,
    res: Response
  ) {
    try {
      console.log(
        "[AUTH] GET /me"
      );

      console.log(
        "[AUTH] req.user:",
        req.user
      );

      /* ----------------------------------------------------------------------
         Authentication middleware should populate req.user.
      ---------------------------------------------------------------------- */

      if (!req.user) {
        console.warn(
          "[AUTH] /me called without authenticated user"
        );

        return res.status(401).json({
          success: false,

          message:
            "Authentication required.",
        });
      }

      /* ----------------------------------------------------------------------
         Return authenticated user
      ---------------------------------------------------------------------- */

      return res.status(200).json({
        success: true,

        message:
          "Authenticated user fetched successfully.",

        user: req.user,
      });
    } catch (error: unknown) {
      console.error(
        "[AUTH] /me error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to fetch authenticated user.",
      });
    }
  }

  /* ==========================================================================
     LOGOUT
  ========================================================================== */

  static async logout(
    _req: Request,
    res: Response
  ) {
    try {
      console.log(
        "[AUTH] Logout started"
      );

      /* ----------------------------------------------------------------------
         Clear access token
      ---------------------------------------------------------------------- */

      res.clearCookie(
        "accessToken",
        {
          httpOnly: true,

          secure: isProduction,

          sameSite:
            isProduction
              ? ("none" as const)
              : ("lax" as const),

          path: "/",
        }
      );

      /* ----------------------------------------------------------------------
         Clear refresh token
      ---------------------------------------------------------------------- */

      res.clearCookie(
        "refreshToken",
        {
          httpOnly: true,

          secure: isProduction,

          sameSite:
            isProduction
              ? ("none" as const)
              : ("lax" as const),

          path: "/",
        }
      );

      console.log(
        "[AUTH] Authentication cookies cleared"
      );

      /* ----------------------------------------------------------------------
         Logout successful
      ---------------------------------------------------------------------- */

      return res.status(200).json({
        success: true,

        message:
          "Logged out successfully.",
      });
    } catch (error: unknown) {
      console.error(
        "[AUTH] Logout error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to logout.",
      });
    }
  }
}