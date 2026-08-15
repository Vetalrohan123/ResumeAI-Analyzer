import { prisma } from "../config/prisma.js";
import { AIService } from "./ai.service.js";

/*
|--------------------------------------------------------------------------
| MATCH SERVICE
|--------------------------------------------------------------------------
*/

export class MatchService {
  /*
  |--------------------------------------------------------------------------
  | CREATE MATCH
  |--------------------------------------------------------------------------
  |
  | Creates an AI-powered match between one resume and one job.
  |
  | POST /api/matches
  |
  */

  static async createMatch(
    jobId: string,
    resumeId: string
  ) {
    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    if (!jobId) {
      throw new Error(
        "Job ID is required."
      );
    }

    if (!resumeId) {
      throw new Error(
        "Resume ID is required."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | FIND JOB
    |--------------------------------------------------------------------------
    */

    const job =
      await prisma.job.findUnique({
        where: {
          id: jobId,
        },
      });

    if (!job) {
      throw new Error(
        "Job not found."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | FIND RESUME
    |--------------------------------------------------------------------------
    */

    const resume =
      await prisma.resume.findUnique({
        where: {
          id: resumeId,
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
      !resume.extractedText.trim()
    ) {
      throw new Error(
        "Resume text is not available."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE JOB DESCRIPTION
    |--------------------------------------------------------------------------
    */

    if (
      !job.description ||
      !job.description.trim()
    ) {
      throw new Error(
        "Job description is not available."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | CHECK EXISTING MATCH
    |--------------------------------------------------------------------------
    |
    | Avoid generating the same AI match repeatedly.
    |
    */

    const existingMatch =
      await prisma.match.findFirst({
        where: {
          jobId,
          resumeId,
        },
      });

    if (existingMatch) {
      console.log(
        "ℹ️ Match already exists:",
        existingMatch.id
      );

      return existingMatch;
    }

    /*
    |--------------------------------------------------------------------------
    | JOB REQUIRED SKILLS
    |--------------------------------------------------------------------------
    */

    const requiredSkills =
      job.requiredSkills ?? [];

    /*
    |--------------------------------------------------------------------------
    | BUILD JOB CONTENT
    |--------------------------------------------------------------------------
    */

    const jobText = `
JOB DESCRIPTION:

${job.description}

REQUIRED SKILLS:

${JSON.stringify(
  requiredSkills,
  null,
  2
)}
`;

    /*
    |--------------------------------------------------------------------------
    | LOG
    |--------------------------------------------------------------------------
    */

    console.log(
      "========================================"
    );

    console.log(
      "🤖 Creating Resume Job Match"
    );

    console.log(
      "💼 Job ID:",
      jobId
    );

    console.log(
      "📄 Resume ID:",
      resumeId
    );

    console.log(
      "========================================"
    );

    /*
    |--------------------------------------------------------------------------
    | AI MATCHING
    |--------------------------------------------------------------------------
    */

    const analysis =
      await AIService.matchResumeToJob(
        resume.extractedText,
        jobText
      );

    /*
    |--------------------------------------------------------------------------
    | VALIDATE AI RESULT
    |--------------------------------------------------------------------------
    */

    if (!analysis) {
      throw new Error(
        "AI matching returned no result."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | SAVE MATCH
    |--------------------------------------------------------------------------
    */

    const match =
      await prisma.match.create({
        data: {
          resumeId,

          jobId,

          matchScore:
            analysis.matchScore,

          matchedSkills:
            analysis.matchedSkills,

          missingSkills:
            analysis.missingSkills,

          strengths:
            analysis.strengths,

          weaknesses:
            analysis.weaknesses,

          recommendations:
            analysis.recommendations,

          hiringRecommendation:
            analysis.summary,
        },

        include: {
          resume: true,

          job: true,
        },
      });

    /*
    |--------------------------------------------------------------------------
    | SUCCESS LOG
    |--------------------------------------------------------------------------
    */

    console.log(
      "========================================"
    );

    console.log(
      "✅ Match created successfully"
    );

    console.log(
      "🆔 Match ID:",
      match.id
    );

    console.log(
      "📊 Match Score:",
      match.matchScore
    );

    console.log(
      "========================================"
    );

    return match;
  }

  /*
  |--------------------------------------------------------------------------
  | GET JOB MATCHES
  |--------------------------------------------------------------------------
  |
  | Returns all candidates matched against
  | a specific job.
  |
  | GET /api/matches/job/:jobId
  |
  */

  static async getJobMatches(
    jobId: string
  ) {
    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    if (!jobId) {
      throw new Error(
        "Job ID is required."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | VERIFY JOB
    |--------------------------------------------------------------------------
    */

    const job =
      await prisma.job.findUnique({
        where: {
          id: jobId,
        },
      });

    if (!job) {
      throw new Error(
        "Job not found."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | GET MATCHES
    |--------------------------------------------------------------------------
    */

    const matches =
      await prisma.match.findMany({
        where: {
          jobId,
        },

        orderBy: {
          matchScore: "desc",
        },

        include: {
          resume: true,

          job: true,
        },
      });

    /*
    |--------------------------------------------------------------------------
    | LOG
    |--------------------------------------------------------------------------
    */

    console.log(
      "📊 Job matches found:",
      matches.length
    );

    return matches;
  }

  /*
  |--------------------------------------------------------------------------
  | GET SINGLE MATCH
  |--------------------------------------------------------------------------
  |
  | GET /api/matches/:id
  |
  */

  static async getMatchById(
    matchId: string
  ) {
    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    if (!matchId) {
      throw new Error(
        "Match ID is required."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | FIND MATCH
    |--------------------------------------------------------------------------
    */

    const match =
      await prisma.match.findUnique({
        where: {
          id: matchId,
        },

        include: {
          resume: true,

          job: true,
        },
      });

    /*
    |--------------------------------------------------------------------------
    | NOT FOUND
    |--------------------------------------------------------------------------
    */

    if (!match) {
      throw new Error(
        "Match not found."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | SUCCESS
    |--------------------------------------------------------------------------
    */

    return match;
  }

  /*
  |--------------------------------------------------------------------------
  | DELETE MATCH
  |--------------------------------------------------------------------------
  |
  | DELETE /api/matches/:id
  |
  */

  static async deleteMatch(
    matchId: string
  ) {
    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    if (!matchId) {
      throw new Error(
        "Match ID is required."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | FIND MATCH
    |--------------------------------------------------------------------------
    */

    const match =
      await prisma.match.findUnique({
        where: {
          id: matchId,
        },
      });

    /*
    |--------------------------------------------------------------------------
    | NOT FOUND
    |--------------------------------------------------------------------------
    */

    if (!match) {
      throw new Error(
        "Match not found."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | DELETE
    |--------------------------------------------------------------------------
    */

    await prisma.match.delete({
      where: {
        id: matchId,
      },
    });

    /*
    |--------------------------------------------------------------------------
    | SUCCESS
    |--------------------------------------------------------------------------
    */

    console.log(
      "🗑️ Match deleted:",
      matchId
    );

    return {
      success: true,

      message:
        "Match deleted successfully.",
    };
  }

  /*
  |--------------------------------------------------------------------------
  | RE-MATCH RESUME
  |--------------------------------------------------------------------------
  |
  | Deletes the previous match and creates
  | a fresh AI match.
  |
  */

  static async rematch(
    jobId: string,
    resumeId: string
  ) {
    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    if (!jobId) {
      throw new Error(
        "Job ID is required."
      );
    }

    if (!resumeId) {
      throw new Error(
        "Resume ID is required."
      );
    }

    /*
    |--------------------------------------------------------------------------
    | FIND EXISTING MATCH
    |--------------------------------------------------------------------------
    */

    const existingMatch =
      await prisma.match.findFirst({
        where: {
          jobId,
          resumeId,
        },
      });

    /*
    |--------------------------------------------------------------------------
    | DELETE EXISTING MATCH
    |--------------------------------------------------------------------------
    */

    if (existingMatch) {
      await prisma.match.delete({
        where: {
          id: existingMatch.id,
        },
      });

      console.log(
        "🗑️ Previous match removed:",
        existingMatch.id
      );
    }


    return this.createMatch(
      jobId,
      resumeId
    );
  }
}