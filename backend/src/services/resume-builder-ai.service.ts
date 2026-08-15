import { GoogleGenAI } from "@google/genai";

/* ============================================================================
   TYPES
   ========================================================================== */

/**
 * Accept both the new underscore format and the older
 * frontend hyphen format.
 *
 * This prevents "Invalid AI action" errors when the
 * frontend/backend are temporarily using different names.
 */
export type ResumeAIAction =
  | "improve_summary"
  | "improve_summary"
  | "improve-experience"
  | "improve_bullets"
  | "improve-bullets"
  | "optimize_skills"
  | "optimize-skills"
  | "improve_project"
  | "improve-project"
  | "assistant";

export interface ResumeAIRequest {
  action: ResumeAIAction | string;
  content?: string;
  context?: string;
  jobDescription?: string;
}

/* ============================================================================
   GEMINI CLIENT
   ========================================================================== */

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    "GEMINI_API_KEY is not configured.",
  );
}

const ai = new GoogleGenAI({
  apiKey,
});

/**
 * Gemini 3.6 Flash
 *
 * This is the current stable model.
 */
const MODEL =
  process.env.GEMINI_MODEL ||
  "gemini-3.6-flash";

/* ============================================================================
   NORMALIZED ACTION
   ========================================================================== */

type NormalizedResumeAIAction =
  | "improve_summary"
  | "improve_experience"
  | "optimize_skills"
  | "improve_project"
  | "assistant";

/* ============================================================================
   SERVICE
   ========================================================================== */

export class ResumeBuilderAIService {
  /* ==========================================================================
     MAIN AI METHOD
     ======================================================================== */

  static async generate(
    data: ResumeAIRequest,
  ) {
    /* ------------------------------------------------------------------------
       BASIC VALIDATION
       ---------------------------------------------------------------------- */

    if (!data) {
      throw new Error(
        "AI request data is required.",
      );
    }

    if (!data.action) {
      throw new Error(
        "AI action is required.",
      );
    }

    /* ------------------------------------------------------------------------
       NORMALIZE ACTION
       ---------------------------------------------------------------------- */

    const action =
      this.normalizeAction(data.action);

    console.log(
      "[RESUME AI] Requested action:",
      data.action,
    );

    console.log(
      "[RESUME AI] Normalized action:",
      action,
    );

    /* ------------------------------------------------------------------------
       CONTENT
       ---------------------------------------------------------------------- */

    const content =
      data.content?.trim() || "";

    const context =
      data.context?.trim() || "";

    const jobDescription =
      data.jobDescription?.trim() || "";

    /* ------------------------------------------------------------------------
       VALIDATION
       ---------------------------------------------------------------------- */

    if (
      action !== "assistant" &&
      !content
    ) {
      throw new Error(
        "Content is required for this AI action.",
      );
    }

    /* ------------------------------------------------------------------------
       BUILD PROMPT
       ---------------------------------------------------------------------- */

    const prompt =
      this.buildPrompt({
        action,
        content,
        context,
        jobDescription,
      });

    /* ------------------------------------------------------------------------
       GEMINI REQUEST
       ---------------------------------------------------------------------- */

    try {
      console.log(
        `[RESUME AI] Generating response using ${MODEL}`,
      );

      const response =
        await ai.models.generateContent({
          model: MODEL,

          contents: prompt,

          config: {
            /*
             * Gemini 3.6 Flash is the selected model.
             *
             * Keep the request simple and compatible.
             */
            maxOutputTokens: 1200,

            systemInstruction:
              `
You are ResumeAI, an expert resume writer,
ATS optimization specialist, and technical
recruiter.

Your job is to improve resumes for real
software engineering, full-stack development,
and technology jobs.

Rules:

1. Never invent employment history.
2. Never invent degrees.
3. Never invent companies.
4. Never invent metrics.
5. Never invent technologies.
6. Never invent projects.
7. Never invent achievements.
8. Preserve factual information.
9. Use strong professional language.
10. Prefer concise ATS-friendly writing.
11. Use strong action verbs.
12. Avoid unnecessary buzzwords.
13. Do not add markdown headings unless
    specifically requested.
14. Return only the requested result.
15. Do not explain what you changed unless
    specifically requested.
              `.trim(),
          },
        });

      /* ----------------------------------------------------------------------
         RESPONSE TEXT
         -------------------------------------------------------------------- */

      const text =
        response.text?.trim();

      if (!text) {
        throw new Error(
          "Gemini returned an empty response.",
        );
      }

      /* ----------------------------------------------------------------------
         CLEAN RESPONSE
         -------------------------------------------------------------------- */

      const result =
        this.cleanResponse(text);

      console.log(
        "[RESUME AI] Generation successful.",
      );

      console.log(
        "[RESUME AI] Model:",
        MODEL,
      );

      return {
        action,
        result,
        model: MODEL,
      };
    } catch (error) {
      console.error(
        "[RESUME AI] Gemini error:",
        error,
      );

      if (error instanceof Error) {
        throw new Error(
          `Gemini AI failed: ${error.message}`,
        );
      }

      throw new Error(
        "Gemini AI failed.",
      );
    }
  }

  /* ==========================================================================
     NORMALIZE ACTION
     ========================================================================== */

