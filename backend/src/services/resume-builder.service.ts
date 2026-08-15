import { prisma } from "../config/prisma.js";
import { Prisma } from "@prisma/client";

interface CurrentUser {
  id: string;
  email: string;
  role: string;
}

export interface ResumeBuilderInput {
  title?: string;

  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;

  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;

  summary?: string;

  skills?: string[];

  experience?: ResumeExperience[];

  education?: ResumeEducation[];

  projects?: ResumeProject[];

  certifications?: ResumeCertification[];

  languages?: string[];

  achievements?: string[];
}

export interface ResumeExperience {
  id?: string;

  company: string;

  position: string;

  location?: string;

  startDate: string;

  endDate?: string;

  current?: boolean;

  description?: string;

  responsibilities?: string[];

  technologies?: string[];
}

export interface ResumeEducation {
  id?: string;

  institution: string;

  degree: string;

  fieldOfStudy?: string;

  location?: string;

  startDate?: string;

  endDate?: string;

  grade?: string;

  description?: string;
}

export interface ResumeProject {
  id?: string;

  name: string;

  description?: string;

  technologies?: string[];

  url?: string;

  github?: string;

  startDate?: string;

  endDate?: string;
}

/* ============================================================================
   CERTIFICATION
   ========================================================================== */

export interface ResumeCertification {
  id?: string;

  name: string;

  issuer?: string;

  issueDate?: string;

  expiryDate?: string;

  credentialId?: string;

  credentialUrl?: string;
}

/* ============================================================================
   RESUME BUILDER SERVICE
   ========================================================================== */

export class ResumeBuilderService {
  /* ==========================================================================
     CREATE RESUME
     ======================================================================== */

  static async createResume(
    data: ResumeBuilderInput,
    user: CurrentUser
  ) {
    /* ------------------------------------------------------------------------
       VALIDATION
       ---------------------------------------------------------------------- */

    this.validateUser(user);
    this.validateRequiredFields(data);

    this.normalizeInput(data);

    /* ------------------------------------------------------------------------
       GENERATE SEARCHABLE TEXT
       ---------------------------------------------------------------------- */

    const extractedText =
      this.generateResumeText(data);

    /* ------------------------------------------------------------------------
       CREATE DATABASE RECORD
       ---------------------------------------------------------------------- */

    const resume =
      await prisma.resume.create({
        data: {
          /* ------------------------------------------------------------------
             USER
             ---------------------------------------------------------------- */

          uploadedById: user.id,

          /* ------------------------------------------------------------------
             BASIC INFORMATION
             ---------------------------------------------------------------- */

          candidateName:
            data.candidateName.trim(),

          candidateEmail:
            data.candidateEmail
              .trim()
              .toLowerCase(),

          candidatePhone:
            data.candidatePhone?.trim() ||
            null,

          /* ------------------------------------------------------------------
             BUILDER INFORMATION
             ---------------------------------------------------------------- */

          title:
            data.title?.trim() ||
            "My Resume",

          location:
            data.location?.trim() ||
            null,

          website:
            data.website?.trim() ||
            null,

          linkedin:
            data.linkedin?.trim() ||
            null,

          github:
            data.github?.trim() ||
            null,

          /* ------------------------------------------------------------------
             FILE INFORMATION
             ---------------------------------------------------------------- */

          fileName:
            data.title?.trim() ||
            `${data.candidateName.trim()} Resume`,

          storedName:
            `builder-${Date.now()}-${user.id}`,

          fileSize: 0,

          mimeType:
            "application/json",

          /* ------------------------------------------------------------------
             RESUME CONTENT

             IMPORTANT:
             Prisma JSON fields require InputJsonValue.
             ---------------------------------------------------------------- */

          extractedText,

          summary:
            data.summary?.trim() ||
            "",

          skills:
            this.toPrismaJson(
              data.skills ?? []
            ),

          experience:
            this.toPrismaJson(
              data.experience ?? []
            ),

          education:
            this.toPrismaJson(
              data.education ?? []
            ),

          projects:
            this.toPrismaJson(
              data.projects ?? []
            ),

          certifications:
            this.toPrismaJson(
              data.certifications ?? []
            ),

          languages:
            this.toPrismaJson(
              data.languages ?? []
            ),

          achievements:
            this.toPrismaJson(
              data.achievements ?? []
            ),

          /* ------------------------------------------------------------------
             AI DATA
             ---------------------------------------------------------------- */

          aiScore: 0,

          strengths:
            this.toPrismaJson([]),

          weaknesses:
            this.toPrismaJson([]),

          suggestions:
            this.toPrismaJson([]),

          /* ------------------------------------------------------------------
             STATUS
             ---------------------------------------------------------------- */

          status: "DRAFT",
        },
      });

    console.log(
      "========================================"
    );

    console.log(
      "✅ BUILDER RESUME CREATED"
    );

    console.log(
      "Resume ID:",
      resume.id
    );

    console.log(
      "Candidate:",
      resume.candidateName
    );

    console.log(
      "========================================"
    );

    return resume;
  }

