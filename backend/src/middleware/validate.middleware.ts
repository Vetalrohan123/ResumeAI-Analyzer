import type {
  Request,
  Response,
  NextFunction,
} from "express";

import type {
  ZodSchema,
} from "zod";

export function validate(
  schema: ZodSchema
) {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {

      const result = schema.safeParse({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      if (!result.success) {

        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: result.error.issues.map(
            (issue) => ({
              field: issue.path.join("."),
              message: issue.message,
            })
          ),
        });

      }

      next();

    } catch (error) {

      next(error);

    }
  };
}