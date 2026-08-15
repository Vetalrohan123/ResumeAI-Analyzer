import type {
  Request,
  Response,
  NextFunction,
} from "express";

import { HistoryService } from "../services/history.service.js";

export class HistoryController {
  static async getHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,  
          message:
            "Authentication required",
        });
      }

      const page = Math.max(
        Number(req.query.page) || 1,
        1
      );

      const limit = Math.min(
        Math.max(
          Number(req.query.limit) || 10,
          1
        ),
        50
      );

      const search =
        typeof req.query.search ===
        "string"
          ? req.query.search
          : "";

      const result =
        await HistoryService.getHistory(
          req.user.id,
          page,
          limit,
          search
        );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}