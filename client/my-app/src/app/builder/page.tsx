"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  Download,
  Copy,
  Save,
  FileText,
  User,
  Briefcase,
  GraduationCap,
  FolderKanban,
  Award,
  Languages,
  Trophy,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

/* ==========================================================================
   TYPES
   ========================================================================== */

type Experience = {
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
};

type Education = {
  id?: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  grade?: string;
  description?: string;
};

type Project = {
  id?: string;
  name: string;
  description?: string;
  technologies?: string[];
  url?: string;
  github?: string;
  startDate?: string;
  endDate?: string;
};

type Certification = {
  id?: string;
  name: string;
  issuer?: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
};

type Resume = {
  id?: string;

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
  experience?: Experience[];
  education?: Education[];
  projects?: Project[];
  certifications?: Certification[];
  languages?: string[];
  achievements?: string[];
};

/* ==========================================================================
   API
   ========================================================================== */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

/* ==========================================================================
   DEFAULT RESUME
   ========================================================================== */

const emptyResume: Resume = {
  title: "My Resume",

  candidateName: "",
  candidateEmail: "",
  candidatePhone: "",

  location: "",
  website: "",
  linkedin: "",
  github: "",

  summary: "",

  skills: [],
  experience: [],
  education: [],
  projects: [],
  certifications: [],
  languages: [],
  achievements: [],
};

/* ==========================================================================
   PAGE
   ========================================================================== */

