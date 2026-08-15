"use client";

import {
  useEffect,
  useState,
  type ComponentType,
} from "react";

import Link from "next/link";
import { useParams } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  User,
  XCircle,
} from "lucide-react";

import { getResumeById } from "@/lib/api";

/* ============================================================
   TYPES
============================================================ */

type Contact = {
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
};

type ATSAnalysis = {
  score?: number | null;
  summary?: string;
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
};

type ParsedData = {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  skills?: string[];
  experience?: unknown[];
  education?: unknown[];
};

type Resume = {
  id: string;

  fileName?: string;
  originalName?: string;
  candidateName?: string;

  status?: string;
  analysisStatus?: string;

  createdAt?: string;
  updatedAt?: string;

  atsScore?: number | null;

  summary?: string;

  skills?: string[];

  experience?: string[];

  education?: string[];

  contact?: Contact;

  atsAnalysis?: ATSAnalysis;

  parsedData?: ParsedData;
};

/* ============================================================
   PAGE
============================================================ */

export default function ResumeDetailsPage() {
  const params = useParams();

  const id =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
      ? params.id[0]
      : "";

  const [resume, setResume] =
    useState<Resume | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  /* ============================================================
     LOAD RESUME
  ============================================================ */

  useEffect(() => {
    if (!id) {
      return;
    }

    void loadResume();
  }, [id]);

  async function loadResume() {
    if (!id) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getResumeById(id);

      const payload = response as
        | (Resume & {
            resume?: Resume;
            data?: Resume;
          })
        | null
        | undefined;

      const data =
        payload?.resume ??
        payload?.data ??
        (payload as Resume | null | undefined);

      if (!data) {
        throw new Error(
          "Resume not found."
        );
      }

      setResume(data as Resume);
    } catch (err) {
      console.error(
        "Failed to load resume:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load resume."
      );
    } finally {
      setLoading(false);
    }
  }

  /* ============================================================
     REFRESH
  ============================================================ */

  async function handleRefresh() {
    if (!id) {
      return;
    }

    try {
      setRefreshing(true);
      setError("");

      const response =
        await getResumeById(id);

      const payload = response as
        | (Resume & {
            resume?: Resume;
            data?: Resume;
          })
        | null
        | undefined;

      const data =
        payload?.resume ??
        payload?.data ??
        (payload as Resume | null | undefined);

      if (!data) {
        throw new Error(
          "Resume not found."
        );
      }

      setResume(data as Resume);
    } catch (err) {
      console.error(
        "Failed to refresh resume:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to refresh resume."
      );
    } finally {
      setRefreshing(false);
    }
  }

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return <ResumeDetailsLoading />;
  }

  /* ============================================================
     ERROR
  ============================================================ */

  if (error || !resume) {
    return (
      <div className="min-h-screen bg-[#08090d] text-white">
        <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6">
          <div className="w-full rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
              <XCircle className="h-7 w-7 text-red-400" />
            </div>

            <h1 className="mt-5 text-xl font-bold">
              Unable to load resume
            </h1>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              {error ||
                "The requested resume could not be found."}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">

              <Link
                href="/resume"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium transition hover:bg-white/[0.08]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Resumes
              </Link>

              <button
                type="button"
                onClick={() => void loadResume()}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold transition hover:bg-violet-400"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>

            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ============================================================
     DATA
  ============================================================ */

  const score = Number(
    resume.atsScore ??
      resume.atsAnalysis?.score ??
      0
  );

  const candidateName =
    resume.candidateName ||
    resume.parsedData?.name ||
    "Candidate";

  const summary =
    resume.summary ||
    resume.atsAnalysis?.summary ||
    resume.parsedData?.summary ||
    "No AI summary available yet.";

  const skills =
    resume.skills ||
    resume.parsedData?.skills ||
    [];

  const contact =
    resume.contact || {
      email: resume.parsedData?.email,
      phone: resume.parsedData?.phone,
      location: resume.parsedData?.location,
    };

  const strengths =
    resume.atsAnalysis?.strengths || [];

  const weaknesses =
    resume.atsAnalysis?.weaknesses || [];

  const recommendations =
    resume.atsAnalysis?.recommendations || [];

  const status = normalizeStatus(
    resume.status ||
      resume.analysisStatus
  );

  /* ============================================================
     UI
  ============================================================ */

  return (
    <div className="min-h-screen bg-[#08090d] text-white">

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <header className="mb-8">

          <Link
            href="/resume"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Resumes
          </Link>

          <div className="mt-5 flex flex-col justify-between gap-5 lg:flex-row lg:items-start">

            <div className="flex min-w-0 items-start gap-4">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10">
                <FileText className="h-7 w-7 text-violet-400" />
              </div>

              <div className="min-w-0">

                <div className="flex flex-wrap items-center gap-3">

                  <h1 className="truncate text-2xl font-bold sm:text-3xl">
                    {candidateName}
                  </h1>

                  <StatusBadge
                    status={status}
                  />

                </div>

                <p className="mt-2 truncate text-sm text-zinc-500">
                  {resume.originalName ||
                    resume.fileName ||
                    "Resume"}
                </p>

                <p className="mt-1 text-xs text-zinc-600">
                  Uploaded{" "}
                  {formatDate(
                    resume.createdAt
                  )}
                </p>

              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                void handleRefresh()
              }
              disabled={refreshing}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
            >

              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh"}

            </button>

          </div>
        </header>

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* ======================================================
            TOP GRID
        ====================================================== */}

        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">

          {/* ATS SCORE */}

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                <Target className="h-5 w-5 text-violet-400" />
              </div>

              <div>
                <h2 className="font-semibold">
                  ATS Performance
                </h2>

                <p className="mt-0.5 text-xs text-zinc-500">
                  Resume compatibility score
                </p>
              </div>

            </div>

            <div className="mt-8 flex flex-col items-center justify-center sm:flex-row sm:justify-between">

              <ScoreCircle score={score} />

              <div className="mt-6 text-center sm:mt-0 sm:text-right">

                <p className="text-xs uppercase tracking-wider text-zinc-500">
                  ATS Score
                </p>

                <p
                  className={`mt-1 text-5xl font-bold ${getScoreTextColor(
                    score
                  )}`}
                >
                  {Math.round(score)}
                  <span className="text-2xl">
                    %
                  </span>
                </p>

                <p className="mt-2 text-sm text-zinc-500">
                  {getScoreLabel(score)}
                </p>

              </div>

            </div>

            <div className="mt-8 h-2 overflow-hidden rounded-full bg-white/10">

              <div
                className={`h-full rounded-full transition-all ${getScoreBackground(
                  score
                )}`}
                style={{
                  width: `${Math.min(
                    Math.max(score, 0),
                    100
                  )}%`,
                }}
              />

            </div>

          </div>

          {/* CANDIDATE INFO */}

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                <User className="h-5 w-5 text-violet-400" />
              </div>

              <div>
                <h2 className="font-semibold">
                  Candidate Information
                </h2>

                <p className="mt-0.5 text-xs text-zinc-500">
                  Parsed resume details
                </p>
              </div>

            </div>

            <div className="mt-6 space-y-3">

              <InfoRow
                label="Name"
                value={candidateName}
              />

              <InfoRow
                label="Email"
                value={
                  contact.email ||
                  "Not available"
                }
              />

              <InfoRow
                label="Phone"
                value={
                  contact.phone ||
                  "Not available"
                }
              />

              <InfoRow
                label="Location"
                value={
                  contact.location ||
                  "Not available"
                }
              />

            </div>

          </div>

        </section>

        {/* ======================================================
            SUMMARY
        ====================================================== */}

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">

          <SectionTitle
            icon={Sparkles}
            title="AI Resume Summary"
            description="AI-generated overview of this candidate"
          />

          <p className="mt-6 max-w-4xl text-sm leading-7 text-zinc-400">
            {summary}
          </p>

        </section>

        {/* ======================================================
            SKILLS
        ====================================================== */}

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">

          <SectionTitle
            icon={TrendingUp}
            title="Skills"
            description="Technical and professional skills detected from the resume"
          />

          {skills.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-2">

              {skills.map(
                (skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="rounded-xl border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-xs font-medium text-violet-300"
                  >
                    {skill}
                  </span>
                )
              )}

            </div>
          ) : (
            <EmptySection text="No skills have been extracted yet." />
          )}

        </section>

        {/* ======================================================
            AI INSIGHTS
        ====================================================== */}

        <section className="mt-6 grid gap-6 md:grid-cols-2">

          <InsightCard
            title="Strengths"
            description="What makes this resume strong"
            icon={CheckCircle2}
            items={strengths}
            type="success"
          />

          <InsightCard
            title="Areas to Improve"
            description="Potential weaknesses detected by AI"
            icon={XCircle}
            items={weaknesses}
            type="danger"
          />

        </section>

        {/* ======================================================
            RECOMMENDATIONS
        ====================================================== */}

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">

          <SectionTitle
            icon={Sparkles}
            title="AI Recommendations"
            description="Suggestions to improve resume performance"
          />

          {recommendations.length > 0 ? (
            <div className="mt-6 space-y-3">

              {recommendations.map(
                (item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4"
                  >

                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
                      <span className="text-xs font-bold text-violet-400">
                        {index + 1}
                      </span>
                    </div>

                    <p className="text-sm leading-6 text-zinc-400">
                      {item}
                    </p>

                  </div>
                )
              )}

            </div>
          ) : (
            <EmptySection text="AI recommendations are not available yet." />
          )}

        </section>

        {/* ======================================================
            QUICK ACTIONS
        ====================================================== */}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <QuickAction
            href="/analysis"
            icon={BarChart3}
            title="View Analyses"
            description="Compare this resume against job descriptions."
          />

          <QuickAction
            href="/jobs"
            icon={Target}
            title="Match With Job"
            description="Find jobs that match this candidate."
          />

          <QuickAction
            href="/resume"
            icon={FileText}
            title="All Resumes"
            description="Return to your resume library."
          />

        </section>

      </main>
    </div>
  );
}

