
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  XCircle,
} from "lucide-react";

import { motion } from "framer-motion";

import {
  getAnalyses,
  type AnalysisResult,
} from "@/lib/api";

/*
|--------------------------------------------------------------------------
| Analysis List Page
|--------------------------------------------------------------------------
*/

export default function AnalysisPage() {
  const [analyses, setAnalyses] = useState<
    AnalysisResult[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState<
      "all" | "strong" | "moderate" | "weak"
    >("all");

  /*
  |--------------------------------------------------------------------------
  | Fetch Analyses
  |--------------------------------------------------------------------------
  */

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      setError("");

      console.log(
        "[Analysis] Fetching analyses..."
      );

      const data =
        await getAnalyses();

      console.log(
        "[Analysis] Received:",
        data
      );

      setAnalyses(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "[Analysis] Fetch error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load analyses."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Filter Analyses
  |--------------------------------------------------------------------------
  */

  const filteredAnalyses =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      return [...analyses]
        .filter((analysis) => {
          if (!keyword) {
            return true;
          }

          const resumeName =
            analysis.resume
              ?.fileName || "";

          const candidateName =
            analysis.resume
              ?.candidateName || "";

          const jobTitle =
            analysis.job?.title || "";

          const company =
            analysis.job?.company || "";

          return (
            resumeName
              .toLowerCase()
              .includes(keyword) ||
            candidateName
              .toLowerCase()
              .includes(keyword) ||
            jobTitle
              .toLowerCase()
              .includes(keyword) ||
            company
              .toLowerCase()
              .includes(keyword)
          );
        })
        .filter((analysis) => {
          const score =
            Number(
              analysis.matchScore ?? 0
            );

          if (filter === "strong") {
            return score >= 80;
          }

          if (filter === "moderate") {
            return (
              score >= 60 &&
              score < 80
            );
          }

          if (filter === "weak") {
            return score < 60;
          }

          return true;
        })
        .sort(
          (a, b) =>
            new Date(
              b.createdAt
            ).getTime() -
            new Date(
              a.createdAt
            ).getTime()
        );
    }, [
      analyses,
      search,
      filter,
    ]);

  /*
  |--------------------------------------------------------------------------
  | Statistics
  |--------------------------------------------------------------------------
  */

  const statistics =
    useMemo(() => {
      const scores =
        analyses
          .map((item) =>
            Number(
              item.matchScore ?? 0
            )
          )
          .filter((score) =>
            Number.isFinite(score)
          );

      const average =
        scores.length
          ? Math.round(
              scores.reduce(
                (sum, score) =>
                  sum + score,
                0
              ) /
                scores.length
            )
          : 0;

      const strong =
        scores.filter(
          (score) => score >= 80
        ).length;

      const moderate =
        scores.filter(
          (score) =>
            score >= 60 &&
            score < 80
        ).length;

      const weak =
        scores.filter(
          (score) => score < 60
        ).length;

      return {
        total: analyses.length,
        average,
        strong,
        moderate,
        weak,
      };
    }, [analyses]);

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
              Loading analyses
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Fetching your AI resume analysis reports...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Page
  |--------------------------------------------------------------------------
  */

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <div className="mx-auto max-w-[1500px] px-4 py-8 lg:px-8">
        {/* ---------------------------------------------------------------- */}
        {/* Header */}
        {/* ---------------------------------------------------------------- */}

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs text-violet-400">
              <Sparkles className="h-4 w-4" />

              AI Resume Analyzer
            </div>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Analyses
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              Review your resume-to-job matches,
              ATS performance, matched skills,
              missing skills, and AI recommendations.
            </p>
          </div>

          <Link
            href="/analyze"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
          >
            <Sparkles className="h-4 w-4" />

            New Analysis
          </Link>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Statistics */}
        {/* ---------------------------------------------------------------- */}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Analyses"
            value={statistics.total}
            icon={
              <FileText className="h-4 w-4" />
            }
          />

          <StatCard
            title="Average Match"
            value={`${statistics.average}%`}
            icon={
              <Target className="h-4 w-4" />
            }
            highlight
          />

          <StatCard
            title="Strong Matches"
            value={statistics.strong}
            icon={
              <CheckCircle2 className="h-4 w-4" />
            }
          />

          <StatCard
            title="Needs Improvement"
            value={
              statistics.moderate +
              statistics.weak
            }
            icon={
              <TrendingUp className="h-4 w-4" />
            }
          />
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Error */}
        {/* ---------------------------------------------------------------- */}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/[0.05] p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />

              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-300">
                  Unable to load analyses
                </h3>

                <p className="mt-1 text-xs leading-5 text-red-300/60">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={fetchAnalyses}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-400/20 px-3 py-2 text-xs text-red-300 transition hover:bg-red-400/10"
                >
                  <RefreshCw className="h-3.5 w-3.5" />

                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Search + Filters */}
        {/* ---------------------------------------------------------------- */}

        <section className="mt-8 rounded-2xl border border-white/10 bg-[#101010] p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search analyses..."
                className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 transition focus:border-violet-400/30 focus:bg-white/[0.05]"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <FilterButton
                active={
                  filter === "all"
                }
                onClick={() =>
                  setFilter("all")
                }
              >
                All
              </FilterButton>

              <FilterButton
                active={
                  filter === "strong"
                }
                onClick={() =>
                  setFilter("strong")
                }
              >
                Strong
              </FilterButton>

              <FilterButton
                active={
                  filter === "moderate"
                }
                onClick={() =>
                  setFilter("moderate")
                }
              >
                Moderate
              </FilterButton>

              <FilterButton
                active={
                  filter === "weak"
                }
                onClick={() =>
                  setFilter("weak")
                }
              >
                Weak
              </FilterButton>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Results Header */}
        {/* ---------------------------------------------------------------- */}

        <div className="mt-8 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              Analysis Reports
            </h2>

            <p className="mt-1 text-xs text-zinc-600">
              {filteredAnalyses.length}{" "}
              {filteredAnalyses.length === 1
                ? "report"
                : "reports"}{" "}
              found
            </p>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Empty State */}
        {/* ---------------------------------------------------------------- */}

        {filteredAnalyses.length ===
          0 && (
          <EmptyState
            hasAnalyses={
              analyses.length > 0
            }
            onClear={() => {
              setSearch("");
              setFilter("all");
            }}
          />
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Analysis Cards */}
        {/* ---------------------------------------------------------------- */}

        {filteredAnalyses.length >
          0 && (
          <div className="mt-5 grid gap-4">
            {filteredAnalyses.map(
              (analysis, index) => (
                <AnalysisCard
                  key={analysis.id}
                  analysis={analysis}
                  index={index}
                />
              )
            )}
          </div>
        )}
      </div>
    </main>
  );
}

