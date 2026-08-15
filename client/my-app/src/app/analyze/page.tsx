"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Sparkles,
  Upload,
  FileText,
  Check,
  Briefcase,
} from "lucide-react";

import ResumeUploader from "@/components/analyzer/ResumeUploader";
import AnalysisLoader from "@/components/analyzer/AnalysisLoader";

import {
  uploadResume,
  createJob,
  createAnalysis,
} from "@/lib/api";

/* ============================================================================
   BUILT-IN JOB DESCRIPTIONS
============================================================================ */

const BUILT_IN_JOBS = [
  {
    id: "fullstack",
    title: "Full Stack Developer",
    company: "Technology Company",
    description: `
We are looking for a Full Stack Developer to build scalable and reliable web applications.

Responsibilities:
- Build modern web applications using React, Next.js and Node.js.
- Develop RESTful APIs using Node.js and Express.js.
- Design and manage PostgreSQL and MongoDB databases.
- Write clean, maintainable and scalable TypeScript code.
- Work with Git and GitHub for version control.
- Build responsive and accessible user interfaces.
- Integrate third-party APIs and services.
- Debug, test and optimize applications.
- Collaborate with frontend and backend developers.

Requirements:
- Strong knowledge of JavaScript and TypeScript.
- Experience with React and Next.js.
- Experience with Node.js and Express.js.
- Knowledge of PostgreSQL or MongoDB.
- Understanding of REST APIs.
- Knowledge of Git and GitHub.
- Understanding of authentication and JWT.
- Familiarity with Docker and cloud deployment is a plus.
`,
  },

  {
    id: "frontend",
    title: "Frontend Developer",
    company: "Technology Company",
    description: `
We are looking for a Frontend Developer to create modern, responsive and high-performance web applications.

Responsibilities:
- Build user interfaces using React and Next.js.
- Convert UI designs into reusable components.
- Build responsive layouts for desktop and mobile.
- Integrate REST APIs.
- Improve website performance and accessibility.
- Write reusable and maintainable TypeScript code.
- Work with Git and GitHub.
- Debug frontend issues and improve user experience.

Requirements:
- Strong knowledge of HTML, CSS and JavaScript.
- Experience with React.js.
- Experience with Next.js.
- Strong TypeScript knowledge.
- Experience with REST APIs.
- Knowledge of Git and GitHub.
- Understanding of responsive design.
- Experience with Tailwind CSS is a plus.
`,
  },

  {
    id: "backend",
    title: "Backend Developer",
    company: "Technology Company",
    description: `
We are looking for a Backend Developer to design and build scalable backend systems and APIs.

Responsibilities:
- Develop RESTful APIs using Node.js and Express.js.
- Design scalable backend services.
- Work with PostgreSQL and MongoDB.
- Implement authentication and authorization.
- Build secure APIs.
- Optimize database queries.
- Implement caching using Redis.
- Write automated tests.
- Debug and monitor backend applications.
- Deploy services using Docker and cloud platforms.

Requirements:
- Strong knowledge of Node.js.
- Experience with Express.js.
- Strong TypeScript or JavaScript knowledge.
- Experience with PostgreSQL or MongoDB.
- Knowledge of REST APIs.
- Experience with JWT authentication.
- Knowledge of Redis.
- Familiarity with Docker.
- Understanding of Git and GitHub.
`,
  },

  {
    id: "java",
    title: "Java Backend Developer",
    company: "Enterprise Technology Company",
    description: `
We are looking for a Java Backend Developer to build scalable enterprise applications.

Responsibilities:
- Develop backend services using Java and Spring Boot.
- Design RESTful APIs.
- Work with relational databases.
- Implement authentication and authorization.
- Write clean and maintainable Java code.
- Create unit and integration tests.
- Optimize backend performance.
- Debug production issues.
- Work with Git and CI/CD pipelines.

Requirements:
- Strong knowledge of Java.
- Experience with Spring Boot.
- Experience building REST APIs.
- Knowledge of SQL and relational databases.
- Understanding of OOP and design patterns.
- Knowledge of Git.
- Familiarity with Docker and CI/CD.
- Understanding of microservices is a plus.
`,
  },

  {
    id: "ai",
    title: "AI / Machine Learning Engineer",
    company: "AI Technology Company",
    description: `
We are looking for an AI / Machine Learning Engineer to build intelligent applications and machine learning systems.

Responsibilities:
- Develop machine learning models.
- Build AI-powered applications.
- Work with Python and machine learning frameworks.
- Integrate LLM APIs.
- Build data processing pipelines.
- Evaluate model performance.
- Develop APIs for machine learning systems.
- Work with vector databases and embeddings.
- Optimize AI applications for production.

Requirements:
- Strong Python knowledge.
- Understanding of machine learning.
- Experience with artificial intelligence.
- Experience with OpenAI or Gemini APIs.
- Understanding of embeddings and vector databases.
- Knowledge of REST APIs.
- Knowledge of SQL.
- Familiarity with LangChain is a plus.
- Understanding of cloud deployment is a plus.
`,
  },
];

