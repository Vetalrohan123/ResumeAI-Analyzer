import PDFDocument from "pdfkit";

import {
  ResumeBuilderService,
  type ResumeBuilderInput,
  type ResumeExperience,
  type ResumeEducation,
  type ResumeProject,
  type ResumeCertification,
} from "./resume-builder.service.js";

/* ============================================================================
   TYPES
   ========================================================================== */

export type ResumeTemplate =
  | "modern"
  | "professional"
  | "minimal";

interface CurrentUser {
  id: string;
  email: string;
  role: string;
}

/* ============================================================================
   PDF LAYOUT
   ========================================================================== */

interface Layout {
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  contentWidth: number;
  contentBottom: number;
}

/* ============================================================================
   RESUME PDF SERVICE
   ========================================================================== */

export class ResumePDFService {
  /* ==========================================================================
     GENERATE PDF
     ======================================================================== */

  static async generatePDF(
    resumeId: string,
    user: CurrentUser,
    template: ResumeTemplate = "modern"
  ): Promise<Buffer> {
    if (!resumeId?.trim()) {
      throw new Error(
        "Resume ID is required."
      );
    }

    if (!user?.id) {
      throw new Error(
        "User is not authenticated."
      );
    }

    const selectedTemplate =
      this.normalizeTemplate(
        template
      );

    const resume =
      await ResumeBuilderService.getResumeById(
        resumeId,
        user
      );

    const data =
      this.convertResumeToBuilderData(
        resume
      );

    const document =
      new PDFDocument({
        size: "A4",
        margin: 0,
        autoFirstPage: true,
        info: {
          Title:
            data.title ||
            `${data.candidateName} Resume`,
          Author:
            data.candidateName ||
            "Resume Builder",
          Subject:
            "Professional Resume",
          Creator:
            "Resume Builder",
        },
      });

    const chunks: Buffer[] = [];

    return new Promise<Buffer>(
      (resolve, reject) => {
        document.on(
          "data",
          (chunk: Buffer) => {
            chunks.push(chunk);
          }
        );

        document.on(
          "end",
          () => {
            resolve(
              Buffer.concat(chunks)
            );
          }
        );

        document.on(
          "error",
          reject
        );

        try {
          switch (
            selectedTemplate
          ) {
            case "professional":
              this.renderProfessional(
                document,
                data
              );
              break;

            case "minimal":
              this.renderMinimal(
                document,
                data
              );
              break;

            case "modern":
            default:
              this.renderModern(
                document,
                data
              );
              break;
          }

          document.end();
        } catch (error) {
          reject(error);
        }
      }
    );
  }

  /* ==========================================================================
     TEMPLATE NORMALIZATION
     ======================================================================== */

  private static normalizeTemplate(
    template: string
  ): ResumeTemplate {
    switch (template) {
      case "professional":
        return "professional";

      case "minimal":
        return "minimal";

      case "modern":
      default:
        return "modern";
    }
  }

  /* ==========================================================================
     LAYOUT HELPERS
     ======================================================================== */

  private static getLayout(
    doc: PDFKit.PDFDocument,
    template: ResumeTemplate
  ): Layout {
    if (
      template === "modern"
    ) {
      const sidebarWidth = 175;

      return {
        marginTop: 45,
        marginBottom: 45,
        marginLeft:
          sidebarWidth + 35,
        marginRight: 30,
        contentWidth:
          doc.page.width -
          sidebarWidth -
          65,
        contentBottom:
          doc.page.height - 40,
      };
    }

    if (
      template === "professional"
    ) {
      const margin = 45;

      return {
        marginTop: 40,
        marginBottom: 45,
        marginLeft: margin,
        marginRight: margin,
        contentWidth:
          doc.page.width -
          margin * 2,
        contentBottom:
          doc.page.height - 45,
      };
    }

    const margin = 55;

    return {
      marginTop: 55,
      marginBottom: 50,
      marginLeft: margin,
      marginRight: margin,
      contentWidth:
        doc.page.width -
        margin * 2,
      contentBottom:
        doc.page.height - 50,
    };
  }

  /* ==========================================================================
     PAGE BREAK
     ======================================================================== */

  private static ensureSpace(
    doc: PDFKit.PDFDocument,
    y: number,
    requiredHeight: number,
    template: ResumeTemplate,
    data?: ResumeBuilderInput
  ): number {
    const layout =
      this.getLayout(
        doc,
        template
      );

    if (
      y + requiredHeight <=
      layout.contentBottom
    ) {
      return y;
    }

    doc.addPage({
      size: "A4",
      margin: 0,
    });

    if (
      template === "modern" &&
      data
    ) {
      this.drawModernSidebar(
        doc,
        data
      );
    }

    return layout.marginTop;
  }

