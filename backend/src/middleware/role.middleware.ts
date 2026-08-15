import type {
 Request,
 Response,
 NextFunction
} from "express";


export const requireAdmin = (
 req:Request,
 res:Response,
 next:NextFunction
)=>{


 if(!req.user){

   return res.status(401).json({

    message:"Unauthorized"

   });

 }


 if(req.user.role !== "ADMIN"){

   return res.status(403).json({

    message:"Admin access required"

   });

 }


 next();

};