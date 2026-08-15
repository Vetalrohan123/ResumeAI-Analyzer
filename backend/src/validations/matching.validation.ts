import { z } from "zod";

export const matchResumeSchema =
  z.object({

    body: z.object({}),

    params: z.object({

      jobId: z
        .string()
        .min(1),

      resumeId: z
        .string()
        .min(1),

    }),

    query: z.object({}),

  });


export const getJobMatchesSchema =
  z.object({

    body: z.object({}),

    params: z.object({

      jobId: z
        .string()
        .min(1),

    }),

    query: z.object({}),

  });