  /* ==========================================================================
     MODERN SIDEBAR
     ======================================================================== */

  private static drawModernSidebar(
    doc: PDFKit.PDFDocument,
    data: ResumeBuilderInput
  ): void {
    const sidebarWidth = 175;
    const pageHeight =
      doc.page.height;

    doc
      .save()
      .rect(
        0,
        0,
        sidebarWidth,
        pageHeight
      )
      .fill("#172033")
      .restore();

    doc
      .fillColor("#ffffff")
      .font("Helvetica-Bold")
      .fontSize(22)
      .text(
        data.candidateName ||
          "Your Name",
        25,
        45,
        {
          width:
            sidebarWidth - 45,
        }
      );

    doc
      .fillColor("#94a3b8")
      .font("Helvetica")
      .fontSize(9)
      .text(
        data.title ||
          "Professional",
        25,
        82,
        {
          width:
            sidebarWidth - 45,
        }
      );

    let sidebarY = 125;

    this.sidebarHeading(
      doc,
      "CONTACT",
      sidebarY
    );

    sidebarY += 25;

    const contacts = [
      data.candidateEmail,
      data.candidatePhone,
      data.location,
      data.website,
      data.linkedin,
      data.github,
    ].filter(Boolean);

    for (
      const contact of contacts
    ) {
      doc
        .fillColor("#dbe4f0")
        .font("Helvetica")
        .fontSize(8)
        .text(
          String(contact),
          25,
          sidebarY,
          {
            width:
              sidebarWidth - 45,
            lineGap: 2,
          }
        );

      sidebarY =
        doc.y + 10;
    }

    if (
      data.skills?.length
    ) {
      this.sidebarHeading(
        doc,
        "SKILLS",
        sidebarY + 10
      );

      sidebarY += 35;

      for (
        const skill of data.skills
      ) {
        doc
          .fillColor("#dbe4f0")
          .font("Helvetica")
          .fontSize(8)
          .text(
            `• ${skill}`,
            25,
            sidebarY,
            {
              width:
                sidebarWidth - 45,
            }
          );

        sidebarY =
          doc.y + 5;
      }
    }

    if (
      data.languages?.length
    ) {
      this.sidebarHeading(
        doc,
        "LANGUAGES",
        sidebarY + 10
      );

      sidebarY += 35;

      for (
        const language of
          data.languages
      ) {
        doc
          .fillColor("#dbe4f0")
          .font("Helvetica")
          .fontSize(8)
          .text(
            `• ${language}`,
            25,
            sidebarY,
            {
              width:
                sidebarWidth - 45,
            }
          );

        sidebarY =
          doc.y + 5;
      }
    }
  }

  /* ==========================================================================
     MODERN TEMPLATE
     ======================================================================== */

