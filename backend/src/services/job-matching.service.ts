import { prisma } from "../config/prisma.js";
import { AIService } from "./ai.service.js";

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

interface CurrentUser {
  id: string;
  email: string;
  role: string;
}

interface MatchingResult {
  matchScore: number;

  skillsScore: number;

  experienceScore: number;

  educationScore: number;

  matchedSkills: string[];

  missingSkills: string[];

  matchedExperience: string[];

  strengths: string[];

  weaknesses: string[];

  recommendations: string[];

  summary: string;
}

/*
|--------------------------------------------------------------------------
| JOB MATCHING SERVICE
|--------------------------------------------------------------------------
*/

export class JobMatchingService {
  /*
  |--------------------------------------------------------------------------
  | MATCH RESUME WITH JOB
  |--------------------------------------------------------------------------
  */

  static async matchResumeWithJob(
    resumeId: string,
    jobId: string,
    user: CurrentUser
  ): Promise<MatchingResult> {
    /*
    |--------------------------------------------------------------------------
    | VALIDATION
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

    if (!user?.id) {
      throw new Error(
        "User is not authenticated."
      );
    }

    console.log(
      "========================================"
    );

    console.log(
      "🤖 RESUME JOB MATCHING"
    );

    console.log(
      "========================================"
    );

    console.log(
      "Resume:",
      resumeId
    );

    console.log(
      "Job:",
      jobId
    );

    /*
    |--------------------------------------------------------------------------
    | GET RESUME
    |--------------------------------------------------------------------------
    */

    const resume =
      await prisma.resume.findFirst({
        where: {
          id: resumeId,

          uploadedById:
            user.id,
        },
      });

    if (!resume) {
      throw new Error(
        "Resume not found."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE RESUME TEXT
    |--------------------------------------------------------------------------
    */

    if (
      !resume.extractedText ||
      resume.extractedText.trim()
        .length === 0
    ) {
      throw new Error(
        "Resume text is not available."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | GET JOB
    |--------------------------------------------------------------------------
    */

    const job =
      await prisma.job.findFirst({
        where: {
          id: jobId,

          createdById:
            user.id,
        },
      });

    if (!job) {
      throw new Error(
        "Job not found or you do not have access to this job."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | JOB DESCRIPTION
    |--------------------------------------------------------------------------
    */

    const jobDescription =
      job.description || "";

    if (
      jobDescription.trim()
        .length === 0
    ) {
      throw new Error(
        "Job description is empty."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | AI MATCHING
    |--------------------------------------------------------------------------
    */

    console.log(
      "📄 Resume characters:",
      resume.extractedText.length
    );

    console.log(
      "💼 Job description characters:",
      jobDescription.length
    );

    console.log(
      "🤖 Sending resume and job to AI..."
    );

    const result =
      await AIService.matchResumeToJob(
        resume.extractedText,
        jobDescription
      );

    /*
    |--------------------------------------------------------------------------
    | NORMALIZE RESULT
    |--------------------------------------------------------------------------
    */

    const matching =
      this.normalizeResult(result);

    console.log(
      "✅ Matching completed"
    );

    console.log(
      "📊 Match score:",
      matching.matchScore
    );

    /*
    |--------------------------------------------------------------------------
    | RETURN
    |--------------------------------------------------------------------------
    */

    return matching;
  }

  /*
  |--------------------------------------------------------------------------
  | NORMALIZE AI RESULT
  |--------------------------------------------------------------------------
  */

  private static normalizeResult(
    result: any
  ): MatchingResult {
    const numberValue = (
      value: unknown
    ): number => {
      const number =
        Number(value);

      if (
        !Number.isFinite(number)
      ) {
        return 0;
      }

      return Math.max(
        0,
        Math.min(100, number)
      );
    };

    const arrayValue = (
      value: unknown
    ): string[] => {
      if (!Array.isArray(value)) {
        return [];
      }

      return value
        .filter(
          (item) =>
            typeof item ===
            "string"
        )
        .map(
          (item) =>
            item.trim()
        )
        .filter(Boolean);
    };

    return {
      matchScore:
        numberValue(
          result?.matchScore
        ),

      skillsScore:
        numberValue(
          result?.skillsScore
        ),

      experienceScore:
        numberValue(
          result?.experienceScore
        ),

      educationScore:
        numberValue(
          result?.educationScore
        ),

      matchedSkills:
        arrayValue(
          result?.matchedSkills
        ),

      missingSkills:
        arrayValue(
          result?.missingSkills
        ),

      matchedExperience:
        arrayValue(
          result?.matchedExperience
        ),

      strengths:
        arrayValue(
          result?.strengths
        ),

      weaknesses:
        arrayValue(
          result?.weaknesses
        ),

      recommendations:
        arrayValue(
          result?.recommendations
        ),

      summary:
        typeof result?.summary ===
        "string"
          ? result.summary
          : "",
    };
  }
}