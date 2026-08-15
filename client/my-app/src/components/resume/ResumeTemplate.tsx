"use client";

import {
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

export interface ResumeData {
  personal: {
    name: string;
    role: string;
    email: string;
    phone: string;
    location: string;
    website?: string;
  };

  summary: string;

  experience: {
    company: string;
    role: string;
    location?: string;
    startDate: string;
    endDate: string;
    bullets: string[];
  }[];

  education: {
    institution: string;
    degree: string;
    year: string;
  }[];

  skills: {
    category: string;
    items: string[];
  }[];

  projects: {
    name: string;
    description: string;
    technologies: string[];
  }[];

  certifications: {
    name: string;
    issuer: string;
    year: string;
  }[];
}

interface ResumeTemplateProps {
  data: ResumeData;
  template?: string;
}

export default function ResumeTemplate({
  data,
  template = "modern",
}: ResumeTemplateProps) {
  const isClassic = template === "classic";
  const isMinimal = template === "minimal";

  return (
    <article
      className={`
        mx-auto
        min-h-[1120px]
        w-full
        max-w-[794px]
        bg-white
        p-10
        text-zinc-900
        shadow-2xl
        transition-all
        duration-300
        ${
          isClassic
            ? "font-serif"
            : "font-sans"
        }
      `}
    >
      {/* =========================
          HEADER
      ========================== */}

      <header
        className={`
          border-b
          pb-6
          ${
            isClassic
              ? "border-zinc-900 text-center"
              : isMinimal
                ? "border-zinc-200"
                : "border-violet-500"
          }
        `}
      >
        <h1 className="text-4xl font-bold tracking-tight">
          {data.personal.name || "Your Name"}
        </h1>

        <p
          className={`
            mt-1
            text-lg
            ${
              isClassic
                ? "text-zinc-700"
                : "text-violet-700"
            }
          `}
        >
          {data.personal.role || "Professional Title"}
        </p>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-600">
          {/* Email */}

          {data.personal.email && (
            <span
              className="flex items-center gap-1"
              key="email"
            >
              <Mail className="h-3.5 w-3.5" />

              {data.personal.email}
            </span>
          )}

          {/* Phone */}

          {data.personal.phone && (
            <span
              className="flex items-center gap-1"
              key="phone"
            >
              <Phone className="h-3.5 w-3.5" />

              {data.personal.phone}
            </span>
          )}

          {/* Location */}

          {data.personal.location && (
            <span
              className="flex items-center gap-1"
              key="location"
            >
              <MapPin className="h-3.5 w-3.5" />

              {data.personal.location}
            </span>
          )}

          {/* Website */}

          {data.personal.website && (
            <span key="website">
              {data.personal.website}
            </span>
          )}
        </div>
      </header>

      {/* =========================
          CONTENT
      ========================== */}

      <div className="space-y-7 pt-6">

        {/* =========================
            SUMMARY
        ========================== */}

        {data.summary && (
          <ResumeBlock
            key="summary"
            title="Professional Summary"
          >
            <p className="text-sm leading-6 text-zinc-700">
              {data.summary}
            </p>
          </ResumeBlock>
        )}

        {/* =========================
            EXPERIENCE
        ========================== */}

        {data.experience &&
          data.experience.length > 0 && (
            <ResumeBlock
              key="experience"
              title="Experience"
            >
              <div className="space-y-5">
                {data.experience.map(
                  (item, index) => (
                    <div
                      key={`
                        experience-
                        ${item.company || "company"}-
                        ${item.role || "role"}-
                        ${item.startDate || "start"}-
                        ${index}
                      `}
                    >
                      {/* Experience Header */}

                      <div className="flex flex-col justify-between gap-1 sm:flex-row">
                        <div>
                          <h3 className="font-semibold">
                            {item.role}
                          </h3>

                          <p className="text-sm text-zinc-600">
                            {item.company}

                            {item.location
                              ? ` · ${item.location}`
                              : ""}
                          </p>
                        </div>

                        <span className="text-xs text-zinc-500">
                          {item.startDate}

                          {" — "}

                          {item.endDate}
                        </span>
                      </div>

                      {/* Experience Bullets */}

                      {item.bullets &&
                        item.bullets.length > 0 && (
                          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-5 text-zinc-700">
                            {item.bullets.map(
                              (
                                bullet,
                                bulletIndex,
                              ) => (
                                <li
                                  key={`
                                    ${item.company || "company"}-
                                    ${item.role || "role"}-
                                    bullet-
                                    ${bulletIndex}
                                  `}
                                >
                                  {bullet}
                                </li>
                              ),
                            )}
                          </ul>
                        )}
                    </div>
                  ),
                )}
              </div>
            </ResumeBlock>
          )}

        {/* =========================
            EDUCATION
        ========================== */}

        {data.education &&
          data.education.length > 0 && (
            <ResumeBlock
              key="education"
              title="Education"
            >
              <div className="space-y-3">
                {data.education.map(
                  (item, index) => (
                    <div
                      key={`
                        education-
                        ${item.institution || "institution"}-
                        ${item.degree || "degree"}-
                        ${index}
                      `}
                      className="flex flex-col justify-between sm:flex-row"
                    >
                      <div>
                        <h3 className="font-semibold">
                          {item.degree}
                        </h3>

                        <p className="text-sm text-zinc-600">
                          {item.institution}
                        </p>
                      </div>

                      <span className="text-xs text-zinc-500">
                        {item.year}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </ResumeBlock>
          )}

        {/* =========================
            SKILLS
        ========================== */}

        {data.skills &&
          data.skills.length > 0 && (
            <ResumeBlock
              key="skills"
              title="Skills"
            >
              <div className="space-y-2">
                {data.skills.map(
                  (group, index) => (
                    <div
                      key={`
                        skill-
                        ${group.category || "category"}-
                        ${index}
                      `}
                      className="text-sm"
                    >
                      <span className="font-semibold">
                        {group.category}
                        {": "}
                      </span>

                      <span className="text-zinc-700">
                        {group.items &&
                        group.items.length > 0
                          ? group.items.join(
                              " · ",
                            )
                          : "No skills added"}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </ResumeBlock>
          )}

        {/* =========================
            PROJECTS
        ========================== */}

        {data.projects &&
          data.projects.length > 0 && (
            <ResumeBlock
              key="projects"
              title="Projects"
            >
              <div className="space-y-4">
                {data.projects.map(
                  (project, index) => (
                    <div
                      key={`
                        project-
                        ${project.name || "project"}-
                        ${index}
                      `}
                    >
                      <h3 className="font-semibold">
                        {project.name}
                      </h3>

                      <p className="mt-1 text-sm leading-5 text-zinc-700">
                        {project.description}
                      </p>

                      {project.technologies &&
                        project.technologies
                          .length > 0 && (
                          <p className="mt-1 text-xs text-zinc-500">
                            {project.technologies.join(
                              " · ",
                            )}
                          </p>
                        )}
                    </div>
                  ),
                )}
              </div>
            </ResumeBlock>
          )}

        {/* =========================
            CERTIFICATIONS
        ========================== */}

        {data.certifications &&
          data.certifications.length > 0 && (
            <ResumeBlock
              key="certifications"
              title="Certifications"
            >
              <div className="space-y-2">
                {data.certifications.map(
                  (item, index) => (
                    <div
                      key={`
                        certification-
                        ${item.name || "certification"}-
                        ${item.issuer || "issuer"}-
                        ${index}
                      `}
                      className="flex justify-between gap-4 text-sm"
                    >
                      <span>
                        <strong>
                          {item.name}
                        </strong>

                        {" · "}

                        {item.issuer}
                      </span>

                      <span className="text-zinc-500">
                        {item.year}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </ResumeBlock>
          )}
      </div>
    </article>
  );
}

/* =========================================
   RESUME SECTION
========================================= */

function ResumeBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-zinc-900">
        {title}
      </h2>

      {children}
    </section>
  );
}