  private static renderModern(
    doc: PDFKit.PDFDocument,
    data: ResumeBuilderInput
  ): void {
    this.drawModernSidebar(
      doc,
      data
    );

    const layout =
      this.getLayout(
        doc,
        "modern"
      );

    const x =
      layout.marginLeft;

    const width =
      layout.contentWidth;

    let y =
      layout.marginTop;

    /* ------------------------------------------------------------------------
       PROFILE
       ---------------------------------------------------------------------- */

    if (data.summary) {
      y =
        this.ensureSpace(
          doc,
          y,
          80,
          "modern",
          data
        );

      y =
        this.sectionTitle(
          doc,
          "PROFILE",
          x,
          y,
          width
        );

      doc
        .fillColor("#334155")
        .font("Helvetica")
        .fontSize(9)
        .text(
          data.summary,
          x,
          y,
          {
            width,
            lineGap: 3,
          }
        );

      y =
        doc.y + 20;
    }

    /* ------------------------------------------------------------------------
       EXPERIENCE
       ---------------------------------------------------------------------- */

    if (
      data.experience?.length
    ) {
      y =
        this.ensureSpace(
          doc,
          y,
          40,
          "modern",
          data
        );

      y =
        this.sectionTitle(
          doc,
          "EXPERIENCE",
          x,
          y,
          width
        );

      for (
        const experience of
          data.experience
      ) {
        y =
          this.ensureSpace(
            doc,
            y,
            100,
            "modern",
            data
          );

        y =
          this.renderExperience(
            doc,
            experience,
            x,
            y,
            width
          );
      }
    }

    /* ------------------------------------------------------------------------
       EDUCATION
       ---------------------------------------------------------------------- */

    if (
      data.education?.length
    ) {
      y =
        this.ensureSpace(
          doc,
          y,
          40,
          "modern",
          data
        );

      y =
        this.sectionTitle(
          doc,
          "EDUCATION",
          x,
          y,
          width
        );

      for (
        const education of
          data.education
      ) {
        y =
          this.ensureSpace(
            doc,
            y,
            70,
            "modern",
            data
          );

        y =
          this.renderEducation(
            doc,
            education,
            x,
            y,
            width
          );
      }
    }

    /* ------------------------------------------------------------------------
       PROJECTS
       ---------------------------------------------------------------------- */

    if (
      data.projects?.length
    ) {
      y =
        this.ensureSpace(
          doc,
          y,
          40,
          "modern",
          data
        );

      y =
        this.sectionTitle(
          doc,
          "PROJECTS",
          x,
          y,
          width
        );

      for (
        const project of
          data.projects
      ) {
        y =
          this.ensureSpace(
            doc,
            y,
            70,
            "modern",
            data
          );

        y =
          this.renderProject(
            doc,
            project,
            x,
            y,
            width
          );
      }
    }

    /* ------------------------------------------------------------------------
       CERTIFICATIONS
       ---------------------------------------------------------------------- */

    if (
      data.certifications?.length
    ) {
      y =
        this.ensureSpace(
          doc,
          y,
          40,
          "modern",
          data
        );

      y =
        this.sectionTitle(
          doc,
          "CERTIFICATIONS",
          x,
          y,
          width
        );

      for (
        const certification of
          data.certifications
      ) {
        y =
          this.ensureSpace(
            doc,
            y,
            50,
            "modern",
            data
          );

        y =
          this.renderCertification(
            doc,
            certification,
            x,
            y,
            width
          );
      }
    }

    /* ------------------------------------------------------------------------
       ACHIEVEMENTS
       ---------------------------------------------------------------------- */

    if (
      data.achievements?.length
    ) {
      y =
        this.ensureSpace(
          doc,
          y,
          40,
          "modern",
          data
        );

      y =
        this.sectionTitle(
          doc,
          "ACHIEVEMENTS",
          x,
          y,
          width
        );

      for (
        const achievement of
          data.achievements
      ) {
        y =
          this.ensureSpace(
            doc,
            y,
            25,
            "modern",
            data
          );

        doc
          .fillColor("#334155")
          .font("Helvetica")
          .fontSize(9)
          .text(
            `• ${achievement}`,
            x,
            y,
            {
              width,
            }
          );

        y =
          doc.y + 5;
      }
    }
  }

  /* ==========================================================================
     PROFESSIONAL TEMPLATE
     ======================================================================== */