  /* ==========================================================================
     GET SINGLE RESUME
     ======================================================================== */

  static async getResumeById(
    id: string,
    user: CurrentUser
  ) {
    this.validateUser(user);

    const resumeId =
      typeof id === "string"
        ? id.trim()
        : "";

    if (!resumeId) {
      throw new Error(
        "Resume ID is required."
      );
    }

    const resume =
      await prisma.resume.findFirst({
        where: {
          id: resumeId,
          uploadedById: user.id,
        },
      });

    if (!resume) {
      throw new Error(
        "Resume not found."
      );
    }

    return resume;
  }

  /* ==========================================================================
     GET ALL RESUMES
     ======================================================================== */

  static async getResumes(
    user: CurrentUser
  ) {
    this.validateUser(user);

    const resumes =
      await prisma.resume.findMany({
        where: {
          uploadedById: user.id,
        },

        orderBy: {
          updatedAt: "desc",
        },
      });

    return resumes;
  }

  /* ==========================================================================
     UPDATE RESUME
     ======================================================================== */

  static async updateResume(
    id: string,
    data: Partial<ResumeBuilderInput>,
    user: CurrentUser
  ) {
    this.validateUser(user);

    const resumeId =
      typeof id === "string"
        ? id.trim()
        : "";

    if (!resumeId) {
      throw new Error(
        "Resume ID is required."
      );
    }

    /* ------------------------------------------------------------------------
       FIND EXISTING RESUME
       ---------------------------------------------------------------------- */

    const existing =
      await prisma.resume.findFirst({
        where: {
          id: resumeId,
          uploadedById: user.id,
        },
      });

    if (!existing) {
      throw new Error(
        "Resume not found."
      );
    }

    /* ------------------------------------------------------------------------
       CONVERT EXISTING JSON DATA
       ---------------------------------------------------------------------- */

    const existingSkills =
      this.toStringArray(
        existing.skills
      );

    const existingExperience =
      this.toExperienceArray(
        existing.experience
      );

    const existingEducation =
      this.toEducationArray(
        existing.education
      );

    const existingProjects =
      this.toProjectArray(
        existing.projects
      );

    const existingCertifications =
      this.toCertificationArray(
        existing.certifications
      );

    const existingLanguages =
      this.toStringArray(
        existing.languages
      );

    const existingAchievements =
      this.toStringArray(
        existing.achievements
      );

    /* ------------------------------------------------------------------------
       MERGE OLD + NEW DATA
       ---------------------------------------------------------------------- */

    const mergedData: ResumeBuilderInput = {
      title:
        data.title ??
        existing.title ??
        "My Resume",

      candidateName:
        data.candidateName ??
        existing.candidateName ??
        "",

      candidateEmail:
        data.candidateEmail ??
        existing.candidateEmail ??
        "",

      candidatePhone:
        data.candidatePhone ??
        existing.candidatePhone ??
        undefined,

      location:
        data.location ??
        existing.location ??
        undefined,

      website:
        data.website ??
        existing.website ??
        undefined,

      linkedin:
        data.linkedin ??
        existing.linkedin ??
        undefined,

      github:
        data.github ??
        existing.github ??
        undefined,

      summary:
        data.summary ??
        existing.summary ??
        "",

      skills:
        data.skills ??
        existingSkills,

      experience:
        data.experience ??
        existingExperience,

      education:
        data.education ??
        existingEducation,

      projects:
        data.projects ??
        existingProjects,

      certifications:
        data.certifications ??
        existingCertifications,

      languages:
        data.languages ??
        existingLanguages,

      achievements:
        data.achievements ??
        existingAchievements,
    };

    /* ------------------------------------------------------------------------
       NORMALIZE
       ---------------------------------------------------------------------- */

    this.normalizeInput(
      mergedData
    );

    /* ------------------------------------------------------------------------
       VALIDATE
       ---------------------------------------------------------------------- */

    this.validateRequiredFields(
      mergedData
    );

    /* ------------------------------------------------------------------------
       GENERATE SEARCHABLE TEXT
       ---------------------------------------------------------------------- */

    const extractedText =
      this.generateResumeText(
        mergedData
      );

    /* ------------------------------------------------------------------------
       UPDATE DATA

       All JSON fields go through toPrismaJson().
       ---------------------------------------------------------------------- */

    const updateData = {
      candidateName:
        mergedData.candidateName.trim(),

      candidateEmail:
        mergedData.candidateEmail
          .trim()
          .toLowerCase(),

      candidatePhone:
        mergedData.candidatePhone?.trim() ||
        null,

      title:
        mergedData.title?.trim() ||
        "My Resume",

      location:
        mergedData.location?.trim() ||
        null,

      website:
        mergedData.website?.trim() ||
        null,

      linkedin:
        mergedData.linkedin?.trim() ||
        null,

      github:
        mergedData.github?.trim() ||
        null,

      fileName:
        mergedData.title?.trim() ||
        existing.fileName,

      extractedText,

      summary:
        mergedData.summary?.trim() ||
        "",

      skills:
        this.toPrismaJson(
          mergedData.skills ?? []
        ),

      experience:
        this.toPrismaJson(
          mergedData.experience ?? []
        ),

      education:
        this.toPrismaJson(
          mergedData.education ?? []
        ),

      projects:
        this.toPrismaJson(
          mergedData.projects ?? []
        ),

      certifications:
        this.toPrismaJson(
          mergedData.certifications ?? []
        ),

      languages:
        this.toPrismaJson(
          mergedData.languages ?? []
        ),

      achievements:
        this.toPrismaJson(
          mergedData.achievements ?? []
        ),
    };

    /* ------------------------------------------------------------------------
       DATABASE UPDATE
       ---------------------------------------------------------------------- */

    const resume =
      await prisma.resume.update({
        where: {
          id: existing.id,
        },

        data: updateData,
      });

    console.log(
      "========================================"
    );

    console.log(
      "✅ BUILDER RESUME UPDATED"
    );

    console.log(
      "Resume ID:",
      resume.id
    );

    console.log(
      "========================================"
    );

    return resume;
  }

