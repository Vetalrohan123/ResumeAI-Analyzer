import { z } from "zod";

/*
|--------------------------------------------------------------------------
| CREATE ANALYSIS SCHEMA
|--------------------------------------------------------------------------
*/

export const createAnalysisSchema =
  z.object({
    body: z.object({
      resumeId: z
        .string()
        .min(
          1,
          "Resume ID is required."
        ),

      jobId: z
        .string()
        .min(
          1,
          "Job ID is required."
        ),
    }),
  });

/*
|--------------------------------------------------------------------------
| ANALYSIS ID PARAMS SCHEMA
|--------------------------------------------------------------------------
*/

export const analysisIdSchema =
  z.object({
    params: z.object({
      id: z
        .string()
        .min(
          1,
          "Analysis ID is required."
        ),
    }),
  });