  private static renderProfessional(
    doc: PDFKit.PDFDocument,
    data: ResumeBuilderInput
  ): void {
    const layout =
      this.getLayout(
        doc,
        "professional"
      );

    const margin =
      layout.marginLeft;

    const width =
      layout.contentWidth;

    let y = 40;

    /* ------------------------------------------------------------------------
       HEADER
       ---------------------------------------------------------------------- */

    doc
      .fillColor("#111827")
      .font("Helvetica-Bold")
      .fontSize(24)
      .text(
        data.candidateName ||
          "Your Name",
        margin,
        y,
        {
          width,
          align: "center",
        }
      );

    y += 32;

    doc
      .fillColor("#374151")
      .font("Helvetica")
      .fontSize(9)
      .text(
        this.contactLine(data),
        margin,
        y,
        {
          width,
          align: "center",
        }
      );

    y += 25;

    doc
      .moveTo(
        margin,
        y
      )
      .lineTo(
        doc.page.width -
          margin,
        y
      )
      .lineWidth(1)
      .stroke("#111827");

    y += 22;

    /* ------------------------------------------------------------------------
       SUMMARY
       ---------------------------------------------------------------------- */

    if (data.summary) {
      y =
        this.ensureSpace(
          doc,
          y,
          80,
          "professional"
        );

      y =
        this.professionalHeading(
          doc,
          "PROFESSIONAL SUMMARY",
          margin,
          y,
          width
        );

      doc
        .fillColor("#374151")
        .font("Helvetica")
        .fontSize(9)
        .text(
          data.summary,
          margin,
          y,
          {
            width,
            lineGap: 3,
          }
        );

      y =
        doc.y + 16;
    }

    /* ------------------------------------------------------------------------
       SKILLS
       ---------------------------------------------------------------------- */

    if (
      data.skills?.length
    ) {
      y =
        this.ensureSpace(
          doc,
          y,
          50,
          "professional"
        );

      y =
        this.professionalHeading(
          doc,
          "TECHNICAL SKILLS",
          margin,
          y,
          width
        );

      doc
        .fillColor("#374151")
        .font("Helvetica")
        .fontSize(9)
        .text(
          data.skills.join(
            "  •  "
          ),
          margin,
          y,
          {
            width,
          }
        );

      y =
        doc.y + 16;
    }

    /* ------------------------------------------------------------------------
       EXPERIENCE
       ---------------------------------------------------------------------- */

    if (
      data.experience?.length
    ) {
      y =
        this.ensureSpace(
          doc,
          y,
          40,
          "professional"
        );

      y =
        this.professionalHeading(
          doc,
          "PROFESSIONAL EXPERIENCE",
          margin,
          y,
          width
        );

      for (
        const experience of
          data.experience
      ) {
        y =
          this.ensureSpace(
            doc,
            y,
            100,
            "professional"
          );

        y =
          this.renderExperience(
            doc,
            experience,
            margin,
            y,
            width
          );
      }
    }

    /* ------------------------------------------------------------------------
       EDUCATION
       ---------------------------------------------------------------------- */

    if (
      data.education?.length
    ) {
      y =
        this.ensureSpace(
          doc,
          y,
          40,
          "professional"
        );

      y =
        this.professionalHeading(
          doc,
          "EDUCATION",
          margin,
          y,
          width
        );

      for (
        const education of
          data.education
      ) {
        y =
          this.ensureSpace(
            doc,
            y,
            70,
            "professional"
          );

        y =
          this.renderEducation(
            doc,
            education,
            margin,
            y,
            width
          );
      }
    }

    /* ------------------------------------------------------------------------
       PROJECTS
       ---------------------------------------------------------------------- */

    if (
      data.projects?.length
    ) {
      y =
        this.ensureSpace(
          doc,
          y,
          40,
          "professional"
        );

      y =
        this.professionalHeading(
          doc,
          "PROJECTS",
          margin,
          y,
          width
        );

      for (
        const project of
          data.projects
      ) {
        y =
          this.ensureSpace(
            doc,
            y,
            70,
            "professional"
          );

        y =
          this.renderProject(
            doc,
            project,
            margin,
            y,
            width
          );
      }
    }

    /* ------------------------------------------------------------------------
       CERTIFICATIONS
       ---------------------------------------------------------------------- */

    if (
      data.certifications?.length
    ) {
      y =
        this.ensureSpace(
          doc,
          y,
          40,
          "professional"
        );

      y =
        this.professionalHeading(
          doc,
          "CERTIFICATIONS",
          margin,
          y,
          width
        );

      for (
        const certification of
          data.certifications
      ) {
        y =
          this.ensureSpace(
            doc,
            y,
            50,
            "professional"
          );

        y =
          this.renderCertification(
            doc,
            certification,
            margin,
            y,
            width
          );
      }
    }

    /* ------------------------------------------------------------------------
       LANGUAGES
       ---------------------------------------------------------------------- */

    if (
      data.languages?.length
    ) {
      y =
        this.ensureSpace(
          doc,
          y,
          50,
          "professional"
        );

      y =
        this.professionalHeading(
          doc,
          "LANGUAGES",
          margin,
          y,
          width
        );

      doc
        .fillColor("#374151")
        .font("Helvetica")
        .fontSize(9)
        .text(
          data.languages.join(
            "  •  "
          ),
          margin,
          y,
          {
            width,
          }
        );

      y =
        doc.y + 16;
    }

    /* ------------------------------------------------------------------------
       ACHIEVEMENTS
       ---------------------------------------------------------------------- */

    if (
      data.achievements?.length
    ) {
      y =
        this.ensureSpace(
          doc,
          y,
          40,
          "professional"
        );

      y =
        this.professionalHeading(
          doc,
          "ACHIEVEMENTS",
          margin,
          y,
          width
        );

      for (
        const achievement of
          data.achievements
      ) {
        y =
          this.ensureSpace(
            doc,
            y,
            25,
            "professional"
          );

        doc
          .fillColor("#374151")
          .font("Helvetica")
          .fontSize(9)
          .text(
            `• ${achievement}`,
            margin,
            y,
            {
              width,
            }
          );

        y =
          doc.y + 4;
      }
    }
  }

