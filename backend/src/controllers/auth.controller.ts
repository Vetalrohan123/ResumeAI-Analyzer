import type {
  Request,
  Response,
  NextFunction,
} from "express";

import { AuthService } from "../services/auth.service.js";

const isProduction =
  process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,

  secure: isProduction,

  sameSite: isProduction
    ? ("none" as const)
    : ("lax" as const),

  path: "/",
};

const accessTokenCookieOptions = {
  ...cookieOptions,

  maxAge: 15 * 60 * 1000,
};

const refreshTokenCookieOptions = {
  ...cookieOptions,

  maxAge:
    7 * 24 * 60 * 60 * 1000,
};

export class AuthController {

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

      res.cookie(
        "accessToken",
        result.accessToken,
        accessTokenCookieOptions
      );

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

        user:
          result.user,
      });

    } catch (error) {
      console.error(
        "[AUTH] Registration error:",
        error
      );

      return next(error);
    }
  }

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

      /*
       * HTTP-only access token
       */

      res.cookie(
        "accessToken",
        result.accessToken,
        accessTokenCookieOptions
      );

      /*
       * HTTP-only refresh token
       */

      res.cookie(
        "refreshToken",
        result.refreshToken,
        refreshTokenCookieOptions
      );

      console.log(
        "[AUTH] Cookies set successfully"
      );

      console.log(
        "[AUTH] Login successful"
      );

      /*
       * IMPORTANT:
       *
       * We don't need to send the tokens
       * in JSON because they're already
       * stored in HTTP-only cookies.
       */

      return res.status(200).json({
        success: true,

        message:
          "Login successful.",

        user:
          result.user,
      });

    } catch (error) {
      console.error(
        "[AUTH] Login error:",
        error
      );

      return next(error);
    }
  }

  static async me(
    req: Request,
    res: Response
  ) {
    console.log(
      "[AUTH] GET /me"
    );

    console.log(
      "[AUTH] Cookies:",
      Object.keys(
        req.cookies || {}
      )
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

      user:
        req.user,
    });
  }

  static async logout(
    _req: Request,
    res: Response
  ) {
    console.log(
      "[AUTH] Logout started"
    );

    res.clearCookie(
      "accessToken",
      cookieOptions
    );

    res.clearCookie(
      "refreshToken",
      cookieOptions
    );

    return res.status(200).json({
      success: true,

      message:
        "Logged out successfully.",
    });
  }
}