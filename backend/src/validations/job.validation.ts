import { z } from "zod";

const emptyParams =
  z.object({});

const emptyQuery =
  z.object({});


export const createJobSchema =
  z.object({

    body: z.object({

      title: z
        .string()
        .min(2)
        .max(200),

      company: z
        .string()
        .min(2)
        .max(200),

      location: z
        .string()
        .max(200)
        .optional(),

      employmentType: z
        .string()
        .max(100)
        .optional(),

      description: z
        .string()
        .min(
          20,
          "Job description must be at least 20 characters"
        ),

      requirements: z
        .string()
        .min(
          10,
          "Requirements are required"
        ),

      salary: z
        .string()
        .max(100)
        .optional(),

      requiredSkills: z
        .array(z.string())
        .min(
          1,
          "At least one required skill is needed"
        ),

      status: z
        .enum([
          "ACTIVE",
          "CLOSED",
          "DRAFT",
        ])
        .optional(),

    }),

    params: emptyParams,

    query: emptyQuery,

  });


export const updateJobSchema =
  z.object({

    body: z.object({

      title: z
        .string()
        .min(2)
        .max(200)
        .optional(),

      company: z
        .string()
        .min(2)
        .max(200)
        .optional(),

      location: z
        .string()
        .max(200)
        .optional(),

      employmentType: z
        .string()
        .max(100)
        .optional(),

      description: z
        .string()
        .min(20)
        .optional(),

      requirements: z
        .string()
        .min(10)
        .optional(),

      salary: z
        .string()
        .max(100)
        .optional(),

      requiredSkills: z
        .array(z.string())
        .optional(),

      status: z
        .enum([
          "ACTIVE",
          "CLOSED",
          "DRAFT",
        ])
        .optional(),

    }),

    params: z.object({

      id: z
        .string()
        .min(1),

    }),

    query: emptyQuery,

  });