  /* ==========================================================================
     MINIMAL TEMPLATE
     ======================================================================== */

  private static renderMinimal(
    doc: PDFKit.PDFDocument,
    data: ResumeBuilderInput
  ): void {
    const layout =
      this.getLayout(
        doc,
        "minimal"
      );

    const margin =
      layout.marginLeft;

    const width =
      layout.contentWidth;

    let y = 55;

    /* ------------------------------------------------------------------------
       HEADER
       ---------------------------------------------------------------------- */

    doc
      .fillColor("#000000")
      .font("Helvetica-Bold")
      .fontSize(25)
      .text(
        data.candidateName ||
          "Your Name",
        margin,
        y,
        {
          width,
        }
      );

    y += 35;

    doc
      .fillColor("#555555")
      .font("Helvetica")
      .fontSize(9)
      .text(
        this.contactLine(data),
        margin,
        y,
        {
          width,
        }
      );

    y += 25;

    /* ------------------------------------------------------------------------
       SUMMARY
       ---------------------------------------------------------------------- */

    if (data.summary) {
      y =
        this.ensureSpace(
          doc,
          y,
          80,
          "minimal"
        );

      y =
        this.minimalHeading(
          doc,
          "SUMMARY",
          margin,
          y,
          width
        );

      doc
        .fillColor("#333333")
        .font("Helvetica")
        .fontSize(9)
        .text(
          data.summary,
          margin,
          y,
          {
            width,
            lineGap: 3,
          }
        );

      y =
        doc.y + 18;
    }

    /* ------------------------------------------------------------------------
       SKILLS
       ---------------------------------------------------------------------- */

    if (
      data.skills?.length
    ) {
      y =
        this.ensureSpace(
          doc,
          y,
          50,
          "minimal"
        );

      y =
        this.minimalHeading(
          doc,
          "SKILLS",
          margin,
          y,
          width
        );

      doc
        .fillColor("#333333")
        .font("Helvetica")
        .fontSize(9)
        .text(
          data.skills.join(
            " • "
          ),
          margin,
          y,
          {
            width,
          }
        );

      y =
        doc.y + 18;
    }

    /* ------------------------------------------------------------------------
       EXPERIENCE
       ---------------------------------------------------------------------- */

    if (
      data.experience?.length
    ) {
      y =
        this.ensureSpace(
          doc,
          y,
          40,
          "minimal"
        );

      y =
        this.minimalHeading(
          doc,
          "EXPERIENCE",
          margin,
          y,
          width
        );

      for (
        const experience of
          data.experience
      ) {
        y =
          this.ensureSpace(
            doc,
            y,
            100,
            "minimal"
          );

        y =
          this.renderExperience(
            doc,
            experience,
            margin,
            y,
            width
          );
      }
    }

    /* ------------------------------------------------------------------------
       EDUCATION
       ---------------------------------------------------------------------- */

    if (
      data.education?.length
    ) {
      y =
        this.ensureSpace(
          doc,
          y,
          40,
          "minimal"
        );

      y =
        this.minimalHeading(
          doc,
          "EDUCATION",
          margin,
          y,
          width
        );

      for (
        const education of
          data.education
      ) {
        y =
          this.ensureSpace(
            doc,
            y,
            70,
            "minimal"
          );

        y =
          this.renderEducation(
            doc,
            education,
            margin,
            y,
            width
          );
      }
    }

    /* ------------------------------------------------------------------------
       PROJECTS
       ---------------------------------------------------------------------- */

    if (
      data.projects?.length
    ) {
      y =
        this.ensureSpace(
          doc,
          y,
          40,
          "minimal"
        );

      y =
        this.minimalHeading(
          doc,
          "PROJECTS",
          margin,
          y,
          width
        );

      for (
        const project of
          data.projects
      ) {
        y =
          this.ensureSpace(
            doc,
            y,
            70,
            "minimal"
          );

        y =
          this.renderProject(
            doc,
            project,
            margin,
            y,
            width
          );
      }
    }

    /* ------------------------------------------------------------------------
       CERTIFICATIONS
       ---------------------------------------------------------------------- */

    if (
      data.certifications?.length
    ) {
      y =
        this.ensureSpace(
          doc,
          y,
          40,
          "minimal"
        );

      y =
        this.minimalHeading(
          doc,
          "CERTIFICATIONS",
          margin,
          y,
          width
        );

      for (
        const certification of
          data.certifications
      ) {
        y =
          this.ensureSpace(
            doc,
            y,
            50,
            "minimal"
          );

        y =
          this.renderCertification(
            doc,
            certification,
            margin,
            y,
            width
          );
      }
    }

    /* ------------------------------------------------------------------------
       LANGUAGES
       ---------------------------------------------------------------------- */

    if (
      data.languages?.length
    ) {
      y =
        this.ensureSpace(
          doc,
          y,
          50,
          "minimal"
        );

      y =
        this.minimalHeading(
          doc,
          "LANGUAGES",
          margin,
          y,
          width
        );

      doc
        .fillColor("#333333")
        .font("Helvetica")
        .fontSize(9)
        .text(
          data.languages.join(
            " • "
          ),
          margin,
          y,
          {
            width,
          }
        );

      y =
        doc.y + 18;
    }

    /* ------------------------------------------------------------------------
       ACHIEVEMENTS
       ---------------------------------------------------------------------- */

    if (
      data.achievements?.length
    ) {
      y =
        this.ensureSpace(
          doc,
          y,
          40,
          "minimal"
        );

      y =
        this.minimalHeading(
          doc,
          "ACHIEVEMENTS",
          margin,
          y,
          width
        );

      for (
        const achievement of
          data.achievements
      ) {
        y =
          this.ensureSpace(
            doc,
            y,
            25,
            "minimal"
          );

        doc
          .fillColor("#333333")
          .font("Helvetica")
          .fontSize(9)
          .text(
            `• ${achievement}`,
            margin,
            y,
            {
              width,
            }
          );

        y =
          doc.y + 4;
      }
    }
  }

