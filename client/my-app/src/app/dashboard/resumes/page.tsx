"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Upload,
  FileText,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock3,
  XCircle,
  ArrowRight,
  Trash2,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import {
  getResumes,
  uploadResume,
  deleteResume,
  getResumeStats,
  type Resume,
  type ResumeStats,
} from "@/lib/api";

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [stats, setStats] = useState<ResumeStats | null>(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [deletingId, setDeletingId] = useState<string | null>(
    null
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadResumes();
  }, []);

  async function loadResumes() {
    try {
      setLoading(true);
      setError(null);

      const [resumeData, statsData] = await Promise.all([
        getResumes(),
        getResumeStats().catch(() => null),
      ]);

      setResumes(Array.isArray(resumeData) ? resumeData : []);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to load resumes:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load resumes"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const resume = await uploadResume(file);

      setResumes((current) => [
        resume,
        ...current.filter((item) => item.id !== resume.id),
      ]);

      try {
        const updatedStats = await getResumeStats();
        setStats(updatedStats);
      } catch {
        // Stats endpoint may not exist.
      }
    } catch (err) {
      console.error("Resume upload failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Resume upload failed"
      );
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this resume?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setError(null);

      await deleteResume(id);

      setResumes((current) =>
        current.filter((resume) => resume.id !== id)
      );

      setStats((current) => {
        if (!current) return current;

        return {
          ...current,
          total: Math.max(0, current.total - 1),
        };
      });
    } catch (err) {
      console.error("Delete resume failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete resume"
      );
    } finally {
      setDeletingId(null);
    }
  }

  const filteredResumes = resumes.filter((resume) => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return (
      resume.fileName?.toLowerCase().includes(query) ||
      resume.candidateName
        ?.toLowerCase()
        .includes(query) ||
      resume.candidateEmail
        ?.toLowerCase()
        .includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-[#08070d] text-white">
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">

        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-400" />

              <span className="text-sm font-medium text-violet-400">
                AI Resume Analyzer
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight">
              Resumes
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              Upload, analyze and manage your candidate resumes.
            </p>
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleUpload}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}

              {uploading
                ? "Uploading..."
                : "Upload Resume"}
            </button>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />

            <div className="flex-1">
              <p className="text-sm font-medium text-red-300">
                Something went wrong
              </p>

              <p className="mt-1 text-sm text-red-400">
                {error}
              </p>
            </div>

            <button
              onClick={loadResumes}
              className="inline-flex items-center gap-2 rounded-lg border border-red-500/20 px-3 py-2 text-xs font-medium text-red-300 hover:bg-red-500/10"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        )}

        {/* STATS */}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <Stat
            icon={FileText}
            label="Total Resumes"
            value={
              stats?.total ??
              resumes.length
            }
          />

          <Stat
            icon={CheckCircle2}
            label="Analyzed"
            value={
              stats?.analyzed ??
              resumes.filter(
                (r) => r.status === "COMPLETED" ||
                  r.status === "completed" ||
                  r.status === "ANALYZED" ||
                  r.status === "analyzed"
              ).length
            }
          />

          <Stat
            icon={Clock3}
            label="Processing"
            value={
              stats?.processing ??
              resumes.filter(
                (r) =>
                  r.status === "PROCESSING" ||
                  r.status === "processing"
              ).length
            }
          />

          <Stat
            icon={Sparkles}
            label="Average Score"
            value={`${stats?.averageScore ?? calculateAverageScore(resumes)}%`}
          />

        </div>

        {/* SEARCH */}

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search resumes..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10"
            />
          </div>

          <button
            onClick={loadResumes}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.07]"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading ? "animate-spin" : ""
              }`}
            />

            Refresh
          </button>

        </div>

        {/* CONTENT */}

        {loading ? (
          <LoadingState />
        ) : filteredResumes.length === 0 ? (
          <EmptyState
            search={search}
            onUpload={() =>
              fileInputRef.current?.click()
            }
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">

            {/* TABLE HEADER */}

            <div className="hidden border-b border-white/10 bg-white/[0.025] px-6 py-4 text-xs font-medium uppercase tracking-wider text-zinc-500 md:grid md:grid-cols-[2fr_1fr_1fr_1fr_auto] md:gap-4">
              <span>Candidate</span>
              <span>Status</span>
              <span>AI Score</span>
              <span>Uploaded</span>
              <span />
            </div>

            {/* ROWS */}

            <div className="divide-y divide-white/10">
              {filteredResumes.map((resume) => (
                <ResumeRow
                  key={resume.id}
                  resume={resume}
                  deleting={
                    deletingId === resume.id
                  }
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

/* ============================================================
   STAT
============================================================ */

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{
    className?: string;
  }>;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-violet-500/20 hover:bg-white/[0.04]">

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-white">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
          <Icon className="h-5 w-5 text-violet-400" />
        </div>
      </div>

    </div>
  );
}

/* ============================================================
   RESUME ROW
============================================================ */

function ResumeRow({
  resume,
  deleting,
  onDelete,
}: {
  resume: Resume;
  deleting: boolean;
  onDelete: (id: string) => void;
}) {
  const score = Number(resume.aiScore) || 0;

  const status = resume.status?.toLowerCase() || "unknown";

  const statusInfo = getStatusInfo(status);

  return (
    <div className="group px-5 py-5 transition hover:bg-white/[0.035] md:px-6">

      <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr_1fr_auto] md:items-center md:gap-4">

        {/* CANDIDATE */}

        <Link
          href={`/resumes/${resume.id}`}
          className="flex min-w-0 items-center gap-3"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-500/10 bg-violet-500/10">
            <FileText className="h-5 w-5 text-violet-400" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {resume.candidateName ||
                "Unknown Candidate"}
            </p>

            <p className="mt-1 truncate text-xs text-zinc-500">
              {resume.fileName}
            </p>

            {resume.candidateEmail && (
              <p className="mt-1 truncate text-xs text-zinc-600">
                {resume.candidateEmail}
              </p>
            )}
          </div>
        </Link>

        {/* STATUS */}

        <div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusInfo.className}`}
          >
            {statusInfo.icon}

            {statusInfo.label}
          </span>
        </div>

        {/* SCORE */}

        <div>
          {score > 0 ? (
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full ${
                    score >= 75
                      ? "bg-emerald-500"
                      : score >= 50
                        ? "bg-amber-500"
                        : "bg-red-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      score,
                      100
                    )}%`,
                  }}
                />
              </div>

              <span className="text-sm font-semibold text-white">
                {score}%
              </span>
            </div>
          ) : (
            <span className="text-xs text-zinc-600">
              Not analyzed
            </span>
          )}
        </div>

        {/* DATE */}

        <div>
          <span className="text-xs text-zinc-500">
            {formatDate(
              resume.createdAt
            )}
          </span>
        </div>

        {/* ACTIONS */}

        <div className="flex items-center gap-2">

          <Link
            href={`/resumes/${resume.id}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-zinc-500 transition hover:border-violet-500/30 hover:bg-violet-500/10 hover:text-violet-400"
            title="View resume"
          >
            <ArrowRight className="h-4 w-4" />
          </Link>

          <button
            onClick={() =>
              onDelete(resume.id)
            }
            disabled={deleting}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-zinc-600 transition hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
            title="Delete resume"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>

        </div>

      </div>

    </div>
  );
}

