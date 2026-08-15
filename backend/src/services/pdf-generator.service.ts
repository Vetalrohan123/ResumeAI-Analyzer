import PDFDocument from "pdfkit";

interface ResumeExperience {
  company?: string;
  position?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  responsibilities?: string[];
  technologies?: string[];
}

interface ResumeEducation {
  institution?: string;
  degree?: string;
  fieldOfStudy?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  grade?: string;
  description?: string;
}

interface ResumeProject {
  name?: string;
  description?: string;
  technologies?: string[];
  url?: string;
  github?: string;
  startDate?: string;
  endDate?: string;
}

interface ResumeCertification {
  name?: string;
  issuer?: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface ResumePDFData {
  title?: string;

  candidateName?: string;
  candidateEmail?: string;
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

export class PDFGeneratorService {
 
  private static readonly PAGE_WIDTH = 595.28;

  private static readonly PAGE_HEIGHT = 841.89;

  private static readonly MARGIN = 45;

  private static readonly CONTENT_WIDTH =
    PDFGeneratorService.PAGE_WIDTH -
    PDFGeneratorService.MARGIN * 2;

  static generateResumePDF(
    resume: ResumePDFData
  ): PDFKit.PDFDocument {
    const doc =
      new PDFDocument({
        size: "A4",

        margins: {
          top: this.MARGIN,
          bottom: this.MARGIN,
          left: this.MARGIN,
          right: this.MARGIN,
        },

        bufferPages: true,

        info: {
          Title:
            resume.title ||
            `${resume.candidateName || "Resume"} Resume`,

          Author:
            resume.candidateName ||
            "Resume Builder",

          Subject:
            "Professional Resume",

          Creator:
            "AI Resume Analyzer",
        },
      });

    this.renderHeader(
      doc,
      resume
    );

    if (
      typeof resume.summary === "string" &&
      resume.summary.trim()
    ) {
      this.renderSectionTitle(
        doc,
        "Professional Summary"
      );

      this.renderParagraph(
        doc,
        resume.summary
      );
    }

    if (
      Array.isArray(resume.skills) &&
      resume.skills.length > 0
    ) {
      this.renderSkills(
        doc,
        resume.skills
      );
    }

    if (
      Array.isArray(resume.experience) &&
      resume.experience.length > 0
    ) {
      this.renderExperience(
        doc,
        resume.experience
      );
    }

    if (
      Array.isArray(resume.education) &&
      resume.education.length > 0
    ) {
      this.renderEducation(
        doc,
        resume.education
      );
    }

    if (
      Array.isArray(resume.projects) &&
      resume.projects.length > 0
    ) {
      this.renderProjects(
        doc,
        resume.projects
      );
    }

    if (
      Array.isArray(resume.certifications) &&
      resume.certifications.length > 0
    ) {
      this.renderCertifications(
        doc,
        resume.certifications
      );
    }

    if (
      Array.isArray(resume.languages) &&
      resume.languages.length > 0
    ) {
      this.renderSimpleListSection(
        doc,
        "Languages",
        resume.languages
      );
    }

    if (
      Array.isArray(resume.achievements) &&
      resume.achievements.length > 0
    ) {
      this.renderAchievements(
        doc,
        resume.achievements
      );
    }

    this.addPageNumbers(doc);

    return doc;
  }

  /* ==========================================================================
     HEADER
     ======================================================================== */

  private static renderHeader(
    doc: PDFKit.PDFDocument,
    resume: ResumePDFData
  ): void {
    const name =
      resume.candidateName?.trim() ||
      "Your Name";

    doc
      .font("Helvetica-Bold")
      .fontSize(22)
      .fillColor("#111827")
      .text(name, {
        align: "center",
        width: this.CONTENT_WIDTH,
      });

    doc.moveDown(0.35);

    const contactItems: string[] = [];

    if (
      typeof resume.candidateEmail === "string" &&
      resume.candidateEmail.trim()
    ) {
      contactItems.push(
        resume.candidateEmail.trim()
      );
    }

    if (
      typeof resume.candidatePhone === "string" &&
      resume.candidatePhone.trim()
    ) {
      contactItems.push(
        resume.candidatePhone.trim()
      );
    }

    if (
      typeof resume.location === "string" &&
      resume.location.trim()
    ) {
      contactItems.push(
        resume.location.trim()
      );
    }

    if (
      typeof resume.website === "string" &&
      resume.website.trim()
    ) {
      contactItems.push(
        resume.website.trim()
      );
    }

    if (
      typeof resume.linkedin === "string" &&
      resume.linkedin.trim()
    ) {
      contactItems.push(
        resume.linkedin.trim()
      );
    }

    if (
      typeof resume.github === "string" &&
      resume.github.trim()
    ) {
      contactItems.push(
        resume.github.trim()
      );
    }

    if (contactItems.length > 0) {
      doc
        .font("Helvetica")
        .fontSize(8.5)
        .fillColor("#4B5563")
        .text(
          contactItems.join("  |  "),
          {
            align: "center",
            width: this.CONTENT_WIDTH,
          }
        );
    }

    doc.moveDown(0.6);

    this.drawDivider(doc);

    doc.moveDown(0.5);
  }

  /* ==========================================================================
     SECTION TITLE
     ======================================================================== */

  private static renderSectionTitle(
    doc: PDFKit.PDFDocument,
    title: string
  ): void {
    this.ensureSpace(doc, 55);

    doc
      .font("Helvetica-Bold")
      .fontSize(10.5)
      .fillColor("#111827")
      .text(title.toUpperCase(), {
        width: this.CONTENT_WIDTH,
      });

    doc.moveDown(0.25);

    this.drawDivider(doc);

    doc.moveDown(0.35);
  }

  /* ==========================================================================
     PARAGRAPH
     ======================================================================== */

  private static renderParagraph(
    doc: PDFKit.PDFDocument,
    text: string
  ): void {
    const cleanText =
      text?.trim();

    if (!cleanText) {
      return;
    }

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#374151")
      .text(cleanText, {
        width: this.CONTENT_WIDTH,
        align: "left",
        lineGap: 2,
      });

    doc.moveDown(0.55);
  }

  /* ==========================================================================
     SKILLS
     ======================================================================== */

  private static renderSkills(
    doc: PDFKit.PDFDocument,
    skills: string[]
  ): void {
    const cleanSkills =
      skills
        .filter(
          (skill): skill is string =>
            typeof skill === "string" &&
            skill.trim().length > 0
        )
        .map(
          (skill) =>
            skill.trim()
        );

    if (
      cleanSkills.length === 0
    ) {
      return;
    }

    this.renderSectionTitle(
      doc,
      "Skills"
    );

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#374151")
      .text(
        cleanSkills.join("  •  "),
        {
          width: this.CONTENT_WIDTH,
          lineGap: 2,
        }
      );

    doc.moveDown(0.55);
  }

  /* ==========================================================================
     EXPERIENCE
     ======================================================================== */

  private static renderExperience(
    doc: PDFKit.PDFDocument,
    experiences: ResumeExperience[]
  ): void {
    this.renderSectionTitle(
      doc,
      "Experience"
    );

    for (
      const experience of experiences
    ) {
      if (!experience) {
        continue;
      }

      this.ensureSpace(doc, 85);

      /* ----------------------------------------------------------------------
         POSITION
         -------------------------------------------------------------------- */

      if (
        experience.position?.trim()
      ) {
        doc
          .font("Helvetica-Bold")
          .fontSize(10)
          .fillColor("#111827")
          .text(
            experience.position.trim(),
            {
              width: this.CONTENT_WIDTH,
            }
          );
      }

      /* ----------------------------------------------------------------------
         DATE
         -------------------------------------------------------------------- */

      const dateText =
        this.formatDateRange(
          experience.startDate,
          experience.endDate,
          experience.current
        );

      if (dateText) {
        doc
          .font("Helvetica")
          .fontSize(8.5)
          .fillColor("#4B5563")
          .text(dateText, {
            align: "right",
            width: this.CONTENT_WIDTH,
          });
      }

      /* ----------------------------------------------------------------------
         COMPANY
         -------------------------------------------------------------------- */

      const companyParts: string[] = [];

      if (
        experience.company?.trim()
      ) {
        companyParts.push(
          experience.company.trim()
        );
      }

      if (
        experience.location?.trim()
      ) {
        companyParts.push(
          experience.location.trim()
        );
      }

      if (
        companyParts.length > 0
      ) {
        doc
          .font("Helvetica-Oblique")
          .fontSize(8.5)
          .fillColor("#4B5563")
          .text(
            companyParts.join("  |  "),
            {
              width: this.CONTENT_WIDTH,
            }
          );
      }

      /* ----------------------------------------------------------------------
         DESCRIPTION
         -------------------------------------------------------------------- */

      if (
        experience.description?.trim()
      ) {
        doc.moveDown(0.2);

        doc
          .font("Helvetica")
          .fontSize(8.8)
          .fillColor("#374151")
          .text(
            experience.description.trim(),
            {
              width: this.CONTENT_WIDTH,
              lineGap: 1.5,
            }
          );
      }

      /* ----------------------------------------------------------------------
         RESPONSIBILITIES
         -------------------------------------------------------------------- */

      if (
        Array.isArray(
          experience.responsibilities
        )
      ) {
        for (
          const responsibility of
            experience.responsibilities
        ) {
          if (
            typeof responsibility !==
              "string" ||
            !responsibility.trim()
          ) {
            continue;
          }

          this.renderBullet(
            doc,
            responsibility.trim()
          );
        }
      }

      /* ----------------------------------------------------------------------
         TECHNOLOGIES
         -------------------------------------------------------------------- */

      if (
        Array.isArray(
          experience.technologies
        ) &&
        experience.technologies.length > 0
      ) {
        const technologies =
          experience.technologies
            .filter(
              (technology) =>
                typeof technology ===
                  "string" &&
                technology.trim()
            )
            .map(
              (technology) =>
                technology.trim()
            );

        if (
          technologies.length > 0
        ) {
          doc.moveDown(0.15);

          doc
            .font("Helvetica-Bold")
            .fontSize(8)
            .fillColor("#4B5563")
            .text(
              `Technologies: ${technologies.join(", ")}`,
              {
                width:
                  this.CONTENT_WIDTH,
              }
            );
        }
      }

      doc.moveDown(0.55);
    }
  }

  /* ==========================================================================
     EDUCATION
     ======================================================================== */

  private static renderEducation(
    doc: PDFKit.PDFDocument,
    educationList: ResumeEducation[]
  ): void {
    this.renderSectionTitle(
      doc,
      "Education"
    );

    for (
      const education of educationList
    ) {
      if (!education) {
        continue;
      }

      this.ensureSpace(doc, 60);

      if (
        education.degree?.trim()
      ) {
        doc
          .font("Helvetica-Bold")
          .fontSize(9.5)
          .fillColor("#111827")
          .text(
            education.degree.trim(),
            {
              width:
                this.CONTENT_WIDTH,
            }
          );
      }

      const dateText =
        this.formatDateRange(
          education.startDate,
          education.endDate,
          false
        );

      if (dateText) {
        doc
          .font("Helvetica")
          .fontSize(8.5)
          .fillColor("#4B5563")
          .text(dateText, {
            align: "right",
            width:
              this.CONTENT_WIDTH,
          });
      }

      const institutionParts: string[] =
        [];

      if (
        education.institution?.trim()
      ) {
        institutionParts.push(
          education.institution.trim()
        );
      }

      if (
        education.fieldOfStudy?.trim()
      ) {
        institutionParts.push(
          education.fieldOfStudy.trim()
        );
      }

      if (
        education.location?.trim()
      ) {
        institutionParts.push(
          education.location.trim()
        );
      }

      if (
        institutionParts.length > 0
      ) {
        doc
          .font("Helvetica-Oblique")
          .fontSize(8.5)
          .fillColor("#4B5563")
          .text(
            institutionParts.join("  |  "),
            {
              width:
                this.CONTENT_WIDTH,
            }
          );
      }

      if (
        education.grade?.trim()
      ) {
        doc
          .font("Helvetica")
          .fontSize(8.5)
          .fillColor("#374151")
          .text(
            `Grade: ${education.grade.trim()}`,
            {
              width:
                this.CONTENT_WIDTH,
            }
          );
      }

      if (
        education.description?.trim()
      ) {
        doc.moveDown(0.15);

        doc
          .font("Helvetica")
          .fontSize(8.5)
          .fillColor("#374151")
          .text(
            education.description.trim(),
            {
              width:
                this.CONTENT_WIDTH,
              lineGap: 1.5,
            }
          );
      }

      doc.moveDown(0.45);
    }
  }

  private static renderProjects(
    doc: PDFKit.PDFDocument,
    projects: ResumeProject[]
  ): void {
    this.renderSectionTitle(
      doc,
      "Projects"
    );

    for (
      const project of projects
    ) {
      if (!project) {
        continue;
      }

      this.ensureSpace(doc, 65);

      if (
        project.name?.trim()
      ) {
        doc
          .font("Helvetica-Bold")
          .fontSize(9.5)
          .fillColor("#111827")
          .text(
            project.name.trim(),
            {
              width:
                this.CONTENT_WIDTH,
            }
          );
      }

      const dateText =
        this.formatDateRange(
          project.startDate,
          project.endDate,
          false
        );

      if (dateText) {
        doc
          .font("Helvetica")
          .fontSize(8)
          .fillColor("#4B5563")
          .text(dateText, {
            align: "right",
            width:
              this.CONTENT_WIDTH,
          });
      }

      if (
        project.description?.trim()
      ) {
        doc
          .font("Helvetica")
          .fontSize(8.7)
          .fillColor("#374151")
          .text(
            project.description.trim(),
            {
              width:
                this.CONTENT_WIDTH,
              lineGap: 1.5,
            }
          );
      }

      if (
        Array.isArray(
          project.technologies
        ) &&
        project.technologies.length > 0
      ) {
        const technologies =
          project.technologies
            .filter(
              (technology) =>
                typeof technology ===
                  "string" &&
                technology.trim()
            )
            .map(
              (technology) =>
                technology.trim()
            );

        if (
          technologies.length > 0
        ) {
          doc
            .font("Helvetica-Bold")
            .fontSize(8)
            .fillColor("#4B5563")
            .text(
              `Technologies: ${technologies.join(", ")}`,
              {
                width:
                  this.CONTENT_WIDTH,
              }
            );
        }
      }

      const links: string[] = [];

      if (
        project.url?.trim()
      ) {
        links.push(
          project.url.trim()
        );
      }

      if (
        project.github?.trim()
      ) {
        links.push(
          project.github.trim()
        );
      }

      if (links.length > 0) {
        doc
          .font("Helvetica")
          .fontSize(7.8)
          .fillColor("#4B5563")
          .text(
            links.join("  |  "),
            {
              width:
                this.CONTENT_WIDTH,
            }
          );
      }

      doc.moveDown(0.45);
    }
  }

  private static renderCertifications(
    doc: PDFKit.PDFDocument,
    certifications: ResumeCertification[]
  ): void {
    this.renderSectionTitle(
      doc,
      "Certifications"
    );

    for (
      const certification of certifications
    ) {
      if (!certification) {
        continue;
      }

      this.ensureSpace(doc, 45);

      if (
        certification.name?.trim()
      ) {
        doc
          .font("Helvetica-Bold")
          .fontSize(9)
          .fillColor("#111827")
          .text(
            certification.name.trim(),
            {
              width:
                this.CONTENT_WIDTH,
            }
          );
      }

      const details: string[] = [];

      if (
        certification.issuer?.trim()
      ) {
        details.push(
          certification.issuer.trim()
        );
      }

      if (
        certification.issueDate?.trim()
      ) {
        details.push(
          certification.issueDate.trim()
        );
      }

      if (
        certification.expiryDate?.trim()
      ) {
        details.push(
          `Expires: ${certification.expiryDate.trim()}`
        );
      }

      if (
        certification.credentialId?.trim()
      ) {
        details.push(
          `Credential ID: ${certification.credentialId.trim()}`
        );
      }

      if (details.length > 0) {
        doc
          .font("Helvetica")
          .fontSize(8.3)
          .fillColor("#4B5563")
          .text(
            details.join("  |  "),
            {
              width:
                this.CONTENT_WIDTH,
            }
          );
      }

      if (
        certification.credentialUrl?.trim()
      ) {
        doc
          .font("Helvetica")
          .fontSize(7.8)
          .fillColor("#4B5563")
          .text(
            certification.credentialUrl.trim(),
            {
              width:
                this.CONTENT_WIDTH,
            }
          );
      }

      doc.moveDown(0.4);
    }
  }

  /* ==========================================================================
     SIMPLE LIST SECTION
     ======================================================================== */

  private static renderSimpleListSection(
    doc: PDFKit.PDFDocument,
    title: string,
    items: string[]
  ): void {
    const cleanItems =
      items
        .filter(
          (item): item is string =>
            typeof item === "string" &&
            item.trim().length > 0
        )
        .map(
          (item) =>
            item.trim()
        );

    if (
      cleanItems.length === 0
    ) {
      return;
    }

    this.renderSectionTitle(
      doc,
      title
    );

    doc
      .font("Helvetica")
      .fontSize(8.8)
      .fillColor("#374151")
      .text(
        cleanItems.join("  •  "),
        {
          width:
            this.CONTENT_WIDTH,
          lineGap: 2,
        }
      );

    doc.moveDown(0.5);
  }

  /* ==========================================================================
     ACHIEVEMENTS
     ======================================================================== */

  private static renderAchievements(
    doc: PDFKit.PDFDocument,
    achievements: string[]
  ): void {
    const cleanAchievements =
      achievements.filter(
        (achievement) =>
          typeof achievement ===
            "string" &&
          achievement.trim()
      );

    if (
      cleanAchievements.length === 0
    ) {
      return;
    }

    this.renderSectionTitle(
      doc,
      "Achievements"
    );

    for (
      const achievement of
        cleanAchievements
    ) {
      this.renderBullet(
        doc,
        achievement.trim()
      );
    }

    doc.moveDown(0.45);
  }

  /* ==========================================================================
     BULLET RENDERER
     ========================================================================

     IMPORTANT:

     PDFKit's TypeScript definitions in your project do not support:

       hanging: 4

     Therefore we manually create the bullet indentation.

     ======================================================================== */

  private static renderBullet(
    doc: PDFKit.PDFDocument,
    text: string
  ): void {
    if (!text?.trim()) {
      return;
    }

    const bulletWidth = 12;

    const textWidth =
      this.CONTENT_WIDTH -
      bulletWidth;

    const startX =
      this.MARGIN;

    const startY =
      doc.y;

    doc
      .font("Helvetica")
      .fontSize(8.8)
      .fillColor("#374151")
      .text(
        "•",
        startX,
        startY,
        {
          width:
            bulletWidth,
          lineGap: 1.5,
        }
      );

    doc
      .font("Helvetica")
      .fontSize(8.8)
      .fillColor("#374151")
      .text(
        text,
        startX + bulletWidth,
        startY,
        {
          width: textWidth,
          lineGap: 1.5,
        }
      );
  }

  /* ==========================================================================
     DATE FORMATTER
     ======================================================================== */

  private static formatDateRange(
    startDate?: string,
    endDate?: string,
    current?: boolean
  ): string {
    const start =
      typeof startDate === "string"
        ? startDate.trim()
        : "";

    let end = "";

    if (current) {
      end = "Present";
    } else {
      end =
        typeof endDate === "string"
          ? endDate.trim()
          : "";
    }

    if (
      start &&
      end
    ) {
      return `${start} - ${end}`;
    }

    return start || end;
  }

  /* ==========================================================================
     DIVIDER
     ======================================================================== */

  private static drawDivider(
    doc: PDFKit.PDFDocument
  ): void {
    const y = doc.y;

    doc
      .moveTo(
        this.MARGIN,
        y
      )
      .lineTo(
        this.PAGE_WIDTH -
          this.MARGIN,
        y
      )
      .lineWidth(0.6)
      .strokeColor("#D1D5DB")
      .stroke();
  }

  /* ==========================================================================
     PAGE SPACE CHECK
     ======================================================================== */

  private static ensureSpace(
    doc: PDFKit.PDFDocument,
    requiredHeight: number
  ): void {
    const bottom =
      this.PAGE_HEIGHT -
      this.MARGIN -
      20;

    if (
      doc.y +
        requiredHeight >
      bottom
    ) {
      doc.addPage();
    }
  }

  /* ==========================================================================
     PAGE NUMBERS
     ======================================================================== */

  private static addPageNumbers(
    doc: PDFKit.PDFDocument
  ): void {
    const range =
      doc.bufferedPageRange();

    for (
      let i = range.start;
      i <
      range.start +
        range.count;
      i++
    ) {
      doc.switchToPage(i);

      const pageNumber =
        i -
        range.start +
        1;

      doc
        .font("Helvetica")
        .fontSize(7)
        .fillColor("#9CA3AF")
        .text(
          `Page ${pageNumber}`,
          this.MARGIN,
          this.PAGE_HEIGHT - 25,
          {
            width:
              this.CONTENT_WIDTH,
            align: "center",
          }
        );
    }
  }
}