  /* ==========================================================================
     EXPERIENCE
     ======================================================================== */

  private static renderExperience(
    doc: PDFKit.PDFDocument,
    experience: ResumeExperience,
    x: number,
    y: number,
    width: number
  ): number {
    doc
      .fillColor("#111827")
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(
        experience.position ||
          "",
        x,
        y,
        {
          width,
        }
      );

    y =
      doc.y + 2;

    doc
      .fillColor("#475569")
      .font("Helvetica-Bold")
      .fontSize(9)
      .text(
        experience.company ||
          "",
        x,
        y,
        {
          width,
        }
      );

    const date =
      `${experience.startDate || ""} - ${
        experience.current
          ? "Present"
          : experience.endDate ||
            ""
      }`;

    doc
      .fillColor("#64748b")
      .font("Helvetica")
      .fontSize(8)
      .text(
        date,
        x,
        y,
        {
          width,
          align: "right",
        }
      );

    y =
      Math.max(
        doc.y,
        y + 13
      ) + 4;

    if (
      experience.location
    ) {
      doc
        .fillColor("#64748b")
        .font("Helvetica")
        .fontSize(8)
        .text(
          experience.location,
          x,
          y,
          {
            width,
          }
        );

      y =
        doc.y + 5;
    }

    if (
      experience.description
    ) {
      doc
        .fillColor("#374151")
        .font("Helvetica")
        .fontSize(9)
        .text(
          experience.description,
          x,
          y,
          {
            width,
            lineGap: 2,
          }
        );

      y =
        doc.y + 5;
    }

    if (
      experience.responsibilities
        ?.length
    ) {
      for (
        const responsibility of
          experience.responsibilities
      ) {
        doc
          .fillColor("#374151")
          .font("Helvetica")
          .fontSize(8.5)
          .text(
            `• ${responsibility}`,
            x,
            y,
            {
              width,
              lineGap: 1,
            }
          );

        y =
          doc.y + 3;
      }
    }

    if (
      experience.technologies
        ?.length
    ) {
      doc
        .fillColor("#64748b")
        .font("Helvetica")
        .fontSize(8)
        .text(
          `Technologies: ${experience.technologies.join(
            ", "
          )}`,
          x,
          y,
          {
            width,
          }
        );

      y =
        doc.y + 5;
    }

    return y + 8;
  }

  /* ==========================================================================
     EDUCATION
     ======================================================================== */