/* ============================================================================
   COMPONENT
============================================================================ */

export default function AnalyzePage() {
  const router = useRouter();

  const [file, setFile] =
    useState<File | null>(null);

  const [jobDescription, setJobDescription] =
    useState("");

  const [selectedJob, setSelectedJob] =
    useState("");

  const [jdFile, setJdFile] =
    useState<File | null>(null);

  const [jdMode, setJdMode] =
    useState<"builtin" | "upload" | "custom">(
      "builtin"
    );

  const [loading, setLoading] =
    useState(false);

  const [step, setStep] =
    useState(0);

  const [error, setError] =
    useState("");

  /* ==========================================================================
     SELECT BUILT-IN JOB
  ========================================================================== */

  const handleBuiltInJobChange = (
    jobId: string
  ) => {
    setSelectedJob(jobId);

    const job =
      BUILT_IN_JOBS.find(
        (item) => item.id === jobId
      );

    if (!job) {
      setJobDescription("");
      return;
    }

    setJobDescription(
      job.description.trim()
    );

    setJdFile(null);
    setError("");
  };

  /* ==========================================================================
     JD FILE UPLOAD
  ========================================================================== */

  const handleJdFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (
      !allowedTypes.includes(
        selectedFile.type
      )
    ) {
      setError(
        "Please upload a PDF, DOCX, or TXT job description."
      );

      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    if (
      selectedFile.size >
      maxSize
    ) {
      setError(
        "Job description file must be smaller than 5MB."
      );

      return;
    }

    setJdFile(selectedFile);
    setSelectedJob("");
    setJobDescription("");
    setError("");
  };

  /* ==========================================================================
     EXTRACT SKILLS
  ========================================================================== */

  const extractSkills = (
    description: string
  ): string[] => {
    const knownSkills = [
      "JavaScript",
      "TypeScript",
      "React",
      "React.js",
      "Next.js",
      "Node.js",
      "Express.js",
      "HTML",
      "CSS",
      "Tailwind CSS",
      "MongoDB",
      "PostgreSQL",
      "MySQL",
      "Prisma",
      "Git",
      "GitHub",
      "Docker",
      "AWS",
      "Redis",
      "REST API",
      "REST APIs",
      "GraphQL",
      "JWT",
      "Python",
      "Java",
      "Spring Boot",
      "C++",
      "C",
      "SQL",
      "Firebase",
      "Supabase",
      "Vite",
      "Redux",
      "Zustand",
      "React Query",
      "Jest",
      "Cypress",
      "CI/CD",
      "Linux",
      "Machine Learning",
      "Artificial Intelligence",
      "AI",
      "OpenAI",
      "Gemini",
      "LangChain",
    ];

    const normalizedDescription =
      description.toLowerCase();

    const foundSkills =
      knownSkills.filter(
        (skill) =>
          normalizedDescription.includes(
            skill.toLowerCase()
          )
      );

    return Array.from(
      new Set(foundSkills)
    );
  };

  /* ==========================================================================
     ANALYZE RESUME
  ========================================================================== */

  const handleAnalyze = async () => {
    if (!file) {
      setError(
        "Please upload your resume first."
      );

      return;
    }

    if (
      jdMode === "builtin" &&
      !selectedJob
    ) {
      setError(
        "Please select a job role."
      );

      return;
    }

    if (
      jdMode === "upload" &&
      !jdFile
    ) {
      setError(
        "Please upload a job description file."
      );

      return;
    }

    if (
      jdMode === "custom" &&
      !jobDescription.trim()
    ) {
      setError(
        "Please enter a job description."
      );

      return;
    }

    try {
      setError("");
      setLoading(true);
      setStep(0);

      /* ======================================================================
         STEP 1
      ====================================================================== */

      setStep(1);

      const resume =
        await uploadResume(file);

      if (!resume?.id) {
        throw new Error(
          "Resume upload failed."
        );
      }

      /* ======================================================================
         RESOLVE JOB DESCRIPTION
      ====================================================================== */

      let finalJobDescription =
        jobDescription.trim();

      let jobTitle =
        "Target Position";

      let companyName =
        "Target Company";

      /* ----------------------------------------------------------------------
         BUILT-IN
      ---------------------------------------------------------------------- */

      if (
        jdMode === "builtin"
      ) {
        const job =
          BUILT_IN_JOBS.find(
            (item) =>
              item.id ===
              selectedJob
          );

        if (!job) {
          throw new Error(
            "Selected job role was not found."
          );
        }

        finalJobDescription =
          job.description.trim();

        jobTitle =
          job.title;

        companyName =
          job.company;
      }

      /* ----------------------------------------------------------------------
         CUSTOM
      ---------------------------------------------------------------------- */

      if (
        jdMode === "custom"
      ) {
        finalJobDescription =
          jobDescription.trim();
      }

      /*
       * NOTE:
       *
       * Uploaded PDF/DOCX job descriptions
       * require backend parsing.
       *
       * The file is validated here and kept
       * ready for the backend upload API.
       */

      if (
        jdMode === "upload"
      ) {
        throw new Error(
          "Job description file upload is ready on the UI, but backend JD file parsing needs to be connected before analysis."
        );
      }

      /* ======================================================================
         STEP 2 — CREATE JOB
      ====================================================================== */

      setStep(2);

      const extractedSkills =
        extractSkills(
          finalJobDescription
        );

      const requiredSkills =
        extractedSkills.length > 0
          ? extractedSkills
          : ["General"];

      const job =
        await createJob({
          title:
            jobTitle,

          company:
            companyName,

          description:
            finalJobDescription,

          requirements:
            finalJobDescription,

          requiredSkills,
        });

      if (!job?.id) {
        throw new Error(
          "Job creation failed."
        );
      }

      /* ======================================================================
         STEP 3 — CREATE ANALYSIS
      ====================================================================== */

      setStep(3);

      const analysis =
        await createAnalysis(
          resume.id,
          job.id
        );

      if (!analysis?.id) {
        throw new Error(
          "Analysis creation failed."
        );
      }

      /* ======================================================================
         STEP 4 — REDIRECT
      ====================================================================== */

      router.push(
        `/analysis/${analysis.id}`
      );

      router.refresh();

    } catch (error) {
      console.error(
        "Resume analysis failed:",
        error
      );

      setLoading(false);
      setStep(0);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while analyzing your resume."
      );
    }
  };

  /* ==========================================================================
     LOADING
  ========================================================================== */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#080808] text-white">
        <AnalysisLoader step={step} />
      </main>
    );
  }

  /* ==========================================================================
     UI
  ========================================================================== */

  return (
    <main className="min-h-screen bg-[#080808] text-white">

      <div className="mx-auto w-full max-w-5xl px-6 py-16 sm:px-8 lg:px-10">

        {/* HEADER */}

        <div className="mb-14 text-center">

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/5 px-4 py-2 text-xs font-medium text-violet-400">

            <Sparkles className="h-3.5 w-3.5" />

            AI-powered resume intelligence

          </div>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            Analyze your resume
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-zinc-500 sm:text-base">
            Upload your resume and compare it
            against a job description. Discover
            your ATS score, skill gaps, missing
            keywords, and personalized
            recommendations.
          </p>

        </div>

        <div className="space-y-8">

          {/* ==================================================================
              RESUME UPLOAD
          ================================================================== */}

          <section className="rounded-3xl border border-zinc-800 bg-[#0d0d0d] p-6 sm:p-8">

            <div className="mb-6">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">

                  <FileText className="h-5 w-5" />

                </div>

                <div>

                  <h2 className="text-lg font-semibold">
                    Upload your resume
                  </h2>

                  <p className="text-sm text-zinc-500">
                    PDF, DOCX or supported resume format
                  </p>

                </div>

              </div>

            </div>

            <ResumeUploader
              file={file}
              onFileChange={setFile}
            />

          </section>

          {/* ==================================================================
              JOB DESCRIPTION
          ================================================================== */}

          <section className="rounded-3xl border border-zinc-800 bg-[#0d0d0d] p-6 sm:p-8">

            <div className="mb-7">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">

                  <Briefcase className="h-5 w-5" />

                </div>

                <div>

                  <h2 className="text-lg font-semibold">
                    Job description
                  </h2>

                  <p className="text-sm text-zinc-500">
                    Choose a built-in role, upload a JD,
                    or write your own.
                  </p>

                </div>

              </div>

            </div>

            {/* MODE SELECTOR */}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

              <button
                type="button"
                onClick={() => {
                  setJdMode("builtin");
                  setJdFile(null);
                  setError("");
                }}
                className={`rounded-2xl border p-4 text-left transition ${
                  jdMode === "builtin"
                    ? "border-violet-500 bg-violet-500/10"
                    : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                }`}
              >

                <div className="flex items-center justify-between">

                  <span className="text-sm font-semibold">
                    Built-in JD
                  </span>

                  {jdMode === "builtin" && (
                    <Check className="h-4 w-4 text-violet-400" />
                  )}

                </div>

                <p className="mt-1 text-xs text-zinc-500">
                  Select a common developer role
                </p>

              </button>

              <button
                type="button"
                onClick={() => {
                  setJdMode("upload");
                  setSelectedJob("");
                  setJobDescription("");
                  setError("");
                }}
                className={`rounded-2xl border p-4 text-left transition ${
                  jdMode === "upload"
                    ? "border-violet-500 bg-violet-500/10"
                    : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                }`}
              >

                <div className="flex items-center justify-between">

                  <span className="text-sm font-semibold">
                    Upload JD
                  </span>

                  {jdMode === "upload" && (
                    <Check className="h-4 w-4 text-violet-400" />
                  )}

                </div>

                <p className="mt-1 text-xs text-zinc-500">
                  Upload PDF, DOCX or TXT
                </p>

              </button>

              <button
                type="button"
                onClick={() => {
                  setJdMode("custom");
                  setSelectedJob("");
                  setJdFile(null);
                  setError("");
                }}
                className={`rounded-2xl border p-4 text-left transition ${
                  jdMode === "custom"
                    ? "border-violet-500 bg-violet-500/10"
                    : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                }`}
              >

                <div className="flex items-center justify-between">

                  <span className="text-sm font-semibold">
                    Write JD
                  </span>

                  {jdMode === "custom" && (
                    <Check className="h-4 w-4 text-violet-400" />
                  )}

                </div>

                <p className="mt-1 text-xs text-zinc-500">
                  Paste your own description
                </p>

              </button>

            </div>

            {/* BUILT-IN JOB SELECTOR */}

            {jdMode === "builtin" && (
              <div className="mt-6">

                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Select job role
                </label>

                <select
                  value={selectedJob}
                  onChange={(event) =>
                    handleBuiltInJobChange(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-zinc-800 bg-[#111111] px-4 py-3 text-sm text-white outline-none transition focus:border-violet-500"
                >

                  <option value="">
                    Select a job role
                  </option>

                  {BUILT_IN_JOBS.map(
                    (job) => (
                      <option
                        key={job.id}
                        value={job.id}
                      >
                        {job.title}
                      </option>
                    )
                  )}

                </select>

                {jobDescription && (
                  <div className="mt-4 rounded-2xl border border-zinc-800 bg-black/30 p-4">

                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Selected job description
                    </p>

                    <p className="max-h-48 overflow-y-auto whitespace-pre-line text-sm leading-6 text-zinc-400">
                      {jobDescription}
                    </p>

                  </div>
                )}

              </div>
            )}

            {/* JD FILE UPLOAD */}

            {jdMode === "upload" && (
              <div className="mt-6">

                <label
                  htmlFor="jd-upload"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-black/20 px-6 py-12 text-center transition hover:border-violet-500 hover:bg-violet-500/5"
                >

                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/10 text-violet-400">

                    <Upload className="h-5 w-5" />

                  </div>

                  <p className="text-sm font-medium text-zinc-200">
                    {jdFile
                      ? jdFile.name
                      : "Upload job description"}
                  </p>

                  <p className="mt-2 text-xs text-zinc-500">
                    PDF, DOCX or TXT · Maximum 5MB
                  </p>

                  <input
                    id="jd-upload"
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={
                      handleJdFileChange
                    }
                    className="hidden"
                  />

                </label>

                {jdFile && (
                  <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">

                    <Check className="h-4 w-4 text-emerald-400" />

                    <span className="text-sm text-emerald-300">
                      {jdFile.name}
                    </span>

                  </div>
                )}

              </div>
            )}

            {/* CUSTOM JD */}

            {jdMode === "custom" && (
              <div className="mt-6">

                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Job description
                </label>

                <textarea
                  value={jobDescription}
                  onChange={(event) =>
                    setJobDescription(
                      event.target.value
                    )
                  }
                  placeholder="Paste the job description here..."
                  rows={12}
                  className="w-full resize-none rounded-2xl border border-zinc-800 bg-[#111111] px-4 py-4 text-sm leading-6 text-white outline-none placeholder:text-zinc-600 transition focus:border-violet-500"
                />

                <div className="mt-2 text-right text-xs text-zinc-600">
                  {jobDescription.length} characters
                </div>

              </div>
            )}

          </section>

          {/* ERROR */}

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          {/* ANALYZE */}

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={loading}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-4 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >

            Analyze Resume

            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />

          </button>

          <p className="text-center text-xs text-zinc-600">
            Your resume is processed securely.
            AI analysis may take a few moments.
          </p>

        </div>
      </div>

    </main>
  );
}