export default function BuilderPage() {
  const [resume, setResume] =
    useState<Resume>(emptyResume);

  const [resumeId, setResumeId] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [activeSection, setActiveSection] =
    useState("personal");

  const [template, setTemplate] =
    useState<
      "modern" | "professional" | "minimal"
    >("modern");

  /* ==========================================================================
     LOAD RESUME FROM QUERY PARAM
     ========================================================================== */

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const id = params.get("id");

    if (id) {
      setResumeId(id);
      loadResume(id);
    }
  }, []);

  /* ==========================================================================
     LOAD RESUME
     ========================================================================== */

  async function loadResume(id: string) {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/resume-builder/${id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Failed to load resume."
        );
      }

      const data = result.data;

      setResume({
        title: data.title || "My Resume",

        candidateName:
          data.candidateName || "",

        candidateEmail:
          data.candidateEmail || "",

        candidatePhone:
          data.candidatePhone || "",

        location:
          data.location || "",

        website:
          data.website || "",

        linkedin:
          data.linkedin || "",

        github:
          data.github || "",

        summary:
          data.summary || "",

        skills:
          Array.isArray(data.skills)
            ? data.skills
            : [],

        experience:
          Array.isArray(data.experience)
            ? data.experience
            : [],

        education:
          Array.isArray(data.education)
            ? data.education
            : [],

        projects:
          Array.isArray(data.projects)
            ? data.projects
            : [],

        certifications:
          Array.isArray(
            data.certifications
          )
            ? data.certifications
            : [],

        languages:
          Array.isArray(data.languages)
            ? data.languages
            : [],

        achievements:
          Array.isArray(
            data.achievements
          )
            ? data.achievements
            : [],
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load resume."
      );
    } finally {
      setLoading(false);
    }
  }

  /* ==========================================================================
     UPDATE ROOT FIELD
     ========================================================================== */

  function updateField(
    field: keyof Resume,
    value: any
  ) {
    setResume((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  /* ==========================================================================
     SAVE RESUME
     ========================================================================== */

  async function saveResume() {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      const method = resumeId
        ? "PUT"
        : "POST";

      const url = resumeId
        ? `${API_URL}/resume-builder/${resumeId}`
        : `${API_URL}/resume-builder`;

      const response = await fetch(url, {
        method,

        credentials: "include",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(resume),
      });

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Failed to save resume."
        );
      }

      const savedResume =
        result.data;

      if (savedResume?.id) {
        setResumeId(
          savedResume.id
        );

        setResume((previous) => ({
          ...previous,
          id: savedResume.id,
        }));

        const currentUrl =
          new URL(
            window.location.href
          );

        currentUrl.searchParams.set(
          "id",
          savedResume.id
        );

        window.history.replaceState(
          {},
          "",
          currentUrl.toString()
        );
      }

      setMessage(
        resumeId
          ? "Resume updated successfully."
          : "Resume created successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save resume."
      );
    } finally {
      setSaving(false);
    }
  }

  /* ==========================================================================
     DELETE RESUME
     ========================================================================== */

  async function deleteResume() {
    if (!resumeId) return;

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this resume?"
      );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");

      const response = await fetch(
        `${API_URL}/resume-builder/${resumeId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Failed to delete resume."
        );
      }

      setResume(emptyResume);
      setResumeId(null);

      window.history.replaceState(
        {},
        "",
        "/builder"
      );

      setMessage(
        "Resume deleted successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete resume."
      );
    } finally {
      setDeleting(false);
    }
  }

  /* ==========================================================================
     DUPLICATE
     ========================================================================== */

  async function duplicateResume() {
    if (!resumeId) {
      setError(
        "Save the resume before duplicating it."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `${API_URL}/resume-builder/${resumeId}/duplicate`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Failed to duplicate resume."
        );
      }

      const duplicate =
        result.data;

      if (duplicate?.id) {
        window.location.href =
          `/builder?id=${duplicate.id}`;
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to duplicate resume."
      );
    } finally {
      setSaving(false);
    }
  }

  /* ==========================================================================
     DOWNLOAD PDF
     ========================================================================== */

  async function downloadPDF() {
    if (!resumeId) {
      setError(
        "Save the resume before downloading the PDF."
      );

      return;
    }

    try {
      setLoading(true);
      setError("");

      const response =
        await fetch(
          `${API_URL}/resume-builder/${resumeId}/pdf?template=${template}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

      if (!response.ok) {
        let errorMessage =
          "Failed to generate PDF.";

        try {
          const result =
            await response.json();

          errorMessage =
            result?.message ||
            errorMessage;
        } catch {
          // Ignore JSON parsing error.
        }

        throw new Error(
          errorMessage
        );
      }

      const blob =
        await response.blob();

      const url =
        window.URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          "a"
        );

      link.href = url;

      link.download =
        `${resume.candidateName || "resume"}-resume.pdf`;

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      window.URL.revokeObjectURL(
        url
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to download PDF."
      );
    } finally {
      setLoading(false);
    }
  }

  /* ==========================================================================
     ADD EXPERIENCE
     ========================================================================== */

  function addExperience() {
    const item: Experience = {
      id: crypto.randomUUID(),
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
      responsibilities: [],
      technologies: [],
    };

    updateField(
      "experience",
      [
        ...(resume.experience || []),
        item,
      ]
    );
  }

  function updateExperience(
    index: number,
    field: keyof Experience,
    value: any
  ) {
    const items = [
      ...(resume.experience || []),
    ];

    items[index] = {
      ...items[index],
      [field]: value,
    };

    updateField(
      "experience",
      items
    );
  }

  function removeExperience(
    index: number
  ) {
    const items = [
      ...(resume.experience || []),
    ];

    items.splice(index, 1);

    updateField(
      "experience",
      items
    );
  }

  /* ==========================================================================
     ADD EDUCATION
     ========================================================================== */

  function addEducation() {
    const item: Education = {
      id: crypto.randomUUID(),
      institution: "",
      degree: "",
      fieldOfStudy: "",
      location: "",
      startDate: "",
      endDate: "",
      grade: "",
      description: "",
    };

    updateField(
      "education",
      [
        ...(resume.education || []),
        item,
      ]
    );
  }

  function updateEducation(
    index: number,
    field: keyof Education,
    value: any
  ) {
    const items = [
      ...(resume.education || []),
    ];

    items[index] = {
      ...items[index],
      [field]: value,
    };

    updateField(
      "education",
      items
    );
  }

  function removeEducation(
    index: number
  ) {
    const items = [
      ...(resume.education || []),
    ];

    items.splice(index, 1);

    updateField(
      "education",
      items
    );
  }

  /* ==========================================================================
     ADD PROJECT
     ========================================================================== */

  function addProject() {
    const item: Project = {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      technologies: [],
      url: "",
      github: "",
      startDate: "",
      endDate: "",
    };

    updateField(
      "projects",
      [
        ...(resume.projects || []),
        item,
      ]
    );
  }

  function updateProject(
    index: number,
    field: keyof Project,
    value: any
  ) {
    const items = [
      ...(resume.projects || []),
    ];

    items[index] = {
      ...items[index],
      [field]: value,
    };

    updateField(
      "projects",
      items
    );
  }

  function removeProject(
    index: number
  ) {
    const items = [
      ...(resume.projects || []),
    ];

    items.splice(index, 1);

    updateField(
      "projects",
      items
    );
  }

  /* ==========================================================================
     ADD CERTIFICATION
     ========================================================================== */

  function addCertification() {
    const item: Certification = {
      id: crypto.randomUUID(),
      name: "",
      issuer: "",
      issueDate: "",
      expiryDate: "",
      credentialId: "",
      credentialUrl: "",
    };

    updateField(
      "certifications",
      [
        ...(resume.certifications ||
          []),
        item,
      ]
    );
  }

  function updateCertification(
    index: number,
    field: keyof Certification,
    value: any
  ) {
    const items = [
      ...(resume.certifications ||
        []),
    ];

    items[index] = {
      ...items[index],
      [field]: value,
    };

    updateField(
      "certifications",
      items
    );
  }

  function removeCertification(
    index: number
  ) {
    const items = [
      ...(resume.certifications ||
        []),
    ];

    items.splice(index, 1);

    updateField(
      "certifications",
      items
    );
  }

  /* ==========================================================================
     SKILLS
     ========================================================================== */

  function addSkill() {
    updateField(
      "skills",
      [
        ...(resume.skills || []),
        "",
      ]
    );
  }

  function updateSkill(
    index: number,
    value: string
  ) {
    const skills = [
      ...(resume.skills || []),
    ];

    skills[index] = value;

    updateField(
      "skills",
      skills
    );
  }

  function removeSkill(
    index: number
  ) {
    const skills = [
      ...(resume.skills || []),
    ];

    skills.splice(index, 1);

    updateField(
      "skills",
      skills
    );
  }

  /* ==========================================================================
     LANGUAGES
     ========================================================================== */

  function addLanguage() {
    updateField(
      "languages",
      [
        ...(resume.languages || []),
        "",
      ]
    );
  }

  function updateLanguage(
    index: number,
    value: string
  ) {
    const languages = [
      ...(resume.languages || []),
    ];

    languages[index] = value;

    updateField(
      "languages",
      languages
    );
  }

  function removeLanguage(
    index: number
  ) {
    const languages = [
      ...(resume.languages || []),
    ];

    languages.splice(index, 1);

    updateField(
      "languages",
      languages
    );
  }

  /* ==========================================================================
     ACHIEVEMENTS
     ========================================================================== */

  function addAchievement() {
    updateField(
      "achievements",
      [
        ...(resume.achievements || []),
        "",
      ]
    );
  }

  function updateAchievement(
    index: number,
    value: string
  ) {
    const achievements = [
      ...(resume.achievements || []),
    ];

    achievements[index] = value;

    updateField(
      "achievements",
      achievements
    );
  }

  function removeAchievement(
    index: number
  ) {
    const achievements = [
      ...(resume.achievements || []),
    ];

    achievements.splice(index, 1);

    updateField(
      "achievements",
      achievements
    );
  }

  /* ==========================================================================
     RESPONSIBILITIES
     ========================================================================== */

  function addResponsibility(
    experienceIndex: number
  ) {
    const experiences = [
      ...(resume.experience || []),
    ];

    const responsibilities = [
      ...(experiences[
        experienceIndex
      ].responsibilities || []),
      "",
    ];

    experiences[
      experienceIndex
    ].responsibilities =
      responsibilities;

    updateField(
      "experience",
      experiences
    );
  }

  function updateResponsibility(
    experienceIndex: number,
    responsibilityIndex: number,
    value: string
  ) {
    const experiences = [
      ...(resume.experience || []),
    ];

    const responsibilities = [
      ...(experiences[
        experienceIndex
      ].responsibilities || []),
    ];

    responsibilities[
      responsibilityIndex
    ] = value;

    experiences[
      experienceIndex
    ].responsibilities =
      responsibilities;

    updateField(
      "experience",
      experiences
    );
  }

  function removeResponsibility(
    experienceIndex: number,
    responsibilityIndex: number
  ) {
    const experiences = [
      ...(resume.experience || []),
    ];

    const responsibilities = [
      ...(experiences[
        experienceIndex
      ].responsibilities || []),
    ];

    responsibilities.splice(
      responsibilityIndex,
      1
    );

    experiences[
      experienceIndex
    ].responsibilities =
      responsibilities;

    updateField(
      "experience",
      experiences
    );
  }

  /* ==========================================================================
     TECHNOLOGIES
     ========================================================================== */

  function updateTechnologyList(
    experienceIndex: number,
    value: string
  ) {
    const experiences = [
      ...(resume.experience || []),
    ];

    experiences[
      experienceIndex
    ].technologies =
      value
        .split(",")
        .map((item) =>
          item.trim()
        )
        .filter(Boolean);

    updateField(
      "experience",
      experiences
    );
  }

  function updateProjectTechnologies(
    index: number,
    value: string
  ) {
    const projects = [
      ...(resume.projects || []),
    ];

    projects[index].technologies =
      value
        .split(",")
        .map((item) =>
          item.trim()
        )
        .filter(Boolean);

    updateField(
      "projects",
      projects
    );
  }

  /* ==========================================================================
     PREVIEW STATS
     ========================================================================== */

  const sectionCount =
    useMemo(() => {
      let count = 0;

      if (
        resume.summary?.trim()
      )
        count++;

      if (
        resume.skills?.length
      )
        count++;

      if (
        resume.experience?.length
      )
        count++;

      if (
        resume.education?.length
      )
        count++;

      if (
        resume.projects?.length
      )
        count++;

      if (
        resume.certifications
          ?.length
      )
        count++;

      return count;
    }, [resume]);

  /* ==========================================================================
     LOADING
     ========================================================================== */

  if (loading && resumeId) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-300">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading resume...
        </div>
      </main>
    );
  }

  /* ==========================================================================
     UI
     ========================================================================== */

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* =====================================================================
          HEADER
          =================================================================== */}

      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-4 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="rounded-lg border border-white/10 p-2 text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>

            <div>
              <h1 className="text-lg font-semibold">
                Resume Builder
              </h1>

              <p className="text-xs text-slate-500">
                {resumeId
                  ? "Editing resume"
                  : "Create a professional resume"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {message && (
              <div className="hidden items-center gap-2 text-sm text-emerald-400 md:flex">
                <CheckCircle2 className="h-4 w-4" />
                {message}
              </div>
            )}

            <button
              type="button"
              onClick={duplicateResume}
              disabled={!resumeId || saving}
              className="hidden items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40 md:flex"
            >
              <Copy className="h-4 w-4" />
              Duplicate
            </button>

            <button
              type="button"
              onClick={saveResume}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-slate-200 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}

              {saving
                ? "Saving..."
                : "Save Resume"}
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================================
          ERROR
          =================================================================== */}

      {(error || message) && (
        <div className="mx-auto max-w-[1600px] px-4 pt-4 lg:px-8">
          {error && (
            <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {message && !error && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 md:hidden">
              <CheckCircle2 className="h-4 w-4" />
              {message}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          CONTENT
          =================================================================== */}

      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(500px,0.85fr)] lg:px-8">
        {/* ===================================================================
            EDITOR
            ================================================================= */}

        <section className="min-w-0">
          {/* -----------------------------------------------------------------
              SECTION NAV
              ----------------------------------------------------------------- */}

          <div className="mb-6 flex gap-2 overflow-x-auto rounded-xl border border-white/10 bg-white/[0.03] p-2">
            <SectionButton
              active={
                activeSection ===
                "personal"
              }
              onClick={() =>
                setActiveSection(
                  "personal"
                )
              }
              icon={<User className="h-4 w-4" />}
              label="Personal"
            />

            <SectionButton
              active={
                activeSection ===
                "experience"
              }
              onClick={() =>
                setActiveSection(
                  "experience"
                )
              }
              icon={
                <Briefcase className="h-4 w-4" />
              }
              label="Experience"
            />

            <SectionButton
              active={
                activeSection ===
                "education"
              }
              onClick={() =>
                setActiveSection(
                  "education"
                )
              }
              icon={
                <GraduationCap className="h-4 w-4" />
              }
              label="Education"
            />

            <SectionButton
              active={
                activeSection ===
                "projects"
              }
              onClick={() =>
                setActiveSection(
                  "projects"
                )
              }
              icon={
                <FolderKanban className="h-4 w-4" />
              }
              label="Projects"
            />

            <SectionButton
              active={
                activeSection ===
                "skills"
              }
              onClick={() =>
                setActiveSection(
                  "skills"
                )
              }
              icon={
                <Award className="h-4 w-4" />
              }
              label="Skills"
            />

            <SectionButton
              active={
                activeSection ===
                "extra"
              }
              onClick={() =>
                setActiveSection(
                  "extra"
                )
              }
              icon={
                <Trophy className="h-4 w-4" />
              }
              label="More"
            />
          </div>

          {/* -----------------------------------------------------------------
              PERSONAL
              ----------------------------------------------------------------- */}

          {activeSection ===
            "personal" && (
            <EditorCard
              title="Personal Information"
              description="Add your contact information and professional headline."
            >
              <div className="grid gap-5 md:grid-cols-2">
                <Input
                  label="Resume Title"
                  value={
                    resume.title || ""
                  }
                  onChange={(value) =>
                    updateField(
                      "title",
                      value
                    )
                  }
                  placeholder="Software Developer Resume"
                />

                <Input
                  label="Full Name *"
                  value={
                    resume.candidateName
                  }
                  onChange={(value) =>
                    updateField(
                      "candidateName",
                      value
                    )
                  }
                  placeholder="John Doe"
                />

                <Input
                  label="Email *"
                  type="email"
                  value={
                    resume.candidateEmail
                  }
                  onChange={(value) =>
                    updateField(
                      "candidateEmail",
                      value
                    )
                  }
                  placeholder="john@example.com"
                />

                <Input
                  label="Phone"
                  value={
                    resume.candidatePhone ||
                    ""
                  }
                  onChange={(value) =>
                    updateField(
                      "candidatePhone",
                      value
                    )
                  }
                  placeholder="+91 98765 43210"
                />

                <Input
                  label="Location"
                  value={
                    resume.location || ""
                  }
                  onChange={(value) =>
                    updateField(
                      "location",
                      value
                    )
                  }
                  placeholder="Pune, Maharashtra"
                />

                <Input
                  label="Website"
                  value={
                    resume.website || ""
                  }
                  onChange={(value) =>
                    updateField(
                      "website",
                      value
                    )
                  }
                  placeholder="https://example.com"
                />

                <Input
                  label="LinkedIn"
                  value={
                    resume.linkedin || ""
                  }
                  onChange={(value) =>
                    updateField(
                      "linkedin",
                      value
                    )
                  }
                  placeholder="https://linkedin.com/in/johndoe"
                />

                <Input
                  label="GitHub"
                  value={
                    resume.github || ""
                  }
                  onChange={(value) =>
                    updateField(
                      "github",
                      value
                    )
                  }
                  placeholder="https://github.com/johndoe"
                />
              </div>

              <div className="mt-6">
                <Textarea
                  label="Professional Summary"
                  value={
                    resume.summary || ""
                  }
                  onChange={(value) =>
                    updateField(
                      "summary",
                      value
                    )
                  }
                  placeholder="Write a concise professional summary..."
                  rows={7}
                />
              </div>
            </EditorCard>
          )}

          {/* -----------------------------------------------------------------
              EXPERIENCE
              ----------------------------------------------------------------- */}

          {activeSection ===
            "experience" && (
            <EditorCard
              title="Work Experience"
              description="Add your professional experience."
              action={
                <AddButton
                  onClick={
                    addExperience
                  }
                  label="Add Experience"
                />
              }
            >
              <div className="space-y-6">
                {(
                  resume.experience ||
                  []
                ).length === 0 ? (
                  <EmptySection
                    text="No experience added yet."
                    buttonLabel="Add Experience"
                    onClick={
                      addExperience
                    }
                  />
                ) : (
                  (
                    resume.experience ||
                    []
                  ).map(
                    (
                      experience,
                      index
                    ) => (
                      <div
                        key={
                          experience.id ||
                          index
                        }
                        className="rounded-xl border border-white/10 bg-black/20 p-5"
                      >
                        <div className="mb-5 flex items-center justify-between">
                          <h3 className="font-medium">
                            Experience #
                            {index + 1}
                          </h3>

                          <button
                            type="button"
                            onClick={() =>
                              removeExperience(
                                index
                              )
                            }
                            className="rounded-lg p-2 text-red-400 transition hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                          <Input
                            label="Job Title"
                            value={
                              experience.position
                            }
                            onChange={(
                              value
                            ) =>
                              updateExperience(
                                index,
                                "position",
                                value
                              )
                            }
                            placeholder="Software Engineer"
                          />

                          <Input
                            label="Company"
                            value={
                              experience.company
                            }
                            onChange={(
                              value
                            ) =>
                              updateExperience(
                                index,
                                "company",
                                value
                              )
                            }
                            placeholder="Google"
                          />

                          <Input
                            label="Location"
                            value={
                              experience.location ||
                              ""
                            }
                            onChange={(
                              value
                            ) =>
                              updateExperience(
                                index,
                                "location",
                                value
                              )
                            }
                            placeholder="Bangalore, India"
                          />

                          <Input
                            label="Technologies"
                            value={(
                              experience.technologies ||
                              []
                            ).join(
                              ", "
                            )}
                            onChange={(
                              value
                            ) =>
                              updateTechnologyList(
                                index,
                                value
                              )
                            }
                            placeholder="React, Node.js, PostgreSQL"
                          />

                          <Input
                            label="Start Date"
                            value={
                              experience.startDate
                            }
                            onChange={(
                              value
                            ) =>
                              updateExperience(
                                index,
                                "startDate",
                                value
                              )
                            }
                            placeholder="Jan 2024"
                          />

                          <Input
                            label="End Date"
                            value={
                              experience.endDate ||
                              ""
                            }
                            disabled={
                              Boolean(
                                experience.current
                              )
                            }
                            onChange={(
                              value
                            ) =>
                              updateExperience(
                                index,
                                "endDate",
                                value
                              )
                            }
                            placeholder="Present"
                          />
                        </div>

                        <label className="mt-5 flex items-center gap-2 text-sm text-slate-300">
                          <input
                            type="checkbox"
                            checked={
                              Boolean(
                                experience.current
                              )
                            }
                            onChange={(
                              event
                            ) =>
                              updateExperience(
                                index,
                                "current",
                                event
                                  .target
                                  .checked
                              )
                            }
                            className="h-4 w-4 rounded"
                          />

                          I currently work here
                        </label>

                        <div className="mt-5">
                          <Textarea
                            label="Description"
                            value={
                              experience.description ||
                              ""
                            }
                            onChange={(
                              value
                            ) =>
                              updateExperience(
                                index,
                                "description",
                                value
                              )
                            }
                            placeholder="Describe your role..."
                            rows={5}
                          />
                        </div>

                        <div className="mt-6">
                          <div className="mb-3 flex items-center justify-between">
                            <label className="text-sm font-medium text-slate-300">
                              Responsibilities
                            </label>

                            <button
                              type="button"
                              onClick={() =>
                                addResponsibility(
                                  index
                                )
                              }
                              className="text-xs text-white hover:underline"
                            >
                              + Add
                            </button>
                          </div>

                          <div className="space-y-2">
                            {(
                              experience.responsibilities ||
                              []
                            ).map(
                              (
                                responsibility,
                                responsibilityIndex
                              ) => (
                                <div
                                  key={
                                    responsibilityIndex
                                  }
                                  className="flex gap-2"
                                >
                                  <input
                                    value={
                                      responsibility
                                    }
                                    onChange={(
                                      event
                                    ) =>
                                      updateResponsibility(
                                        index,
                                        responsibilityIndex,
                                        event
                                          .target
                                          .value
                                      )
                                    }
                                    placeholder="Built REST APIs..."
                                    className="min-w-0 flex-1 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm outline-none transition focus:border-white/30"
                                  />

                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeResponsibility(
                                        index,
                                        responsibilityIndex
                                      )
                                    }
                                    className="rounded-lg px-3 text-red-400 hover:bg-red-500/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            </EditorCard>
          )}

          {/* -----------------------------------------------------------------
              EDUCATION
              ----------------------------------------------------------------- */}

          {activeSection ===
            "education" && (
            <EditorCard
              title="Education"
              description="Add your educational background."
              action={
                <AddButton
                  onClick={
                    addEducation
                  }
                  label="Add Education"
                />
              }
            >
              <div className="space-y-6">
                {(
                  resume.education ||
                  []
                ).length === 0 ? (
                  <EmptySection
                    text="No education added yet."
                    buttonLabel="Add Education"
                    onClick={
                      addEducation
                    }
                  />
                ) : (
                  (
                    resume.education ||
                    []
                  ).map(
                    (
                      education,
                      index
                    ) => (
                      <div
                        key={
                          education.id ||
                          index
                        }
                        className="rounded-xl border border-white/10 bg-black/20 p-5"
                      >
                        <div className="mb-5 flex items-center justify-between">
                          <h3 className="font-medium">
                            Education #
                            {index + 1}
                          </h3>

                          <button
                            type="button"
                            onClick={() =>
                              removeEducation(
                                index
                              )
                            }
                            className="rounded-lg p-2 text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                          <Input
                            label="Institution"
                            value={
                              education.institution
                            }
                            onChange={(
                              value
                            ) =>
                              updateEducation(
                                index,
                                "institution",
                                value
                              )
                            }
                            placeholder="University Name"
                          />

                          <Input
                            label="Degree"
                            value={
                              education.degree
                            }
                            onChange={(
                              value
                            ) =>
                              updateEducation(
                                index,
                                "degree",
                                value
                              )
                            }
                            placeholder="Bachelor of Computer Applications"
                          />

                          <Input
                            label="Field of Study"
                            value={
                              education.fieldOfStudy ||
                              ""
                            }
                            onChange={(
                              value
                            ) =>
                              updateEducation(
                                index,
                                "fieldOfStudy",
                                value
                              )
                            }
                            placeholder="Computer Science"
                          />

                          <Input
                            label="Location"
                            value={
                              education.location ||
                              ""
                            }
                            onChange={(
                              value
                            ) =>
                              updateEducation(
                                index,
                                "location",
                                value
                              )
                            }
                            placeholder="Pune, India"
                          />

                          <Input
                            label="Start Date"
                            value={
                              education.startDate ||
                              ""
                            }
                            onChange={(
                              value
                            ) =>
                              updateEducation(
                                index,
                                "startDate",
                                value
                              )
                            }
                            placeholder="2022"
                          />

                          <Input
                            label="End Date"
                            value={
                              education.endDate ||
                              ""
                            }
                            onChange={(
                              value
                            ) =>
                              updateEducation(
                                index,
                                "endDate",
                                value
                              )
                            }
                            placeholder="2025"
                          />

                          <Input
                            label="Grade / GPA"
                            value={
                              education.grade ||
                              ""
                            }
                            onChange={(
                              value
                            ) =>
                              updateEducation(
                                index,
                                "grade",
                                value
                              )
                            }
                            placeholder="8.5 CGPA"
                          />
                        </div>

                        <div className="mt-5">
                          <Textarea
                            label="Description"
                            value={
                              education.description ||
                              ""
                            }
                            onChange={(
                              value
                            ) =>
                              updateEducation(
                                index,
                                "description",
                                value
                              )
                            }
                            placeholder="Relevant coursework, achievements..."
                            rows={4}
                          />
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            </EditorCard>
          )}

          {/* -----------------------------------------------------------------
              PROJECTS
              ----------------------------------------------------------------- */}

          {activeSection ===
            "projects" && (
            <EditorCard
              title="Projects"
              description="Showcase your best projects."
              action={
                <AddButton
                  onClick={
                    addProject
                  }
                  label="Add Project"
                />
              }
            >
              <div className="space-y-6">
                {(
                  resume.projects ||
                  []
                ).length === 0 ? (
                  <EmptySection
                    text="No projects added yet."
                    buttonLabel="Add Project"
                    onClick={
                      addProject
                    }
                  />
                ) : (
                  (
                    resume.projects ||
                    []
                  ).map(
                    (
                      project,
                      index
                    ) => (
                      <div
                        key={
                          project.id ||
                          index
                        }
                        className="rounded-xl border border-white/10 bg-black/20 p-5"
                      >
                        <div className="mb-5 flex items-center justify-between">
                          <h3 className="font-medium">
                            Project #
                            {index + 1}
                          </h3>

                          <button
                            type="button"
                            onClick={() =>
                              removeProject(
                                index
                              )
                            }
                            className="rounded-lg p-2 text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                          <Input
                            label="Project Name"
                            value={
                              project.name
                            }
                            onChange={(
                              value
                            ) =>
                              updateProject(
                                index,
                                "name",
                                value
                              )
                            }
                            placeholder="AI Resume Analyzer"
                          />

                          <Input
                            label="Technologies"
                            value={(
                              project.technologies ||
                              []
                            ).join(
                              ", "
                            )}
                            onChange={(
                              value
                            ) =>
                              updateProjectTechnologies(
                                index,
                                value
                              )
                            }
                            placeholder="Next.js, Node.js, PostgreSQL"
                          />

                          <Input
                            label="Project URL"
                            value={
                              project.url ||
                              ""
                            }
                            onChange={(
                              value
                            ) =>
                              updateProject(
                                index,
                                "url",
                                value
                              )
                            }
                            placeholder="https://example.com"
                          />

                          <Input
                            label="GitHub URL"
                            value={
                              project.github ||
                              ""
                            }
                            onChange={(
                              value
                            ) =>
                              updateProject(
                                index,
                                "github",
                                value
                              )
                            }
                            placeholder="https://github.com/..."
                          />

                          <Input
                            label="Start Date"
                            value={
                              project.startDate ||
                              ""
                            }
                            onChange={(
                              value
                            ) =>
                              updateProject(
                                index,
                                "startDate",
                                value
                              )
                            }
                            placeholder="2025"
                          />

                          <Input
                            label="End Date"
                            value={
                              project.endDate ||
                              ""
                            }
                            onChange={(
                              value
                            ) =>
                              updateProject(
                                index,
                                "endDate",
                                value
                              )
                            }
                            placeholder="2026"
                          />
                        </div>

                        <div className="mt-5">
                          <Textarea
                            label="Description"
                            value={
                              project.description ||
                              ""
                            }
                            onChange={(
                              value
                            ) =>
                              updateProject(
                                index,
                                "description",
                                value
                              )
                            }
                            placeholder="Describe what you built and the impact..."
                            rows={5}
                          />
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            </EditorCard>
          )}

          {/* -----------------------------------------------------------------
              SKILLS
              ----------------------------------------------------------------- */}

          {activeSection ===
            "skills" && (
            <EditorCard
              title="Skills"
              description="Add technical and professional skills."
              action={
                <AddButton
                  onClick={
                    addSkill
                  }
                  label="Add Skill"
                />
              }
            >
              <div className="space-y-3">
                {(
                  resume.skills ||
                  []
                ).map(
                  (skill, index) => (
                    <div
                      key={index}
                      className="flex gap-2"
                    >
                      <input
                        value={
                          skill
                        }
                        onChange={(
                          event
                        ) =>
                          updateSkill(
                            index,
                            event
                              .target
                              .value
                          )
                        }
                        placeholder="React.js"
                        className="min-w-0 flex-1 rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-white/30"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeSkill(
                            index
                          )
                        }
                        className="rounded-lg px-4 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )
                )}

                {(
                  resume.skills ||
                  []
                ).length === 0 && (
                  <EmptySection
                    text="No skills added yet."
                    buttonLabel="Add Skill"
                    onClick={
                      addSkill
                    }
                  />
                )}
              </div>
            </EditorCard>
          )}

          {/* -----------------------------------------------------------------
              MORE
              ----------------------------------------------------------------- */}

          {activeSection ===
            "extra" && (
            <div className="space-y-6">
              {/* Certifications */}

              <EditorCard
                title="Certifications"
                description="Add professional certifications."
                action={
                  <AddButton
                    onClick={
                      addCertification
                    }
                    label="Add"
                  />
                }
              >
                <div className="space-y-5">
                  {(
                    resume.certifications ||
                    []
                  ).map(
                    (
                      certification,
                      index
                    ) => (
                      <div
                        key={
                          certification.id ||
                          index
                        }
                        className="rounded-xl border border-white/10 bg-black/20 p-5"
                      >
                        <div className="mb-5 flex items-center justify-between">
                          <h3 className="font-medium">
                            Certification #
                            {index + 1}
                          </h3>

                          <button
                            type="button"
                            onClick={() =>
                              removeCertification(
                                index
                              )
                            }
                            className="text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                          <Input
                            label="Certification Name"
                            value={
                              certification.name
                            }
                            onChange={(
                              value
                            ) =>
                              updateCertification(
                                index,
                                "name",
                                value
                              )
                            }
                            placeholder="AWS Certified Developer"
                          />

                          <Input
                            label="Issuer"
                            value={
                              certification.issuer ||
                              ""
                            }
                            onChange={(
                              value
                            ) =>
                              updateCertification(
                                index,
                                "issuer",
                                value
                              )
                            }
                            placeholder="Amazon Web Services"
                          />

                          <Input
                            label="Issue Date"
                            value={
                              certification.issueDate ||
                              ""
                            }
                            onChange={(
                              value
                            ) =>
                              updateCertification(
                                index,
                                "issueDate",
                                value
                              )
                            }
                            placeholder="Jan 2026"
                          />

                          <Input
                            label="Expiry Date"
                            value={
                              certification.expiryDate ||
                              ""
                            }
                            onChange={(
                              value
                            ) =>
                              updateCertification(
                                index,
                                "expiryDate",
                                value
                              )
                            }
                            placeholder="Jan 2029"
                          />

                          <Input
                            label="Credential ID"
                            value={
                              certification.credentialId ||
                              ""
                            }
                            onChange={(
                              value
                            ) =>
                              updateCertification(
                                index,
                                "credentialId",
                                value
                              )
                            }
                            placeholder="ABC123"
                          />

                          <Input
                            label="Credential URL"
                            value={
                              certification.credentialUrl ||
                              ""
                            }
                            onChange={(
                              value
                            ) =>
                              updateCertification(
                                index,
                                "credentialUrl",
                                value
                              )
                            }
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    )
                  )}

                  {(
                    resume.certifications ||
                    []
                  ).length === 0 && (
                    <EmptySection
                      text="No certifications added."
                      buttonLabel="Add Certification"
                      onClick={
                        addCertification
                      }
                    />
                  )}
                </div>
              </EditorCard>

              {/* Languages */}

              <EditorCard
                title="Languages"
                description="Add languages you speak."
                action={
                  <AddButton
                    onClick={
                      addLanguage
                    }
                    label="Add Language"
                  />
                }
              >
                <div className="space-y-3">
                  {(
                    resume.languages ||
                    []
                  ).map(
                    (
                      language,
                      index
                    ) => (
                      <div
                        key={index}
                        className="flex gap-2"
                      >
                        <input
                          value={
                            language
                          }
                          onChange={(
                            event
                          ) =>
                            updateLanguage(
                              index,
                              event
                                .target
                                .value
                            )
                          }
                          placeholder="English — Fluent"
                          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-white/30"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeLanguage(
                              index
                            )
                          }
                          className="rounded-lg px-4 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )
                  )}
                </div>
              </EditorCard>

              {/* Achievements */}

              <EditorCard
                title="Achievements"
                description="Add awards, achievements, and notable accomplishments."
                action={
                  <AddButton
                    onClick={
                      addAchievement
                    }
                    label="Add Achievement"
                  />
                }
              >
                <div className="space-y-3">
                  {(
                    resume.achievements ||
                    []
                  ).map(
                    (
                      achievement,
                      index
                    ) => (
                      <div
                        key={index}
                        className="flex gap-2"
                      >
                        <textarea
                          value={
                            achievement
                          }
                          onChange={(
                            event
                          ) =>
                            updateAchievement(
                              index,
                              event
                                .target
                                .value
                            )
                          }
                          rows={3}
                          placeholder="Won first place in..."
                          className="min-w-0 flex-1 resize-none rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-white/30"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeAchievement(
                              index
                            )
                          }
                          className="rounded-lg px-3 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )
                  )}
                </div>
              </EditorCard>
            </div>
          )}

          {/* -----------------------------------------------------------------
              DANGER ZONE
              ----------------------------------------------------------------- */}

          {resumeId && (
            <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/[0.03] p-5">
              <h3 className="font-medium text-red-300">
                Danger Zone
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Deleting this resume cannot be undone.
              </p>

              <button
                type="button"
                onClick={
                  deleteResume
                }
                disabled={deleting}
                className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/20 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}

                Delete Resume
              </button>
            </div>
          )}
        </section>

        {/* ===================================================================
            PREVIEW
            ================================================================= */}

        <aside className="lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)]">
          <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            {/* Preview Header */}

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
              <div>
                <h2 className="font-semibold">
                  Live Preview
                </h2>

                <p className="text-xs text-slate-500">
                  {sectionCount} sections
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={template}
                  onChange={(event) =>
                    setTemplate(
                      event.target
                        .value as
                        | "modern"
                        | "professional"
                        | "minimal"
                    )
                  }
                  className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-slate-300 outline-none"
                >
                  <option value="modern">
                    Modern
                  </option>

                  <option value="professional">
                    Professional
                  </option>

                  <option value="minimal">
                    Minimal
                  </option>
                </select>

                <button
                  type="button"
                  onClick={
                    downloadPDF
                  }
                  disabled={
                    !resumeId ||
                    loading
                  }
                  className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-medium text-slate-950 disabled:opacity-40"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}

                  PDF
                </button>
              </div>
            </div>

            {/* Preview Area */}

            <div className="flex-1 overflow-auto bg-slate-800/60 p-4 md:p-8">
              <ResumePreview
                resume={resume}
                template={template}
              />
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

/* ============================================================================
   SECTION BUTTON
   ========================================================================== */

function SectionButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm transition ${
        active
          ? "bg-white text-slate-950"
          : "text-slate-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

/* ============================================================================
   EDITOR CARD
   ========================================================================== */

function EditorCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-7">
      <div className="mb-7 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-sm text-slate-500">
              {description}
            </p>
          )}
        </div>

        {action}
      </div>

      {children}
    </div>
  );
}

/* ============================================================================
   INPUT
   ========================================================================== */

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </span>

      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-white/30 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </label>
  );
}

/* ============================================================================
   TEXTAREA
   ========================================================================== */

function Textarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 5,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </span>

      <textarea
        value={value}
        rows={rows}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        className="w-full resize-y rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-white/30"
      />
    </label>
  );
}

/* ============================================================================
   ADD BUTTON
   ========================================================================== */

function AddButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
    >
      <Plus className="h-4 w-4" />
      {label}
    </button>
  );
}

/* ============================================================================
   EMPTY SECTION
   ========================================================================== */

function EmptySection({
  text,
  buttonLabel,
  onClick,
}: {
  text: string;
  buttonLabel: string;
  onClick: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-12 text-center">
      <FileText className="mb-3 h-8 w-8 text-slate-600" />

      <p className="text-sm text-slate-500">
        {text}
      </p>

      <button
        type="button"
        onClick={onClick}
        className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-950"
      >
        {buttonLabel}
      </button>
    </div>
  );
}

/* ============================================================================
   RESUME PREVIEW
   ========================================================================== */

function ResumePreview({
  resume,
  template,
}: {
  resume: Resume;
  template:
    | "modern"
    | "professional"
    | "minimal";
}) {
  const modern =
    template === "modern";

  const professional =
    template === "professional";

  return (
    <div
      className={`mx-auto min-h-[1120px] w-full max-w-[794px] bg-white p-8 text-slate-900 shadow-2xl md:p-12 ${
        professional
          ? "font-serif"
          : "font-sans"
      }`}
    >
      {/* ---------------------------------------------------------------------
          HEADER
          ------------------------------------------------------------------- */}

      <header
        className={`border-b pb-6 ${
          modern
            ? "border-slate-200"
            : "border-slate-900"
        }`}
      >
        <h1
          className={`text-3xl font-bold tracking-tight ${
            professional
              ? "uppercase"
              : ""
          }`}
        >
          {resume.candidateName ||
            "Your Name"}
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          {resume.title ||
            "Professional Resume"}
        </p>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
          {resume.candidateEmail && (
            <span>
              {resume.candidateEmail}
            </span>
          )}

          {resume.candidatePhone && (
            <span>
              {resume.candidatePhone}
            </span>
          )}

          {resume.location && (
            <span>
              {resume.location}
            </span>
          )}

          {resume.website && (
            <span>
              {resume.website}
            </span>
          )}

          {resume.linkedin && (
            <span>
              {resume.linkedin}
            </span>
          )}

          {resume.github && (
            <span>
              {resume.github}
            </span>
          )}
        </div>
      </header>

      {/* ---------------------------------------------------------------------
          SUMMARY
          ------------------------------------------------------------------- */}

      {resume.summary?.trim() && (
        <PreviewSection
          title="Summary"
        >
          <p className="text-sm leading-6 text-slate-700">
            {resume.summary}
          </p>
        </PreviewSection>
      )}

      {/* ---------------------------------------------------------------------
          SKILLS
          ------------------------------------------------------------------- */}

      {resume.skills &&
        resume.skills.length >
          0 && (
          <PreviewSection title="Skills">
            <div className="flex flex-wrap gap-2">
              {resume.skills
                .filter(Boolean)
                .map(
                  (
                    skill,
                    index
                  ) => (
                    <span
                      key={index}
                      className="text-sm text-slate-700"
                    >
                      {skill}
                      {index <
                        resume
                          .skills!
                          .filter(
                            Boolean
                          )
                          .length -
                          1
                        ? " • "
                        : ""}
                    </span>
                  )
                )}
            </div>
          </PreviewSection>
        )}

      {/* ---------------------------------------------------------------------
          EXPERIENCE
          ------------------------------------------------------------------- */}

      {resume.experience &&
        resume.experience.length >
          0 && (
          <PreviewSection title="Experience">
            <div className="space-y-6">
              {resume.experience.map(
                (
                  experience,
                  index
                ) => (
                  <div
                    key={
                      experience.id ||
                      index
                    }
                  >
                    <div className="flex flex-col justify-between gap-1 md:flex-row">
                      <div>
                        <h3 className="text-sm font-bold">
                          {
                            experience.position
                          }
                        </h3>

                        <p className="text-sm font-medium text-slate-700">
                          {
                            experience.company
                          }
                          {experience.location
                            ? ` — ${experience.location}`
                            : ""}
                        </p>
                      </div>

                      <p className="text-xs text-slate-500">
                        {
                          experience.startDate
                        }{" "}
                        -{" "}
                        {experience.current
                          ? "Present"
                          : experience.endDate ||
                            ""}
                      </p>
                    </div>

                    {experience.description && (
                      <p className="mt-2 text-sm leading-5 text-slate-700">
                        {
                          experience.description
                        }
                      </p>
                    )}

                    {experience.responsibilities &&
                      experience
                        .responsibilities
                        .length >
                        0 && (
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                          {experience.responsibilities
                            .filter(
                              Boolean
                            )
                            .map(
                              (
                                responsibility,
                                responsibilityIndex
                              ) => (
                                <li
                                  key={
                                    responsibilityIndex
                                  }
                                >
                                  {
                                    responsibility
                                  }
                                </li>
                              )
                            )}
                        </ul>
                      )}

                    {experience.technologies &&
                      experience
                        .technologies
                        .length >
                        0 && (
                        <p className="mt-2 text-xs text-slate-500">
                          <strong>
                            Technologies:
                          </strong>{" "}
                          {experience.technologies.join(
                            ", "
                          )}
                        </p>
                      )}
                  </div>
                )
              )}
            </div>
          </PreviewSection>
        )}

      {/* ---------------------------------------------------------------------
          EDUCATION
          ------------------------------------------------------------------- */}

      {resume.education &&
        resume.education.length >
          0 && (
          <PreviewSection title="Education">
            <div className="space-y-5">
              {resume.education.map(
                (
                  education,
                  index
                ) => (
                  <div
                    key={
                      education.id ||
                      index
                    }
                  >
                    <div className="flex flex-col justify-between gap-1 md:flex-row">
                      <div>
                        <h3 className="text-sm font-bold">
                          {
                            education.degree
                          }
                          {education.fieldOfStudy
                            ? `, ${education.fieldOfStudy}`
                            : ""}
                        </h3>

                        <p className="text-sm text-slate-700">
                          {
                            education.institution
                          }
                        </p>
                      </div>

                      <p className="text-xs text-slate-500">
                        {
                          education.startDate
                        }{" "}
                        -{" "}
                        {
                          education.endDate
                        }
                      </p>
                    </div>

                    {education.grade && (
                      <p className="mt-1 text-xs text-slate-500">
                        Grade:{" "}
                        {
                          education.grade
                        }
                      </p>
                    )}

                    {education.description && (
                      <p className="mt-2 text-sm text-slate-700">
                        {
                          education.description
                        }
                      </p>
                    )}
                  </div>
                )
              )}
            </div>
          </PreviewSection>
        )}

      {/* ---------------------------------------------------------------------
          PROJECTS
          ------------------------------------------------------------------- */}

      {resume.projects &&
        resume.projects.length >
          0 && (
          <PreviewSection title="Projects">
            <div className="space-y-5">
              {resume.projects.map(
                (
                  project,
                  index
                ) => (
                  <div
                    key={
                      project.id ||
                      index
                    }
                  >
                    <h3 className="text-sm font-bold">
                      {
                        project.name
                      }
                    </h3>

                    {(project.url ||
                      project.github) && (
                      <p className="text-xs text-slate-500">
                        {project.url ||
                          project.github}
                      </p>
                    )}

                    {project.description && (
                      <p className="mt-2 text-sm leading-5 text-slate-700">
                        {
                          project.description
                        }
                      </p>
                    )}

                    {project.technologies &&
                      project
                        .technologies
                        .length >
                        0 && (
                        <p className="mt-2 text-xs text-slate-500">
                          {
                            project.technologies.join(
                              " • "
                            )
                          }
                        </p>
                      )}
                  </div>
                )
              )}
            </div>
          </PreviewSection>
        )}

      {/* ---------------------------------------------------------------------
          CERTIFICATIONS
          ------------------------------------------------------------------- */}

      {resume.certifications &&
        resume.certifications.length >
          0 && (
          <PreviewSection title="Certifications">
            <div className="space-y-3">
              {resume.certifications.map(
                (
                  certification,
                  index
                ) => (
                  <div
                    key={
                      certification.id ||
                      index
                    }
                  >
                    <h3 className="text-sm font-bold">
                      {
                        certification.name
                      }
                    </h3>

                    <p className="text-sm text-slate-700">
                      {
                        certification.issuer
                      }

                      {certification.issueDate
                        ? ` — ${certification.issueDate}`
                        : ""}
                    </p>
                  </div>
                )
              )}
            </div>
          </PreviewSection>
        )}

      {/* ---------------------------------------------------------------------
          LANGUAGES
          ------------------------------------------------------------------- */}

      {resume.languages &&
        resume.languages.length >
          0 && (
          <PreviewSection title="Languages">
            <p className="text-sm text-slate-700">
              {resume.languages
                .filter(Boolean)
                .join(
                  " • "
                )}
            </p>
          </PreviewSection>
        )}

      {/* ---------------------------------------------------------------------
          ACHIEVEMENTS
          ------------------------------------------------------------------- */}

      {resume.achievements &&
        resume.achievements.length >
          0 && (
          <PreviewSection title="Achievements">
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
              {resume.achievements
                .filter(Boolean)
                .map(
                  (
                    achievement,
                    index
                  ) => (
                    <li key={index}>
                      {
                        achievement
                      }
                    </li>
                  )
                )}
            </ul>
          </PreviewSection>
        )}
    </div>
  );
}

/* ============================================================================
   PREVIEW SECTION
   ========================================================================== */

function PreviewSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-7">
      <h2 className="mb-3 border-b border-slate-200 pb-1 text-xs font-bold uppercase tracking-[0.15em] text-slate-900">
        {title}
      </h2>

      {children}
    </section>
  );
}