import type {
  Request,
  Response,
  NextFunction,
} from "express";

import { AuthService } from "../services/auth.service.js";

/* ==========================================================================
   ENVIRONMENT
   ========================================================================== */

const isProduction =
  process.env.NODE_ENV === "production";

/* ==========================================================================
   COOKIE OPTIONS
   ========================================================================== */

const accessTokenCookieOptions = {
  httpOnly: true,

  secure: isProduction,

  sameSite: isProduction
    ? ("none" as const)
    : ("lax" as const),

  maxAge: 15 * 60 * 1000,

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

/* ==========================================================================
   AUTH CONTROLLER
   ========================================================================== */

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

      const result =
        await AuthService.register(
          req.body
        );

      if (!result.accessToken) {
        return res.status(500).json({
          success: false,
          message:
            "Access token was not generated.",
        });
      }

      if (!result.refreshToken) {
        return res.status(500).json({
          success: false,
          message:
            "Refresh token was not generated.",
        });
      }

      /* Set access token */

      res.cookie(
        "accessToken",
        result.accessToken,
        accessTokenCookieOptions
      );

      /* Set refresh token */

      res.cookie(
        "refreshToken",
        result.refreshToken,
        refreshTokenCookieOptions
      );

      console.log(
        "[AUTH] Registration successful"
      );

      return res.status(201).json({
        success: true,

        message:
          "Account created successfully.",

        user: result.user,
      });

    } catch (error) {

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

      const result =
        await AuthService.login(
          req.body
        );

      /* ----------------------------------------------------------------------
         Verify access token
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
         Verify refresh token
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

      console.log(
        "[AUTH] Login successful"
      );

      return res.status(200).json({
        success: true,

        message:
          "Login successful.",

        user: result.user,

        accessToken: result.accessToken,

        refreshToken: result.refreshToken,
      });

    } catch (error) {

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

    console.log(
      "[AUTH] GET /me"
    );

    console.log(
      "[AUTH] req.user:",
      req.user
    );

    if (!req.user) {

      return res.status(401).json({
        success: false,

        message:
          "Authentication required.",
      });
    }

    return res.status(200).json({

      success: true,

      message:
        "Authenticated user fetched successfully.",

      user: req.user,

    });
  }

  /* ==========================================================================
     LOGOUT
     ========================================================================== */

  static async logout(
    _req: Request,
    res: Response
  ) {

    console.log(
      "[AUTH] Logout started"
    );

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

    return res.status(200).json({

      success: true,

      message:
        "Logged out successfully.",

    });
  }
}