  /* ==========================================================================
     DELETE RESUME
     ======================================================================== */

  static async deleteResume(
    id: string,
    user: CurrentUser
  ) {
    this.validateUser(user);

    const resumeId =
      typeof id === "string"
        ? id.trim()
        : "";

    if (!resumeId) {
      throw new Error(
        "Resume ID is required."
      );
    }

    /* ------------------------------------------------------------------------
       OWNERSHIP CHECK
       ---------------------------------------------------------------------- */

    const existing =
      await prisma.resume.findFirst({
        where: {
          id: resumeId,
          uploadedById: user.id,
        },
      });

    if (!existing) {
      throw new Error(
        "Resume not found."
      );
    }

    /* ------------------------------------------------------------------------
       DELETE
       ---------------------------------------------------------------------- */

    await prisma.resume.delete({
      where: {
        id: existing.id,
      },
    });

    console.log(
      "🗑️ BUILDER RESUME DELETED:",
      existing.id
    );

    return {
      success: true,

      message:
        "Resume deleted successfully.",
    };
  }

  /* ==========================================================================
     DUPLICATE RESUME
     ======================================================================== */

  static async duplicateResume(
    id: string,
    user: CurrentUser
  ) {
    this.validateUser(user);

    const resumeId =
      typeof id === "string"
        ? id.trim()
        : "";

    if (!resumeId) {
      throw new Error(
        "Resume ID is required."
      );
    }

    /* ------------------------------------------------------------------------
       GET ORIGINAL
       ---------------------------------------------------------------------- */

    const existing =
      await this.getResumeById(
        resumeId,
        user
      );

    /* ------------------------------------------------------------------------
       TITLE
       ---------------------------------------------------------------------- */

    const originalTitle =
      existing.title?.trim() ||
      "My Resume";

    const duplicateTitle =
      `${originalTitle} Copy`;

    /* ------------------------------------------------------------------------
       CREATE DUPLICATE
       ---------------------------------------------------------------------- */

    const duplicate =
      await prisma.resume.create({
        data: {
          uploadedById:
            user.id,

          candidateName:
            existing.candidateName,

          candidateEmail:
            existing.candidateEmail,

          candidatePhone:
            existing.candidatePhone,

          title:
            duplicateTitle,

          location:
            existing.location,

          website:
            existing.website,

          linkedin:
            existing.linkedin,

          github:
            existing.github,

          fileName:
            duplicateTitle,

          storedName:
            `builder-${Date.now()}-${user.id}`,

          fileSize: 0,

          mimeType:
            "application/json",

          extractedText:
            existing.extractedText,

          summary:
            existing.summary,

          skills:
            this.toPrismaJson(
              this.toStringArray(
                existing.skills
              )
            ),

          experience:
            this.toPrismaJson(
              this.toExperienceArray(
                existing.experience
              )
            ),

          education:
            this.toPrismaJson(
              this.toEducationArray(
                existing.education
              )
            ),

          projects:
            this.toPrismaJson(
              this.toProjectArray(
                existing.projects
              )
            ),

          certifications:
            this.toPrismaJson(
              this.toCertificationArray(
                existing.certifications
              )
            ),

          languages:
            this.toPrismaJson(
              this.toStringArray(
                existing.languages
              )
            ),

          achievements:
            this.toPrismaJson(
              this.toStringArray(
                existing.achievements
              )
            ),

          aiScore:
            existing.aiScore,

          strengths:
            this.toPrismaJson(
              this.toStringArray(
                existing.strengths
              )
            ),

          weaknesses:
            this.toPrismaJson(
              this.toStringArray(
                existing.weaknesses
              )
            ),

          suggestions:
            this.toPrismaJson(
              this.toStringArray(
                existing.suggestions
              )
            ),

          status:
            "DRAFT",
        },
      });

    console.log(
      "========================================"
    );

    console.log(
      "📋 BUILDER RESUME DUPLICATED"
    );

    console.log(
      "Original:",
      existing.id
    );

    console.log(
      "Duplicate:",
      duplicate.id
    );

    console.log(
      "========================================"
    );

    return duplicate;
  }

