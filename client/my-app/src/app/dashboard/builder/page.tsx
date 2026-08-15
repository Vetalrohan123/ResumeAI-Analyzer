"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Plus,
  Trash2,
  Sparkles,
  GripVertical,
  User,
  Briefcase,
  GraduationCap,
  Code2,
  FolderKanban,
  Eye,
  X,
  Save,
  Loader2,
  LayoutTemplate,
  Check,
} from "lucide-react";

import {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  ApiError,
} from "@/lib/api";

/* ==========================================================================
   TYPES
   ========================================================================== */

type TemplateType =
  | "modern"
  | "professional"
  | "minimal"
  | "executive";

type Experience = {
  id: number | string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
};

type Education = {
  id: number | string;
  degree: string;
  school: string;
  location: string;
  year: string;
};

type Project = {
  id: number | string;
  name: string;
  description: string;
  technologies: string;
};

type Personal = {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  github: string;
  linkedin: string;
};

type ResumeBuilderData = {
  title: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  location: string;
  website?: string;
  linkedin: string;
  github: string;
  summary: string;
  skills: string[];
  experience: Omit<Experience, "id">[];
  education: Omit<Education, "id">[];
  projects: Omit<Project, "id">[];
  certifications: unknown[];
  languages: string[];
  achievements: string[];
  template: TemplateType;
};

type ResumeBuilderResponse = {
  id: string;
  title?: string | null;
  candidateName?: string | null;
  candidateEmail?: string | null;
  candidatePhone?: string | null;
  location?: string | null;
  website?: string | null;
  linkedin?: string | null;
  github?: string | null;
  summary?: string | null;
  skills?: unknown;
  experience?: unknown;
  education?: unknown;
  projects?: unknown;
  certifications?: unknown;
  languages?: unknown;
  achievements?: unknown;
  template?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type AIAction =
  | "improve_summary"
  | "improve_experience"
  | "optimize_skills"
  | "improve_project";

/* ==========================================================================
   DEFAULT DATA
   ========================================================================== */

const defaultPersonal: Personal = {
  name: "Rohan Vetal",
  title: "Full Stack Developer",
  email: "rohan@example.com",
  phone: "+91 98765 43210",
  location: "Pune, Maharashtra",
  github: "github.com/rohanvetal",
  linkedin: "linkedin.com/in/rohanvetal",
};

const defaultSummary =
  "Full Stack Developer passionate about building scalable web applications using React, Next.js, Node.js, TypeScript, and PostgreSQL. Experienced in developing modern SaaS products and AI-powered applications.";

const defaultSkills =
  "React, Next.js, TypeScript, JavaScript, Node.js, Express.js, PostgreSQL, Prisma, MongoDB, Docker, Git, REST APIs";

const defaultExperience: Experience[] = [
  {
    id: 1,
    role: "Full Stack Developer",
    company: "Tech Company",
    location: "Pune, India",
    startDate: "2025",
    endDate: "Present",
    description:
      "Built scalable web applications using React, Next.js and Node.js.\nDeveloped REST APIs and integrated PostgreSQL databases.\nImproved application performance and user experience.",
  },
];

const defaultEducation: Education[] = [
  {
    id: 1,
    degree: "Bachelor of Computer Applications",
    school: "Indira College",
    location: "Pune, India",
    year: "2023 - 2026",
  },
];

const defaultProjects: Project[] = [
  {
    id: 1,
    name: "AI Resume Analyzer",
    description:
      "AI-powered resume analysis platform that evaluates ATS compatibility, identifies missing skills and compares resumes against job descriptions.",
    technologies:
      "Next.js, TypeScript, Node.js, PostgreSQL, Prisma, Gemini AI",
  },
];

/* ==========================================================================
   TEMPLATES
   ========================================================================== */

const templates: {
  id: TemplateType;
  name: string;
  description: string;
}[] = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean and ATS-friendly",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Corporate and polished",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple and elegant",
  },
  {
    id: "executive",
    name: "Executive",
    description: "Premium leadership style",
  },
];

/* ==========================================================================
   HELPERS
   ========================================================================== */

function toStringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string => typeof item === "string",
  );
}

function normalizeTemplate(value: unknown): TemplateType {
  if (
    value === "modern" ||
    value === "professional" ||
    value === "minimal" ||
    value === "executive"
  ) {
    return value;
  }

  return "modern";
}

function normalizeExperience(value: unknown): Experience[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const data =
      item && typeof item === "object"
        ? (item as Record<string, unknown>)
        : {};

    return {
      id:
        typeof data.id === "string" ||
        typeof data.id === "number"
          ? data.id
          : Date.now() + index,

      role: toStringValue(data.role),
      company: toStringValue(data.company),
      location: toStringValue(data.location),
      startDate: toStringValue(data.startDate),
      endDate: toStringValue(data.endDate),
      description: toStringValue(data.description),
    };
  });
}

function normalizeEducation(value: unknown): Education[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const data =
      item && typeof item === "object"
        ? (item as Record<string, unknown>)
        : {};

    return {
      id:
        typeof data.id === "string" ||
        typeof data.id === "number"
          ? data.id
          : Date.now() + index,

      degree: toStringValue(data.degree),
      school: toStringValue(data.school),
      location: toStringValue(data.location),
      year: toStringValue(data.year),
    };
  });
}

function normalizeProjects(value: unknown): Project[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const data =
      item && typeof item === "object"
        ? (item as Record<string, unknown>)
        : {};

    return {
      id:
        typeof data.id === "string" ||
        typeof data.id === "number"
          ? data.id
          : Date.now() + index,

      name: toStringValue(data.name),
      description: toStringValue(data.description),
      technologies: toStringValue(data.technologies),
    };
  });
}

/* ==========================================================================
   PAGE
   ========================================================================== */

