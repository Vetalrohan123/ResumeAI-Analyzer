import "dotenv/config";

import express from "express";

import type {
  Request,
  Response,
  NextFunction,
} from "express";

import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";

import { errorMiddleware } from "./middleware/error.middleware.js";

import authRoutes from "./routes/auth.routes.js";
import resumeRoutes from "./routes/resume.routes.js";
import jobRoutes from "./routes/job.routes.js";
import matchRoutes from "./routes/match.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import analysisRoutes from "./routes/analysis.routes.js";
import jobMatchingRoutes from "./routes/job-matching.routes.js";
import resumeBuilderRoutes from "./routes/resume-builder.routes.js";
import resumeBuilderAIRoutes from "./routes/resume-builder-ai.routes.js";

import {
  globalRateLimiter,
} from "./middleware/security.middleware.js";

/* ============================================================================
   APP
============================================================================ */

const app = express();

/* ============================================================================
   ENVIRONMENT
============================================================================ */

const NODE_ENV =
  process.env.NODE_ENV || "development";

const isProduction =
  NODE_ENV === "production";

/* ============================================================================
   PORT
============================================================================ */

const PORT =
  Number(process.env.PORT) || 5000;

/* ============================================================================
   CLIENT URL
============================================================================ */

/*
 * IMPORTANT:
 *
 * On Render set:
 *
 * CLIENT_URL=https://resumeai-app.onrender.com
 *
 * Do NOT put /api here.
 *
 * Correct:
 * https://resumeai-app.onrender.com
 *
 * Wrong:
 * https://resumeai-app.onrender.com/api
 */

const CLIENT_URL =
  process.env.CLIENT_URL ||
  "http://localhost:3000";

/* ============================================================================
   STARTUP LOG
============================================================================ */

console.log(
  "================================================"
);

console.log(
  "🚀 AI Resume Analyzer API"
);

console.log(
  "================================================"
);

console.log(
  "🌍 Environment:",
  NODE_ENV
);

console.log(
  "🌐 Client URL:",
  CLIENT_URL
);

console.log(
  "🚀 API Port:",
  PORT
);

console.log(
  "🍪 Production cookies:",
  isProduction
);

console.log(
  "================================================"
);

/* ============================================================================
   TRUST PROXY
============================================================================ */

if (isProduction) {
  app.set(
    "trust proxy",
    1
  );
}

/* ============================================================================
   REQUEST LOGGER
============================================================================ */

app.use(
  (
    req: Request,
    _res: Response,
    next: NextFunction
  ) => {
    console.log(
      `[API] ${req.method} ${req.originalUrl}`
    );

    console.log(
      "[API] Origin:",
      req.headers.origin
    );

    next();
  }
);

/* ============================================================================
   COOKIE PARSER
============================================================================ */

app.use(
  cookieParser()
);

/* ============================================================================
   CORS
============================================================================ */

/*
 * The frontend and backend are on different origins.
 *
 * credentials: true is REQUIRED because we use
 * HTTP-only authentication cookies.
 */

app.use(
  cors({
    origin: CLIENT_URL,

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
      "Accept",
    ],

    exposedHeaders: [
      "Set-Cookie",
    ],
  })
);

/* ============================================================================
   SECURITY HEADERS
============================================================================ */

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },

    crossOriginEmbedderPolicy: false,

    referrerPolicy: {
      policy:
        "strict-origin-when-cross-origin",
    },
  })
);

/* ============================================================================
   RATE LIMITER
============================================================================ */

app.use(
  globalRateLimiter
);

/* ============================================================================
   HTTP LOGGER
============================================================================ */

if (isProduction) {
  app.use(
    morgan("combined")
  );
} else {
  app.use(
    morgan("dev")
  );
}

/* ============================================================================
   BODY PARSER
============================================================================ */

app.use(
  express.json({
    limit: "2mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "2mb",
  })
);

/* ============================================================================
   ROOT HEALTH CHECK
============================================================================ */

app.get(
  "/",
  (
    _req: Request,
    res: Response
  ) => {
    return res.status(200).json({
      success: true,

      message:
        "AI Resume Analyzer API Running 🚀",

      environment:
        NODE_ENV,

      timestamp:
        new Date().toISOString(),
    });
  }
);

/* ============================================================================
   API HEALTH CHECK
============================================================================ */

app.get(
  "/api/health",
  (
    _req: Request,
    res: Response
  ) => {
    return res.status(200).json({
      success: true,

      message:
        "API is healthy",

      environment:
        NODE_ENV,

      timestamp:
        new Date().toISOString(),
    });
  }
);

/* ============================================================================
   AUTH ROUTES
============================================================================ */