  /* ==========================================================================
     VALIDATE USER
     ======================================================================== */

  private static validateUser(
    user: CurrentUser
  ): void {
    if (!user) {
      throw new Error(
        "User is not authenticated."
      );
    }

    if (
      !user.id ||
      !user.id.trim()
    ) {
      throw new Error(
        "User ID is required."
      );
    }

    if (
      !user.email ||
      !user.email.trim()
    ) {
      throw new Error(
        "User email is required."
      );
    }
  }

  /* ==========================================================================
     VALIDATE REQUIRED FIELDS
     ======================================================================== */

  private static validateRequiredFields(
    data: ResumeBuilderInput
  ): void {
    if (
      !data.candidateName ||
      !data.candidateName.trim()
    ) {
      throw new Error(
        "Candidate name is required."
      );
    }

    if (
      !data.candidateEmail ||
      !data.candidateEmail.trim()
    ) {
      throw new Error(
        "Candidate email is required."
      );
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailRegex.test(
        data.candidateEmail.trim()
      )
    ) {
      throw new Error(
        "Invalid candidate email."
      );
    }
  }

  /* ==========================================================================
     NORMALIZE INPUT
     ======================================================================== */

  private static normalizeInput(
    data: ResumeBuilderInput
  ): void {
    data.candidateName =
      data.candidateName?.trim() ||
      "";

    data.candidateEmail =
      data.candidateEmail
        ?.trim()
        .toLowerCase() ||
      "";

    if (
      typeof data.candidatePhone ===
      "string"
    ) {
      data.candidatePhone =
        data.candidatePhone.trim();
    }

    if (
      typeof data.title ===
      "string"
    ) {
      data.title =
        data.title.trim();
    }

    if (
      typeof data.location ===
      "string"
    ) {
      data.location =
        data.location.trim();
    }

    if (
      typeof data.website ===
      "string"
    ) {
      data.website =
        data.website.trim();
    }

    if (
      typeof data.linkedin ===
      "string"
    ) {
      data.linkedin =
        data.linkedin.trim();
    }

    if (
      typeof data.github ===
      "string"
    ) {
      data.github =
        data.github.trim();
    }

    if (
      typeof data.summary ===
      "string"
    ) {
      data.summary =
        data.summary.trim();
    }

    /* ------------------------------------------------------------------------
       STRING ARRAYS
       ---------------------------------------------------------------------- */

    if (
      Array.isArray(data.skills)
    ) {
      data.skills =
        data.skills
          .filter(
            (
              item
            ): item is string =>
              typeof item ===
              "string"
          )
          .map(
            (item) =>
              item.trim()
          )
          .filter(Boolean);
    }

    if (
      Array.isArray(
        data.languages
      )
    ) {
      data.languages =
        data.languages
          .filter(
            (
              item
            ): item is string =>
              typeof item ===
              "string"
          )
          .map(
            (item) =>
              item.trim()
          )
          .filter(Boolean);
    }

    if (
      Array.isArray(
        data.achievements
      )
    ) {
      data.achievements =
        data.achievements
          .filter(
            (
              item
            ): item is string =>
              typeof item ===
              "string"
          )
          .map(
            (item) =>
              item.trim()
          )
          .filter(Boolean);
    }

    /* ------------------------------------------------------------------------
       EXPERIENCE
       ---------------------------------------------------------------------- */

    if (
      Array.isArray(
        data.experience
      )
    ) {
      data.experience =
        data.experience.map(
          (item) => ({
            ...item,

            company:
              item.company?.trim() ||
              "",

            position:
              item.position?.trim() ||
              "",

            location:
              item.location?.trim() ||
              undefined,

            startDate:
              item.startDate?.trim() ||
              "",

            endDate:
              item.endDate?.trim() ||
              undefined,

            description:
              item.description?.trim() ||
              undefined,

            responsibilities:
              Array.isArray(
                item.responsibilities
              )
                ? item.responsibilities
                    .filter(
                      (
                        value
                      ): value is string =>
                        typeof value ===
                        "string"
                    )
                    .map(
                      (value) =>
                        value.trim()
                    )
                    .filter(Boolean)
                : [],

            technologies:
              Array.isArray(
                item.technologies
              )
                ? item.technologies
                    .filter(
                      (
                        value
                      ): value is string =>
                        typeof value ===
                        "string"
                    )
                    .map(
                      (value) =>
                        value.trim()
                    )
                    .filter(Boolean)
                : [],
          })
        );
    }

    /* ------------------------------------------------------------------------
       EDUCATION
       ---------------------------------------------------------------------- */

    if (
      Array.isArray(
        data.education
      )
    ) {
      data.education =
        data.education.map(
          (item) => ({
            ...item,

            institution:
              item.institution?.trim() ||
              "",

            degree:
              item.degree?.trim() ||
              "",

            fieldOfStudy:
              item.fieldOfStudy?.trim() ||
              undefined,

            location:
              item.location?.trim() ||
              undefined,

            startDate:
              item.startDate?.trim() ||
              undefined,

            endDate:
              item.endDate?.trim() ||
              undefined,

            grade:
              item.grade?.trim() ||
              undefined,

            description:
              item.description?.trim() ||
              undefined,
          })
        );
    }

    /* ------------------------------------------------------------------------
       PROJECTS
       ---------------------------------------------------------------------- */

    if (
      Array.isArray(
        data.projects
      )
    ) {
      data.projects =
        data.projects.map(
          (item) => ({
            ...item,

            name:
              item.name?.trim() ||
              "",

            description:
              item.description?.trim() ||
              undefined,

            technologies:
              Array.isArray(
                item.technologies
              )
                ? item.technologies
                    .filter(
                      (
                        value
                      ): value is string =>
                        typeof value ===
                        "string"
                    )
                    .map(
                      (value) =>
                        value.trim()
                    )
                    .filter(Boolean)
                : [],

            url:
              item.url?.trim() ||
              undefined,

            github:
              item.github?.trim() ||
              undefined,

            startDate:
              item.startDate?.trim() ||
              undefined,

            endDate:
              item.endDate?.trim() ||
              undefined,
          })
        );
    }

    /* ------------------------------------------------------------------------
       CERTIFICATIONS
       ---------------------------------------------------------------------- */

    if (
      Array.isArray(
        data.certifications
      )
    ) {
      data.certifications =
        data.certifications.map(
          (item) => ({
            ...item,

            name:
              item.name?.trim() ||
              "",

            issuer:
              item.issuer?.trim() ||
              undefined,

            issueDate:
              item.issueDate?.trim() ||
              undefined,

            expiryDate:
              item.expiryDate?.trim() ||
              undefined,

            credentialId:
              item.credentialId?.trim() ||
              undefined,

            credentialUrl:
              item.credentialUrl?.trim() ||
              undefined,
          })
        );
    }
  }