  private static renderEducation(
    doc: PDFKit.PDFDocument,
    education: ResumeEducation,
    x: number,
    y: number,
    width: number
  ): number {
    doc
      .fillColor("#111827")
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(
        education.degree ||
          "",
        x,
        y,
        {
          width,
        }
      );

    y =
      doc.y + 2;

    doc
      .fillColor("#475569")
      .font("Helvetica-Bold")
      .fontSize(9)
      .text(
        education.institution ||
          "",
        x,
        y,
        {
          width,
        }
      );

    const date =
      `${education.startDate || ""} - ${
        education.endDate || ""
      }`;

    if (
      education.startDate ||
      education.endDate
    ) {
      doc
        .fillColor("#64748b")
        .font("Helvetica")
        .fontSize(8)
        .text(
          date,
          x,
          y,
          {
            width,
            align: "right",
          }
        );
    }

    y =
      Math.max(
        doc.y,
        y + 13
      ) + 4;

    if (
      education.fieldOfStudy
    ) {
      doc
        .fillColor("#374151")
        .font("Helvetica")
        .fontSize(8.5)
        .text(
          education.fieldOfStudy,
          x,
          y,
          {
            width,
          }
        );

      y =
        doc.y + 3;
    }

    if (
      education.location
    ) {
      doc
        .fillColor("#64748b")
        .font("Helvetica")
        .fontSize(8)
        .text(
          education.location,
          x,
          y,
          {
            width,
          }
        );

      y =
        doc.y + 3;
    }

    if (education.grade) {
      doc
        .fillColor("#64748b")
        .font("Helvetica")
        .fontSize(8)
        .text(
          `Grade: ${education.grade}`,
          x,
          y,
          {
            width,
          }
        );

      y =
        doc.y + 3;
    }

    if (
      education.description
    ) {
      doc
        .fillColor("#374151")
        .font("Helvetica")
        .fontSize(8.5)
        .text(
          education.description,
          x,
          y,
          {
            width
          }
        );

      y =
        doc.y + 4;
    }

    return y + 8;
  }

  /* ==========================================================================
     PROJECT
     ======================================================================== */

  private static renderProject(
    doc: PDFKit.PDFDocument,
    project: ResumeProject,
    x: number,
    y: number,
    width: number
  ): number {
    doc
      .fillColor("#111827")
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(
        project.name ||
          "",
        x,
        y,
        {
          width,
        }
      );

    y =
      doc.y + 3;

    if (
      project.description
    ) {
      doc
        .fillColor("#374151")
        .font("Helvetica")
        .fontSize(8.5)
        .text(
          project.description,
          x,
          y,
          {
            width,
            lineGap: 2,
          }
        );

      y =
        doc.y + 4;
    }

    if (
      project.technologies
        ?.length
    ) {
      doc
        .fillColor("#64748b")
        .font("Helvetica")
        .fontSize(8)
        .text(
          `Tech: ${project.technologies.join(
            ", "
          )}`,
          x,
          y,
          {
            width,
          }
        );

      y =
        doc.y + 3;
    }

    if (
      project.startDate ||
      project.endDate
    ) {
      const dates =
        `${project.startDate || ""} - ${
          project.endDate || ""
        }`;

      doc
        .fillColor("#64748b")
        .font("Helvetica")
        .fontSize(8)
        .text(
          dates,
          x,
          y,
          {
            width,
          }
        );

      y =
        doc.y + 3;
    }

    const links = [
      project.url,
      project.github,
    ].filter(Boolean);

    if (links.length) {
      doc
        .fillColor("#475569")
        .font("Helvetica")
        .fontSize(7.5)
        .text(
          links.join("  |  "),
          x,
          y,
          {
            width,
          }
        );

      y =
        doc.y + 4;
    }

    return y + 8;
  }

  /* ==========================================================================
     CERTIFICATION
     ======================================================================== */

  private static renderCertification(
    doc: PDFKit.PDFDocument,
    certification: ResumeCertification,
    x: number,
    y: number,
    width: number
  ): number {
    doc
      .fillColor("#111827")
      .font("Helvetica-Bold")
      .fontSize(9)
      .text(
        certification.name ||
          "",
        x,
        y,
        {
          width,
        }
      );

    y =
      doc.y + 2;

    const details = [
      certification.issuer,
      certification.issueDate,
      certification.expiryDate,
      certification.credentialId,
    ].filter(Boolean);

    if (details.length) {
      doc
        .fillColor("#64748b")
        .font("Helvetica")
        .fontSize(8)
        .text(
          details.join(" • "),
          x,
          y,
          {
            width,
          }
        );

      y =
        doc.y + 4;
    }

    if (
      certification.credentialUrl
    ) {
      doc
        .fillColor("#475569")
        .font("Helvetica")
        .fontSize(7.5)
        .text(
          certification.credentialUrl,
          x,
          y,
          {
            width,
          }
        );

      y =
        doc.y + 4;
    }

    return y + 6;
  }

