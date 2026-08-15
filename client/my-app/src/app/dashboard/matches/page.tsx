"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";

import { getJobMatches } from "@/services/match.api";
import type { JobMatch } from "@/types/match";

/* ============================================================
   TYPES
============================================================ */

interface Job {
  id: string;
  title?: string;
  description?: string;
  requiredSkills?: string[];
}

interface JobsResponse {
  success: boolean;
  message?: string;
  data?: Job[] | null;
}

/* ============================================================
   API CONFIG
============================================================ */

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api"
).replace(/\/+$/, "");

/* ============================================================
   AUTH TOKEN
============================================================ */

const TOKEN_KEY = "resumeai_access_token";

/* ============================================================
   MATCHES PAGE
============================================================ */

export default function MatchesPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [matches, setMatches] = useState<JobMatch[]>([]);

  const [selectedJobId, setSelectedJobId] = useState("");
  const [search, setSearch] = useState("");

  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);

  const [error, setError] = useState("");

  /* ==========================================================
     GET TOKEN
  ========================================================== */

  const getToken = (): string | null => {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const token = localStorage.getItem(TOKEN_KEY);

      console.log(
        "[AUTH] Token exists:",
        Boolean(token)
      );

      if (token) {
        console.log(
          "[AUTH] Token preview:",
          `${token.substring(0, 20)}...`
        );
      }

      return token?.trim() || null;
    } catch (error) {
      console.error(
        "[AUTH] Unable to read token:",
        error
      );

      return null;
    }
  };

  /* ==========================================================
     LOAD JOBS
  ========================================================== */

  const loadJobs = async () => {
    try {
      setLoadingJobs(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please log in again."
        );
      }

      const jobsUrl = `${API_URL}/jobs`;

      console.log("=================================");
      console.log("[JOBS] API URL:", jobsUrl);
      console.log("[JOBS] Token exists:", Boolean(token));
      console.log("[JOBS] Token key:", TOKEN_KEY);
      console.log("=================================");

      const response = await fetch(jobsUrl, {
        method: "GET",

        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },

        credentials: "include",

        cache: "no-store",
      });

      console.log(
        "[JOBS] Response status:",
        response.status
      );

      const text = await response.text();

      console.log(
        "[JOBS] Raw response:",
        text
      );

      let data: JobsResponse;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          `Invalid response from server. Status: ${response.status}`
        );
      }

      /* ======================================================
         UNAUTHORIZED
      ====================================================== */

      if (response.status === 401) {
        console.error(
          "[AUTH] Backend rejected authentication:",
          data
        );

        localStorage.removeItem(TOKEN_KEY);

        throw new Error(
          "Your session has expired. Please log in again."
        );
      }

      /* ======================================================
         OTHER ERRORS
      ====================================================== */

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to load jobs. Server returned ${response.status}.`
        );
      }

      /* ======================================================
         NORMALIZE JOB DATA
      ====================================================== */

      const jobList = Array.isArray(data?.data)
        ? data.data
        : [];

      console.log(
        "[JOBS] Jobs received:",
        jobList
      );

      setJobs(jobList);

      /* ======================================================
         SELECT FIRST JOB
      ====================================================== */

      if (jobList.length > 0) {
        setSelectedJobId((currentId) => {
          const currentJobExists = jobList.some(
            (job) => job.id === currentId
          );

          if (currentJobExists) {
            return currentId;
          }

          return jobList[0].id;
        });
      } else {
        setSelectedJobId("");
        setMatches([]);
      }
    } catch (err) {
      console.error(
        "[JOBS] Load jobs error:",
        err
      );

      setJobs([]);
      setMatches([]);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load jobs."
      );
    } finally {
      setLoadingJobs(false);
    }
  };

  /* ==========================================================
     LOAD MATCHES
  ========================================================== */

  const loadMatches = async (jobId: string) => {
    if (!jobId) {
      setMatches([]);
      return;
    }

    try {
      setLoadingMatches(true);
      setError("");

      console.log(
        "[MATCHES] Loading matches for job:",
        jobId
      );

      const data = await getJobMatches(jobId);

      const matchList = Array.isArray(data)
        ? data
        : [];

      console.log(
        "[MATCHES] Matches received:",
        matchList
      );

      setMatches(matchList);
    } catch (err) {
      console.error(
        "[MATCHES] Load matches error:",
        err
      );

      setMatches([]);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load job matches."
      );
    } finally {
      setLoadingMatches(false);
    }
  };

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    loadJobs();
  }, []);

  /* ==========================================================
     LOAD MATCHES WHEN JOB CHANGES
  ========================================================== */

  useEffect(() => {
    if (!selectedJobId) {
      setMatches([]);
      return;
    }

    loadMatches(selectedJobId);
  }, [selectedJobId]);

  /* ==========================================================
     SELECTED JOB
  ========================================================== */

  const selectedJob = useMemo(() => {
    return jobs.find(
      (job) => job.id === selectedJobId
    );
  }, [jobs, selectedJobId]);

  /* ==========================================================
     FILTER MATCHES
  ========================================================== */

  const filteredMatches = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return matches;
    }

    return matches.filter((match) => {
      const name =
        match.resume?.name || "";

      const email =
        match.resume?.email || "";

      const matchedSkills =
        match.matchedSkills || [];

      const missingSkills =
        match.missingSkills || [];

      const skills = [
        ...matchedSkills,
        ...missingSkills,
      ].join(" ");

      return (
        name
          .toLowerCase()
          .includes(query) ||
        email
          .toLowerCase()
          .includes(query) ||
        skills
          .toLowerCase()
          .includes(query)
      );
    });
  }, [matches, search]);

  /* ==========================================================
     STATISTICS
  ========================================================== */

  const totalMatches = matches.length;

  const strongMatches = matches.filter(
    (match) =>
      Number(match.matchScore) >= 80
  ).length;

  const averageScore =
    matches.length > 0
      ? Math.round(
          matches.reduce(
            (sum, match) =>
              sum +
              Number(
                match.matchScore || 0
              ),
            0
          ) / matches.length
        )
      : 0;

  const missingSkillsCount =
    matches.reduce(
      (total, match) =>
        total +
        (match.missingSkills?.length || 0),
      0
    );

  /* ==========================================================
     SCORE STYLE
  ========================================================== */

  const getScoreClass = (score: number) => {
    if (score >= 80) {
      return {
        text: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
      };
    }

    if (score >= 60) {
      return {
        text: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
      };
    }

    return {
      text: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
    };
  };

  /* ==========================================================
     SCORE LABEL
  ========================================================== */

  const getScoreLabel = (score: number) => {
    if (score >= 80) {
      return "Excellent";
    }

    if (score >= 60) {
      return "Good";
    }

    if (score >= 40) {
      return "Fair";
    }

    return "Low";
  };

  /* ==========================================================
     REFRESH
  ========================================================== */

  const handleRefresh = async () => {
    setError("");

    await loadJobs();
  };

  /* ==========================================================
     LOGIN REDIRECT
  ========================================================== */

  const handleLoginRedirect = () => {
    window.location.href = "/login";
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <main className="min-h-screen bg-[#07070a] text-white">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <section className="mb-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>
              <div className="mb-3 flex items-center gap-2 text-sm text-violet-400">
                <Sparkles size={16} />

                <span>
                  AI Recruitment
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Job Match Dashboard
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-zinc-400 md:text-base">
                Find the strongest candidates
                for your job using
                AI-powered resume matching.
              </p>
            </div>

            <div className="flex items-center gap-3">

              {/* REFRESH */}

              <button
                type="button"
                onClick={handleRefresh}
                disabled={
                  loadingJobs ||
                  loadingMatches
                }
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={
                    loadingJobs ||
                    loadingMatches
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh
              </button>

              {/* MANAGE JOBS */}

              <Link
                href="/dashboard/jobs"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
              >
                <Briefcase size={16} />

                Manage Jobs
              </Link>
            </div>
          </div>
        </section>

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-300">

            <div className="flex items-start gap-3">
              <XCircle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <div>
                <p className="font-medium">
                  Something went wrong
                </p>

                <p className="mt-1 text-red-300/80">
                  {error}
                </p>
              </div>
            </div>

            {error
              .toLowerCase()
              .includes("log in") && (
              <button
                type="button"
                onClick={
                  handleLoginRedirect
                }
                className="shrink-0 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500/20"
              >
                Login
              </button>
            )}
          </div>
        )}

        {/* ====================================================
            JOB SELECTOR
        ==================================================== */}

        <section className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/20">

          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-300">
            <Briefcase
              size={16}
              className="text-violet-400"
            />

            Select Job
          </div>

          {/* LOADING */}

          {loadingJobs ? (
            <div className="flex h-12 items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-zinc-400">

              <Loader2
                size={16}
                className="animate-spin"
              />

              Loading jobs...
            </div>
          ) : jobs.length === 0 ? (

            /* NO JOBS */

            <div className="rounded-xl border border-dashed border-white/10 bg-black/20 p-6 text-center">

              <Briefcase
                size={28}
                className="mx-auto mb-3 text-zinc-600"
              />

              <p className="text-sm font-medium text-zinc-300">
                No jobs found
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                Create a job before
                generating candidate
                matches.
              </p>

              <Link
                href="/dashboard/jobs"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-500"
              >
                Create Job

                <ArrowRight size={15} />
              </Link>
            </div>
          ) : (

            /* JOB SELECT */

            <div className="relative">
              <select
                value={selectedJobId}
                onChange={(event) =>
                  setSelectedJobId(
                    event.target.value
                  )
                }
                className="w-full appearance-none rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 pr-10 text-sm text-white outline-none transition focus:border-violet-500/50"
              >
                {jobs.map((job) => (
                  <option
                    key={job.id}
                    value={job.id}
                    className="bg-[#0d0d12]"
                  >
                    {job.title ||
                      "Untitled Job"}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500"
              />
            </div>
          )}

          {/* SELECTED JOB */}

          {selectedJob && (
            <div className="mt-4 rounded-xl border border-white/5 bg-black/20 p-4">

              <h2 className="font-semibold text-zinc-100">
                {selectedJob.title ||
                  "Untitled Job"}
              </h2>

              {selectedJob.description && (
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500">
                  {selectedJob.description}
                </p>
              )}

              {selectedJob.requiredSkills &&
                selectedJob.requiredSkills.length >
                  0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedJob.requiredSkills
                      .slice(0, 10)
                      .map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-xs text-violet-300"
                        >
                          {skill}
                        </span>
                      ))}
                  </div>
                )}
            </div>
          )}
        </section>

        {/* ====================================================
            STATS
        ==================================================== */}

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            icon={Users}
            label="Total Matches"
            value={totalMatches}
            description="Candidates matched"
          />

          <StatCard
            icon={Target}
            label="Average Score"
            value={`${averageScore}%`}
            description="Across all candidates"
          />

          <StatCard
            icon={TrendingUp}
            label="Strong Matches"
            value={strongMatches}
            description="80%+ match score"
          />

          <StatCard
            icon={XCircle}
            label="Skill Gaps"
            value={missingSkillsCount}
            description="Missing required skills"
          />

        </section>

        {/* ====================================================
            SEARCH
        ==================================================== */}

        <section className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="text-xl font-semibold">
              Candidate Matches
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Ranked by AI match score.
            </p>
          </div>

          <div className="relative w-full sm:w-80">

            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search candidates..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-500/50"
            />
          </div>
        </section>

        {/* ====================================================
            MATCHES
        ==================================================== */}

        {loadingMatches ? (

          /* LOADING */

          <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02]">

            <div className="text-center">

              <Loader2
                size={32}
                className="mx-auto animate-spin text-violet-400"
              />

              <p className="mt-4 text-sm text-zinc-400">
                Analyzing candidate
                matches...
              </p>

            </div>
          </div>
        ) : filteredMatches.length === 0 ? (

          /* EMPTY */

          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10">

              <FileText
                size={26}
                className="text-violet-400"
              />

            </div>

            <h3 className="mt-5 text-lg font-semibold">
              No matches found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
              {search
                ? "No candidates match your search."
                : "There are no resume matches for this job yet."}
            </p>

          </div>
        ) : (

          /* MATCH LIST */

          <section className="space-y-4">

            {filteredMatches.map(
              (match) => {

                const score =
                  Number(
                    match.matchScore || 0
                  );

                const scoreStyle =
                  getScoreClass(score);

                const candidateName =
                  match.resume?.name ||
                  "Unknown Candidate";

                const candidateEmail =
                  match.resume?.email ||
                  "No email available";

                return (
                  <article
                    key={match.id}
                    className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/15 hover:bg-white/[0.045]"
                  >

                    {/* TOP */}

                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                      {/* CANDIDATE */}

                      <div className="flex min-w-0 items-start gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 text-lg font-bold text-violet-300">
                          {candidateName
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">

                          <h3 className="truncate text-base font-semibold text-white">
                            {candidateName}
                          </h3>

                          <p className="mt-1 truncate text-sm text-zinc-500">
                            {candidateEmail}
                          </p>

                          {/* MATCHED SKILLS */}

                          <div className="mt-3 flex flex-wrap gap-2">

                            {match.matchedSkills
                              ?.slice(0, 5)
                              .map(
                                (skill) => (
                                  <span
                                    key={
                                      skill
                                    }
                                    className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300"
                                  >
                                    <CheckCircle2
                                      size={
                                        12
                                      }
                                    />

                                    {skill}
                                  </span>
                                )
                              )}

                          </div>
                        </div>
                      </div>

                      {/* SCORE */}

                      <div className="flex items-center gap-6">

                        <div className="text-right">

                          <p className="text-xs text-zinc-500">
                            Match Score
                          </p>

                          <div className="mt-1 flex items-center gap-2">

                            <span
                              className={`text-2xl font-bold ${scoreStyle.text}`}
                            >
                              {score}%
                            </span>

                            <span
                              className={`rounded-full border px-2 py-0.5 text-xs ${scoreStyle.bg} ${scoreStyle.border} ${scoreStyle.text}`}
                            >
                              {getScoreLabel(
                                score
                              )}
                            </span>

                          </div>
                        </div>

                        <Link
                          href={`/matches/${match.id}`}
                          className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.08]"
                        >
                          View Match

                          <ArrowRight
                            size={15}
                          />
                        </Link>

                      </div>
                    </div>

                    {/* DETAILS */}

                    <div className="mt-5 grid gap-4 border-t border-white/5 pt-5 md:grid-cols-3">

                      <MatchDetail
                        label="Matched Skills"
                        value={
                          match
                            .matchedSkills
                            ?.length || 0
                        }
                        icon={
                          CheckCircle2
                        }
                        positive
                      />

                      <MatchDetail
                        label="Missing Skills"
                        value={
                          match
                            .missingSkills
                            ?.length || 0
                        }
                        icon={XCircle}
                      />

                      <MatchDetail
                        label="Strengths"
                        value={
                          match.strengths
                            ?.length || 0
                        }
                        icon={
                          TrendingUp
                        }
                        positive
                      />

                    </div>
                  </article>
                );
              }
            )}

          </section>
        )}
      </div>
    </main>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  description: string;
}

function StatCard({
  icon: Icon,
  label,
  value,
  description,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">

      <div className="flex items-center justify-between">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">

          <Icon
            size={19}
            className="text-violet-400"
          />

        </div>
      </div>

      <p className="mt-4 text-sm text-zinc-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-white">
        {value}
      </p>

      <p className="mt-1 text-xs text-zinc-600">
        {description}
      </p>

    </div>
  );
}

/* ============================================================
   MATCH DETAIL
============================================================ */

interface MatchDetailProps {
  label: string;
  value: number;
  icon: React.ElementType;
  positive?: boolean;
}

function MatchDetail({
  label,
  value,
  icon: Icon,
  positive = false,
}: MatchDetailProps) {
  return (
    <div className="flex items-center gap-3">

      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg ${
          positive
            ? "bg-emerald-500/10"
            : "bg-red-500/10"
        }`}
      >
        <Icon
          size={16}
          className={
            positive
              ? "text-emerald-400"
              : "text-red-400"
          }
        />
      </div>

      <div>
        <p className="text-xs text-zinc-600">
          {label}
        </p>

        <p className="text-sm font-semibold text-zinc-200">
          {value}
        </p>
      </div>

    </div>
  );
}