"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  Search,
  Users,
  Trophy,
  Target,
  TrendingUp,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Briefcase,
  RefreshCw,
} from "lucide-react";

import {
  getJobMatches,
} from "@/lib/api/matches";

import type {
  JobMatch,
} from "@/types/match";

interface PageProps {
  params: {
    jobId: string;
  };
}

export default function JobMatchDashboard({
  params,
}: PageProps) {
  const {
    jobId,
  } = params;

  const [matches, setMatches] =
    useState<JobMatch[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [scoreFilter, setScoreFilter] =
    useState("all");

  /*
  |--------------------------------------------------------------------------
  | LOAD MATCHES
  |--------------------------------------------------------------------------
  */

  async function loadMatches() {
    try {
      setLoading(true);

      setError("");

      const data =
        await getJobMatches(
          jobId
        );

      setMatches(data);
    } catch (error) {
      console.error(
        "Failed to load matches:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load matches."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (jobId) {
      loadMatches();
    }
  }, [jobId]);

  /*
  |--------------------------------------------------------------------------
  | STATS
  |--------------------------------------------------------------------------
  */

  const stats = useMemo(() => {
    const total =
      matches.length;

    const strong =
      matches.filter(
        (match) =>
          match.matchScore >= 80
      ).length;

    const medium =
      matches.filter(
        (match) =>
          match.matchScore >= 60 &&
          match.matchScore < 80
      ).length;

    const weak =
      matches.filter(
        (match) =>
          match.matchScore < 60
      ).length;

    const average =
      total > 0
        ? Math.round(
            matches.reduce(
              (
                total,
                match
              ) =>
                total +
                match.matchScore,
              0
            ) / total
          )
        : 0;

    return {
      total,
      strong,
      medium,
      weak,
      average,
    };
  }, [matches]);

  /*
  |--------------------------------------------------------------------------
  | FILTER
  |--------------------------------------------------------------------------
  */

  const filteredMatches =
    useMemo(() => {
      return matches.filter(
        (match) => {
          const candidateName =
            match.resume
              ?.name ||
            match.resume
              ?.originalName ||
            match.resume
              ?.fileName ||
            "Unknown Candidate";

          const candidateEmail =
            match.resume
              ?.email ||
            "";

          const searchValue =
            search
              .toLowerCase()
              .trim();

          const matchesSearch =
            !searchValue ||
            candidateName
              .toLowerCase()
              .includes(
                searchValue
              ) ||
            candidateEmail
              .toLowerCase()
              .includes(
                searchValue
              ) ||
            match.matchedSkills.some(
              (skill) =>
                skill
                  .toLowerCase()
                  .includes(
                    searchValue
                  )
            );

          let matchesScore =
            true;

          if (
            scoreFilter ===
            "strong"
          ) {
            matchesScore =
              match.matchScore >=
              80;
          }

          if (
            scoreFilter ===
            "medium"
          ) {
            matchesScore =
              match.matchScore >=
                60 &&
              match.matchScore <
                80;
          }

          if (
            scoreFilter ===
            "weak"
          ) {
            matchesScore =
              match.matchScore <
              60;
          }

          return (
            matchesSearch &&
            matchesScore
          );
        }
      );
    }, [
      matches,
      search,
      scoreFilter,
    ]);

  /*
  |--------------------------------------------------------------------------
  | SCORE COLOR
  |--------------------------------------------------------------------------
  */

  function getScoreClass(
    score: number
  ) {
    if (score >= 80) {
      return "text-emerald-400";
    }

    if (score >= 60) {
      return "text-yellow-400";
    }

    return "text-red-400";
  }

  /*
  |--------------------------------------------------------------------------
  | SCORE BACKGROUND
  |--------------------------------------------------------------------------
  */

  function getScoreBackground(
    score: number
  ) {
    if (score >= 80) {
      return "bg-emerald-500/10 border-emerald-500/20";
    }

    if (score >= 60) {
      return "bg-yellow-500/10 border-yellow-500/20";
    }

    return "bg-red-500/10 border-red-500/20";
  }

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <main className="min-h-screen bg-[#07090d] text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div>
            <Link
              href="/dashboard"
              className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
            >
              <ArrowLeft
                size={16}
              />

              Back to Dashboard
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                <Briefcase
                  size={20}
                  className="text-indigo-400"
                />
              </div>

              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  Job Match Dashboard
                </h1>

                <p className="mt-1 text-sm text-zinc-500">
                  AI-powered candidate
                  matching and ranking
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={loadMatches}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
            <AlertCircle
              className="mt-0.5 text-red-400"
              size={20}
            />

            <div>
              <p className="font-medium text-red-300">
                Failed to load matches
              </p>

              <p className="mt-1 text-sm text-red-300/70">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* STATS */}

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            icon={
              <Users
                size={20}
              />
            }
            title="Candidates"
            value={
              stats.total
            }
            description="Total matched resumes"
          />

          <StatCard
            icon={
              <Target
                size={20}
              />
            }
            title="Average Match"
            value={`${stats.average}%`}
            description="Overall compatibility"
          />

          <StatCard
            icon={
              <Trophy
                size={20}
              />
            }
            title="Strong Matches"
            value={
              stats.strong
            }
            description="80%+ compatibility"
          />

          <StatCard
            icon={
              <TrendingUp
                size={20}
              />
            }
            title="Medium Matches"
            value={
              stats.medium
            }
            description="60–79% compatibility"
          />

        </section>

        {/* SCORE DISTRIBUTION */}

        {!loading &&
          matches.length > 0 && (
            <section className="mb-8 rounded-2xl border border-white/10 bg-white/[0.025] p-6">

              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">
                    Match Distribution
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    Candidate quality overview
                  </p>
                </div>

                <div className="text-sm text-zinc-500">
                  {stats.total} candidates
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">

                <Distribution
                  label="Strong"
                  value={
                    stats.strong
                  }
                  total={
                    stats.total
                  }
                  color="bg-emerald-500"
                  text="text-emerald-400"
                />

                <Distribution
                  label="Medium"
                  value={
                    stats.medium
                  }
                  total={
                    stats.total
                  }
                  color="bg-yellow-500"
                  text="text-yellow-400"
                />

                <Distribution
                  label="Weak"
                  value={
                    stats.weak
                  }
                  total={
                    stats.total
                  }
                  color="bg-red-500"
                  text="text-red-400"
                />

              </div>
            </section>
          )}

        {/* SEARCH */}

        <section className="mb-6 flex flex-col gap-3 md:flex-row">

          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search candidates or skills..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-indigo-500/50"
            />
          </div>

          <select
            value={scoreFilter}
            onChange={(event) =>
              setScoreFilter(
                event.target.value
              )
            }
            className="rounded-xl border border-white/10 bg-[#10131a] px-4 py-3 text-sm text-zinc-300 outline-none focus:border-indigo-500/50"
          >
            <option value="all">
              All Matches
            </option>

            <option value="strong">
              Strong Matches
            </option>

            <option value="medium">
              Medium Matches
            </option>

            <option value="weak">
              Weak Matches
            </option>
          </select>

        </section>

        {/* TABLE */}

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">

          <div className="border-b border-white/10 px-6 py-5">
            <div className="flex items-center justify-between">

              <div>
                <h2 className="font-semibold">
                  Candidate Ranking
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Ranked by AI match score
                </p>
              </div>

              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-400">
                {filteredMatches.length} results
              </span>

            </div>
          </div>

          {loading ? (
            <LoadingState />
          ) : filteredMatches.length ===
            0 ? (
            <EmptyState
              hasMatches={
                matches.length > 0
              }
            />
          ) : (
            <div className="divide-y divide-white/[0.07]">

              {filteredMatches.map(
                (
                  match,
                  index
                ) => (
                  <CandidateRow
                    key={
                      match.id
                    }
                    match={
                      match
                    }
                    rank={
                      index + 1
                    }
                    getScoreClass={
                      getScoreClass
                    }
                    getScoreBackground={
                      getScoreBackground
                    }
                  />
                )
              )}

            </div>
          )}
        </section>

      </div>
    </main>
  );
}