app.use(
  "/api/auth",
  authRoutes
);

/* ============================================================================
   RESUME ROUTES
============================================================================ */

app.use(
  "/api/resumes",
  resumeRoutes
);

/* ============================================================================
   JOB ROUTES
============================================================================ */

app.use(
  "/api/jobs",
  jobRoutes
);

/* ============================================================================
   MATCH ROUTES
============================================================================ */

app.use(
  "/api/matches",
  matchRoutes
);

/* ============================================================================
   DASHBOARD ROUTES
============================================================================ */

app.use(
  "/api/dashboard",
  dashboardRoutes
);

/* ============================================================================
   ADMIN ROUTES
============================================================================ */

app.use(
  "/api/admin",
  adminRoutes
);

/* ============================================================================
   ANALYSIS ROUTES
============================================================================ */

app.use(
  "/api/analysis",
  analysisRoutes
);

/* ============================================================================
   JOB MATCHING ROUTES
============================================================================ */

app.use(
  "/api/job-matching",
  jobMatchingRoutes
);

/* ============================================================================
   RESUME BUILDER
============================================================================ */

app.use(
  "/api/resume-builder",
  resumeBuilderRoutes
);

/* ============================================================================
   RESUME BUILDER AI
============================================================================ */

app.use(
  "/api/resume-builder/ai",
  resumeBuilderAIRoutes
);

/* ============================================================================
   TEST ROUTE
============================================================================ */

app.get(
  "/api/test-route",
  (
    _req: Request,
    res: Response
  ) => {
    return res.status(200).json({
      success: true,
      message:
        "Test route works",
    });
  }
);

/* ============================================================================
   404 HANDLER
============================================================================ */

app.use(
  (
    req: Request,
    res: Response
  ) => {
    console.warn(
      `❌ 404 Route Not Found: ${req.method} ${req.originalUrl}`
    );

    return res.status(404).json({
      success: false,

      message:
        "Route Not Found",

      path:
        req.originalUrl,
    });
  }
);

/* ============================================================================
   GLOBAL ERROR HANDLER
============================================================================ */

app.use(
  errorMiddleware
);

/* ============================================================================
   START SERVER
============================================================================ */

const server =
  app.listen(
    PORT,
    () => {
      console.log(
        "================================================"
      );

      console.log(
        `🚀 Server running on port ${PORT}`
      );

      console.log(
        `📡 API: /api`
      );

      console.log(
        `❤️ Health: /`
      );

      console.log(
        `❤️ API Health: /api/health`
      );

      console.log(
        `🔐 Auth API: /api/auth`
      );

      console.log(
        `📄 Resume API: /api/resumes`
      );

      console.log(
        `💼 Job API: /api/jobs`
      );

      console.log(
        `🎯 Match API: /api/matches`
      );

      console.log(
        `📊 Dashboard API: /api/dashboard`
      );

      console.log(
        `👑 Admin API: /api/admin`
      );

      console.log(
        `📊 Analysis API: /api/analysis`
      );

      console.log(
        `🤖 Job Matching API: /api/job-matching`
      );

      console.log(
        "================================================"
      );
    }
  );

/* ============================================================================
   GRACEFUL SHUTDOWN
============================================================================ */

let isShuttingDown =
  false;

const shutdown = (
  signal: string
) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown =
    true;

  console.log(
    `\n🛑 ${signal} received. Shutting down server...`
  );

  server.close(
    (error) => {
      if (error) {
        console.error(
          "❌ Error while closing HTTP server:",
          error
        );

        process.exit(1);
      }

      console.log(
        "✅ HTTP server closed."
      );

      process.exit(0);
    }
  );

  setTimeout(
    () => {
      console.error(
        "⚠️ Forced shutdown after timeout."
      );

      process.exit(1);
    },
    10000
  ).unref();
};

/* ============================================================================
   SIGTERM
============================================================================ */

process.on(
  "SIGTERM",
  () => {
    shutdown(
      "SIGTERM"
    );
  }
);

/* ============================================================================
   SIGINT
============================================================================ */

process.on(
  "SIGINT",
  () => {
    shutdown(
      "SIGINT"
    );
  }
);

/* ============================================================================
   UNHANDLED REJECTION
============================================================================ */

process.on(
  "unhandledRejection",
  (reason) => {
    console.error(
      "❌ Unhandled Promise Rejection:",
      reason
    );
  }
);

/* ============================================================================
   UNCAUGHT EXCEPTION
============================================================================ */

process.on(
  "uncaughtException",
  (error) => {
    console.error(
      "❌ Uncaught Exception:",
      error
    );

    shutdown(
      "UNCAUGHT_EXCEPTION"
    );
  }
);

export default app;