  /* ==========================================================================
     MODERN SECTION
     ======================================================================== */

  private static sectionTitle(
    doc: PDFKit.PDFDocument,
    title: string,
    x: number,
    y: number,
    width: number
  ): number {
    doc
      .fillColor("#172033")
      .font("Helvetica-Bold")
      .fontSize(11)
      .text(
        title,
        x,
        y,
        {
          width,
        }
      );

    doc
      .moveTo(
        x,
        y + 17
      )
      .lineTo(
        x + width,
        y + 17
      )
      .lineWidth(0.7)
      .stroke("#cbd5e1");

    return y + 27;
  }

  /* ==========================================================================
     PROFESSIONAL SECTION
     ======================================================================== */

  private static professionalHeading(
    doc: PDFKit.PDFDocument,
    title: string,
    x: number,
    y: number,
    width: number
  ): number {
    doc
      .fillColor("#111827")
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(
        title,
        x,
        y,
        {
          width,
        }
      );

    doc
      .moveTo(
        x,
        y + 15
      )
      .lineTo(
        x + width,
        y + 15
      )
      .lineWidth(0.6)
      .stroke("#9ca3af");

    return y + 25;
  }

  /* ==========================================================================
     MINIMAL SECTION
     ======================================================================== */

  private static minimalHeading(
    doc: PDFKit.PDFDocument,
    title: string,
    x: number,
    y: number,
    width: number
  ): number {
    doc
      .fillColor("#000000")
      .font("Helvetica-Bold")
      .fontSize(9)
      .text(
        title,
        x,
        y,
        {
          width,
        }
      );

    doc
      .moveTo(
        x,
        y + 13
      )
      .lineTo(
        x + width,
        y + 13
      )
      .lineWidth(0.5)
      .stroke("#999999");

    return y + 22;
  }

  /* ==========================================================================
     SIDEBAR HEADING
     ======================================================================== */

  private static sidebarHeading(
    doc: PDFKit.PDFDocument,
    text: string,
    y: number
  ): void {
    doc
      .fillColor("#ffffff")
      .font("Helvetica-Bold")
      .fontSize(8)
      .text(
        text,
        25,
        y
      );
  }

  /* ==========================================================================
     CONTACT LINE
     ======================================================================== */

  private static contactLine(
    data: ResumeBuilderInput
  ): string {
    return [
      data.candidateEmail,
      data.candidatePhone,
      data.location,
      data.website,
      data.linkedin,
      data.github,
    ]
      .filter(Boolean)
      .join("  |  ");
  }

  /* ==========================================================================
     DATABASE → BUILDER DATA
     ======================================================================== */

  private static convertResumeToBuilderData(
    resume: any
  ): ResumeBuilderInput {
    return {
      title:
        resume.title ||
        resume.fileName ||
        "My Resume",

      candidateName:
        resume.candidateName ||
        "",

      candidateEmail:
        resume.candidateEmail ||
        "",

      candidatePhone:
        resume.candidatePhone ||
        undefined,

      location:
        resume.location ||
        undefined,

      website:
        resume.website ||
        undefined,

      linkedin:
        resume.linkedin ||
        undefined,

      github:
        resume.github ||
        undefined,

      summary:
        resume.summary ||
        "",

      skills:
        this.toStringArray(
          resume.skills
        ),

      experience:
        this.toExperienceArray(
          resume.experience
        ),

      education:
        this.toEducationArray(
          resume.education
        ),

      projects:
        this.toProjectArray(
          resume.projects
        ),

      certifications:
        this.toCertificationArray(
          resume.certifications
        ),

      languages:
        this.toStringArray(
          resume.languages
        ),

      achievements:
        this.toStringArray(
          resume.achievements
        ),
    };
  }

  /* ==========================================================================
     JSON HELPERS
     ======================================================================== */

  private static toStringArray(
    value: unknown
  ): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter(
      (
        item
      ): item is string =>
        typeof item === "string"
    );
  }

  private static toExperienceArray(
    value: unknown
  ): ResumeExperience[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value as ResumeExperience[];
  }

  private static toEducationArray(
    value: unknown
  ): ResumeEducation[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value as ResumeEducation[];
  }

  private static toProjectArray(
    value: unknown
  ): ResumeProject[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value as ResumeProject[];
  }

  private static toCertificationArray(
    value: unknown
  ): ResumeCertification[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value as ResumeCertification[];
  }
}