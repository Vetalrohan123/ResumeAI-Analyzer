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
  process.env.NODE_ENV ||
  "development";

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
  "================================================"
);

/* ============================================================================
   TRUST PROXY
============================================================================ */

/*
 * Required when deployed behind:
 *
 * - Render
 * - Railway
 * - Nginx
 * - AWS Load Balancer
 * - Cloudflare
 *
 * Important for:
 *
 * - HTTPS
 * - secure cookies
 * - rate limiting
 * - req.ip
 */

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

    /*
     * Disabled because the frontend/API
     * may need to load resources across origins.
     */
    crossOriginEmbedderPolicy: false,

    referrerPolicy: {
      policy:
        "strict-origin-when-cross-origin",
    },
  })
);

/* ============================================================================
   GLOBAL RATE LIMITER
============================================================================ */

app.use(
  globalRateLimiter
);

/* ============================================================================
   HTTP REQUEST LOGGER
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

/*
 * These limits apply to JSON/urlencoded requests.
 *
 * Resume uploads use Multer and therefore
 * are not affected by these limits.
 */

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

app.use(
  "/api/resume-builder",
  resumeBuilderRoutes
);

app.use(
  "/api/resume-builder/ai",
  resumeBuilderAIRoutes
);


app.get(
  "/api/test-route",
  (_req, res) => {
    return res.json({
      success: true,
      message: "Test route works",
    });
  }
); 

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

/*
 * IMPORTANT:
 *
 * This MUST be the final middleware.
 *
 * It must come after:
 *
 * - all routes
 * - 404 handler
 */

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
        `🚀 Server running on http://localhost:${PORT}`
      );

      console.log(
        `📡 API: http://localhost:${PORT}/api`
      );

      console.log(
        `❤️ Health: http://localhost:${PORT}/`
      );

      console.log(
        `❤️ API Health: http://localhost:${PORT}/api/health`
      );

      console.log(
        `🔐 Auth API: http://localhost:${PORT}/api/auth`
      );

      console.log(
        `📄 Resume API: http://localhost:${PORT}/api/resumes`
      );

      console.log(
        `💼 Job API: http://localhost:${PORT}/api/jobs`
      );

      console.log(
        `🎯 Match API: http://localhost:${PORT}/api/matches`
      );

      console.log(
        `📊 Dashboard API: http://localhost:${PORT}/api/dashboard`
      );

      console.log(
        `👑 Admin API: http://localhost:${PORT}/api/admin`
      );

      console.log(
        `📊 Analysis API: http://localhost:${PORT}/api/analysis`
      );

      console.log(
        `🤖 Job Matching API: http://localhost:${PORT}/api/job-matching`
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

  /*
   * Stop accepting new connections.
   */

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

  /*
   * Force shutdown after 10 seconds.
   */

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
   UNHANDLED PROMISE REJECTION
============================================================================ */

process.on(
  "unhandledRejection",
  (reason) => {
    console.error(
      "❌ Unhandled Promise Rejection:",
      reason
    );

    /*
     * The process manager/container
     * should restart the application
     * if this becomes a fatal condition.
     */
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

