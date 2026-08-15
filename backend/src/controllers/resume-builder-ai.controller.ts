import type {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  ResumeBuilderAIService,
  type ResumeAIAction,
} from "../services/resume-builder-ai.service.js";

/* ============================================================================
   ALLOWED ACTIONS
============================================================================ */

/*
 * IMPORTANT:
 *
 * These values MUST match ResumeAIAction
 * inside resume-builder-ai.service.ts
 */

const ALLOWED_ACTIONS = [
  "improve-summary",
  "improve-bullets",
  "optimize-skills",
  "improve-project",
  "assistant",
] as const;

type AllowedAIAction =
  (typeof ALLOWED_ACTIONS)[number];

/* ============================================================================
   ACTION VALIDATION
============================================================================ */

function isValidAIAction(
  action: unknown,
): action is ResumeAIAction {
  return (
    typeof action === "string" &&
    ALLOWED_ACTIONS.includes(
      action as AllowedAIAction,
    )
  );
}

/* ============================================================================
   CONTROLLER
============================================================================ */

export class ResumeBuilderAIController {
  /* ==========================================================================
     GENERATE AI CONTENT
  ========================================================================== */

  static async generate(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      console.log(
        "================================================",
      );

      console.log(
        "[RESUME BUILDER AI] Request received",
      );

      console.log(
        "[RESUME BUILDER AI] Method:",
        req.method,
      );

      console.log(
        "[RESUME BUILDER AI] URL:",
        req.originalUrl,
      );

      console.log(
        "[RESUME BUILDER AI] Body:",
        req.body,
      );

      /* ----------------------------------------------------------------------
         BODY VALIDATION
      ---------------------------------------------------------------------- */

      const body =
        req.body &&
        typeof req.body === "object"
          ? req.body
          : {};

      const {
        action,
        content,
        context,
        jobDescription,
      } = body;

      /* ----------------------------------------------------------------------
         VALIDATE ACTION EXISTS
      ---------------------------------------------------------------------- */

      if (!action) {
        console.warn(
          "[RESUME BUILDER AI] Missing action",
        );

        return res.status(400).json({
          success: false,

          message:
            "AI action is required.",

          allowedActions:
            ALLOWED_ACTIONS,
        });
      }

      /* ----------------------------------------------------------------------
         VALIDATE ACTION
      ---------------------------------------------------------------------- */

      if (!isValidAIAction(action)) {
        console.error(
          "[RESUME BUILDER AI] Invalid action:",
          action,
        );

        return res.status(400).json({
          success: false,

          message:
            "Invalid AI action.",

          receivedAction:
            action,

          allowedActions:
            ALLOWED_ACTIONS,
        });
      }

      /* ----------------------------------------------------------------------
         VALIDATE CONTENT
      ---------------------------------------------------------------------- */

      const normalizedContent =
        typeof content === "string"
          ? content.trim()
          : "";

      const normalizedContext =
        typeof context === "string"
          ? context.trim()
          : "";

      const normalizedJobDescription =
        typeof jobDescription === "string"
          ? jobDescription.trim()
          : "";

      /*
       * Assistant does not require content.
       * All other actions require content.
       */

      if (
        action !== "assistant" &&
        !normalizedContent
      ) {
        console.warn(
          "[RESUME BUILDER AI] Missing content for action:",
          action,
        );

        return res.status(400).json({
          success: false,

          message:
            "Content is required for this AI action.",

          action,
        });
      }

      /* ----------------------------------------------------------------------
         LOG REQUEST
      ---------------------------------------------------------------------- */

      console.log(
        "[RESUME BUILDER AI] Action:",
        action,
      );

      console.log(
        "[RESUME BUILDER AI] Content length:",
        normalizedContent.length,
      );

      console.log(
        "[RESUME BUILDER AI] Context length:",
        normalizedContext.length,
      );

      console.log(
        "[RESUME BUILDER AI] Job description length:",
        normalizedJobDescription.length,
      );

      /* ----------------------------------------------------------------------
         CALL AI SERVICE
      ---------------------------------------------------------------------- */

      const result =
        await ResumeBuilderAIService.generate({
          action,

          content:
            normalizedContent,

          context:
            normalizedContext,

          jobDescription:
            normalizedJobDescription,
        });

      /* ----------------------------------------------------------------------
         SUCCESS
      ---------------------------------------------------------------------- */

      console.log(
        "[RESUME BUILDER AI] Generation successful",
      );

      console.log(
        "[RESUME BUILDER AI] Model:",
        result.model,
      );

      console.log(
        "================================================",
      );

      return res.status(200).json({
        success: true,

        message:
          "AI content generated successfully.",

        data: {
          action:
            result.action,

          result:
            result.result,

          model:
            result.model,
        },
      });
    } catch (error) {
      /* ----------------------------------------------------------------------
         ERROR
      ---------------------------------------------------------------------- */

      console.error(
        "[RESUME BUILDER AI] Error:",
        error,
      );

      return next(error);
    }
  }
}