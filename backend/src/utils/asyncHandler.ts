import type {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";

export function asyncHandler(
  handler: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<any>
): RequestHandler {
  return (
    req,
    res,
    next
  ) => {
    Promise.resolve(
      handler(req, res, next)
    ).catch(next);
  };
}