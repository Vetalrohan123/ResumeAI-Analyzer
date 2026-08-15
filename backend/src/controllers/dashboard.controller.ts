import type {
  Request,
  Response,
} from "express";

import {
  DashboardService,
} from "../services/dashboard.service.js";


export class DashboardController {


  /*
  |--------------------------------------------------------------------------
  | Get Dashboard
  |--------------------------------------------------------------------------
  */

  static async getDashboard(
    req: Request,
    res: Response
  ) {

    try {

      /*
      |--------------------------------------------------------------------------
      | Get User ID
      |--------------------------------------------------------------------------
      */

      const userId =
        (req as any).user?.id;


      /*
      |--------------------------------------------------------------------------
      | Validate User
      |--------------------------------------------------------------------------
      */

      if (!userId) {

        return res.status(401).json({

          success: false,

          message:
            "User not authenticated",

        });

      }


      /*
      |--------------------------------------------------------------------------
      | Get Dashboard
      |--------------------------------------------------------------------------
      */

      const dashboard =
        await DashboardService.getDashboard(
          userId
        );


      /*
      |--------------------------------------------------------------------------
      | Response
      |--------------------------------------------------------------------------
      */

      return res.status(200).json({

        success: true,

        data:
          dashboard,

      });

    } catch (error) {

      console.error(
        "Dashboard Controller Error:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Failed to load dashboard",

      });

    }

  }

}