import type {
  Response,
  NextFunction,
} from "express";

import jwt, {
  type JwtPayload as JsonWebTokenPayload,
} from "jsonwebtoken";

import { prisma } from "../config/prisma.js";

import type {
  AuthenticatedRequest,
} from "../types/auth.types.js";

/* ============================================================================
   JWT PAYLOAD
   ========================================================================== */

interface AuthTokenPayload
  extends JsonWebTokenPayload {
  id?: string;
  userId?: string;
  email?: string;
  role?: string;
}

/* ============================================================================
   AUTHENTICATION MIDDLEWARE
   ============================================================================
   
   Supports:

   1. HTTP-only cookie
      accessToken

   2. Authorization header
      Bearer <token>

   Flow:

   Request
      ↓
   Get token
      ↓
   Verify JWT
      ↓
   Extract user ID
      ↓
   Find user in PostgreSQL
      ↓
   Attach user to req.user
      ↓
   next()

   ========================================================================== */

export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    console.log(
      "================================================"
    );

    console.log(
      "[AUTH] Checking authentication..."
    );

    /* ========================================================================
       1. GET TOKEN
       ====================================================================== */

    let token: string | undefined;

    /* ========================================================================
       2. CHECK HTTP-ONLY COOKIE
       ====================================================================== */

    const cookieToken =
      req.cookies?.accessToken;

    if (
      typeof cookieToken === "string" &&
      cookieToken.trim().length > 0
    ) {
      token =
        cookieToken.trim();

      console.log(
        "[AUTH] Token found in HTTP-only cookie"
      );
    }

    /* ========================================================================
       3. CHECK AUTHORIZATION HEADER
       ====================================================================== */

    if (!token) {
      const authHeader =
        req.headers.authorization;

      if (
        typeof authHeader === "string" &&
        authHeader.trim().length > 0
      ) {
        console.log(
          "[AUTH] Authorization header present"
        );

        /* --------------------------------------------------------------------
           Validate Bearer format
           ------------------------------------------------------------------ */

        if (
          !authHeader
            .trim()
            .toLowerCase()
            .startsWith("bearer ")
        ) {
          console.error(
            "[AUTH] Invalid Authorization header format"
          );

          res.status(401).json({
            success: false,
            message:
              "Invalid authorization format",
          });

          return;
        }

        /* --------------------------------------------------------------------
           Extract token
           ------------------------------------------------------------------ */

        const bearerToken =
          authHeader
            .trim()
            .slice(7)
            .trim();

        if (!bearerToken) {
          console.error(
            "[AUTH] Bearer token is empty"
          );

          res.status(401).json({
            success: false,
            message:
              "Authentication required",
          });

          return;
        }

        token =
          bearerToken;

        console.log(
          "[AUTH] Using Bearer token"
        );
      }
    }

    /* ========================================================================
       4. TOKEN REQUIRED
       ====================================================================== */

    if (!token) {
      console.error(
        "[AUTH] Authentication token missing"
      );

      console.log(
        "[AUTH] Authorization header:",
        req.headers.authorization
          ? "present"
          : "missing"
      );

      console.log(
        "[AUTH] Cookies received:",
        Object.keys(
          req.cookies || {}
        )
      );

      res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });

      return;
    }

    /* ========================================================================
       5. JWT SECRET
       ====================================================================== */

    const secret =
      process.env.JWT_SECRET;

    if (
      !secret ||
      secret.trim().length === 0
    ) {
      console.error(
        "[AUTH] JWT_SECRET is not configured"
      );

      res.status(500).json({
        success: false,
        message:
          "Server authentication configuration error",
      });

      return;
    }

    /* ========================================================================
       6. VERIFY JWT
       ====================================================================== */

    let decoded: AuthTokenPayload;

    try {
      const verified =
        jwt.verify(
          token,
          secret
        );

      /* ----------------------------------------------------------------------
         JWT payload must be an object
         -------------------------------------------------------------------- */

      if (
        typeof verified === "string"
      ) {
        console.error(
          "[AUTH] JWT payload is a string"
        );

        res.status(401).json({
          success: false,
          message:
            "Invalid authentication token",
        });

        return;
      }

      decoded =
        verified as AuthTokenPayload;

      console.log(
        "[AUTH] JWT verified successfully"
      );

      console.log(
        "[AUTH] JWT payload:",
        {
          id: decoded.id,
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role,
        }
      );
    } catch (error) {
      /* ----------------------------------------------------------------------
         Token expired
         -------------------------------------------------------------------- */

      if (
        error instanceof
        jwt.TokenExpiredError
      ) {
        console.error(
          "[AUTH] Access token expired"
        );

        res.status(401).json({
          success: false,
          message:
            "Authentication token expired",
        });

        return;
      }

      /* ----------------------------------------------------------------------
         Invalid token
         -------------------------------------------------------------------- */

      if (
        error instanceof
        jwt.JsonWebTokenError
      ) {
        console.error(
          "[AUTH] Invalid JWT:",
          error.message
        );

        res.status(401).json({
          success: false,
          message:
            "Invalid authentication token",
        });

        return;
      }

      /* ----------------------------------------------------------------------
         Unknown JWT error
         -------------------------------------------------------------------- */

      console.error(
        "[AUTH] JWT verification failed:",
        error
      );

      res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });

      return;
    }

    /* ========================================================================
       7. GET USER ID FROM JWT
       ====================================================================== */

    const userId =
      decoded.id ??
      decoded.userId;

    if (
      !userId ||
      typeof userId !== "string" ||
      userId.trim().length === 0
    ) {
      console.error(
        "[AUTH] JWT does not contain a valid user ID"
      );

      console.error(
        "[AUTH] JWT payload:",
        decoded
      );

      res.status(401).json({
        success: false,
        message:
          "Invalid authentication token",
      });

      return;
    }

    /* ========================================================================
       8. LOAD USER FROM DATABASE
       ====================================================================== */

    console.log(
      "[AUTH] Looking up user:",
      userId
    );

    const user =
      await prisma.user.findUnique({
        where: {
          id: userId.trim(),
        },

        select: {
          id: true,
          email: true,
          role: true,
        },
      });

    /* ========================================================================
       9. USER NOT FOUND
       ====================================================================== */

    if (!user) {
      console.error(
        "[AUTH] User no longer exists:",
        userId
      );

      res.status(401).json({
        success: false,
        message:
          "User account no longer exists",
      });

      return;
    }

    /* ========================================================================
       10. ATTACH USER TO REQUEST
       ====================================================================== */

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    /* ========================================================================
       11. AUTH SUCCESS LOG
       ====================================================================== */

    console.log(
      "[AUTH] User authenticated successfully"
    );

    console.log(
      "[AUTH] User ID:",
      user.id
    );

    console.log(
      "[AUTH] User email:",
      user.email
    );

    console.log(
      "[AUTH] User role:",
      user.role
    );

    console.log(
      "================================================"
    );

    /* ========================================================================
       12. CONTINUE REQUEST
       ====================================================================== */

    next();
  } catch (error) {
    console.error(
      "[AUTH] Unexpected authentication error:",
      error
    );

    res.status(401).json({
      success: false,
      message:
        "Authentication required",
    });
  }
}

/* ============================================================================
   ALIAS
   ========================================================================== */

export const authMiddleware =
  authenticate;