/*
|--------------------------------------------------------------------------
| STAT CARD
|--------------------------------------------------------------------------
*/

function StatCard({
  icon,
  title,
  value,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-white/15 hover:bg-white/[0.04]">

      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
        {icon}
      </div>

      <p className="text-sm text-zinc-500">
        {title}
      </p>

      <p className="mt-1 text-2xl font-semibold">
        {value}
      </p>

      <p className="mt-1 text-xs text-zinc-600">
        {description}
      </p>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| DISTRIBUTION
|--------------------------------------------------------------------------
*/

function Distribution({
  label,
  value,
  total,
  color,
  text,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
  text: string;
}) {
  const percentage =
    total > 0
      ? Math.round(
          (value / total) *
            100
        )
      : 0;

  return (
    <div className="rounded-xl border border-white/10 bg-black/10 p-4">

      <div className="mb-3 flex items-center justify-between">

        <span className="text-sm text-zinc-400">
          {label}
        </span>

        <span
          className={`text-sm font-semibold ${text}`}
        >
          {value}
        </span>

      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">

        <div
          className={`h-full rounded-full ${color}`}
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

      <p className="mt-2 text-xs text-zinc-600">
        {percentage}% of candidates
      </p>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| CANDIDATE ROW
|--------------------------------------------------------------------------
*/

function CandidateRow({
  match,
  rank,
  getScoreClass,
  getScoreBackground,
}: {
  match: JobMatch;
  rank: number;
  getScoreClass: (
    score: number
  ) => string;
  getScoreBackground: (
    score: number
  ) => string;
}) {
  const candidateName =
    match.resume?.name ||
    match.resume
      ?.originalName ||
    match.resume
      ?.fileName ||
    "Unknown Candidate";

  const email =
    match.resume?.email ||
    "No email available";

  const score =
    match.matchScore;

  return (
    <Link
      href={`/dashboard/matches/${match.id}`}
      className="group block px-6 py-5 transition hover:bg-white/[0.035]"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center">

        {/* RANK */}

        <div className="flex items-center gap-4 lg:w-12">

          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-sm font-semibold text-zinc-400">
            #{rank}
          </div>

        </div>

        {/* CANDIDATE */}

        <div className="min-w-0 flex-1">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/20 text-sm font-semibold text-indigo-300">
              {candidateName
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="min-w-0">

              <h3 className="truncate font-medium text-zinc-100">
                {candidateName}
              </h3>

              <p className="truncate text-sm text-zinc-500">
                {email}
              </p>

            </div>

          </div>

        </div>

        {/* MATCHED SKILLS */}

        <div className="lg:w-64">

          <p className="mb-2 text-xs uppercase tracking-wider text-zinc-600">
            Matched Skills
          </p>

          <div className="flex flex-wrap gap-1.5">

            {match.matchedSkills
              .slice(0, 4)
              .map(
                (
                  skill
                ) => (
                  <span
                    key={
                      skill
                    }
                    className="rounded-md border border-emerald-500/15 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300"
                  >
                    {skill}
                  </span>
                )
              )}

            {match.matchedSkills
              .length >
              4 && (
              <span className="px-1 py-1 text-xs text-zinc-600">
                +
                {match
                  .matchedSkills
                  .length -
                  4}
              </span>
            )}

          </div>

        </div>

        {/* SCORE */}

        <div className="flex items-center gap-4 lg:w-36">

          <div
            className={`flex h-14 w-14 items-center justify-center rounded-xl border ${getScoreBackground(
              score
            )}`}
          >
            <span
              className={`text-lg font-bold ${getScoreClass(
                score
              )}`}
            >
              {score}%
            </span>
          </div>

          <div className="hidden xl:block">

            <p className="text-xs text-zinc-600">
              Match
            </p>

            <p
              className={`text-sm font-medium ${getScoreClass(
                score
              )}`}
            >
              {score >= 80
                ? "Strong"
                : score >=
                  60
                ? "Moderate"
                : "Weak"}
            </p>

          </div>

        </div>

        {/* ARROW */}

        <ChevronRight
          size={20}
          className="text-zinc-700 transition group-hover:translate-x-1 group-hover:text-zinc-400"
        />

      </div>
    </Link>
  );
}

/*
|--------------------------------------------------------------------------
| LOADING
|--------------------------------------------------------------------------
*/

function LoadingState() {
  return (
    <div className="flex min-h-[350px] flex-col items-center justify-center">

      <Loader2
        size={30}
        className="animate-spin text-indigo-400"
      />

      <p className="mt-4 text-sm text-zinc-500">
        Loading candidate matches...
      </p>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| EMPTY
|--------------------------------------------------------------------------
*/

function EmptyState({
  hasMatches,
}: {
  hasMatches: boolean;
}) {
  return (
    <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">

      {hasMatches ? (
        <>
          <Search
            size={32}
            className="text-zinc-600"
          />

          <h3 className="mt-4 font-medium">
            No candidates found
          </h3>

          <p className="mt-2 max-w-sm text-sm text-zinc-600">
            Try changing your search
            or score filter.
          </p>
        </>
      ) : (
        <>
          <Users
            size={32}
            className="text-zinc-600"
          />

          <h3 className="mt-4 font-medium">
            No matches yet
          </h3>

          <p className="mt-2 max-w-sm text-sm text-zinc-600">
            Match resumes against this
            job to see AI-powered
            candidate rankings here.
          </p>
        </>
      )}

    </div>
  );
}