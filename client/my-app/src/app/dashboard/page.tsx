
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Briefcase,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
  Users,
} from "lucide-react";

import { motion } from "framer-motion";

import {
  loadDashboard,
  type DashboardData,
  type RecentAnalysis,
} from "@/lib/api";

/*
|--------------------------------------------------------------------------
| Dashboard Page
|--------------------------------------------------------------------------
*/

export default function DashboardPage() {
  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Fetch Dashboard
  |--------------------------------------------------------------------------
  */

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      console.log(
        "[Dashboard] Loading dashboard..."
      );

      const data =
        await loadDashboard();

      console.log(
        "[Dashboard] Dashboard data:",
        data
      );

      setDashboard(data);
    } catch (err) {
      console.error(
        "[Dashboard] Error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Initial Load
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchDashboard();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#080808] text-white">
        <div className="mx-auto flex min-h-screen max-w-[1500px] items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
              <Sparkles className="h-6 w-6 animate-pulse text-violet-400" />
            </div>

            <h2 className="mt-5 text-lg font-semibold">
              Loading dashboard
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Preparing your resume analytics...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (error || !dashboard) {
    return (
      <main className="min-h-screen bg-[#080808] text-white">
        <div className="mx-auto flex min-h-screen max-w-[1500px] items-center justify-center px-6">
          <div className="max-w-md text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/10 bg-red-400/[0.05]">
              <AlertCircle className="h-6 w-6 text-red-400" />
            </div>

            <h1 className="mt-5 text-xl font-semibold">
              Unable to load dashboard
            </h1>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              {error ||
                "Dashboard data is unavailable."}
            </p>

            <button
              type="button"
              onClick={fetchDashboard}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              <RefreshCw className="h-4 w-4" />

              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  const stats =
    dashboard.stats;

  const recentAnalyses =
    dashboard.recentAnalyses || [];

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <div className="mx-auto max-w-[1500px] px-4 py-8 lg:px-8">
        {/* ---------------------------------------------------------------- */}
        {/* Header */}
        {/* ---------------------------------------------------------------- */}

        <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs text-violet-400">
              <Sparkles className="h-4 w-4" />

              AI Resume Analyzer
            </div>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Dashboard
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              Track your resumes, job matches,
              ATS performance, and AI-powered
              hiring insights.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/dashboard/resumes"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.07] hover:text-white"
            >
              <FileText className="h-4 w-4" />

              View Resumes
            </Link>

            <Link
              href="/analyze"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              <Sparkles className="h-4 w-4" />

              Analyze Resume
            </Link>
          </div>
        </header>

        {/* ---------------------------------------------------------------- */}
        {/* Stats */}
        {/* ---------------------------------------------------------------- */}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <DashboardStat
            title="Total Resumes"
            value={stats.totalResumes}
            description="Uploaded resumes"
            icon={
              <FileText className="h-4 w-4" />
            }
          />

          <DashboardStat
            title="Total Analyses"
            value={stats.totalAnalyses}
            description="AI reports generated"
            icon={
              <BarChart3 className="h-4 w-4" />
            }
          />

          <DashboardStat
            title="Total Jobs"
            value={stats.totalJobs}
            description="Target positions"
            icon={
              <Briefcase className="h-4 w-4" />
            }
          />

          <DashboardStat
            title="Average Match"
            value={`${Math.round(
              Number(
                stats.averageMatchScore ||
                  0
              )
            )}%`}
            description="Overall compatibility"
            icon={
              <Target className="h-4 w-4" />
            }
            highlight
          />

          <DashboardStat
            title="Strong Matches"
            value={stats.strongMatches}
            description="Score 75 or higher"
            icon={
              <CheckCircle2 className="h-4 w-4" />
            }
          />
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Main Grid */}
        {/* ---------------------------------------------------------------- */}

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          {/* -------------------------------------------------------------- */}
          {/* Latest Analysis */}
          {/* -------------------------------------------------------------- */}

          <LatestAnalysisCard
            analysis={
              dashboard.latestAnalysis
            }
          />

          {/* -------------------------------------------------------------- */}
          {/* Quick Actions */}
          {/* -------------------------------------------------------------- */}

          <QuickActions />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Analytics Overview */}
        {/* ---------------------------------------------------------------- */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-[#101010] p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Performance Overview
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                Current resume analysis performance.
              </p>
            </div>

            <Link
              href="/dashboard/analysis"
              className="inline-flex items-center gap-2 text-xs text-zinc-500 transition hover:text-white"
            >
              View all analyses

              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <PerformanceCard
              title="Average Match"
              value={Math.round(
                Number(
                  stats.averageMatchScore ||
                    0
                )
              )}
              suffix="%"
              description="Average compatibility across analyzed resumes."
              icon={
                <Target className="h-5 w-5" />
              }
            />

            <PerformanceCard
              title="Strong Matches"
              value={
                stats.strongMatches
              }
              suffix=""
              description="Analyses with a match score of 75+."
              icon={
                <TrendingUp className="h-5 w-5" />
              }
            />

            <PerformanceCard
              title="Analysis Coverage"
              value={
                stats.totalResumes > 0
                  ? Math.round(
                      (stats.totalAnalyses /
                        stats.totalResumes) *
                        100
                    )
                  : 0
              }
              suffix="%"
              description="Resume analysis coverage."
              icon={
                <BarChart3 className="h-5 w-5" />
              }
            />
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Recent Analyses */}
        {/* ---------------------------------------------------------------- */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-[#101010] p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Recent Analyses
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                Your latest AI resume-to-job comparisons.
              </p>
            </div>

            <Link
              href="/dashboard/analysis"
              className="inline-flex items-center gap-2 text-xs text-zinc-500 transition hover:text-white"
            >
              View all

              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentAnalyses.length ===
          0 ? (
            <EmptyAnalyses />
          ) : (
            <div className="mt-6 overflow-hidden rounded-xl border border-white/10">
              <div className="hidden grid-cols-[1.5fr_1fr_120px_140px_40px] gap-4 border-b border-white/10 bg-white/[0.02] px-4 py-3 text-[10px] uppercase tracking-[0.12em] text-zinc-600 md:grid">
                <span>Resume</span>
                <span>Job</span>
                <span>Match</span>
                <span>Recommendation</span>
                <span />
              </div>

              <div className="divide-y divide-white/10">
                {recentAnalyses
                  .slice(0, 10)
                  .map(
                    (
                      analysis,
                      index
                    ) => (
                      <RecentAnalysisRow
                        key={
                          analysis.id
                        }
                        analysis={
                          analysis
                        }
                        index={
                          index
                        }
                      />
                    )
                  )}
              </div>
            </div>
          )}
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Bottom CTA */}
        {/* ---------------------------------------------------------------- */}

        <section className="mt-6 overflow-hidden rounded-2xl border border-violet-400/15 bg-violet-400/[0.05] p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-xs text-violet-400">
                <Sparkles className="h-4 w-4" />

                AI-powered resume intelligence
              </div>

              <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                Improve your resume before your next application.
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Upload your latest resume, compare it
                against a target job, and get actionable
                recommendations to improve your chances.
              </p>
            </div>

            <Link
              href="/analyze"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              Start Analysis

              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

/*
|--------------------------------------------------------------------------
| Dashboard Stat
|--------------------------------------------------------------------------
*/

function DashboardStat({
  title,
  value,
  description,
  icon,
  highlight = false,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      whileHover={{
        y: -2,
      }}
      className={
        "rounded-2xl border p-5 transition " +
        (highlight
          ? "border-violet-400/20 bg-violet-400/[0.06]"
          : "border-white/10 bg-[#101010]")
      }
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500">
          {title}
        </span>

        <span
          className={
            highlight
              ? "text-violet-400"
              : "text-zinc-500"
          }
        >
          {icon}
        </span>
      </div>

      <p className="mt-4 text-3xl font-semibold">
        {value}
      </p>

      <p className="mt-1 text-[11px] text-zinc-600">
        {description}
      </p>
    </motion.div>
  );
}

/*
|--------------------------------------------------------------------------
| Latest Analysis
|--------------------------------------------------------------------------
*/

function LatestAnalysisCard({
  analysis,
}: {
  analysis: DashboardData["latestAnalysis"];
}) {
  if (!analysis) {
    return (
      <section className="rounded-2xl border border-white/10 bg-[#101010] p-6">
        <div>
          <h2 className="text-lg font-semibold">
            Latest Analysis
          </h2>

          <p className="mt-1 text-xs text-zinc-500">
            Your most recent resume analysis.
          </p>
        </div>

        <div className="mt-8 rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
          <Sparkles className="mx-auto h-7 w-7 text-zinc-600" />

          <h3 className="mt-4 text-sm font-medium">
            No analysis yet
          </h3>

          <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-zinc-600">
            Upload a resume and compare it with
            a target job to generate your first
            analysis.
          </p>

          <Link
            href="/analyze"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-black"
          >
            Analyze Resume

            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    );
  }

  const score = Number(
    analysis.matchScore || 0
  );

  const atsScore = Number(
    analysis.resume?.aiScore ??
      score
  );

  return (
    <section className="rounded-2xl border border-white/10 bg-[#101010] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">
            Latest Analysis
          </h2>

          <p className="mt-1 text-xs text-zinc-500">
            Your most recent resume analysis.
          </p>
        </div>

        <span className="rounded-full border border-violet-400/20 bg-violet-400/[0.06] px-3 py-1 text-[10px] text-violet-300">
          Latest
        </span>
      </div>

      <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/[0.06]">
          <FileText className="h-7 w-7 text-violet-400" />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold">
            {analysis.resume?.fileName ||
              "Resume"}
          </h3>

          <p className="mt-1 text-xs text-zinc-500">
            {analysis.resume
              ?.candidateName ||
              "Candidate"}
          </p>

          <p className="mt-2 text-xs text-zinc-600">
            {analysis.job?.title ||
              "Target Job"}

            {analysis.job?.company
              ? ` · ${analysis.job.company}`
              : ""}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <ScoreMetric
          label="Job Match"
          value={score}
          suffix="%"
          highlight
        />

        <ScoreMetric
          label="ATS Score"
          value={atsScore}
          suffix="%"
        />
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/dashboard/analysis/${analysis.id}`}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-black transition hover:bg-zinc-200"
        >
          View Full Analysis

          <ArrowRight className="h-3.5 w-3.5" />
        </Link>

        <Link
          href="/dashboard/analysis"
          className="inline-flex items-center justify-center rounded-xl border border-white/10 px-4 py-3 text-xs text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
        >
          All Analyses
        </Link>
      </div>
    </section>
  );
}

/*
|--------------------------------------------------------------------------
| Score Metric
|--------------------------------------------------------------------------
*/

function ScoreMetric({
  label,
  value,
  suffix = "",
  highlight = false,
}: {
  label: string;
  value: number;
  suffix?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        "rounded-xl border p-4 " +
        (highlight
          ? "border-violet-400/15 bg-violet-400/[0.04]"
          : "border-white/10 bg-white/[0.02]")
      }
    >
      <p className="text-[10px] text-zinc-600">
        {label}
      </p>

      <p
        className={
          "mt-2 text-2xl font-semibold " +
          (highlight
            ? "text-violet-300"
            : "text-white")
        }
      >
        {Math.round(value)}
        <span className="ml-1 text-xs text-zinc-600">
          {suffix}
        </span>
      </p>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Quick Actions
|--------------------------------------------------------------------------
*/

function QuickActions() {
  const actions = [
    {
      href: "/analyze",
      title: "Analyze Resume",
      description:
        "Compare a resume against a target job.",
      icon: Sparkles,
      primary: true,
    },
    {
      href: "/dashboard/resumes",
      title: "Manage Resumes",
      description:
        "View and manage your uploaded resumes.",
      icon: FileText,
    },
    {
      href: "/dashboard/jobs",
      title: "Manage Jobs",
      description:
        "Create and manage target positions.",
      icon: Briefcase,
    },
    {
      href: "/dashboard/analysis",
      title: "View Analyses",
      description:
        "Review your AI analysis reports.",
      icon: BarChart3,
    },
  ];

  return (
    <section className="rounded-2xl border border-white/10 bg-[#101010] p-6">
      <div>
        <h2 className="text-lg font-semibold">
          Quick Actions
        </h2>

        <p className="mt-1 text-xs text-zinc-500">
          Jump directly to the tools you use most.
        </p>
      </div>

      <div className="mt-5 grid gap-3">
        {actions.map(
          (action, index) => {
            const Icon =
              action.icon;

            return (
              <motion.div
                key={action.href}
                initial={{
                  opacity: 0,
                  x: 8,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay:
                    index * 0.04,
                }}
              >
                <Link
                  href={action.href}
                  className={
                    "group flex items-center gap-3 rounded-xl border p-3.5 transition " +
                    (action.primary
                      ? "border-violet-400/20 bg-violet-400/[0.05] hover:bg-violet-400/[0.09]"
                      : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]")
                  }
                >
                  <div
                    className={
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg " +
                      (action.primary
                        ? "bg-violet-400/10 text-violet-400"
                        : "bg-white/[0.04] text-zinc-500")
                    }
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium">
                      {action.title}
                    </p>

                    <p className="mt-0.5 truncate text-[11px] text-zinc-600">
                      {action.description}
                    </p>
                  </div>

                  <ArrowRight className="h-4 w-4 text-zinc-700 transition group-hover:translate-x-0.5 group-hover:text-zinc-400" />
                </Link>
              </motion.div>
            );
          }
        )}
      </div>
    </section>
  );
}

/*
|--------------------------------------------------------------------------
| Performance Card
|--------------------------------------------------------------------------
*/

function PerformanceCard({
  title,
  value,
  suffix,
  description,
  icon,
}: {
  title: string;
  value: number;
  suffix: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500">
          {title}
        </span>

        <span className="text-violet-400">
          {icon}
        </span>
      </div>

      <div className="mt-4">
        <span className="text-3xl font-semibold">
          {value}
        </span>

        {suffix && (
          <span className="ml-1 text-sm text-zinc-600">
            {suffix}
          </span>
        )}
      </div>

      <p className="mt-2 text-[11px] leading-5 text-zinc-600">
        {description}
      </p>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Recent Analysis Row
|--------------------------------------------------------------------------
*/

function RecentAnalysisRow({
  analysis,
  index,
}: {
  analysis: RecentAnalysis;
  index: number;
}) {
  const score = Number(
    analysis.matchScore || 0
  );

  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        delay: index * 0.03,
      }}
      className="group grid gap-4 px-4 py-4 transition hover:bg-white/[0.02] md:grid-cols-[1.5fr_1fr_120px_140px_40px] md:items-center"
    >
      {/* Resume */}

      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.03] text-zinc-500">
          <FileText className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <p className="truncate text-xs font-medium">
            {analysis.resume
              ?.fileName ||
              "Resume"}
          </p>

          <p className="mt-0.5 truncate text-[11px] text-zinc-600">
            {analysis.resume
              ?.candidateName ||
              "Candidate"}
          </p>
        </div>
      </div>

      {/* Job */}

      <div className="min-w-0">
        <p className="truncate text-xs text-zinc-400">
          {analysis.job?.title ||
            "Job"}
        </p>

        <p className="mt-0.5 truncate text-[11px] text-zinc-600">
          {analysis.job?.company ||
            "Company"}
        </p>
      </div>

      {/* Score */}

      <div>
        <ScoreBadge score={score} />
      </div>

      {/* Recommendation */}

      <div>
        <RecommendationBadge
          recommendation={
            analysis.hiringRecommendation
          }
        />
      </div>

      {/* View */}

      <Link
        href={`/dashboard/analysis/${analysis.id}`}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-700 transition hover:bg-white/10 hover:text-white"
        title="View analysis"
      >
        <ArrowRight className="h-4 w-4" />
      </Link>

      {/* Mobile Date */}

      <div className="flex items-center gap-1.5 text-[10px] text-zinc-700 md:hidden">
        <Clock3 className="h-3 w-3" />

        {formatDate(
          analysis.createdAt
        )}
      </div>
    </motion.div>
  );
}

/*
|--------------------------------------------------------------------------
| Score Badge
|--------------------------------------------------------------------------
*/

function ScoreBadge({
  score,
}: {
  score: number;
}) {
  let className =
    "border-red-400/20 bg-red-400/[0.05] text-red-400";

  if (score >= 80) {
    className =
      "border-emerald-400/20 bg-emerald-400/[0.05] text-emerald-400";
  } else if (score >= 60) {
    className =
      "border-yellow-400/20 bg-yellow-400/[0.05] text-yellow-400";
  }

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium ${className}`}
    >
      {Math.round(score)}%
    </span>
  );
}

/*
|--------------------------------------------------------------------------
| Recommendation Badge
|--------------------------------------------------------------------------
*/

function RecommendationBadge({
  recommendation,
}: {
  recommendation?: string;
}) {
  const value =
    recommendation ||
    "Not available";

  const normalized =
    value.toLowerCase();

  let className =
    "border-zinc-800 bg-zinc-900 text-zinc-400";

  if (
    normalized.includes("strong") ||
    normalized.includes("excellent") ||
    normalized === "hire" ||
    normalized.includes("recommended")
  ) {
    className =
      "border-emerald-400/20 bg-emerald-400/[0.05] text-emerald-400";
  } else if (
    normalized.includes("good") ||
    normalized.includes("potential") ||
    normalized.includes("moderate") ||
    normalized.includes("consider")
  ) {
    className =
      "border-yellow-400/20 bg-yellow-400/[0.05] text-yellow-400";
  } else if (
    normalized.includes("weak") ||
    normalized.includes("reject") ||
    normalized.includes("not_recommended")
  ) {
    className =
      "border-red-400/20 bg-red-400/[0.05] text-red-400";
  }

  return (
    <span
      className={`inline-flex max-w-[140px] rounded-full border px-2.5 py-1 text-[10px] font-medium capitalize ${className}`}
    >
      {value.replace(
        /_/g,
        " "
      )}
    </span>
  );
}

/*
|--------------------------------------------------------------------------
| Empty Analyses
|--------------------------------------------------------------------------
*/

function EmptyAnalyses() {
  return (
    <div className="mt-6 rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-14 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
        <BarChart3 className="h-5 w-5 text-zinc-600" />
      </div>

      <h3 className="mt-4 text-sm font-medium">
        No analyses yet
      </h3>

      <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-zinc-600">
        Your latest resume-to-job analysis reports
        will appear here.
      </p>

      <Link
        href="/analyze"
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-zinc-200"
      >
        <Sparkles className="h-3.5 w-3.5" />

        Start Analysis
      </Link>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Date Formatter
|--------------------------------------------------------------------------
*/

function formatDate(
  value?: string
): string {
  if (!value) {
    return "Unknown date";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Unknown date";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