/* ============================================================
   LOADING
============================================================ */

function LoadingState() {
  return (
    <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.025]">
      <div className="flex flex-col items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10">
          <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
        </div>

        <p className="mt-4 text-sm font-medium text-zinc-300">
          Loading resumes...
        </p>

        <p className="mt-1 text-xs text-zinc-600">
          Fetching your resume library
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   EMPTY
============================================================ */

function EmptyState({
  search,
  onUpload,
}: {
  search: string;
  onUpload: () => void;
}) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10">
        <FileText className="h-8 w-8 text-violet-400" />
      </div>

      <h2 className="mt-5 text-lg font-semibold text-white">
        {search
          ? "No resumes found"
          : "No resumes yet"}
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
        {search
          ? "Try a different candidate name, email or file name."
          : "Upload your first resume and let AI analyze the candidate's skills, experience and qualifications."}
      </p>

      {!search && (
        <button
          onClick={onUpload}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
        >
          <Upload className="h-4 w-4" />
          Upload Resume
        </button>
      )}

    </div>
  );
}

/* ============================================================
   STATUS
============================================================ */

function getStatusInfo(status: string) {
  switch (status) {
    case "completed":
    case "analyzed":
    case "success":
      return {
        label: "Analyzed",
        className:
          "bg-emerald-500/10 text-emerald-400",
        icon: (
          <CheckCircle2 className="h-3.5 w-3.5" />
        ),
      };

    case "processing":
    case "pending":
      return {
        label: "Processing",
        className:
          "bg-amber-500/10 text-amber-400",
        icon: (
          <Clock3 className="h-3.5 w-3.5" />
        ),
      };

    case "failed":
    case "error":
      return {
        label: "Failed",
        className:
          "bg-red-500/10 text-red-400",
        icon: (
          <XCircle className="h-3.5 w-3.5" />
        ),
      };

    default:
      return {
        label: status || "Unknown",
        className:
          "bg-zinc-500/10 text-zinc-400",
        icon: (
          <Clock3 className="h-3.5 w-3.5" />
        ),
      };
  }
}

/* ============================================================
   HELPERS
============================================================ */

function calculateAverageScore(
  resumes: Resume[]
) {
  const scores = resumes
    .map((resume) =>
      Number(resume.aiScore)
    )
    .filter((score) =>
      Number.isFinite(score) &&
      score > 0
    );

  if (!scores.length) {
    return 0;
  }

  return Math.round(
    scores.reduce(
      (sum, score) =>
        sum + score,
      0
    ) / scores.length
  );
}

function formatDate(
  value?: string
) {
  if (!value) {
    return "—";
  }

  try {
    return new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    ).format(new Date(value));
  } catch {
    return "—";
  }
}