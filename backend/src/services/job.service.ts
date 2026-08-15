import { prisma } from "../config/prisma.js";
import { Prisma } from "@prisma/client";

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

export interface CreateJobInput {
  title: string;
  company: string;
  location?: string;
  employmentType?: string;
  description: string;
  requirements: string;
  salary?: string;
  requiredSkills: string[];
}

export type UpdateJobInput =
  Partial<CreateJobInput>;

/*
|--------------------------------------------------------------------------
| Job Service
|--------------------------------------------------------------------------
*/

export class JobService {
  /*
  |--------------------------------------------------------------------------
  | CREATE JOB
  |--------------------------------------------------------------------------
  */

  static async createJob(
    data: CreateJobInput,
    userId: string
  ) {
    /*
    |--------------------------------------------------------------------------
    | Validate Input
    |--------------------------------------------------------------------------
    */

    if (!data) {
      throw new Error(
        "Job data is required"
      );
    }

    if (!userId) {
      throw new Error(
        "User ID is required"
      );
    }

    if (!data.title?.trim()) {
      throw new Error(
        "Job title is required"
      );
    }

    if (!data.company?.trim()) {
      throw new Error(
        "Company name is required"
      );
    }

    if (!data.description?.trim()) {
      throw new Error(
        "Job description is required"
      );
    }

    if (!data.requirements?.trim()) {
      throw new Error(
        "Job requirements are required"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Validate Required Skills
    |--------------------------------------------------------------------------
    */

    const requiredSkills =
      Array.isArray(
        data.requiredSkills
      )
        ? data.requiredSkills
            .filter(
              (skill) =>
                typeof skill === "string"
            )
            .map(
              (skill) =>
                skill.trim()
            )
            .filter(
              Boolean
            )
        : [];

    /*
    |--------------------------------------------------------------------------
    | Create Job
    |--------------------------------------------------------------------------
    */

    console.log(
      "========================================"
    );

    console.log(
      "💼 Creating Job"
    );

    console.log(
      "👤 User ID:",
      userId
    );

    console.log(
      "📌 Title:",
      data.title
    );

    console.log(
      "🏢 Company:",
      data.company
    );

    console.log(
      "========================================"
    );

    const job =
      await prisma.job.create({
        data: {
          title:
            data.title.trim(),

          company:
            data.company.trim(),

          location:
            data.location?.trim() ||
            null,

          employmentType:
            data.employmentType?.trim() ||
            null,

          description:
            data.description.trim(),

          requirements:
            data.requirements.trim(),

          salary:
            data.salary?.trim() ||
            null,

          requiredSkills:
            requiredSkills,

          createdById:
            userId,
        },
      });

    console.log(
      "✅ Job created successfully"
    );

    console.log(
      "🆔 Job ID:",
      job.id
    );

    return job;
  }

  /*
  |--------------------------------------------------------------------------
  | GET ALL JOBS
  |--------------------------------------------------------------------------
  */

  static async getJobs(
    userId: string
  ) {
    /*
    |--------------------------------------------------------------------------
    | Validate User
    |--------------------------------------------------------------------------
    */

    if (!userId) {
      throw new Error(
        "User ID is required"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Fetch Jobs
    |--------------------------------------------------------------------------
    */

    const jobs =
      await prisma.job.findMany({
        where: {
          createdById:
            userId,
        },

        orderBy: {
          createdAt:
            "desc",
        },
      });

    return jobs;
  }

  /*
  |--------------------------------------------------------------------------
  | GET JOB BY ID
  |--------------------------------------------------------------------------
  */

  static async getJobById(
    id: string,
    userId: string
  ) {
    /*
    |--------------------------------------------------------------------------
    | Validate ID
    |--------------------------------------------------------------------------
    */

    if (!id) {
      throw new Error(
        "Job ID is required"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Validate User
    |--------------------------------------------------------------------------
    */

    if (!userId) {
      throw new Error(
        "User ID is required"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Find Job
    |--------------------------------------------------------------------------
    */

    const job =
      await prisma.job.findFirst({
        where: {
          id,

          createdById:
            userId,
        },
      });

    /*
    |--------------------------------------------------------------------------
    | Job Not Found
    |--------------------------------------------------------------------------
    */

    if (!job) {
      throw new Error(
        "Job not found"
      );
    }

    return job;
  }

  /*
  |--------------------------------------------------------------------------
  | UPDATE JOB
  |--------------------------------------------------------------------------
  */

  static async updateJob(
    id: string,
    data: UpdateJobInput,
    userId: string
  ) {
    /*
    |--------------------------------------------------------------------------
    | Validate ID
    |--------------------------------------------------------------------------
    */

    if (!id) {
      throw new Error(
        "Job ID is required"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Validate User
    |--------------------------------------------------------------------------
    */

    if (!userId) {
      throw new Error(
        "User ID is required"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Validate Data
    |--------------------------------------------------------------------------
    */

    if (!data) {
      throw new Error(
        "Job update data is required"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Find Existing Job
    |--------------------------------------------------------------------------
    */

    const existingJob =
      await prisma.job.findFirst({
        where: {
          id,

          createdById:
            userId,
        },
      });

    if (!existingJob) {
      throw new Error(
        "Job not found"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Prepare Update Data
    |--------------------------------------------------------------------------
    */

    const updateData:
      Prisma.JobUpdateInput = {};

    /*
    |--------------------------------------------------------------------------
    | Title
    |--------------------------------------------------------------------------
    */

    if (
      data.title !== undefined
    ) {
      const title =
        data.title.trim();

      if (!title) {
        throw new Error(
          "Job title cannot be empty"
        );
      }

      updateData.title =
        title;
    }

    /*
    |--------------------------------------------------------------------------
    | Company
    |--------------------------------------------------------------------------
    */

    if (
      data.company !== undefined
    ) {
      const company =
        data.company.trim();

      if (!company) {
        throw new Error(
          "Company name cannot be empty"
        );
      }

      updateData.company =
        company;
    }

    /*
    |--------------------------------------------------------------------------
    | Location
    |--------------------------------------------------------------------------
    */

    if (
      data.location !== undefined
    ) {
      updateData.location =
        data.location.trim() ||
        null;
    }

    /*
    |--------------------------------------------------------------------------
    | Employment Type
    |--------------------------------------------------------------------------
    */

    if (
      data.employmentType !==
      undefined
    ) {
      updateData.employmentType =
        data.employmentType.trim() ||
        null;
    }

    /*
    |--------------------------------------------------------------------------
    | Description
    |--------------------------------------------------------------------------
    */

    if (
      data.description !==
      undefined
    ) {
      const description =
        data.description.trim();

      if (!description) {
        throw new Error(
          "Job description cannot be empty"
        );
      }

      updateData.description =
        description;
    }

    /*
    |--------------------------------------------------------------------------
    | Requirements
    |--------------------------------------------------------------------------
    */

    if (
      data.requirements !==
      undefined
    ) {
      const requirements =
        data.requirements.trim();

      if (!requirements) {
        throw new Error(
          "Job requirements cannot be empty"
        );
      }

      updateData.requirements =
        requirements;
    }

    /*
    |--------------------------------------------------------------------------
    | Salary
    |--------------------------------------------------------------------------
    */

    if (
      data.salary !== undefined
    ) {
      updateData.salary =
        data.salary.trim() ||
        null;
    }

    /*
    |--------------------------------------------------------------------------
    | Required Skills
    |--------------------------------------------------------------------------
    */

    if (
      data.requiredSkills !==
      undefined
    ) {
      const requiredSkills =
        Array.isArray(
          data.requiredSkills
        )
          ? data.requiredSkills
              .filter(
                (skill) =>
                  typeof skill ===
                  "string"
              )
              .map(
                (skill) =>
                  skill.trim()
              )
              .filter(
                Boolean
              )
          : [];

      updateData.requiredSkills =
        requiredSkills;
    }

    /*
    |--------------------------------------------------------------------------
    | Prevent Empty Update
    |--------------------------------------------------------------------------
    */

    if (
      Object.keys(
        updateData
      ).length === 0
    ) {
      throw new Error(
        "No fields provided for update"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Update Job
    |--------------------------------------------------------------------------
    */

    console.log(
      "========================================"
    );

    console.log(
      "✏️ Updating Job"
    );

    console.log(
      "🆔 Job ID:",
      id
    );

    console.log(
      "👤 User ID:",
      userId
    );

    console.log(
      "========================================"
    );

    const job =
      await prisma.job.update({
        where: {
          id:
            existingJob.id,
        },

        data:
          updateData,
      });

    console.log(
      "✅ Job updated successfully"
    );

    return job;
  }

  /*
  |--------------------------------------------------------------------------
  | DELETE JOB
  |--------------------------------------------------------------------------
  */

  static async deleteJob(
    id: string,
    userId: string
  ) {
    /*
    |--------------------------------------------------------------------------
    | Validate ID
    |--------------------------------------------------------------------------
    */

    if (!id) {
      throw new Error(
        "Job ID is required"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Validate User
    |--------------------------------------------------------------------------
    */

    if (!userId) {
      throw new Error(
        "User ID is required"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Find Existing Job
    |--------------------------------------------------------------------------
    */

    const existingJob =
      await prisma.job.findFirst({
        where: {
          id,

          createdById:
            userId,
        },
      });

    if (!existingJob) {
      throw new Error(
        "Job not found"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Delete Job
    |--------------------------------------------------------------------------
    |
    | Analysis records are automatically
    | deleted because your Prisma schema
    | uses onDelete: Cascade.
    |
    */

    await prisma.job.delete({
      where: {
        id:
          existingJob.id,
      },
    });

    console.log(
      "🗑️ Job deleted successfully:",
      existingJob.id
    );

    return {
      success: true,

      message:
        "Job deleted successfully",
    };
  }

  /*
  |--------------------------------------------------------------------------
  | SEARCH JOBS
  |--------------------------------------------------------------------------
  */

  static async searchJobs(
    userId: string,
    keyword: string
  ) {
    /*
    |--------------------------------------------------------------------------
    | Validate User
    |--------------------------------------------------------------------------
    */

    if (!userId) {
      throw new Error(
        "User ID is required"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Normalize Keyword
    |--------------------------------------------------------------------------
    */

    const searchKeyword =
      keyword?.trim() || "";

    /*
    |--------------------------------------------------------------------------
    | Return All Jobs
    |--------------------------------------------------------------------------
    */

    if (!searchKeyword) {
      return await this.getJobs(
        userId
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Search
    |--------------------------------------------------------------------------
    */

    const jobs =
      await prisma.job.findMany({
        where: {
          createdById:
            userId,

          OR: [
            {
              title: {
                contains:
                  searchKeyword,

                mode:
                  "insensitive",
              },
            },

            {
              company: {
                contains:
                  searchKeyword,

                mode:
                  "insensitive",
              },
            },

            {
              location: {
                contains:
                  searchKeyword,

                mode:
                  "insensitive",
              },
            },

            {
              description: {
                contains:
                  searchKeyword,

                mode:
                  "insensitive",
              },
            },

            {
              requirements: {
                contains:
                  searchKeyword,

                mode:
                  "insensitive",
              },
            },
          ],
        },

        orderBy: {
          createdAt:
            "desc",
        },
      });

    return jobs;
  }

  /*
  |--------------------------------------------------------------------------
  | GET JOB WITH ANALYSES
  |--------------------------------------------------------------------------
  */

  static async getJobWithAnalyses(
    id: string,
    userId: string
  ) {
    /*
    |--------------------------------------------------------------------------
    | Validate ID
    |--------------------------------------------------------------------------
    */

    if (!id) {
      throw new Error(
        "Job ID is required"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Validate User
    |--------------------------------------------------------------------------
    */

    if (!userId) {
      throw new Error(
        "User ID is required"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Fetch Job
    |--------------------------------------------------------------------------
    */

    const job =
      await prisma.job.findFirst({
        where: {
          id,

          createdById:
            userId,
        },

        include: {
          analyses: {
            include: {
              resume: true,
            },

            orderBy: {
              createdAt:
                "desc",
            },
          },
        },
      });

    /*
    |--------------------------------------------------------------------------
    | Job Not Found
    |--------------------------------------------------------------------------
    */

    if (!job) {
      throw new Error(
        "Job not found"
      );
    }

    return job;
  }

  /*
  |--------------------------------------------------------------------------
  | UPDATE JOB STATUS
  |--------------------------------------------------------------------------
  */

  static async updateJobStatus(
    id: string,
    status: "ACTIVE" | "CLOSED" | "DRAFT",
    userId: string
  ) {
    /*
    |--------------------------------------------------------------------------
    | Validate ID
    |--------------------------------------------------------------------------
    */

    if (!id) {
      throw new Error(
        "Job ID is required"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Validate User
    |--------------------------------------------------------------------------
    */

    if (!userId) {
      throw new Error(
        "User ID is required"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Validate Status
    |--------------------------------------------------------------------------
    */

    const allowedStatuses = [
      "ACTIVE",
      "CLOSED",
      "DRAFT",
    ];

    if (
      !allowedStatuses.includes(
        status
      )
    ) {
      throw new Error(
        "Invalid job status"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Find Job
    |--------------------------------------------------------------------------
    */

    const existingJob =
      await prisma.job.findFirst({
        where: {
          id,

          createdById:
            userId,
        },
      });

    if (!existingJob) {
      throw new Error(
        "Job not found"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Update Status
    |--------------------------------------------------------------------------
    */

    const job =
      await prisma.job.update({
        where: {
          id:
            existingJob.id,
        },

        data: {
          status:
            status as Prisma.JobUpdateInput["status"],
        },
      });

    return job;
  }
}