  /* ==========================================================================
     GENERATE SEARCHABLE RESUME TEXT
     ======================================================================== */

  private static generateResumeText(
    data: ResumeBuilderInput
  ): string {
    const sections: string[] = [];

    /* ------------------------------------------------------------------------
       PERSONAL INFORMATION
       ---------------------------------------------------------------------- */

    sections.push(
      data.candidateName || ""
    );

    sections.push(
      data.candidateEmail || ""
    );

    sections.push(
      data.candidatePhone || ""
    );

    sections.push(
      data.location || ""
    );

    sections.push(
      data.website || ""
    );

    sections.push(
      data.linkedin || ""
    );

    sections.push(
      data.github || ""
    );

    /* ------------------------------------------------------------------------
       TITLE
       ---------------------------------------------------------------------- */

    if (
      data.title?.trim()
    ) {
      sections.push(
        "TITLE"
      );

      sections.push(
        data.title
      );
    }

    /* ------------------------------------------------------------------------
       SUMMARY
       ---------------------------------------------------------------------- */

    if (
      data.summary?.trim()
    ) {
      sections.push(
        "SUMMARY"
      );

      sections.push(
        data.summary
      );
    }

    /* ------------------------------------------------------------------------
       SKILLS
       ---------------------------------------------------------------------- */

    if (
      data.skills &&
      data.skills.length > 0
    ) {
      sections.push(
        "SKILLS"
      );

      sections.push(
        data.skills.join(", ")
      );
    }

    /* ------------------------------------------------------------------------
       EXPERIENCE
       ---------------------------------------------------------------------- */

    if (
      data.experience &&
      data.experience.length > 0
    ) {
      sections.push(
        "EXPERIENCE"
      );

      for (
        const experience of
        data.experience
      ) {
        sections.push(
          experience.position || ""
        );

        sections.push(
          experience.company || ""
        );

        sections.push(
          experience.location || ""
        );

        sections.push(
          `${experience.startDate || ""} - ${
            experience.current
              ? "Present"
              : experience.endDate ||
                ""
          }`
        );

        if (
          experience.description?.trim()
        ) {
          sections.push(
            experience.description
          );
        }

        if (
          experience.responsibilities &&
          experience.responsibilities
            .length > 0
        ) {
          sections.push(
            experience.responsibilities.join(
              "\n"
            )
          );
        }

        if (
          experience.technologies &&
          experience.technologies
            .length > 0
        ) {
          sections.push(
            experience.technologies.join(
              ", "
            )
          );
        }
      }
    }

    /* ------------------------------------------------------------------------
       EDUCATION
       ---------------------------------------------------------------------- */

    if (
      data.education &&
      data.education.length > 0
    ) {
      sections.push(
        "EDUCATION"
      );

      for (
        const education of
        data.education
      ) {
        sections.push(
          education.degree || ""
        );

        sections.push(
          education.fieldOfStudy || ""
        );

        sections.push(
          education.institution || ""
        );

        sections.push(
          education.location || ""
        );

        sections.push(
          education.grade || ""
        );

        if (
          education.startDate ||
          education.endDate
        ) {
          sections.push(
            `${education.startDate || ""} - ${
              education.endDate || ""
            }`
          );
        }

        if (
          education.description?.trim()
        ) {
          sections.push(
            education.description
          );
        }
      }
    }

    /* ------------------------------------------------------------------------
       PROJECTS
       ---------------------------------------------------------------------- */

    if (
      data.projects &&
      data.projects.length > 0
    ) {
      sections.push(
        "PROJECTS"
      );

      for (
        const project of
        data.projects
      ) {
        sections.push(
          project.name || ""
        );

        if (
          project.description?.trim()
        ) {
          sections.push(
            project.description
          );
        }

        if (
          project.technologies &&
          project.technologies.length >
            0
        ) {
          sections.push(
            project.technologies.join(
              ", "
            )
          );
        }

        sections.push(
          project.url || ""
        );

        sections.push(
          project.github || ""
        );

        if (
          project.startDate ||
          project.endDate
        ) {
          sections.push(
            `${project.startDate || ""} - ${
              project.endDate || ""
            }`
          );
        }
      }
    }

    /* ------------------------------------------------------------------------
       CERTIFICATIONS
       ---------------------------------------------------------------------- */

    if (
      data.certifications &&
      data.certifications.length > 0
    ) {
      sections.push(
        "CERTIFICATIONS"
      );

      for (
        const certification of
        data.certifications
      ) {
        sections.push(
          certification.name || ""
        );

        sections.push(
          certification.issuer || ""
        );

        sections.push(
          certification.issueDate || ""
        );

        sections.push(
          certification.expiryDate || ""
        );

        sections.push(
          certification.credentialId ||
            ""
        );

        sections.push(
          certification.credentialUrl ||
            ""
        );
      }
    }

    /* ------------------------------------------------------------------------
       LANGUAGES
       ---------------------------------------------------------------------- */

    if (
      data.languages &&
      data.languages.length > 0
    ) {
      sections.push(
        "LANGUAGES"
      );

      sections.push(
        data.languages.join(", ")
      );
    }

    /* ------------------------------------------------------------------------
       ACHIEVEMENTS
       ---------------------------------------------------------------------- */

    if (
      data.achievements &&
      data.achievements.length > 0
    ) {
      sections.push(
        "ACHIEVEMENTS"
      );

      sections.push(
        data.achievements.join(
          "\n"
        )
      );
    }

    /* ------------------------------------------------------------------------
       FINAL TEXT
       ---------------------------------------------------------------------- */

    return sections
      .filter(
        (value) =>
          typeof value ===
            "string" &&
          value.trim().length > 0
      )
      .join("\n");
  }