/* ============================================================
   QUICK ACTION
============================================================ */

function QuickAction({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: ComponentType<{
    className?: string;
  }>;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-violet-500/20 hover:bg-white/[0.05]"
    >

      <Icon className="h-5 w-5 text-violet-400" />

      <h3 className="mt-4 text-sm font-semibold">
        {title}
      </h3>

      <p className="mt-1 text-xs leading-5 text-zinc-500">
        {description}
      </p>

      <ArrowRight className="mt-4 h-4 w-4 text-zinc-600 transition group-hover:translate-x-1 group-hover:text-violet-400" />

    </Link>
  );
}

/* ============================================================
   SCORE CIRCLE
============================================================ */

function ScoreCircle({
  score,
}: {
  score: number;
}) {
  const radius = 58;

  const circumference =
    2 * Math.PI * radius;

  const safeScore = Math.min(
    Math.max(score, 0),
    100
  );

  const offset =
    circumference -
    (safeScore / 100) *
      circumference;

  return (
    <div className="relative h-36 w-36">

      <svg
        className="h-36 w-36 -rotate-90"
        viewBox="0 0 140 140"
      >

        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-white/10"
        />

        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={getScoreTextColor(
            score
          )}
        />

      </svg>

      <div className="absolute inset-0 flex items-center justify-center">

        <Target
          className={`h-7 w-7 ${getScoreTextColor(
            score
          )}`}
        />

      </div>

    </div>
  );
}

