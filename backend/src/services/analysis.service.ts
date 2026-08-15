import { prisma } from "../config/prisma.js";
import { AIAnalysisService } from "./ai-analysis.service.js";

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

interface CreateAnalysisInput {
  resumeId: string;
  jobId: string;
  userId: string;
}

interface AIAnalysisResult {
  matchScore: number;

  matchedSkills: unknown;

  missingSkills: unknown;

  strengths: unknown;

  weaknesses: unknown;

  recommendations: unknown;

  hiringRecommendation: string;
}

/*
|--------------------------------------------------------------------------
| Analysis Service
|--------------------------------------------------------------------------
*/

export class AnalysisService {
  /*
  |--------------------------------------------------------------------------
  | CREATE / UPDATE ANALYSIS
  |--------------------------------------------------------------------------
  */

  static async create(
    data: CreateAnalysisInput
  ) {
    const {
      resumeId,
      jobId,
      userId,
    } = data;

    /*
    |--------------------------------------------------------------------------
    | Validate Input
    |--------------------------------------------------------------------------
    */

    if (!resumeId) {
      throw new Error(
        "Resume ID is required."
      );
    }

    if (!jobId) {
      throw new Error(
        "Job ID is required."
      );
    }

    if (!userId) {
      throw new Error(
        "User ID is required."
      );
    }

    console.log(
      "========================================"
    );

    console.log(
      "🤖 ANALYSIS STARTED"
    );

    console.log(
      "📄 Resume ID:",
      resumeId
    );

    console.log(
      "💼 Job ID:",
      jobId
    );

    console.log(
      "👤 User ID:",
      userId
    );

    console.log(
      "========================================"
    );

    /*
    |--------------------------------------------------------------------------
    | Find Resume
    |--------------------------------------------------------------------------
    */

    const resume =
      await prisma.resume.findFirst({
        where: {
          id: resumeId,

          uploadedById: userId,
        },
      });

    if (!resume) {
      throw new Error(
        "Resume not found or does not belong to this user."
      );
    }

    console.log(
      "✅ Resume found:",
      resume.id
    );

    /*
    |--------------------------------------------------------------------------
    | Validate Resume Text
    |--------------------------------------------------------------------------
    */

    if (
      !resume.extractedText ||
      !resume.extractedText.trim()
    ) {
      throw new Error(
        "Resume text is not available. Please upload the resume again."
      );
    }

    console.log(
      "✅ Resume text available."
    );

    /*
    |--------------------------------------------------------------------------
    | Find Job
    |--------------------------------------------------------------------------
    */

    const job =
      await prisma.job.findFirst({
        where: {
          id: jobId,

          createdById: userId,
        },
      });

    if (!job) {
      throw new Error(
        "Job not found or does not belong to this user."
      );
    }

    console.log(
      "✅ Job found:",
      job.id
    );

    /*
    |--------------------------------------------------------------------------
    | Existing Analysis
    |--------------------------------------------------------------------------
    */

    const existingAnalysis =
      await prisma.analysis.findFirst({
        where: {
          resumeId,
          jobId,
        },
      });

    if (existingAnalysis) {
      console.log(
        "🔄 Existing analysis found:",
        existingAnalysis.id
      );
    } else {
      console.log(
        "🆕 No existing analysis found."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | RUN AI ANALYSIS
    |--------------------------------------------------------------------------
    */

    console.log(
      "========================================"
    );

    console.log(
      "🧠 SENDING RESUME + JOB TO AI"
    );

    console.log(
      "========================================"
    );

    let aiResult: AIAnalysisResult;

    try {
      aiResult =
        await AIAnalysisService.analyze(
          resumeId,
          jobId
        );

      console.log(
        "========================================"
      );

      console.log(
        "✅ AI ANALYSIS COMPLETED"
      );

      console.dir(
        aiResult,
        {
          depth: null,
        }
      );

      console.log(
        "========================================"
      );
    } catch (error) {
      /*
      |--------------------------------------------------------------------------
      | Detailed AI Error
      |--------------------------------------------------------------------------
      */

      console.error(
        "========================================"
      );

      console.error(
        "❌ AI ANALYSIS FAILED"
      );

      console.error(
        "📄 Resume ID:",
        resumeId
      );

      console.error(
        "💼 Job ID:",
        jobId
      );

      console.error(
        "👤 User ID:",
        userId
      );

      console.error(
        "❌ Error:",
        error
      );

      if (error instanceof Error) {
        console.error(
          "❌ Error Message:",
          error.message
        );

        console.error(
          "❌ Error Stack:",
          error.stack
        );
      }

      console.error(
        "========================================"
      );

      /*
      |--------------------------------------------------------------------------
      | IMPORTANT
      |--------------------------------------------------------------------------
      | Do NOT hide the original AI error.
      |--------------------------------------------------------------------------
      */

      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to analyze resume with AI."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Normalize Match Score
    |--------------------------------------------------------------------------
    */

    const matchScore =
      Math.max(
        0,
        Math.min(
          100,
          Math.round(
            Number(
              aiResult?.matchScore
            ) || 0
          )
        )
      );

    /*
    |--------------------------------------------------------------------------
    | Normalize Arrays
    |--------------------------------------------------------------------------
    */

    const matchedSkills =
      Array.isArray(
        aiResult?.matchedSkills
      )
        ? aiResult.matchedSkills
        : [];

    const missingSkills =
      Array.isArray(
        aiResult?.missingSkills
      )
        ? aiResult.missingSkills
        : [];

    const strengths =
      Array.isArray(
        aiResult?.strengths
      )
        ? aiResult.strengths
        : [];

    const weaknesses =
      Array.isArray(
        aiResult?.weaknesses
      )
        ? aiResult.weaknesses
        : [];

    const recommendations =
      Array.isArray(
        aiResult?.recommendations
      )
        ? aiResult.recommendations
        : [];

    /*
    |--------------------------------------------------------------------------
    | Hiring Recommendation
    |--------------------------------------------------------------------------
    */

    const hiringRecommendation =
      typeof aiResult?.hiringRecommendation ===
      "string" &&
      aiResult.hiringRecommendation.trim()
        ? aiResult.hiringRecommendation
        : "PENDING";

    console.log(
      "========================================"
    );

    console.log(
      "📊 NORMALIZED AI RESULT"
    );

    console.log(
      "Match Score:",
      matchScore
    );

    console.log(
      "Matched Skills:",
      matchedSkills
    );

    console.log(
      "Missing Skills:",
      missingSkills
    );

    console.log(
      "Hiring Recommendation:",
      hiringRecommendation
    );

    console.log(
      "========================================"
    );

    /*
    |--------------------------------------------------------------------------
    | UPDATE EXISTING ANALYSIS
    |--------------------------------------------------------------------------
    */

    if (existingAnalysis) {
      console.log(
        "💾 Updating existing analysis..."
      );

      const updatedAnalysis =
        await prisma.analysis.update({
          where: {
            id: existingAnalysis.id,
          },

          data: {
            matchScore,

            matchedSkills,

            missingSkills,

            strengths,

            weaknesses,

            recommendations,

            hiringRecommendation,
          },

          include: {
            resume: true,

            job: true,
          },
        });

      console.log(
        "========================================"
      );

      console.log(
        "✅ ANALYSIS UPDATED SUCCESSFULLY"
      );

      console.log(
        "🆔 Analysis ID:",
        updatedAnalysis.id
      );

      console.log(
        "📊 Match Score:",
        updatedAnalysis.matchScore
      );

      console.log(
        "========================================"
      );

      return updatedAnalysis;
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE NEW ANALYSIS
    |--------------------------------------------------------------------------
    */

    console.log(
      "💾 Creating new analysis..."
    );

    const analysis =
      await prisma.analysis.create({
        data: {
          resumeId,

          jobId,

          matchScore,

          matchedSkills,

          missingSkills,

          strengths,

          weaknesses,

          recommendations,

          hiringRecommendation,
        },

        include: {
          resume: true,

          job: true,
        },
      });

    /*
    |--------------------------------------------------------------------------
    | Success Log
    |--------------------------------------------------------------------------
    */

    console.log(
      "========================================"
    );

    console.log(
      "✅ ANALYSIS CREATED SUCCESSFULLY"
    );

    console.log(
      "🆔 Analysis ID:",
      analysis.id
    );

    console.log(
      "📊 Match Score:",
      analysis.matchScore
    );

    console.log(
      "💡 Hiring Recommendation:",
      analysis.hiringRecommendation
    );

    console.log(
      "========================================"
    );

    return analysis;
  }

  /*
  |--------------------------------------------------------------------------
  | GET ALL ANALYSES
  |--------------------------------------------------------------------------
  */

  static async getAll(
    userId: string
  ) {
    /*
    |--------------------------------------------------------------------------
    | Validate User
    |--------------------------------------------------------------------------
    */

    if (!userId) {
      throw new Error(
        "User ID is required."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Fetch Analyses
    |--------------------------------------------------------------------------
    */

    const analyses =
      await prisma.analysis.findMany({
        where: {
          resume: {
            uploadedById: userId,
          },

          job: {
            createdById: userId,
          },
        },

        include: {
          resume: true,

          job: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    return analyses;
  }

  /*
  |--------------------------------------------------------------------------
  | GET ANALYSIS BY ID
  |--------------------------------------------------------------------------
  */

  static async getById(
    analysisId: string,
    userId: string
  ) {
    /*
    |--------------------------------------------------------------------------
    | Validate Analysis ID
    |--------------------------------------------------------------------------
    */

    if (!analysisId) {
      throw new Error(
        "Analysis ID is required."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Validate User ID
    |--------------------------------------------------------------------------
    */

    if (!userId) {
      throw new Error(
        "User ID is required."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Find Analysis
    |--------------------------------------------------------------------------
    */

    const analysis =
      await prisma.analysis.findFirst({
        where: {
          id: analysisId,

          resume: {
            uploadedById: userId,
          },

          job: {
            createdById: userId,
          },
        },

        include: {
          resume: true,

          job: true,
        },
      });

    /*
    |--------------------------------------------------------------------------
    | Not Found
    |--------------------------------------------------------------------------
    */

    if (!analysis) {
      throw new Error(
        "Analysis not found."
      );
    }

    return analysis;
  }

  /*
  |--------------------------------------------------------------------------
  | GET ANALYSES FOR RESUME
  |--------------------------------------------------------------------------
  */

  static async getByResume(
    resumeId: string,
    userId: string
  ) {
    /*
    |--------------------------------------------------------------------------
    | Validate Input
    |--------------------------------------------------------------------------
    */

    if (!resumeId) {
      throw new Error(
        "Resume ID is required."
      );
    }

    if (!userId) {
      throw new Error(
        "User ID is required."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Verify Resume Ownership
    |--------------------------------------------------------------------------
    */

    const resume =
      await prisma.resume.findFirst({
        where: {
          id: resumeId,

          uploadedById: userId,
        },

        select: {
          id: true,
        },
      });

    if (!resume) {
      throw new Error(
        "Resume not found."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Fetch Analyses
    |--------------------------------------------------------------------------
    */

    const analyses =
      await prisma.analysis.findMany({
        where: {
          resumeId,

          resume: {
            uploadedById: userId,
          },
        },

        include: {
          resume: true,

          job: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    return analyses;
  }

  /*
  |--------------------------------------------------------------------------
  | GET ANALYSES FOR JOB
  |--------------------------------------------------------------------------
  */

  static async getByJob(
    jobId: string,
    userId: string
  ) {
    /*
    |--------------------------------------------------------------------------
    | Validate Input
    |--------------------------------------------------------------------------
    */

    if (!jobId) {
      throw new Error(
        "Job ID is required."
      );
    }

    if (!userId) {
      throw new Error(
        "User ID is required."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Verify Job Ownership
    |--------------------------------------------------------------------------
    */

    const job =
      await prisma.job.findFirst({
        where: {
          id: jobId,

          createdById: userId,
        },

        select: {
          id: true,
        },
      });

    if (!job) {
      throw new Error(
        "Job not found."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Fetch Analyses
    |--------------------------------------------------------------------------
    */

    const analyses =
      await prisma.analysis.findMany({
        where: {
          jobId,

          job: {
            createdById: userId,
          },
        },

        include: {
          resume: true,

          job: true,
        },

        orderBy: {
          matchScore: "desc",
        },
      });

    return analyses;
  }

  /*
  |--------------------------------------------------------------------------
  | DELETE ANALYSIS
  |--------------------------------------------------------------------------
  */

  static async delete(
    analysisId: string,
    userId: string
  ) {
    /*
    |--------------------------------------------------------------------------
    | Validate Analysis ID
    |--------------------------------------------------------------------------
    */

    if (!analysisId) {
      throw new Error(
        "Analysis ID is required."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Validate User ID
    |--------------------------------------------------------------------------
    */

    if (!userId) {
      throw new Error(
        "User ID is required."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Check Ownership
    |--------------------------------------------------------------------------
    */

    const analysis =
      await prisma.analysis.findFirst({
        where: {
          id: analysisId,

          resume: {
            uploadedById: userId,
          },

          job: {
            createdById: userId,
          },
        },
      });

    if (!analysis) {
      throw new Error(
        "Analysis not found."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Delete Analysis
    |--------------------------------------------------------------------------
    */

    await prisma.analysis.delete({
      where: {
        id: analysis.id,
      },
    });

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    console.log(
      "🗑️ Analysis deleted:",
      analysis.id
    );

    return {
      success: true,

      message:
        "Analysis deleted successfully.",
    };
  }
}