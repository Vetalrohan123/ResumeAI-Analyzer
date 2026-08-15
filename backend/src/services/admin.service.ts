import { prisma } from "../config/prisma.js";

/*
|--------------------------------------------------------------------------
| ADMIN SERVICE
|--------------------------------------------------------------------------
*/

export class AdminService {
  /*
  |--------------------------------------------------------------------------
  | GET ALL USERS
  |--------------------------------------------------------------------------
  */

  static async getUsers() {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return users;
  }

  /*
  |--------------------------------------------------------------------------
  | GET ALL RESUMES
  |--------------------------------------------------------------------------
  */

  static async getResumes() {
    const resumes = await prisma.resume.findMany({
      select: {
        id: true,

        candidateName: true,
        candidateEmail: true,
        candidatePhone: true,

        fileName: true,
        storedName: true,
        fileSize: true,
        mimeType: true,

        aiScore: true,
        summary: true,

        skills: true,
        experience: true,
        education: true,
        projects: true,
        certifications: true,

        strengths: true,
        weaknesses: true,
        suggestions: true,

        status: true,

        createdAt: true,
        updatedAt: true,

        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return resumes;
  }

  /*
  |--------------------------------------------------------------------------
  | GET ALL JOBS
  |--------------------------------------------------------------------------
  */

  static async getJobs() {
    const jobs = await prisma.job.findMany({
      select: {
        id: true,

        title: true,
        company: true,
        location: true,
        employmentType: true,

        description: true,
        requirements: true,
        salary: true,
        requiredSkills: true,

        status: true,

        createdAt: true,
        updatedAt: true,

        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return jobs;
  }

  /*
  |--------------------------------------------------------------------------
  | GET ALL MATCHES
  |--------------------------------------------------------------------------
  */

  static async getMatches() {
    const matches = await prisma.match.findMany({
      select: {
        id: true,

        resumeId: true,
        jobId: true,

        matchScore: true,

        matchedSkills: true,
        missingSkills: true,

        strengths: true,
        weaknesses: true,

        recommendations: true,

        hiringRecommendation: true,

        createdAt: true,

        /*
         * IMPORTANT:
         *
         * updatedAt was removed because your
         * Prisma Match model does not contain
         * an updatedAt field.
         */

        resume: {
          select: {
            id: true,

            candidateName: true,
            candidateEmail: true,
            candidatePhone: true,

            aiScore: true,
          },
        },

        job: {
          select: {
            id: true,

            title: true,
            company: true,
            location: true,
          },
        },
      },

      orderBy: {
        matchScore: "desc",
      },
    });

    return matches;
  }

  /*
  |--------------------------------------------------------------------------
  | DELETE USER
  |--------------------------------------------------------------------------
  */

  static async deleteUser(userId: string) {
    /*
     * Validate user ID
     */

    if (
      !userId ||
      typeof userId !== "string"
    ) {
      throw new Error(
        "User ID is required"
      );
    }

    /*
     * Find existing user
     */

    const existingUser =
      await prisma.user.findUnique({
        where: {
          id: userId,
        },

        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

    /*
     * User not found
     */

    if (!existingUser) {
      throw new Error(
        "User not found"
      );
    }

    /*
     * Delete user
     */

    const deletedUser =
      await prisma.user.delete({
        where: {
          id: userId,
        },

        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

    return deletedUser;
  }
}