/* ============================================================
   SECTION TITLE
============================================================ */

function SectionTitle({
  icon: Icon,
  title,
  description,
}: {
  icon: ComponentType<{
    className?: string;
  }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">

        <Icon className="h-5 w-5 text-violet-400" />

      </div>

      <div>

        <h2 className="font-semibold">
          {title}
        </h2>

        <p className="mt-0.5 text-xs text-zinc-500">
          {description}
        </p>

      </div>

    </div>
  );
}

/* ============================================================
   INFO ROW
============================================================ */

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">

      <p className="text-[10px] uppercase tracking-wider text-zinc-600">
        {label}
      </p>

      <p className="mt-1 truncate text-sm text-zinc-300">
        {value}
      </p>

    </div>
  );
}

/* ============================================================
   INSIGHT CARD
============================================================ */

function InsightCard({
  title,
  description,
  icon: Icon,
  items,
  type,
}: {
  title: string;
  description: string;
  icon: ComponentType<{
    className?: string;
  }>;
  items: string[];
  type: "success" | "danger";
}) {
  const iconStyle =
    type === "success"
      ? "bg-emerald-500/10 text-emerald-400"
      : "bg-red-500/10 text-red-400";

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">

      <div className="flex items-center gap-3">

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconStyle}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div>

          <h2 className="font-semibold">
            {title}
          </h2>

          <p className="mt-0.5 text-xs text-zinc-500">
            {description}
          </p>

        </div>

      </div>

      {items.length > 0 ? (
        <div className="mt-6 space-y-3">

          {items.map(
            (item, index) => (
              <div
                key={`${item}-${index}`}
                className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4"
              >

                <span
                  className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
                    type === "success"
                      ? "bg-emerald-400"
                      : "bg-red-400"
                  }`}
                />

                <p className="text-sm leading-6 text-zinc-400">
                  {item}
                </p>

              </div>
            )
          )}

        </div>
      ) : (
        <EmptySection
          text={
            type === "success"
              ? "No strengths available yet."
              : "No weaknesses available yet."
          }
        />
      )}

    </div>
  );
}

/* ============================================================
   EMPTY SECTION
============================================================ */

function EmptySection({
  text,
}: {
  text: string;
}) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-8 text-center">

      <p className="text-sm text-zinc-600">
        {text}
      </p>

    </div>
  );
}

/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles =
    status === "analyzed"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
      : status === "processing"
      ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
      : status === "failed"
      ? "border-red-500/20 bg-red-500/10 text-red-300"
      : "border-white/10 bg-white/5 text-zinc-400";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${styles}`}
    >

      {status === "analyzed" && (
        <CheckCircle2 className="h-3 w-3" />
      )}

      {status === "processing" && (
        <Clock3 className="h-3 w-3" />
      )}

      {status === "failed" && (
        <XCircle className="h-3 w-3" />
      )}

      {status}

    </span>
  );
}

/* ============================================================
   LOADING
============================================================ */

function ResumeDetailsLoading() {
  return (
    <div className="min-h-screen bg-[#08090d] text-white">

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        <div className="animate-pulse">

          <div className="h-4 w-32 rounded bg-white/10" />

          <div className="mt-6 flex gap-4">

            <div className="h-14 w-14 rounded-2xl bg-white/10" />

            <div>

              <div className="h-8 w-64 rounded bg-white/10" />

              <div className="mt-3 h-4 w-48 rounded bg-white/10" />

            </div>

          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">

            <div className="h-72 rounded-3xl bg-white/[0.04]" />

            <div className="h-72 rounded-3xl bg-white/[0.04]" />

          </div>

          <div className="mt-6 h-52 rounded-3xl bg-white/[0.04]" />

          <div className="mt-6 h-48 rounded-3xl bg-white/[0.04]" />

        </div>

      </main>

    </div>
  );
}

/* ============================================================
   NORMALIZE STATUS
============================================================ */

function normalizeStatus(
  status?: string
): string {
  const value =
    status?.toLowerCase().trim() || "";

  if (
    value.includes("process") ||
    value.includes("pending")
  ) {
    return "processing";
  }

  if (
    value.includes("fail") ||
    value.includes("error")
  ) {
    return "failed";
  }

  if (
    value.includes("analy") ||
    value.includes("complete") ||
    value.includes("success")
  ) {
    return "analyzed";
  }

  return value || "uploaded";
}

/* ============================================================
   FORMAT DATE
============================================================ */

function formatDate(
  value?: string
): string {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

/* ============================================================
   SCORE COLOR
============================================================ */

function getScoreTextColor(
  score: number
): string {
  if (score >= 80) {
    return "text-emerald-400";
  }

  if (score >= 60) {
    return "text-amber-400";
  }

  return "text-red-400";
}

/* ============================================================
   SCORE BACKGROUND
============================================================ */

function getScoreBackground(
  score: number
): string {
  if (score >= 80) {
    return "bg-emerald-400";
  }

  if (score >= 60) {
    return "bg-amber-400";
  }

  return "bg-red-400";
}

/* ============================================================
   SCORE LABEL
============================================================ */

function getScoreLabel(
  score: number
): string {
  if (score >= 80) {
    return "Excellent ATS compatibility";
  }

  if (score >= 60) {
    return "Good ATS compatibility";
  }

  if (score >= 40) {
    return "Needs improvement";
  }

  return "Low ATS compatibility";
}