export default function ResumeBuilderPage() {
  const [activeSection, setActiveSection] =
    useState("personal");

  const [showPreview, setShowPreview] =
    useState(false);

  const [showTemplates, setShowTemplates] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [exporting, setExporting] =
    useState(false);

  const [aiLoading, setAiLoading] =
    useState<string | null>(null);

  const [resumeId, setResumeId] =
    useState<string | null>(null);

  const [saveMessage, setSaveMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [template, setTemplate] =
    useState<TemplateType>("modern");

  const [personal, setPersonal] =
    useState<Personal>(defaultPersonal);

  const [summary, setSummary] =
    useState(defaultSummary);

  const [skills, setSkills] =
    useState(defaultSkills);

  const [experience, setExperience] =
    useState<Experience[]>(defaultExperience);

  const [education, setEducation] =
    useState<Education[]>(defaultEducation);

  const [projects, setProjects] =
    useState<Project[]>(defaultProjects);

  const initializedRef =
    useRef(false);

  /* ========================================================================
     SECTIONS
     ======================================================================== */

  const sections = [
    {
      id: "personal",
      label: "Personal Information",
      icon: User,
    },
    {
      id: "summary",
      label: "Professional Summary",
      icon: Briefcase,
    },
    {
      id: "experience",
      label: "Experience",
      icon: Briefcase,
    },
    {
      id: "education",
      label: "Education",
      icon: GraduationCap,
    },
    {
      id: "skills",
      label: "Skills",
      icon: Code2,
    },
    {
      id: "projects",
      label: "Projects",
      icon: FolderKanban,
    },
  ];

  /* ========================================================================
     LOAD RESUME
     ======================================================================== */

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;

    loadResume();
  }, []);

  async function loadResume() {
    try {
      setLoading(true);
      setError("");

      const response =
        await apiGet<ResumeBuilderResponse[]>(
          "/resume-builder",
        );

      if (
        !response.success ||
        !response.data ||
        response.data.length === 0
      ) {
        setLoading(false);
        return;
      }

      loadResumeIntoEditor(
        response.data[0],
      );
    } catch (err) {
      console.error(
        "[RESUME BUILDER] Load error:",
        err,
      );

      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to load resume.",
      );
    } finally {
      setLoading(false);
    }
  }

  function loadResumeIntoEditor(
    resume: ResumeBuilderResponse,
  ) {
    setResumeId(resume.id);

    setTemplate(
      normalizeTemplate(
        resume.template,
      ),
    );

    setPersonal({
      name:
        resume.candidateName || "",
      title:
        resume.title ||
        "Full Stack Developer",
      email:
        resume.candidateEmail || "",
      phone:
        resume.candidatePhone || "",
      location:
        resume.location || "",
      github:
        resume.github || "",
      linkedin:
        resume.linkedin || "",
    });

    setSummary(
      resume.summary || "",
    );

    setSkills(
      toStringArray(
        resume.skills,
      ).join(", "),
    );

    setExperience(
      normalizeExperience(
        resume.experience,
      ),
    );

    setEducation(
      normalizeEducation(
        resume.education,
      ),
    );

    setProjects(
      normalizeProjects(
        resume.projects,
      ),
    );
  }

  /* ========================================================================
     PAYLOAD
     ======================================================================== */

  function buildResumePayload(): ResumeBuilderData {
    return {
      title: personal.name
        ? `${personal.name} Resume`
        : "My Resume",

      candidateName:
        personal.name,

      candidateEmail:
        personal.email,

      candidatePhone:
        personal.phone,

      location:
        personal.location,

      website: "",

      linkedin:
        personal.linkedin,

      github:
        personal.github,

      summary,

      skills: skills
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),

      experience:
        experience.map(
          ({ id, ...item }) => item,
        ),

      education:
        education.map(
          ({ id, ...item }) => item,
        ),

      projects:
        projects.map(
          ({ id, ...item }) => item,
        ),

      certifications: [],
      languages: [],
      achievements: [],

      template,
    };
  }

  /* ========================================================================
     SAVE
     ======================================================================== */

  async function handleSave() {
    try {
      setSaving(true);
      setError("");
      setSaveMessage("");

      const payload =
        buildResumePayload();

      if (resumeId) {
        const response =
          await apiPut<ResumeBuilderResponse>(
            `/resume-builder/${encodeURIComponent(
              resumeId,
            )}`,
            payload,
          );

        if (!response.success) {
          throw new ApiError(
            response.message ||
              "Failed to update resume.",
            400,
            response,
          );
        }

        setSaveMessage(
          "Resume updated successfully.",
        );
      } else {
        const response =
          await apiPost<ResumeBuilderResponse>(
            "/resume-builder",
            payload,
          );

        if (
          !response.success ||
          !response.data
        ) {
          throw new ApiError(
            response.message ||
              "Failed to create resume.",
            400,
            response,
          );
        }

        setResumeId(
          response.data.id,
        );

        setSaveMessage(
          "Resume created successfully.",
        );
      }

      window.setTimeout(
        () => setSaveMessage(""),
        3000,
      );
    } catch (err) {
      console.error(
        "[RESUME BUILDER] Save error:",
        err,
      );

      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to save resume.",
      );
    } finally {
      setSaving(false);
    }
  }

  /* ========================================================================
     DELETE
     ======================================================================== */

  async function handleDeleteResume() {
    if (!resumeId) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this resume?",
      );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response =
        await apiDelete(
          `/resume-builder/${encodeURIComponent(
            resumeId,
          )}`,
        );

      if (!response.success) {
        throw new ApiError(
          response.message ||
            "Failed to delete resume.",
          400,
          response,
        );
      }

      setResumeId(null);

      setTemplate("modern");

      setPersonal(
        defaultPersonal,
      );

      setSummary(
        defaultSummary,
      );

      setSkills(
        defaultSkills,
      );

      setExperience(
        defaultExperience,
      );

      setEducation(
        defaultEducation,
      );

      setProjects(
        defaultProjects,
      );

      setSaveMessage(
        "Resume deleted successfully.",
      );
    } catch (err) {
      console.error(
        "[RESUME BUILDER] Delete error:",
        err,
      );

      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to delete resume.",
      );
    } finally {
      setSaving(false);
    }
  }

  /* ========================================================================
     EXPORT PDF
     ======================================================================== */

  async function handleExportPDF() {
    try {
      setExporting(true);
      setError("");

      let currentResumeId =
        resumeId;

      /*
       * If resume does not exist in database,
       * save it first.
       */
      if (!currentResumeId) {
        const response =
          await apiPost<ResumeBuilderResponse>(
            "/resume-builder",
            buildResumePayload(),
          );

        if (
          !response.success ||
          !response.data
        ) {
          throw new Error(
            "Failed to save resume before PDF export.",
          );
        }

        currentResumeId =
          response.data.id;

        setResumeId(
          currentResumeId,
        );
      }

      const apiBase =
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:5000/api";

      const cleanBase =
        apiBase.replace(/\/+$/, "");

      const pdfUrl =
        `${cleanBase}/resume-builder/${encodeURIComponent(
          currentResumeId,
        )}/pdf?template=${encodeURIComponent(
          template,
        )}`;

      const response =
        await fetch(pdfUrl, {
          method: "GET",
          credentials: "include",
        });

      if (!response.ok) {
        const text =
          await response.text();

        throw new Error(
          text ||
            "Failed to generate PDF.",
        );
      }

      const blob =
        await response.blob();

      const blobUrl =
        window.URL.createObjectURL(
          blob,
        );

      const link =
        document.createElement("a");

      link.href = blobUrl;

      link.download =
        `${personal.name || "resume"}-${template}-resume.pdf`;

      document.body.appendChild(
        link,
      );

      link.click();

      link.remove();

      window.URL.revokeObjectURL(
        blobUrl,
      );
    } catch (err) {
      console.error(
        "[RESUME BUILDER] PDF error:",
        err,
      );

      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to generate PDF.",
      );
    } finally {
      setExporting(false);
    }
  }

  /* ========================================================================
     EXPERIENCE
     ======================================================================== */

  function updateExperience(
    id: number | string,
    field: keyof Experience,
    value: string,
  ) {
    setExperience((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  }

  function addExperience() {
    setExperience((items) => [
      ...items,
      {
        id: Date.now(),
        role: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ]);
  }

  function removeExperience(
    id: number | string,
  ) {
    setExperience((items) =>
      items.filter(
        (item) => item.id !== id,
      ),
    );
  }

  /* ========================================================================
     EDUCATION
     ======================================================================== */

  function updateEducation(
    id: number | string,
    field: keyof Education,
    value: string,
  ) {
    setEducation((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  }

  function addEducation() {
    setEducation((items) => [
      ...items,
      {
        id: Date.now(),
        degree: "",
        school: "",
        location: "",
        year: "",
      },
    ]);
  }

  function removeEducation(
    id: number | string,
  ) {
    setEducation((items) =>
      items.filter(
        (item) => item.id !== id,
      ),
    );
  }

  /* ========================================================================
     PROJECTS
     ======================================================================== */

  function updateProject(
    id: number | string,
    field: keyof Project,
    value: string,
  ) {
    setProjects((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  }

  function addProject() {
    setProjects((items) => [
      ...items,
      {
        id: Date.now(),
        name: "",
        description: "",
        technologies: "",
      },
    ]);
  }

  function removeProject(
    id: number | string,
  ) {
    setProjects((items) =>
      items.filter(
        (item) => item.id !== id,
      ),
    );
  }

  /* ========================================================================
     AI
     ======================================================================== */

  async function handleAIAction(
    action: AIAction,
    content: string,
    targetId?: number | string,
  ) {
    if (!content.trim()) {
      setError(
        "Please enter some content before using AI.",
      );
      return;
    }

    try {
      setAiLoading(
        targetId !== undefined
          ? `${action}-${targetId}`
          : action,
      );

      setError("");

      const response =
        await apiPost<{
          result?: string;
          content?: string;
          text?: string;
        }>(
          "/resume-builder/ai",
          {
            action,
            content,
            resumeId,
          },
        );

      if (
        !response.success ||
        !response.data
      ) {
        throw new ApiError(
          response.message ||
            "AI request failed.",
          400,
          response,
        );
      }

      const result =
        response.data.result ||
        response.data.content ||
        response.data.text ||
        "";

      if (!result.trim()) {
        throw new Error(
          "AI returned an empty response.",
        );
      }

      /*
       * Apply AI response
       */

      if (
        action ===
        "improve_summary"
      ) {
        setSummary(result);
      }

      if (
        action ===
          "improve_experience" &&
        targetId !== undefined
      ) {
        setExperience(
          (items) =>
            items.map(
              (item) =>
                item.id === targetId
                  ? {
                      ...item,
                      description:
                        result,
                    }
                  : item,
            ),
        );
      }

      if (
        action ===
        "optimize_skills"
      ) {
        setSkills(result);
      }

      if (
        action ===
          "improve_project" &&
        targetId !== undefined
      ) {
        setProjects(
          (items) =>
            items.map(
              (item) =>
                item.id === targetId
                  ? {
                      ...item,
                      description:
                        result,
                    }
                  : item,
            ),
        );
      }

      setSaveMessage(
        "AI improvement applied.",
      );

      window.setTimeout(
        () => setSaveMessage(""),
        2500,
      );
    } catch (err) {
      console.error(
        "[RESUME BUILDER] AI error:",
        err,
      );

      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "AI request failed.",
      );
    } finally {
      setAiLoading(null);
    }
  }

  /* ========================================================================
     TEMPLATE
     ======================================================================== */

  function handleTemplateChange(
    newTemplate: TemplateType,
  ) {
    setTemplate(newTemplate);
    setShowTemplates(false);
  }

  /* ========================================================================
     LOADING
     ======================================================================== */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808] text-white">
        <div className="flex items-center gap-3 text-sm text-zinc-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading Resume Builder...
        </div>
      </main>
    );
  }

  /* ========================================================================
     RENDER
     ======================================================================== */

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      {/* HEADER */}

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080808]/90 backdrop-blur-xl print:hidden">
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>

            <div className="hidden h-5 w-px bg-white/10 md:block" />

            <div className="hidden items-center gap-2 md:flex">
              <span className="text-sm text-zinc-300">
                Resume Builder
              </span>

              <span
                className={`rounded-md border px-2 py-0.5 text-[11px] ${
                  resumeId
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                    : "border-yellow-500/20 bg-yellow-500/10 text-yellow-400"
                }`}
              >
                {resumeId
                  ? "Saved"
                  : "Draft"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {saveMessage && (
              <span className="hidden text-xs text-emerald-400 md:block">
                {saveMessage}
              </span>
            )}

            {resumeId && (
              <button
                onClick={
                  handleDeleteResume
                }
                disabled={saving}
                className="hidden items-center gap-2 rounded-lg border border-red-500/10 px-3 py-2 text-sm text-red-400 transition hover:border-red-500/20 hover:bg-red-500/5 disabled:opacity-50 md:flex"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            )}

            <button
              onClick={() =>
                setShowTemplates(
                  !showTemplates,
                )
              }
              className="flex items-center gap-2 rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-sm text-violet-300 transition hover:bg-violet-500/15"
            >
              <LayoutTemplate className="h-4 w-4" />

              <span className="hidden sm:inline">
                Template
              </span>

              <span className="hidden text-xs text-violet-400 md:inline">
                {
                  templates.find(
                    (item) =>
                      item.id ===
                      template,
                  )?.name
                }
              </span>
            </button>

            <button
              onClick={() =>
                setShowPreview(true)
              }
              className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-400 transition hover:border-white/20 hover:text-white"
            >
              <Eye className="h-4 w-4" />

              <span className="hidden sm:inline">
                Preview
              </span>
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:border-white/20 hover:text-white disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}

              <span className="hidden sm:inline">
                {saving
                  ? "Saving..."
                  : "Save"}
              </span>
            </button>

            <button
              onClick={
                handleExportPDF
              }
              disabled={exporting}
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:opacity-60"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}

              {exporting
                ? "Exporting..."
                : "Export PDF"}
            </button>
          </div>
        </div>

        {/* TEMPLATE DROPDOWN */}

        {showTemplates && (
          <div className="absolute right-5 top-[70px] z-[80] w-[330px] rounded-2xl border border-white/10 bg-[#111111] p-3 shadow-2xl">
            <div className="mb-3 px-2">
              <p className="text-sm font-medium text-white">
                Choose Resume Template
              </p>

              <p className="mt-1 text-xs text-zinc-600">
                Select a template for your resume.
              </p>
            </div>

            <div className="space-y-2">
              {templates.map(
                (item) => (
                  <button
                    key={item.id}
                    onClick={() =>
                      handleTemplateChange(
                        item.id,
                      )
                    }
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                      template === item.id
                        ? "border-violet-500/40 bg-violet-500/10"
                        : "border-white/5 bg-white/[0.02] hover:border-white/10"
                    }`}
                  >
                    <TemplateThumbnail
                      template={
                        item.id
                      }
                    />

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white">
                        {item.name}
                      </p>

                      <p className="mt-0.5 text-xs text-zinc-600">
                        {
                          item.description
                        }
                      </p>
                    </div>

                    {template ===
                      item.id && (
                      <Check className="h-4 w-4 text-violet-400" />
                    )}
                  </button>
                ),
              )}
            </div>
          </div>
        )}
      </header>

      {/* ERROR */}

      {error && (
        <div className="border-b border-red-500/20 bg-red-500/5 px-5 py-3 text-center text-sm text-red-400 print:hidden">
          {error}
        </div>
      )}

      {/* MAIN */}

      <div className="grid min-h-[calc(100vh-64px)] lg:grid-cols-[430px_1fr]">
        {/* EDITOR */}

        <aside className="border-r border-white/10 bg-[#0c0c0c] print:hidden">
          <div className="border-b border-white/10 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-medium">
                  Resume Editor
                </h1>

                <p className="mt-1 text-xs text-zinc-600">
                  Build your professional resume
                </p>
              </div>

              <button
                onClick={() =>
                  setActiveSection(
                    "summary",
                  )
                }
                className="flex items-center gap-1.5 rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-xs text-violet-300"
              >
                <Sparkles className="h-3.5 w-3.5" />
                AI
              </button>
            </div>
          </div>

          {/* TEMPLATE */}

          <div className="border-b border-white/10 p-4">
            <button
              onClick={() =>
                setShowTemplates(
                  !showTemplates,
                )
              }
              className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-left transition hover:border-white/20"
            >
              <TemplateThumbnail
                template={template}
              />

              <div className="flex-1">
                <p className="text-xs text-zinc-500">
                  Current template
                </p>

                <p className="mt-1 text-sm font-medium text-white">
                  {
                    templates.find(
                      (item) =>
                        item.id ===
                        template,
                    )?.name
                  }
                </p>
              </div>

              <LayoutTemplate className="h-4 w-4 text-zinc-500" />
            </button>
          </div>

          {/* NAVIGATION */}

          <div className="flex gap-1 overflow-x-auto border-b border-white/10 p-3 lg:block lg:space-y-1">
            {sections.map(
              (section) => {
                const Icon =
                  section.icon;

                return (
                  <button
                    key={
                      section.id
                    }
                    onClick={() =>
                      setActiveSection(
                        section.id,
                      )
                    }
                    className={`flex min-w-max items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition lg:w-full ${
                      activeSection ===
                      section.id
                        ? "bg-white/[0.06] text-white"
                        : "text-zinc-500 hover:bg-white/[0.03]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />

                    {section.label}
                  </button>
                );
              },
            )}
          </div>

          {/* CONTENT */}

          <div className="max-h-[calc(100vh-310px)] overflow-y-auto p-5">
            {/* PERSONAL */}

            {activeSection ===
              "personal" && (
              <EditorSection
                title="Personal Information"
                description="Basic contact information displayed at the top of your resume."
              >
                <Field
                  label="Full Name"
                  value={
                    personal.name
                  }
                  onChange={(value) =>
                    setPersonal({
                      ...personal,
                      name: value,
                    })
                  }
                />

                <Field
                  label="Professional Title"
                  value={
                    personal.title
                  }
                  onChange={(value) =>
                    setPersonal({
                      ...personal,
                      title: value,
                    })
                  }
                />

                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="Email"
                    value={
                      personal.email
                    }
                    onChange={(value) =>
                      setPersonal({
                        ...personal,
                        email: value,
                      })
                    }
                  />

                  <Field
                    label="Phone"
                    value={
                      personal.phone
                    }
                    onChange={(value) =>
                      setPersonal({
                        ...personal,
                        phone: value,
                      })
                    }
                  />
                </div>

                <Field
                  label="Location"
                  value={
                    personal.location
                  }
                  onChange={(value) =>
                    setPersonal({
                      ...personal,
                      location: value,
                    })
                  }
                />

                <Field
                  label="GitHub"
                  value={
                    personal.github
                  }
                  onChange={(value) =>
                    setPersonal({
                      ...personal,
                      github: value,
                    })
                  }
                />

                <Field
                  label="LinkedIn"
                  value={
                    personal.linkedin
                  }
                  onChange={(value) =>
                    setPersonal({
                      ...personal,
                      linkedin: value,
                    })
                  }
                />
              </EditorSection>
            )}

            {/* SUMMARY */}

            {activeSection ===
              "summary" && (
              <EditorSection
                title="Professional Summary"
                description="Write a concise summary highlighting your strongest qualifications."
              >
                <Textarea
                  label="Summary"
                  value={summary}
                  onChange={setSummary}
                  rows={8}
                />

                <AIButton
                  text="Improve Summary with AI"
                  loading={
                    aiLoading ===
                    "improve_summary"
                  }
                  onClick={() =>
                    handleAIAction(
                      "improve_summary",
                      summary,
                    )
                  }
                />
              </EditorSection>
            )}

            {/* EXPERIENCE */}

            {activeSection ===
              "experience" && (
              <EditorSection
                title="Experience"
                description="Add your professional experience and achievements."
              >
                <div className="space-y-4">
                  {experience.map(
                    (item) => {
                      const loadingKey =
                        `improve_experience-${item.id}`;

                      return (
                        <div
                          key={
                            item.id
                          }
                          className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
                        >
                          <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <GripVertical className="h-4 w-4 text-zinc-700" />

                              <span className="text-xs text-zinc-500">
                                Experience
                              </span>
                            </div>

                            <button
                              onClick={() =>
                                removeExperience(
                                  item.id,
                                )
                              }
                              className="text-zinc-600 hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="space-y-3">
                            <Field
                              label="Job Title"
                              value={
                                item.role
                              }
                              onChange={(
                                value,
                              ) =>
                                updateExperience(
                                  item.id,
                                  "role",
                                  value,
                                )
                              }
                            />

                            <Field
                              label="Company"
                              value={
                                item.company
                              }
                              onChange={(
                                value,
                              ) =>
                                updateExperience(
                                  item.id,
                                  "company",
                                  value,
                                )
                              }
                            />

                            <Field
                              label="Location"
                              value={
                                item.location
                              }
                              onChange={(
                                value,
                              ) =>
                                updateExperience(
                                  item.id,
                                  "location",
                                  value,
                                )
                              }
                            />

                            <div className="grid grid-cols-2 gap-3">
                              <Field
                                label="Start"
                                value={
                                  item.startDate
                                }
                                onChange={(
                                  value,
                                ) =>
                                  updateExperience(
                                    item.id,
                                    "startDate",
                                    value,
                                  )
                                }
                              />

                              <Field
                                label="End"
                                value={
                                  item.endDate
                                }
                                onChange={(
                                  value,
                                ) =>
                                  updateExperience(
                                    item.id,
                                    "endDate",
                                    value,
                                  )
                                }
                              />
                            </div>

                            <Textarea
                              label="Description"
                              value={
                                item.description
                              }
                              onChange={(
                                value,
                              ) =>
                                updateExperience(
                                  item.id,
                                  "description",
                                  value,
                                )
                              }
                              rows={7}
                            />

                            <AIButton
                              text="Improve Bullet Points"
                              loading={
                                aiLoading ===
                                loadingKey
                              }
                              onClick={() =>
                                handleAIAction(
                                  "improve_experience",
                                  item.description,
                                  item.id,
                                )
                              }
                            />
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>

                <AddButton
                  text="Add Experience"
                  onClick={
                    addExperience
                  }
                />
              </EditorSection>
            )}

            {/* EDUCATION */}

            {activeSection ===
              "education" && (
              <EditorSection
                title="Education"
                description="Add your academic background."
              >
                <div className="space-y-4">
                  {education.map(
                    (item) => (
                      <div
                        key={
                          item.id
                        }
                        className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
                      >
                        <div className="mb-4 flex items-center justify-between">
                          <span className="text-xs text-zinc-500">
                            Education
                          </span>

                          <button
                            onClick={() =>
                              removeEducation(
                                item.id,
                              )
                            }
                            className="text-zinc-600 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="space-y-3">
                          <Field
                            label="Degree"
                            value={
                              item.degree
                            }
                            onChange={(
                              value,
                            ) =>
                              updateEducation(
                                item.id,
                                "degree",
                                value,
                              )
                            }
                          />

                          <Field
                            label="School"
                            value={
                              item.school
                            }
                            onChange={(
                              value,
                            ) =>
                              updateEducation(
                                item.id,
                                "school",
                                value,
                              )
                            }
                          />

                          <Field
                            label="Location"
                            value={
                              item.location
                            }
                            onChange={(
                              value,
                            ) =>
                              updateEducation(
                                item.id,
                                "location",
                                value,
                              )
                            }
                          />

                          <Field
                            label="Year"
                            value={
                              item.year
                            }
                            onChange={(
                              value,
                            ) =>
                              updateEducation(
                                item.id,
                                "year",
                                value,
                              )
                            }
                          />
                        </div>
                      </div>
                    ),
                  )}
                </div>

                <AddButton
                  text="Add Education"
                  onClick={
                    addEducation
                  }
                />
              </EditorSection>
            )}

            {/* SKILLS */}

            {activeSection ===
              "skills" && (
              <EditorSection
                title="Skills"
                description="Add technologies and skills relevant to your target roles."
              >
                <Textarea
                  label="Skills"
                  value={skills}
                  onChange={setSkills}
                  rows={8}
                />

                <p className="text-xs leading-5 text-zinc-600">
                  Separate skills with commas.
                </p>

                <AIButton
                  text="Optimize Skills with AI"
                  loading={
                    aiLoading ===
                    "optimize_skills"
                  }
                  onClick={() =>
                    handleAIAction(
                      "optimize_skills",
                      skills,
                    )
                  }
                />
              </EditorSection>
            )}

            {/* PROJECTS */}

            {activeSection ===
              "projects" && (
              <EditorSection
                title="Projects"
                description="Showcase projects that demonstrate your technical skills."
              >
                <div className="space-y-4">
                  {projects.map(
                    (item) => {
                      const loadingKey =
                        `improve_project-${item.id}`;

                      return (
                        <div
                          key={
                            item.id
                          }
                          className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
                        >
                          <div className="mb-4 flex items-center justify-between">
                            <span className="text-xs text-zinc-500">
                              Project
                            </span>

                            <button
                              onClick={() =>
                                removeProject(
                                  item.id,
                                )
                              }
                              className="text-zinc-600 hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="space-y-3">
                            <Field
                              label="Project Name"
                              value={
                                item.name
                              }
                              onChange={(
                                value,
                              ) =>
                                updateProject(
                                  item.id,
                                  "name",
                                  value,
                                )
                              }
                            />

                            <Textarea
                              label="Description"
                              value={
                                item.description
                              }
                              onChange={(
                                value,
                              ) =>
                                updateProject(
                                  item.id,
                                  "description",
                                  value,
                                )
                              }
                              rows={6}
                            />

                            <Field
                              label="Technologies"
                              value={
                                item.technologies
                              }
                              onChange={(
                                value,
                              ) =>
                                updateProject(
                                  item.id,
                                  "technologies",
                                  value,
                                )
                              }
                            />

                            <AIButton
                              text="Improve Project Description"
                              loading={
                                aiLoading ===
                                loadingKey
                              }
                              onClick={() =>
                                handleAIAction(
                                  "improve_project",
                                  item.description,
                                  item.id,
                                )
                              }
                            />
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>

                <AddButton
                  text="Add Project"
                  onClick={
                    addProject
                  }
                />
              </EditorSection>
            )}
          </div>
        </aside>

        {/* DESKTOP PREVIEW */}

        <section className="hidden overflow-auto bg-[#171717] p-8 lg:block print:block print:bg-white print:p-0">
          <div className="mx-auto max-w-[850px]">
            <div className="mb-5 flex items-center justify-between print:hidden">
              <div>
                <p className="text-xs uppercase tracking-widest text-zinc-600">
                  Live Preview
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                  {
                    templates.find(
                      (item) =>
                        item.id ===
                        template,
                    )?.name
                  }{" "}
                  template
                </p>
              </div>

              <button
                onClick={() =>
                  setShowPreview(true)
                }
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#111111] px-3 py-2 text-xs text-zinc-400"
              >
                <Eye className="h-3.5 w-3.5" />
                Preview
              </button>
            </div>

            <ResumePreview
              template={template}
              personal={personal}
              summary={summary}
              skills={skills}
              experience={
                experience
              }
              education={education}
              projects={projects}
            />
          </div>
        </section>
      </div>

      {/* MOBILE PREVIEW */}

      {showPreview && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/90 p-4 backdrop-blur-sm lg:hidden">
          <div className="mx-auto max-w-[850px]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-white">
                  Resume Preview
                </h2>

                <p className="mt-1 text-xs text-zinc-600">
                  {
                    templates.find(
                      (item) =>
                        item.id ===
                        template,
                    )?.name
                  }{" "}
                  Template
                </p>
              </div>

              <button
                onClick={() =>
                  setShowPreview(false)
                }
                className="rounded-lg border border-white/10 p-2 text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <ResumePreview
              template={template}
              personal={personal}
              summary={summary}
              skills={skills}
              experience={
                experience
              }
              education={education}
              projects={projects}
            />
          </div>
        </div>
      )}
    </main>
  );
}

/* ==========================================================================
   TEMPLATE THUMBNAIL
   ========================================================================== */

function TemplateThumbnail({
  template,
}: {
  template: TemplateType;
}) {
  return (
    <div
      className={`relative h-12 w-10 shrink-0 overflow-hidden rounded border ${
        template === "modern"
          ? "border-violet-500/30 bg-violet-500/10"
          : template === "professional"
            ? "border-blue-500/30 bg-blue-500/10"
            : template === "minimal"
              ? "border-zinc-500/30 bg-zinc-500/10"
              : "border-amber-500/30 bg-amber-500/10"
      }`}
    >
      <div className="p-1.5">
        <div className="mb-1 h-1.5 w-5 rounded bg-zinc-400" />
        <div className="mb-1 h-0.5 w-7 rounded bg-zinc-700" />

        <div className="space-y-1">
          <div className="h-0.5 w-full rounded bg-zinc-700" />
          <div className="h-0.5 w-5/6 rounded bg-zinc-700" />
          <div className="h-0.5 w-full rounded bg-zinc-700" />
          <div className="h-0.5 w-4/6 rounded bg-zinc-700" />
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   EDITOR SECTION
   ========================================================================== */

function EditorSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-lg font-medium">
        {title}
      </h2>

      <p className="mb-6 mt-1 text-xs leading-5 text-zinc-600">
        {description}
      </p>

      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

/* ==========================================================================
   FIELD
   ========================================================================== */

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-zinc-500">
        {label}
      </span>

      <input
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="h-10 w-full rounded-lg border border-white/10 bg-[#101010] px-3 text-sm text-white outline-none transition focus:border-violet-500/40"
      />
    </label>
  );
}

/* ==========================================================================
   TEXTAREA
   ========================================================================== */

function Textarea({
  label,
  value,
  onChange,
  rows = 5,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-zinc-500">
        {label}
      </span>

      <textarea
        rows={rows}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="w-full resize-none rounded-lg border border-white/10 bg-[#101010] px-3 py-2.5 text-sm leading-6 text-white outline-none transition focus:border-violet-500/40"
      />
    </label>
  );
}

/* ==========================================================================
   AI BUTTON
   ========================================================================== */

function AIButton({
  text,
  onClick,
  loading = false,
}: {
  text: string;
  onClick: () => void;
  loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-violet-500/20 bg-violet-500/10 py-2.5 text-xs text-violet-300 transition hover:bg-violet-500/15 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Sparkles className="h-3.5 w-3.5" />
      )}

      {loading
        ? "AI is working..."
        : text}
    </button>
  );
}

/* ==========================================================================
   ADD BUTTON
   ========================================================================== */

function AddButton({
  text,
  onClick,
}: {
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/10 py-3 text-xs text-zinc-500 transition hover:border-white/20 hover:text-white"
    >
      <Plus className="h-4 w-4" />
      {text}
    </button>
  );
}

/* ==========================================================================
   RESUME PREVIEW
   ========================================================================== */

function ResumePreview({
  template,
  personal,
  summary,
  skills,
  experience,
  education,
  projects,
}: {
  template: TemplateType;
  personal: Personal;
  summary: string;
  skills: string;
  experience: Experience[];
  education: Education[];
  projects: Project[];
}) {
  if (
    template ===
    "professional"
  ) {
    return (
      <ProfessionalTemplate
        personal={personal}
        summary={summary}
        skills={skills}
        experience={experience}
        education={education}
        projects={projects}
      />
    );
  }

  if (
    template === "minimal"
  ) {
    return (
      <MinimalTemplate
        personal={personal}
        summary={summary}
        skills={skills}
        experience={experience}
        education={education}
        projects={projects}
      />
    );
  }

  if (
    template === "executive"
  ) {
    return (
      <ExecutiveTemplate
        personal={personal}
        summary={summary}
        skills={skills}
        experience={experience}
        education={education}
        projects={projects}
      />
    );
  }

  return (
    <ModernTemplate
      personal={personal}
      summary={summary}
      skills={skills}
      experience={experience}
      education={education}
      projects={projects}
    />
  );
}

/* ==========================================================================
   MODERN TEMPLATE
   ========================================================================== */

function ModernTemplate({
  personal,
  summary,
  skills,
  experience,
  education,
  projects,
}: {
  personal: Personal;
  summary: string;
  skills: string;
  experience: Experience[];
  education: Education[];
  projects: Project[];
}) {
  return (
    <article className="min-h-[1100px] bg-white p-12 text-[#18181b] shadow-2xl print:min-h-0 print:shadow-none">
      <header className="border-b-2 border-zinc-900 pb-5">
        <h1 className="text-3xl font-bold tracking-tight">
          {personal.name ||
            "Your Name"}
        </h1>

        <p className="mt-1 text-base font-medium text-zinc-600">
          {personal.title ||
            "Professional Title"}
        </p>

        <ContactLine
          personal={personal}
        />
      </header>

      <ResumeContent
        summary={summary}
        skills={skills}
        experience={experience}
        education={education}
        projects={projects}
      />

      <ResumeFooter />
    </article>
  );
}

/* ==========================================================================
   PROFESSIONAL TEMPLATE
   ========================================================================== */

function ProfessionalTemplate({
  personal,
  summary,
  skills,
  experience,
  education,
  projects,
}: {
  personal: Personal;
  summary: string;
  skills: string;
  experience: Experience[];
  education: Education[];
  projects: Project[];
}) {
  return (
    <article className="min-h-[1100px] bg-white p-12 text-[#18181b] shadow-2xl print:min-h-0 print:shadow-none">
      <header className="border-l-4 border-zinc-900 pl-5">
        <h1 className="text-3xl font-bold uppercase tracking-tight">
          {personal.name ||
            "Your Name"}
        </h1>

        <p className="mt-1 text-sm font-semibold uppercase tracking-widest text-zinc-500">
          {personal.title ||
            "Professional Title"}
        </p>

        <ContactLine
          personal={personal}
        />
      </header>

      <div className="mt-8">
        <ResumeContent
          summary={summary}
          skills={skills}
          experience={experience}
          education={education}
          projects={projects}
        />
      </div>

      <ResumeFooter />
    </article>
  );
}

/* ==========================================================================
   MINIMAL TEMPLATE
   ========================================================================== */

function MinimalTemplate({
  personal,
  summary,
  skills,
  experience,
  education,
  projects,
}: {
  personal: Personal;
  summary: string;
  skills: string;
  experience: Experience[];
  education: Education[];
  projects: Project[];
}) {
  return (
    <article className="min-h-[1100px] bg-white px-14 py-12 text-[#18181b] shadow-2xl print:min-h-0 print:shadow-none">
      <header>
        <h1 className="text-4xl font-light tracking-tight">
          {personal.name ||
            "Your Name"}
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          {personal.title ||
            "Professional Title"}
        </p>

        <ContactLine
          personal={personal}
        />

        <div className="mt-6 h-px bg-zinc-200" />
      </header>

      <ResumeContent
        summary={summary}
        skills={skills}
        experience={experience}
        education={education}
        projects={projects}
        minimal
      />

      <ResumeFooter />
    </article>
  );
}

/* ==========================================================================
   EXECUTIVE TEMPLATE
   ========================================================================== */

function ExecutiveTemplate({
  personal,
  summary,
  skills,
  experience,
  education,
  projects,
}: {
  personal: Personal;
  summary: string;
  skills: string;
  experience: Experience[];
  education: Education[];
  projects: Project[];
}) {
  return (
    <article className="min-h-[1100px] bg-white p-12 text-[#18181b] shadow-2xl print:min-h-0 print:shadow-none">
      <header className="border-b-4 border-zinc-900 pb-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              {personal.name ||
                "Your Name"}
            </h1>

            <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
              {personal.title ||
                "Professional Title"}
            </p>
          </div>

          <div className="text-right">
            {personal.location && (
              <p className="text-xs text-zinc-500">
                {
                  personal.location
                }
              </p>
            )}

            {personal.email && (
              <p className="mt-1 text-xs text-zinc-500">
                {
                  personal.email
                }
              </p>
            )}

            {personal.phone && (
              <p className="mt-1 text-xs text-zinc-500">
                {
                  personal.phone
                }
              </p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
            {personal.github && (
              <span>
                {
                  personal.github
                }
              </span>
            )}

            {personal.linkedin && (
              <span>
                {
                  personal.linkedin
                }
              </span>
            )}
          </div>
        </div>
      </header>

      <ResumeContent
        summary={summary}
        skills={skills}
        experience={experience}
        education={education}
        projects={projects}
        executive
      />

      <ResumeFooter />
    </article>
  );
}

/* ==========================================================================
   SHARED RESUME CONTENT
   ========================================================================== */

function ResumeContent({
  summary,
  skills,
  experience,
  education,
  projects,
  minimal = false,
  executive = false,
}: {
  summary: string;
  skills: string;
  experience: Experience[];
  education: Education[];
  projects: Project[];
  minimal?: boolean;
  executive?: boolean;
}) {
  return (
    <>
      {summary && (
        <ResumeSection
          title="PROFESSIONAL SUMMARY"
          minimal={minimal}
          executive={executive}
        >
          <p className="text-sm leading-6 text-zinc-700">
            {summary}
          </p>
        </ResumeSection>
      )}

      {experience.length > 0 && (
        <ResumeSection
          title="EXPERIENCE"
          minimal={minimal}
          executive={executive}
        >
          <div className="space-y-5">
            {experience.map(
              (item) => (
                <div
                  key={item.id}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold">
                        {item.role ||
                          "Job Title"}
                      </h3>

                      <p className="mt-0.5 text-xs font-medium text-zinc-600">
                        {item.company ||
                          "Company"}

                        {item.location
                          ? ` · ${item.location}`
                          : ""}
                      </p>
                    </div>

                    <p className="shrink-0 text-xs text-zinc-500">
                      {
                        item.startDate
                      }{" "}
                      –{" "}
                      {
                        item.endDate
                      }
                    </p>
                  </div>

                  {item.description && (
                    <div className="mt-2 whitespace-pre-line text-xs leading-5 text-zinc-700">
                      {
                        item.description
                      }
                    </div>
                  )}
                </div>
              ),
            )}
          </div>
        </ResumeSection>
      )}

      {projects.length > 0 && (
        <ResumeSection
          title="PROJECTS"
          minimal={minimal}
          executive={executive}
        >
          <div className="space-y-4">
            {projects.map(
              (item) => (
                <div
                  key={item.id}
                >
                  <h3 className="text-sm font-semibold">
                    {item.name ||
                      "Project Name"}
                  </h3>

                  {item.description && (
                    <p className="mt-1 text-xs leading-5 text-zinc-700">
                      {
                        item.description
                      }
                    </p>
                  )}

                  {item.technologies && (
                    <p className="mt-1 text-xs font-medium text-zinc-500">
                      {
                        item.technologies
                      }
                    </p>
                  )}
                </div>
              ),
            )}
          </div>
        </ResumeSection>
      )}

      {skills && (
        <ResumeSection
          title="SKILLS"
          minimal={minimal}
          executive={executive}
        >
          <p className="text-xs leading-5 text-zinc-700">
            {skills}
          </p>
        </ResumeSection>
      )}

      {education.length > 0 && (
        <ResumeSection
          title="EDUCATION"
          minimal={minimal}
          executive={executive}
        >
          <div className="space-y-4">
            {education.map(
              (item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4"
                >
                  <div>
                    <h3 className="text-sm font-semibold">
                      {item.degree ||
                        "Degree"}
                    </h3>

                    <p className="mt-0.5 text-xs text-zinc-600">
                      {item.school ||
                        "School"}

                      {item.location
                        ? ` · ${item.location}`
                        : ""}
                    </p>
                  </div>

                  <p className="shrink-0 text-xs text-zinc-500">
                    {item.year}
                  </p>
                </div>
              ),
            )}
          </div>
        </ResumeSection>
      )}
    </>
  );
}

/* ==========================================================================
   CONTACT
   ========================================================================== */

function ContactLine({
  personal,
}: {
  personal: Personal;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
      {personal.email && (
        <span>
          {personal.email}
        </span>
      )}

      {personal.phone && (
        <span>
          {personal.phone}
        </span>
      )}

      {personal.location && (
        <span>
          {personal.location}
        </span>
      )}

      {personal.github && (
        <span>
          {personal.github}
        </span>
      )}

      {personal.linkedin && (
        <span>
          {personal.linkedin}
        </span>
      )}
    </div>
  );
}

/* ==========================================================================
   RESUME SECTION
   ========================================================================== */

function ResumeSection({
  title,
  children,
  minimal = false,
  executive = false,
}: {
  title: string;
  children: React.ReactNode;
  minimal?: boolean;
  executive?: boolean;
}) {
  return (
    <section
      className={`mt-7 ${
        minimal ? "mt-8" : ""
      }`}
    >
      <h2
        className={`border-b pb-1.5 text-[10px] font-bold tracking-[0.16em] ${
          executive
            ? "border-zinc-900 text-zinc-900"
            : minimal
              ? "border-zinc-200 text-zinc-600"
              : "border-zinc-200 text-zinc-800"
        }`}
      >
        {title}
      </h2>

      <div className="mt-3">
        {children}
      </div>
    </section>
  );
}

/* ==========================================================================
   FOOTER
   ========================================================================== */

function ResumeFooter() {
  return (
    <footer className="mt-10 border-t border-zinc-200 pt-3 text-center text-[9px] text-zinc-400">
      ResumeAI · AI-powered resume intelligence
    </footer>
  );
}