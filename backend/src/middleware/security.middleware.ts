import type {
  Request,
  Response,
  NextFunction,
} from "express";

import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

const allowedOrigins = (
  process.env.FRONTEND_URL ||
  "http://localhost:3000"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const corsMiddleware = cors({
  origin: (
    origin,
    callback
  ) => {

    if (!origin) {
      callback(null, true);
      return;
    }

    if (
      allowedOrigins.includes(
        origin
      )
    ) {
      callback(null, true);
      return;
    }

    console.warn(
      "[SECURITY] CORS request blocked:",
      origin
    );

    callback(
      new Error(
        "Not allowed by CORS"
      )
    );
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],
});

/* ============================================================================
   HELMET
   ========================================================================== */

export const helmetMiddleware =
  helmet({
    contentSecurityPolicy:
      false,

    crossOriginEmbedderPolicy:
      false,

    frameguard: {
      action: "deny",
    },

    referrerPolicy: {
      policy:
        "strict-origin-when-cross-origin",
    },
  });

/* ============================================================================
   GLOBAL RATE LIMITER
   ========================================================================== */

export const globalRateLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    limit: 300,

    standardHeaders:
      "draft-8",

    legacyHeaders:
      false,

    message: {
      success: false,
      message:
        "Too many requests. Please try again later.",
    },

    handler: (
      req: Request,
      res: Response
    ) => {
      console.warn(
        "[SECURITY] Global rate limit exceeded:",
        req.ip
      );

      res.status(429).json({
        success: false,
        message:
          "Too many requests. Please try again later.",
      });
    },
  });

/* ============================================================================
   AUTH RATE LIMITER
   ========================================================================== */

export const authRateLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    limit: 10,

    standardHeaders:
      "draft-8",

    legacyHeaders:
      false,

    skipSuccessfulRequests:
      true,

    message: {
      success: false,
      message:
        "Too many authentication attempts. Please try again later.",
    },

    handler: (
      req: Request,
      res: Response
    ) => {
      console.warn(
        "[SECURITY] Authentication rate limit exceeded:",
        req.ip
      );

      res.status(429).json({
        success: false,
        message:
          "Too many authentication attempts. Please try again later.",
      });
    },
  });

/* ============================================================================
   AI RATE LIMITER
   ========================================================================== */

export const aiRateLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    limit: 20,

    standardHeaders:
      "draft-8",

    legacyHeaders:
      false,

    message: {
      success: false,
      message:
        "AI usage limit reached. Please try again later.",
    },

    handler: (
      req: Request,
      res: Response
    ) => {
      console.warn(
        "[SECURITY] AI rate limit exceeded:",
        req.ip
      );

      res.status(429).json({
        success: false,
        message:
          "Too many AI requests. Please try again later.",
      });
    },
  });

/* ============================================================================
   UPLOAD RATE LIMITER
   ========================================================================== */

export const uploadRateLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    limit: 20,

    standardHeaders:
      "draft-8",

    legacyHeaders:
      false,

    message: {
      success: false,
      message:
        "Too many resume uploads. Please try again later.",
    },

    handler: (
      req: Request,
      res: Response
    ) => {
      console.warn(
        "[SECURITY] Upload rate limit exceeded:",
        req.ip
      );

      res.status(429).json({
        success: false,
        message:
          "Too many resume uploads. Please try again later.",
      });
    },
  });

/* ============================================================================
   REQUEST LOGGING
   ========================================================================== */

export function securityRequestLogger(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  console.log(
    `[REQUEST] ${req.method} ${req.originalUrl} - IP: ${req.ip}`
  );

  next();
}

