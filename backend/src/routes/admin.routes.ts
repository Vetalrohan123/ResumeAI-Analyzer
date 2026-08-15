import {
Router
} from "express";


import {
AdminController
} from "../controllers/admin.controller.js";


import {
authenticate
} from "../middleware/auth.middleware.js";


import {
requireAdmin
} from "../middleware/role.middleware.js";



const router = Router();



router.use(
 authenticate,
 requireAdmin
);



router.get(
"/users",
AdminController.users
);


router.get(
"/resumes",
AdminController.resumes
);


router.get(
"/jobs",
AdminController.jobs
);


router.get(
"/matches",
AdminController.matches
);


router.delete(
"/users/:id",
AdminController.deleteUser
);



export default router;