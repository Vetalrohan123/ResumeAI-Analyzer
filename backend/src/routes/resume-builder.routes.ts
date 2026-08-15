import { Router } from "express";

import {
  ResumeBuilderController,
} from "../controllers/resume-builder.controller.js";

import {
  authenticate,
} from "../middleware/auth.middleware.js";

/* ==========================================================================
   RESUME BUILDER ROUTER

   Base URL:
   /api/resume-builder

   Routes:

   POST   /api/resume-builder
   GET    /api/resume-builder

   GET    /api/resume-builder/:id/pdf
   POST   /api/resume-builder/:id/duplicate

   GET    /api/resume-builder/:id
   PUT    /api/resume-builder/:id
   DELETE /api/resume-builder/:id

   ========================================================================== */

const router = Router();

/* ==========================================================================
   AUTHENTICATION

   Every Resume Builder endpoint requires an authenticated user.
   ========================================================================== */

router.use(authenticate);

/* ==========================================================================
   CREATE RESUME

   POST /api/resume-builder

   Body example:

   {
     "title": "Software Developer Resume",
     "candidateName": "Rohan Vetal",
     "candidateEmail": "rohan@example.com",
     "candidatePhone": "+91 9876543210",
     "location": "Pune, Maharashtra",
     "website": "https://example.com",
     "linkedin": "https://linkedin.com/in/example",
     "github": "https://github.com/example",
     "summary": "Full-stack developer...",
     "skills": [
       "JavaScript",
       "TypeScript",
       "React",
       "Node.js"
     ],
     "experience": [],
     "education": [],
     "projects": [],
     "certifications": [],
     "languages": [
       "English",
       "Hindi"
     ],
     "achievements": []
   }

   ========================================================================== */

router.post(
  "/",
  ResumeBuilderController.createResume
);

/* ==========================================================================
   GET ALL RESUMES

   GET /api/resume-builder

   Returns all resumes belonging to the authenticated user.

   ========================================================================== */

router.get(
  "/",
  ResumeBuilderController.getResumes
);

/* ==========================================================================
   GENERATE PDF

   GET /api/resume-builder/:id/pdf

   Optional query:

   ?template=modern
   ?template=professional
   ?template=minimal

   Example:

   GET /api/resume-builder/abc123/pdf?template=modern

   IMPORTANT:
   This route must appear BEFORE /:id.

   ========================================================================== */

router.get(
  "/:id/pdf",
  ResumeBuilderController.generatePDF
);

/* ==========================================================================
   DUPLICATE RESUME

   POST /api/resume-builder/:id/duplicate

   Example:

   POST /api/resume-builder/abc123/duplicate

   IMPORTANT:
   This route must appear BEFORE /:id.

   ========================================================================== */

router.post(
  "/:id/duplicate",
  ResumeBuilderController.duplicateResume
);

/* ==========================================================================
   GET SINGLE RESUME

   GET /api/resume-builder/:id

   Example:

   GET /api/resume-builder/abc123

   ========================================================================== */

router.get(
  "/:id",
  ResumeBuilderController.getResume
);

/* ==========================================================================
   UPDATE RESUME

   PUT /api/resume-builder/:id

   Example:

   PUT /api/resume-builder/abc123

   ========================================================================== */

router.put(
  "/:id",
  ResumeBuilderController.updateResume
);

/* ==========================================================================
   DELETE RESUME

   DELETE /api/resume-builder/:id

   Example:

   DELETE /api/resume-builder/abc123

   ========================================================================== */

router.delete(
  "/:id",
  ResumeBuilderController.deleteResume
);

/* ==========================================================================
   EXPORT ROUTER
   ========================================================================== */

export default router;