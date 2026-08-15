"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  User,
  Mail,
  Phone,
  Loader2,
  Target,
} from "lucide-react";

import {
  getMatchById,
} from "@/lib/api/matches";

import type {
  JobMatch,
} from "@/types/match";

interface PageProps {
  params: {
    matchId: string;
  };
}

export default function MatchDetailsPage({
  params,
}: PageProps) {
  const {
    matchId,
  } = params;

  const [match, setMatch] =
    useState<JobMatch | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function load() {
      try {
        const data =
          await getMatchById(
            matchId
          );

        setMatch(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load match."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [matchId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07090d] text-white">
        <div className="text-center">

          <Loader2
            size={32}
            className="mx-auto animate-spin text-indigo-400"
          />

          <p className="mt-4 text-sm text-zinc-500">
            Loading match...
          </p>

        </div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-[#07090d] px-6 py-10 text-white">

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
        >
          <ArrowLeft
            size={16}
          />

          Back
        </Link>

        <div className="mx-auto mt-20 max-w-md text-center">

          <AlertTriangle
            size={40}
            className="mx-auto text-red-400"
          />

          <h1 className="mt-5 text-xl font-semibold">
            Match not found
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            {error ||
              "This match could not be loaded."}
          </p>

        </div>
      </div>
    );
  }

  const candidateName =
    match.resume?.name ||
    match.resume
      ?.originalName ||
    "Unknown Candidate";

  const score =
    match.matchScore;

  return (
    <main className="min-h-screen bg-[#07090d] text-white">

      <div className="mx-auto max-w-6xl px-6 py-10">

        {/* HEADER */}

        <Link
          href={`/dashboard/matches/${match.jobId}`}
          className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
        >
          <ArrowLeft
            size={16}
          />

          Back to Candidates
        </Link>

        {/* CANDIDATE HEADER */}

        <section className="mb-6 rounded-2xl border border-white/10 bg-white/[0.025] p-6">

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-4">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/30 to-purple-500/20 text-xl font-bold text-indigo-300">
                {candidateName
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>

                <h1 className="text-2xl font-semibold">
                  {candidateName}
                </h1>

                <div className="mt-2 flex flex-wrap gap-4 text-sm text-zinc-500">

                  {match.resume
                    ?.email && (
                    <span className="flex items-center gap-2">
                      <Mail
                        size={14}
                      />

                      {
                        match
                          .resume
                          .email
                      }
                    </span>
                  )}

                  {match.resume
                    ?.phone && (
                    <span className="flex items-center gap-2">
                      <Phone
                        size={14}
                      />

                      {
                        match
                          .resume
                          .phone
                      }
                    </span>
                  )}

                </div>

              </div>

            </div>

            {/* SCORE */}

            <div className="flex items-center gap-4">

              <div className="text-right">

                <p className="text-xs uppercase tracking-wider text-zinc-600">
                  AI Match Score
                </p>

                <p
                  className={`text-4xl font-bold ${
                    score >= 80
                      ? "text-emerald-400"
                      : score >= 60
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  {score}%
                </p>

              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10">
                <Target
                  size={24}
                  className="text-indigo-400"
                />
              </div>

            </div>

          </div>

        </section>

        {/* SUMMARY */}

        {match.hiringRecommendation && (
          <section className="mb-6 rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.06] p-6">

            <div className="flex gap-4">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10">
                <User
                  size={20}
                  className="text-indigo-400"
                />
              </div>

              <div>

                <h2 className="font-semibold">
                  AI Hiring Recommendation
                </h2>

                <p className="mt-2 leading-7 text-zinc-400">
                  {
                    match.hiringRecommendation
                  }
                </p>

              </div>

            </div>

          </section>
        )}

        {/* GRID */}

        <div className="grid gap-6 lg:grid-cols-2">

          {/* MATCHED SKILLS */}

          <SkillCard
            title="Matched Skills"
            icon={
              <CheckCircle2
                size={20}
              />
            }
            skills={
              match.matchedSkills
            }
            type="matched"
          />

          {/* MISSING SKILLS */}

          <SkillCard
            title="Missing Skills"
            icon={
              <XCircle
                size={20}
              />
            }
            skills={
              match.missingSkills
            }
            type="missing"
          />

          {/* STRENGTHS */}

          <ListCard
            title="Candidate Strengths"
            icon={
              <CheckCircle2
                size={20}
              />
            }
            items={
              match.strengths
            }
            type="strength"
          />

          {/* WEAKNESSES */}

          <ListCard
            title="Candidate Weaknesses"
            icon={
              <AlertTriangle
                size={20}
              />
            }
            items={
              match.weaknesses
            }
            type="weakness"
          />

        </div>

        {/* RECOMMENDATIONS */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-6">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10">
              <Lightbulb
                size={20}
                className="text-yellow-400"
              />
            </div>

            <div>

              <h2 className="font-semibold">
                Recommendations
              </h2>

              <p className="text-sm text-zinc-600">
                AI-generated recommendations
              </p>

            </div>

          </div>

          <div className="mt-5 space-y-3">

            {match.recommendations
              .length === 0 ? (
              <p className="text-sm text-zinc-600">
                No recommendations available.
              </p>
            ) : (
              match.recommendations.map(
                (
                  recommendation,
                  index
                ) => (
                  <div
                    key={
                      index
                    }
                    className="flex gap-3 rounded-xl border border-white/[0.07] bg-black/10 p-4"
                  >
                    <span className="text-sm font-semibold text-indigo-400">
                      {index +
                        1}
                    </span>

                    <p className="text-sm leading-6 text-zinc-400">
                      {
                        recommendation
                      }
                    </p>
                  </div>
                )
              )
            )}

          </div>

        </section>

      </div>
    </main>
  );
}

/*
|--------------------------------------------------------------------------
| SKILL CARD
|--------------------------------------------------------------------------
*/

function SkillCard({
  title,
  icon,
  skills,
  type,
}: {
  title: string;
  icon: React.ReactNode;
  skills: string[];
  type: "matched" | "missing";
}) {
  const matched =
    type === "matched";

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">

      <div className="flex items-center gap-3">

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            matched
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-red-500/10 text-red-400"
          }`}
        >
          {icon}
        </div>

        <h2 className="font-semibold">
          {title}
        </h2>

      </div>

      <div className="mt-5 flex flex-wrap gap-2">

        {skills.length === 0 ? (
          <p className="text-sm text-zinc-600">
            None identified.
          </p>
        ) : (
          skills.map(
            (skill) => (
              <span
                key={skill}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  matched
                    ? "border-emerald-500/15 bg-emerald-500/10 text-emerald-300"
                    : "border-red-500/15 bg-red-500/10 text-red-300"
                }`}
              >
                {skill}
              </span>
            )
          )
        )}

      </div>

    </section>
  );
}

/*
|--------------------------------------------------------------------------
| LIST CARD
|--------------------------------------------------------------------------
*/

function ListCard({
  title,
  icon,
  items,
  type,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  type: "strength" | "weakness";
}) {
  const strength =
    type === "strength";

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">

      <div className="flex items-center gap-3">

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            strength
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-orange-500/10 text-orange-400"
          }`}
        >
          {icon}
        </div>

        <h2 className="font-semibold">
          {title}
        </h2>

      </div>

      <div className="mt-5 space-y-3">

        {items.length === 0 ? (
          <p className="text-sm text-zinc-600">
            None identified.
          </p>
        ) : (
          items.map(
            (
              item,
              index
            ) => (
              <div
                key={
                  index
                }
                className="flex gap-3 rounded-xl border border-white/[0.07] bg-black/10 p-4"
              >
                <span
                  className={`mt-0.5 ${
                    strength
                      ? "text-emerald-400"
                      : "text-orange-400"
                  }`}
                >
                  •
                </span>

                <p className="text-sm leading-6 text-zinc-400">
                  {item}
                </p>

              </div>
            )
          )
        )}

      </div>

    </section>
  );
}