"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock3,
  Edit3,
  Loader2,
  MapPin,
  Search,
  Sparkles,
  Trash2,
  XCircle,
} from "lucide-react";

interface Job {
  id: string;
  title?: string;
  company?: string;
  location?: string;
  employmentType?: string;
  description?: string;
  requirements?: string;
  salary?: string;
  requiredSkills?: string[];
  status?: "ACTIVE" | "CLOSED" | "DRAFT";
  createdAt?: string;
  updatedAt?: string;
}

interface JobResponse {
  success?: boolean;
  message?: string;
  data?: Job;
}

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api"
).replace(/\/+$/, "");

const TOKEN_KEY = "resumeai_access_token";

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const jobId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [job, setJob] = useState<Job | null>(null);

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getToken = () => {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage
      .getItem(TOKEN_KEY)
      ?.trim() || null;
  };

  const loadJob = async () => {
    if (!jobId) {
      setError("Job ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please log in again."
        );
      }

      const response = await fetch(
        `${API_URL}/jobs/${jobId}`,
        {
          method: "GET",

          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },

          credentials: "include",
          cache: "no-store",
        }
      );

      const text = await response.text();

      let data: JobResponse = {};

      try {
        data = text
          ? JSON.parse(text)
          : {};
      } catch {
        throw new Error(
          `Invalid response from server. Status: ${response.status}`
        );
      }

      if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);

        throw new Error(
          "Your session has expired. Please log in again."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to load job. Server returned ${response.status}.`
        );
      }

      if (!data?.data) {
        throw new Error("Job was not found.");
      }

      setJob(data.data);
    } catch (err) {
      console.error("[JOB DETAILS]", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load job."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJob();
  }, [jobId]);

  const handleDelete = async () => {
    if (!jobId || deleting) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this job? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please log in again."
        );
      }

      const response = await fetch(
        `${API_URL}/jobs/${jobId}`,
        {
          method: "DELETE",

          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },

          credentials: "include",
        }
      );

      const text = await response.text();

      let data: any = {};

      try {
        data = text
          ? JSON.parse(text)
          : {};
      } catch {
        data = {};
      }

      if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);

        throw new Error(
          "Your session has expired. Please log in again."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to delete job."
        );
      }

      router.push("/dashboard/jobs");
      router.refresh();
    } catch (err) {
      console.error("[DELETE JOB]", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete job."
      );
    } finally {
      setDeleting(false);
    }
  };

  const getStatusStyle = (
    status?: Job["status"]
  ) => {
    switch (status) {
      case "ACTIVE":
        return {
          label: "Active",
          className:
            "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
        };

      case "CLOSED":
        return {
          label: "Closed",
          className:
            "border-red-500/20 bg-red-500/10 text-red-300",
        };

      default:
        return {
          label: "Draft",
          className:
            "border-amber-500/20 bg-amber-500/10 text-amber-300",
        };
    }
  };

  const formatDate = (date?: string) => {
    if (!date) {
      return "Not available";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#07070a] text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <Loader2
              size={32}
              className="mx-auto animate-spin text-violet-400"
            />

            <p className="mt-4 text-sm text-zinc-500">
              Loading job...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!job) {
    return (
      <main className="min-h-screen bg-[#07070a] text-white">
        <div className="mx-auto max-w-4xl px-6 py-12">

          <Link
            href="/dashboard/jobs"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to Manage Jobs
          </Link>

          <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">
            <XCircle
              size={32}
              className="mx-auto text-red-400"
            />

            <h1 className="mt-4 text-xl font-semibold">
              Unable to load job
            </h1>

            <p className="mt-2 text-sm text-red-300/80">
              {error || "Job not found."}
            </p>

            <Link
              href="/dashboard/jobs"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black"
            >
              Back to Jobs
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const statusStyle = getStatusStyle(
    job.status
  );

  return (
    <main className="min-h-screen bg-[#07070a] text-white">
      <div className="mx-auto max-w-6xl px-6 py-10 lg:px-8">

        {/* HEADER */}

        <div className="mb-8">
          <Link
            href="/dashboard/jobs"
            className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to Manage Jobs
          </Link>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

            <div className="flex min-w-0 items-start gap-4">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10">
                <Briefcase
                  size={25}
                  className="text-violet-400"
                />
              </div>

              <div className="min-w-0">

                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1 text-sm text-violet-400">
                    <Sparkles size={14} />
                    AI Recruitment
                  </span>

                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyle.className}`}
                  >
                    {statusStyle.label}
                  </span>
                </div>

                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                  {job.title ||
                    "Untitled Job"}
                </h1>

                <p className="mt-2 flex items-center gap-2 text-sm text-zinc-400">
                  <Building2 size={15} />

                  {job.company ||
                    "Company not specified"}
                </p>
              </div>
            </div>

            {/* ACTIONS */}

            <div className="flex flex-wrap gap-3">

              <Link
                href={`/dashboard/jobs/${job.id}/edit`}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.08]"
              >
                <Edit3 size={16} />
                Edit Job
              </Link>

              <Link
                href={`/dashboard/jobs/${job.id}/matches`}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
              >
                <Search size={16} />
                Find Candidates
              </Link>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Trash2 size={16} />
                )}

                Delete
              </button>
            </div>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* JOB META */}

        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <InfoCard
            icon={MapPin}
            label="Location"
            value={
              job.location ||
              "Not specified"
            }
          />

          <InfoCard
            icon={Briefcase}
            label="Employment"
            value={
              job.employmentType ||
              "Not specified"
            }
          />

          <InfoCard
            icon={Clock3}
            label="Salary"
            value={
              job.salary ||
              "Not specified"
            }
          />

          <InfoCard
            icon={Clock3}
            label="Created"
            value={formatDate(
              job.createdAt
            )}
          />

        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

          {/* MAIN CONTENT */}

          <div className="space-y-6">

            {/* DESCRIPTION */}

            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

              <h2 className="text-lg font-semibold">
                Job Description
              </h2>

              <div className="mt-5 whitespace-pre-line text-sm leading-7 text-zinc-400">
                {job.description ||
                  "No job description provided."}
              </div>
            </section>

            {/* REQUIREMENTS */}

            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

              <h2 className="text-lg font-semibold">
                Candidate Requirements
              </h2>

              <div className="mt-5 whitespace-pre-line text-sm leading-7 text-zinc-400">
                {job.requirements ||
                  "No requirements provided."}
              </div>
            </section>

          </div>

          {/* SIDEBAR */}

          <aside className="space-y-6">

            {/* SKILLS */}

            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

              <h2 className="text-base font-semibold">
                Required Skills
              </h2>

              <p className="mt-1 text-xs text-zinc-600">
                Skills used for AI candidate matching.
              </p>

              {job.requiredSkills &&
              job.requiredSkills.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-2">

                  {job.requiredSkills.map(
                    (skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs text-violet-300"
                      >
                        <CheckCircle2
                          size={13}
                        />

                        {skill}
                      </span>
                    )
                  )}

                </div>
              ) : (
                <p className="mt-5 text-sm text-zinc-600">
                  No skills added.
                </p>
              )}
            </section>

            {/* MATCH CTA */}

            <section className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.06] p-6">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                <Sparkles
                  size={19}
                  className="text-violet-400"
                />
              </div>

              <h2 className="mt-4 font-semibold">
                Find the best candidates
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Use AI-powered resume matching to
                identify candidates who best fit this
                job.
              </p>

              <Link
                href={`/dashboard/jobs/${job.id}/matches`}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
              >
                Find Candidates
                <Search size={15} />
              </Link>
            </section>

            {/* JOB INFO */}

            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

              <h2 className="text-base font-semibold">
                Job Information
              </h2>

              <div className="mt-5 space-y-4 text-sm">

                <div className="flex items-center justify-between gap-4">
                  <span className="text-zinc-600">
                    Status
                  </span>

                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs ${statusStyle.className}`}
                  >
                    {statusStyle.label}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-zinc-600">
                    Created
                  </span>

                  <span className="text-zinc-300">
                    {formatDate(
                      job.createdAt
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-zinc-600">
                    Updated
                  </span>

                  <span className="text-zinc-300">
                    {formatDate(
                      job.updatedAt
                    )}
                  </span>
                </div>

              </div>
            </section>

          </aside>
        </div>
      </div>
    </main>
  );
}

interface InfoCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: InfoCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
        <Icon
          size={18}
          className="text-violet-400"
        />
      </div>

      <p className="mt-4 text-xs text-zinc-600">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-semibold text-zinc-200">
        {value}
      </p>
    </div>
  );
}