/*
|--------------------------------------------------------------------------
| Stat Card
|--------------------------------------------------------------------------
*/

function StatCard({
  title,
  value,
  icon,
  highlight = false,
}: {
  title: string;
  value: string | number;
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
      className={
        "rounded-2xl border p-5 " +
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
    </motion.div>
  );
}

/*
|--------------------------------------------------------------------------
| Filter Button
|--------------------------------------------------------------------------
*/

function FilterButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-lg px-3 py-2 text-xs font-medium transition " +
        (active
          ? "bg-white text-black"
          : "border border-white/10 bg-white/[0.02] text-zinc-500 hover:bg-white/[0.06] hover:text-white")
      }
    >
      {children}
    </button>
  );
}

/*
|--------------------------------------------------------------------------
| Analysis Card
|--------------------------------------------------------------------------
*/

function AnalysisCard({
  analysis,
  index,
}: {
  analysis: AnalysisResult;
  index: number;
}) {
  const score = Number(
    analysis.matchScore ?? 0
  );

  const atsScore = Number(
    analysis.resume?.aiScore ??
      score
  );

  const matched =
    analysis.matchedSkills?.length ??
    0;

  const missing =
    analysis.missingSkills?.length ??
    0;

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: index * 0.04,
        duration: 0.3,
      }}
      whileHover={{
        y: -2,
      }}
      className="group rounded-2xl border border-white/10 bg-[#101010] p-5 transition hover:border-white/15 hover:bg-[#121212]"
    >
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
        {/* -------------------------------------------------------------- */}
        {/* Resume */}
        {/* -------------------------------------------------------------- */}

        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/[0.06]">
            <FileText className="h-5 w-5 text-violet-400" />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-white">
              {analysis.resume?.fileName ||
                "Resume"}
            </h3>

            <p className="mt-1 truncate text-xs text-zinc-500">
              {analysis.resume
                ?.candidateName ||
                "Candidate name unavailable"}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-zinc-600">
              <span>
                {formatDate(
                  analysis.createdAt
                )}
              </span>

              <span className="text-zinc-800">
                •
              </span>

              <span className="truncate">
                {analysis.job?.title ||
                  "Job"}
              </span>

              {analysis.job?.company && (
                <>
                  <span className="text-zinc-800">
                    •
                  </span>

                  <span>
                    {analysis.job.company}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------- */}
        {/* Match */}
        {/* -------------------------------------------------------------- */}

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 xl:w-[430px]">
          <ScoreBox
            label="Match"
            value={score}
            suffix="%"
            highlight
          />

          <ScoreBox
            label="ATS"
            value={atsScore}
            suffix="%"
          />

          <ScoreBox
            label="Matched"
            value={matched}
          />

          <ScoreBox
            label="Missing"
            value={missing}
          />
        </div>

        {/* -------------------------------------------------------------- */}
        {/* Recommendation */}
        {/* -------------------------------------------------------------- */}

        <div className="flex items-center justify-between gap-4 xl:w-[210px]">
          <RecommendationBadge
            recommendation={
              analysis.hiringRecommendation
            }
          />

          <Link
            href={`/dashboard/analysis/${analysis.id}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-zinc-500 transition hover:bg-white/10 hover:text-white"
            title="View analysis"
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/*
|--------------------------------------------------------------------------
| Score Box
|--------------------------------------------------------------------------
*/

function ScoreBox({
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
        "rounded-xl border p-3 " +
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
          "mt-1 text-lg font-semibold " +
          (highlight
            ? "text-violet-300"
            : "text-white")
        }
      >
        {Math.round(value)}
        {suffix && (
          <span className="ml-0.5 text-xs text-zinc-600">
            {suffix}
          </span>
        )}
      </p>
    </div>
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
      "border-emerald-400/20 bg-emerald-400/5 text-emerald-400";
  } else if (
    normalized.includes("good") ||
    normalized.includes("potential") ||
    normalized.includes("moderate") ||
    normalized.includes("consider")
  ) {
    className =
      "border-yellow-400/20 bg-yellow-400/5 text-yellow-400";
  } else if (
    normalized.includes("weak") ||
    normalized.includes("reject") ||
    normalized.includes("not_recommended")
  ) {
    className =
      "border-red-400/20 bg-red-400/5 text-red-400";
  }

  return (
    <span
      className={`inline-flex max-w-[150px] rounded-full border px-3 py-1.5 text-[11px] font-medium capitalize ${className}`}
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
| Empty State
|--------------------------------------------------------------------------
*/

function EmptyState({
  hasAnalyses,
  onClear,
}: {
  hasAnalyses: boolean;
  onClear: () => void;
}) {
  if (hasAnalyses) {
    return (
      <div className="mt-5 rounded-2xl border border-white/10 bg-[#101010] px-6 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
          <Search className="h-6 w-6 text-zinc-500" />
        </div>

        <h3 className="mt-5 text-lg font-semibold">
          No matching analyses
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">
          Try changing your search or analysis
          filter.
        </p>

        <button
          type="button"
          onClick={onClear}
          className="mt-6 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-zinc-200"
        >
          Clear Filters
        </button>
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-2xl border border-white/10 bg-[#101010] px-6 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/[0.06]">
        <Sparkles className="h-7 w-7 text-violet-400" />
      </div>

      <h3 className="mt-6 text-xl font-semibold">
        No analyses yet
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">
        Upload a resume and compare it with a
        target job to generate your first
        AI-powered analysis.
      </p>

      <Link
        href="/analyze"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
      >
        <Sparkles className="h-4 w-4" />

        Start Analysis

        <ArrowRight className="h-4 w-4" />
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

