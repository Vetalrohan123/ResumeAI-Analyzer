import { z } from "zod";

export const registerSchema =
  z.object({

    body: z.object({

      name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100),

      email: z
        .string()
        .email("Invalid email address")
        .toLowerCase(),

      password: z
        .string()
        .min(
          8,
          "Password must be at least 8 characters"
        )
        .max(100),

      company: z
        .string()
        .max(150)
        .optional(),

    }),

    params: z.object({}),

    query: z.object({}),

  });


export const loginSchema =
  z.object({

    body: z.object({

      email: z
        .string()
        .email("Invalid email address")
        .toLowerCase(),

      password: z
        .string()
        .min(
          1,
          "Password is required"
        ),

    }),

    params: z.object({}),

    query: z.object({}),

  });