  private static normalizeAction(
    action: string,
  ): NormalizedResumeAIAction {
    const normalized =
      action.trim().toLowerCase();

    switch (normalized) {
      /* ----------------------------------------------------------------------
         SUMMARY
         -------------------------------------------------------------------- */

      case "improve_summary":
      case "improve-summary":
        return "improve_summary";

      /* ----------------------------------------------------------------------
         EXPERIENCE
         -------------------------------------------------------------------- */

      case "improve_experience":
      case "improve-experience":
      case "improve_bullets":
      case "improve-bullets":
        return "improve_experience";

      /* ----------------------------------------------------------------------
         SKILLS
         -------------------------------------------------------------------- */

      case "optimize_skills":
      case "optimize-skills":
        return "optimize_skills";

      /* ----------------------------------------------------------------------
         PROJECT
         -------------------------------------------------------------------- */

      case "improve_project":
      case "improve-project":
        return "improve_project";

      /* ----------------------------------------------------------------------
         ASSISTANT
         -------------------------------------------------------------------- */

      case "assistant":
        return "assistant";

      /* ----------------------------------------------------------------------
         INVALID
         -------------------------------------------------------------------- */

      default:
        throw new Error(
          `Invalid AI action: ${action}`,
        );
    }
  }

  /* ==========================================================================
     BUILD PROMPT
     ========================================================================== */

  private static buildPrompt({
    action,
    content,
    context,
    jobDescription,
  }: {
    action: NormalizedResumeAIAction;
    content: string;
    context: string;
    jobDescription: string;
  }) {
    /* ------------------------------------------------------------------------
       SUMMARY
       ---------------------------------------------------------------------- */

    if (
      action === "improve_summary"
    ) {
      return `
Improve the following professional resume summary.

Requirements:

- Keep the same factual information.
- Make it concise and ATS-friendly.
- Target software engineering and full-stack
  developer roles.
- Highlight relevant technical skills.
- Use strong professional language.
- Keep it around 60-100 words.
- Do not add information that isn't present.
- Do not invent achievements.
- Do not invent metrics.

Current summary:

${content}

Additional context:

${context || "None"}

Return only the improved summary.
      `.trim();
    }

    /* ------------------------------------------------------------------------
       EXPERIENCE
       ---------------------------------------------------------------------- */

    if (
      action === "improve_experience"
    ) {
      return `
Rewrite the following work experience into
strong resume bullet points.

Requirements:

- Preserve the original facts.
- Do not invent metrics.
- Do not invent responsibilities.
- Do not invent technologies.
- Do not invent companies.
- Start bullets with strong action verbs.
- Make each bullet concise.
- Focus on impact, technology, and results.
- Optimize for ATS.
- Produce 3-6 bullet points.
- Each bullet should be on a separate line.
- Do not use bullet symbols such as "-", "*",
  or "•".
- Return plain text lines only.

Current experience:

${content}

Additional context:

${context || "None"}

Return only the improved bullet points.
      `.trim();
    }

    /* ------------------------------------------------------------------------
       SKILLS
       ---------------------------------------------------------------------- */

    if (
      action === "optimize_skills"
    ) {
      return `
Optimize the following resume skills section.

Requirements:

- Keep skills that are already present.
- Remove obvious duplicates.
- Correct capitalization.
- Group related technical skills logically.
- Prioritize relevant software engineering skills.
- Do not invent skills.
- Do not add technologies that aren't present.
- Use the job description only to prioritize
  skills that already exist in the candidate's
  skills list.
- Return a clean comma-separated list.

Current skills:

${content}

Job description:

${jobDescription || "None"}

Return only the optimized comma-separated skills.
      `.trim();
    }

    /* ------------------------------------------------------------------------
       PROJECT
       ---------------------------------------------------------------------- */

    if (
      action === "improve_project"
    ) {
      return `
Improve the following project description
for a professional software developer resume.

Requirements:

- Preserve the original facts.
- Do not invent users.
- Do not invent revenue.
- Do not invent metrics.
- Do not invent companies.
- Do not invent technologies.
- Explain what the project does.
- Highlight technical implementation.
- Mention important technologies already present.
- Make the description concise.
- Optimize for ATS.
- Keep it around 50-90 words.

Current project:

${content}

Additional context:

${context || "None"}

Return only the improved project description.
      `.trim();
    }

    /* ------------------------------------------------------------------------
       AI ASSISTANT
       ---------------------------------------------------------------------- */

    if (
      action === "assistant"
    ) {
      return `
You are an AI resume assistant.

Help the candidate improve their resume.

Candidate resume context:

${context || "No resume context provided."}

User request:

${
  content ||
  "Provide useful recommendations for improving this resume."
}

Job description:

${jobDescription || "None"}

Give practical and concise advice.

Focus on:

- ATS optimization
- Resume structure
- Technical skills
- Professional summary
- Experience bullet points
- Project descriptions
- Missing information
- Keyword optimization

Do not invent candidate information.

Return a concise helpful response.
      `.trim();
    }

    /* ------------------------------------------------------------------------
       SAFETY FALLBACK
       ---------------------------------------------------------------------- */

    throw new Error(
      `Unsupported AI action: ${action}`,
    );
  }

  /* ==========================================================================
     CLEAN GEMINI RESPONSE
     ========================================================================== */

  private static cleanResponse(
    text: string,
  ): string {
    return text
      .replace(
        /^```[a-zA-Z]*\n?/i,
        "",
      )
      .replace(
        /\n?```$/i,
        "",
      )
      .trim();
  }
}