  /* ==========================================================================
     PRISMA JSON CONVERTER

     This fixes errors such as:

     Type 'ResumeExperience[]' is not assignable to type 'InputJsonValue'

     We serialize and parse the value to guarantee that the object contains
     only JSON-compatible values.
     ======================================================================== */

  private static toPrismaJson(
    value: unknown
  ): Prisma.InputJsonValue {
    const serialized =
      JSON.stringify(
        value ?? []
      );

    return JSON.parse(
      serialized
    ) as Prisma.InputJsonValue;
  }

  /* ==========================================================================
     JSON → STRING[]
     ======================================================================== */

  private static toStringArray(
    value: unknown
  ): string[] {
    if (
      !Array.isArray(value)
    ) {
      return [];
    }

    return value
      .filter(
        (
          item
        ): item is string =>
          typeof item ===
          "string"
      )
      .map(
        (item) =>
          item.trim()
      )
      .filter(Boolean);
  }

  /* ==========================================================================
     JSON → EXPERIENCE[]
     ======================================================================== */

  private static toExperienceArray(
    value: unknown
  ): ResumeExperience[] {
    if (
      !Array.isArray(value)
    ) {
      return [];
    }

    return value as ResumeExperience[];
  }

  /* ==========================================================================
     JSON → EDUCATION[]
     ======================================================================== */

  private static toEducationArray(
    value: unknown
  ): ResumeEducation[] {
    if (
      !Array.isArray(value)
    ) {
      return [];
    }

    return value as ResumeEducation[];
  }

  /* ==========================================================================
     JSON → PROJECT[]
     ======================================================================== */

  private static toProjectArray(
    value: unknown
  ): ResumeProject[] {
    if (
      !Array.isArray(value)
    ) {
      return [];
    }

    return value as ResumeProject[];
  }

  /* ==========================================================================
     JSON → CERTIFICATION[]
     ======================================================================== */

  private static toCertificationArray(
    value: unknown
  ): ResumeCertification[] {
    if (
      !Array.isArray(value)
    ) {
      return [];
    }

    return value as ResumeCertification[];
  }
}