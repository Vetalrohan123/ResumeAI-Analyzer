
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  Download,
  FileText,
  Lightbulb,
  Sparkles,
  Target,
  TrendingUp,
  XCircle,
} from "lucide-react";

import { motion } from "framer-motion";

import {
  getAnalysis,
  type AnalysisResult,
} from "@/lib/api";

import {
  exportAnalysisAsPDF,
} from "@/lib/export-analysis";

/*
|--------------------------------------------------------------------------
| Analysis Details Page
|--------------------------------------------------------------------------
*/

export default function AnalysisDetailsPage() {
  const params = useParams();

  const analysisId =
    typeof params?.id === "string"
      ? params.id
      : "";

  const [analysis, setAnalysis] =
    useState<AnalysisResult | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [exporting, setExporting] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | Fetch Analysis
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!analysisId) {
      setError("Analysis ID is missing.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        setError("");

        console.log(
          "[Analysis] Fetching analysis:",
          analysisId
        );

        const data =
          await getAnalysis(analysisId);

        if (cancelled) {
          return;
        }

        setAnalysis(data);
      } catch (err) {
        console.error(
          "[browser] Fetch Analysis Error:",
          err
        );

        if (cancelled) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load analysis."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchAnalysis();

    return () => {
      cancelled = true;
    };
  }, [analysisId]);

  /*
  |--------------------------------------------------------------------------
  | Export Analysis
  |--------------------------------------------------------------------------
  */

  const handleExport = () => {
    if (!analysis) {
      return;
    }

    try {
      setExporting(true);

      const exportData = {
        ...analysis,
        recommendations: (
          analysis.recommendations ?? []
        ).map((recommendation, index) => ({
          priority:
            ["High", "Medium", "Low"][
              index % 3
            ] ?? "Medium",
          title: `Recommendation ${index + 1}`,
          description: recommendation,
        })),
      };

      exportAnalysisAsPDF(exportData);
    } catch (err) {
      console.error(
        "Failed to export analysis:",
        err
      );

      alert(
        "Failed to export analysis."
      );
    } finally {
      setExporting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Loading State
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#080808] text-white">
        <div className="mx-auto flex min-h-screen max-w-[1500px] items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
              <Sparkles className="h-5 w-5 animate-pulse text-violet-400" />
            </div>

            <p className="mt-4 text-sm text-zinc-500">
              Loading analysis...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error State
  |--------------------------------------------------------------------------
  */

  if (error || !analysis) {
    return (
      <main className="min-h-screen bg-[#080808] text-white">
        <div className="mx-auto flex min-h-screen max-w-[1500px] items-center justify-center px-6">
          <div className="max-w-md text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/10 bg-red-400/5">
              <CircleAlert className="h-6 w-6 text-red-400" />
            </div>

            <h1 className="mt-5 text-xl font-semibold">
              Unable to load analysis
            </h1>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              {error ||
                "The requested analysis could not be found."}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>

              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
                className="rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-zinc-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Scores
  |--------------------------------------------------------------------------
  */

  const matchScore = Number(
    analysis.matchScore ?? 0
  );

  /*
   * Your backend AnalysisResult currently stores
   * the overall resume score inside resume.aiScore.
   */
  const atsScore = Number(
    analysis.resume?.aiScore ?? matchScore
  );

  const matchedSkills =
    analysis.matchedSkills ?? [];

  const missingSkills =
    analysis.missingSkills ?? [];

  const strengths =
    analysis.strengths ?? [];

  const weaknesses =
    analysis.weaknesses ?? [];

  const recommendations =
    analysis.recommendations ?? [];

  /*
  |--------------------------------------------------------------------------
  | Page
  |--------------------------------------------------------------------------
  */

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      {/* ---------------------------------------------------------------- */}
      {/* Header */}
      {/* ---------------------------------------------------------------- */}

      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-4 lg:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <Link
              href="/dashboard"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-400 transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div className="hidden h-5 w-px bg-white/10 sm:block" />

            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-medium">
                {analysis.resume?.fileName ||
                  "Resume"}
              </p>

              <p className="truncate text-xs text-zinc-500">
                {analysis.job?.title ||
                  "Job"}

                {analysis.job?.company
                  ? ` · ${analysis.job.company}`
                  : ""}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" />

            {exporting
              ? "Exporting..."
              : "Export Report"}
          </button>
        </div>
      </header>

      {/* ---------------------------------------------------------------- */}
      {/* Main */}
      {/* ---------------------------------------------------------------- */}

      <div className="mx-auto max-w-[1500px] px-4 py-8 lg:px-8">
        {/* ---------------------------------------------------------------- */}
        {/* Heading */}
        {/* ---------------------------------------------------------------- */}

        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-xs text-zinc-500">
            <FileText className="h-4 w-4" />

            Analysis ID:

            <span className="text-zinc-400">
              {analysisId}
            </span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Resume Analysis
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            AI-powered analysis of your resume against the{" "}
            <span className="text-zinc-300">
              {analysis.job?.title ||
                "target position"}
            </span>

            {analysis.job?.company
              ? ` at ${analysis.job.company}.`
              : "."}
          </p>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Score Cards */}
        {/* ---------------------------------------------------------------- */}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ScoreCard
            title="ATS Score"
            value={atsScore}
            suffix="/100"
            icon={
              <Target className="h-4 w-4" />
            }
            primary
          />

          <ScoreCard
            title="Job Match"
            value={matchScore}
            suffix="/100"
            icon={
              <TrendingUp className="h-4 w-4" />
            }
          />

          <ScoreCard
            title="Matched Skills"
            value={matchedSkills.length}
            suffix=""
            icon={
              <CheckCircle2 className="h-4 w-4" />
            }
          />

          <ScoreCard
            title="Missing Skills"
            value={missingSkills.length}
            suffix=""
            icon={
              <XCircle className="h-4 w-4" />
            }
          />
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* ATS + Keywords */}
        {/* ---------------------------------------------------------------- */}

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          {/* ATS Compatibility */}

          <motion.section
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.4,
            }}
            className="rounded-2xl border border-white/10 bg-[#101010] p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  ATS Compatibility
                </h2>

                <p className="mt-1 text-xs text-zinc-500">
                  Overall resume performance
                </p>
              </div>

              <span
                className={`rounded-full border px-3 py-1 text-xs ${getScoreBadge(
                  atsScore
                )}`}
              >
                {getScoreLabel(
                  atsScore
                )}
              </span>
            </div>

            <div className="mt-8 flex flex-col items-center">
              <div
                className="relative flex h-52 w-52 items-center justify-center rounded-full"
                style={{
                  background:
                    `conic-gradient(#8b5cf6 ${Math.min(
                      100,
                      Math.max(0, atsScore)
                    ) * 3.6}deg, #27272a 0deg)`,
                }}
              >
                <div className="flex h-40 w-40 flex-col items-center justify-center rounded-full bg-[#101010]">
                  <span className="text-5xl font-semibold">
                    {Math.round(atsScore)}
                  </span>

                  <span className="text-xs text-zinc-500">
                    out of 100
                  </span>
                </div>
              </div>

              <p className="mt-6 max-w-md text-center text-sm leading-6 text-zinc-500">
                {getATSDescription(
                  atsScore
                )}
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MiniScore
                label="ATS"
                score={atsScore}
              />

              <MiniScore
                label="Match"
                score={matchScore}
              />

              <MiniScore
                label="Matched"
                score={
                  matchedSkills.length
                }
              />

              <MiniScore
                label="Missing"
                score={
                  missingSkills.length
                }
              />
            </div>
          </motion.section>

          {/* Keyword Analysis */}

          <KeywordCard
            analysis={analysis}
          />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Resume + Job Information */}
        {/* ---------------------------------------------------------------- */}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <InfoCard
            title="Resume"
            icon={
              <FileText className="h-4 w-4" />
            }
          >
            <InfoRow
              label="File"
              value={
                analysis.resume?.fileName ||
                "Not available"
              }
            />

            <InfoRow
              label="Candidate"
              value={
                analysis.resume?.candidateName ||
                "Not provided"
              }
            />

            <InfoRow
              label="Email"
              value={
                analysis.resume?.candidateEmail ||
                "Not provided"
              }
            />

            <InfoRow
              label="Phone"
              value={
                analysis.resume?.candidatePhone ||
                "Not provided"
              }
            />

            <InfoRow
              label="Status"
              value={
                analysis.resume?.status ||
                "Not available"
              }
            />
          </InfoCard>

          <InfoCard
            title="Target Job"
            icon={
              <Target className="h-4 w-4" />
            }
          >
            <InfoRow
              label="Position"
              value={
                analysis.job?.title ||
                "Not available"
              }
            />

            <InfoRow
              label="Company"
              value={
                analysis.job?.company ||
                "Not provided"
              }
            />

            <InfoRow
              label="Location"
              value={
                analysis.job?.location ||
                "Not provided"
              }
            />

            <InfoRow
              label="Employment"
              value={
                analysis.job?.employmentType ||
                "Not provided"
              }
            />

            <InfoRow
              label="Salary"
              value={
                analysis.job?.salary ||
                "Not provided"
              }
            />
          </InfoCard>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Skills */}
        {/* ---------------------------------------------------------------- */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-[#101010] p-6">
          <SectionHeading
            title="Skills Analysis"
            description="Skills identified by the AI analysis."
          />

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <SkillList
              title="Matched Skills"
              items={matchedSkills}
              type="matched"
            />

            <SkillList
              title="Missing Skills"
              items={missingSkills}
              type="missing"
            />
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Strengths */}
        {/* ---------------------------------------------------------------- */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-[#101010] p-6">
          <SectionHeading
            title="Strengths"
            description="What your resume does well for this target role."
          />

          <BulletList
            items={strengths}
            icon={
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            }
            emptyText="No strengths available yet."
          />
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Weaknesses */}
        {/* ---------------------------------------------------------------- */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-[#101010] p-6">
          <SectionHeading
            title="Weaknesses"
            description="Areas that may reduce your compatibility with this role."
          />

          <BulletList
            items={weaknesses}
            icon={
              <XCircle className="h-4 w-4 text-red-400" />
            }
            emptyText="No weaknesses available yet."
          />
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* AI Recommendations */}
        {/* ---------------------------------------------------------------- */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-[#101010] p-6">
          <SectionHeading
            title="AI Recommendations"
            description="Personalized improvements generated from your resume and target job."
          />

          <BulletList
            items={recommendations}
            icon={
              <Lightbulb className="h-4 w-4 text-amber-400" />
            }
            emptyText="No recommendations available yet."
          />
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Hiring Recommendation */}
        {/* ---------------------------------------------------------------- */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-[#101010] p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-violet-400">
                AI Decision
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Hiring Recommendation
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                Based on the overall resume compatibility,
                required skills, experience, and job requirements.
              </p>
            </div>

            <RecommendationBadge
              recommendation={
                analysis.hiringRecommendation
              }
            />
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Resume Summary */}
        {/* ---------------------------------------------------------------- */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-[#101010] p-6">
          <SectionHeading
            title="Resume Summary"
            description="Summary extracted from the uploaded resume."
          />

          <p className="mt-5 text-sm leading-7 text-zinc-400">
            {analysis.resume?.summary ||
              "No resume summary available."}
          </p>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Job Description */}
        {/* ---------------------------------------------------------------- */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-[#101010] p-6">
          <SectionHeading
            title="Target Job Description"
            description="Job description used by the AI for comparison."
          />

          <p className="mt-5 whitespace-pre-line text-sm leading-7 text-zinc-400">
            {analysis.job?.description ||
              "No job description available."}
          </p>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Job Requirements */}
        {/* ---------------------------------------------------------------- */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-[#101010] p-6">
          <SectionHeading
            title="Job Requirements"
            description="Requirements used during the analysis."
          />

          <p className="mt-5 whitespace-pre-line text-sm leading-7 text-zinc-400">
            {analysis.job?.requirements ||
              "No job requirements available."}
          </p>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Bottom Actions */}
        {/* ---------------------------------------------------------------- */}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" />

            {exporting
              ? "Exporting..."
              : "Download Analysis"}
          </button>

          <Link
            href="/analyze"
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
          >
            <Sparkles className="h-4 w-4" />

            Analyze Another Resume
          </Link>

          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />

            Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}

/*
|--------------------------------------------------------------------------
| Score Card
|--------------------------------------------------------------------------
*/

function ScoreCard({
  title,
  value,
  suffix,
  icon,
  primary = false,
}: {
  title: string;
  value: number;
  suffix: string;
  icon: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <motion.div
      whileHover={{
        y: -2,
      }}
      transition={{
        duration: 0.2,
      }}
      className={
        "rounded-2xl border p-5 " +
        (primary
          ? "border-violet-400/20 bg-violet-400/[0.06]"
          : "border-white/10 bg-[#101010]")
      }
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500">
          {title}
        </span>

        <span className="text-zinc-500">
          {icon}
        </span>
      </div>

      <div className="mt-5">
        <span className="text-3xl font-semibold">
          {Math.round(value)}
        </span>

        {suffix && (
          <span className="ml-1 text-sm text-zinc-600">
            {suffix}
          </span>
        )}
      </div>
    </motion.div>
  );
}

/*
|--------------------------------------------------------------------------
| Mini Score
|--------------------------------------------------------------------------
*/

function MiniScore({
  label,
  score,
}: {
  label: string;
  score: number;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <p className="text-[11px] text-zinc-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-semibold">
        {Math.round(score)}
      </p>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Keyword Card
|--------------------------------------------------------------------------
*/

function KeywordCard({
  analysis,
}: {
  analysis: AnalysisResult;
}) {
  const matched =
    analysis.matchedSkills ?? [];

  const missing =
    analysis.missingSkills ?? [];

  return (
    <section className="rounded-2xl border border-white/10 bg-[#101010] p-6">
      <SectionHeading
        title="Keyword Analysis"
        description="Keywords and skills found or missing from your resume."
      />

      <KeywordGroup
        title="Matched"
        icon={
          <CheckCircle2 className="h-4 w-4" />
        }
        items={matched}
        type="matched"
      />

      <KeywordGroup
        title="Missing"
        icon={
          <XCircle className="h-4 w-4" />
        }
        items={missing}
        type="missing"
      />
    </section>
  );
}

/*
|--------------------------------------------------------------------------
| Keyword Group
|--------------------------------------------------------------------------
*/

function KeywordGroup({
  title,
  icon,
  items,
  type,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  type: "matched" | "missing";
}) {
  const styles = {
    matched:
      "border-emerald-400/20 bg-emerald-400/5 text-emerald-300",

    missing:
      "border-red-400/20 bg-red-400/5 text-red-300",
  };

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center gap-2 text-xs text-zinc-400">
        {icon}

        {title}

        <span className="text-zinc-600">
          ({items.length})
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-zinc-600">
          No {title.toLowerCase()} skills available.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className={
                "rounded-lg border px-2.5 py-1.5 text-xs " +
                styles[type]
              }
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Skill List
|--------------------------------------------------------------------------
*/

function SkillList({
  title,
  items,
  type,
}: {
  title: string;
  items: string[];
  type: "matched" | "missing";
}) {
  const isMatched =
    type === "matched";

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        {isMatched ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        ) : (
          <XCircle className="h-4 w-4 text-red-400" />
        )}

        <h3 className="text-sm font-medium">
          {title}
        </h3>

        <span className="text-xs text-zinc-600">
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-xs text-zinc-600">
            No {title.toLowerCase()} available.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((skill, index) => (
            <span
              key={`${skill}-${index}`}
              className={
                isMatched
                  ? "rounded-lg border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 text-xs text-emerald-300"
                  : "rounded-lg border border-red-400/20 bg-red-400/5 px-3 py-2 text-xs text-red-300"
              }
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Section Heading
|--------------------------------------------------------------------------
*/

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold">
        {title}
      </h2>

      <p className="mt-1 text-xs text-zinc-500">
        {description}
      </p>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Bullet List
|--------------------------------------------------------------------------
*/

function BulletList({
  items,
  icon,
  emptyText,
}: {
  items: string[];
  icon: React.ReactNode;
  emptyText: string;
}) {
  if (!items.length) {
    return (
      <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-5">
        <p className="text-sm text-zinc-600">
          {emptyText}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5 grid gap-3">
      {items.map((item, index) => (
        <div
          key={`${item}-${index}`}
          className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4"
        >
          <div className="mt-0.5 shrink-0">
            {icon}
          </div>

          <p className="text-sm leading-6 text-zinc-400">
            {item}
          </p>
        </div>
      ))}
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Info Card
|--------------------------------------------------------------------------
*/

function InfoCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#101010] p-6">
      <div className="flex items-center gap-2">
        <span className="text-zinc-500">
          {icon}
        </span>

        <h2 className="text-lg font-semibold">
          {title}
        </h2>
      </div>

      <div className="mt-5 divide-y divide-white/10">
        {children}
      </div>
    </section>
  );
}

/*
|--------------------------------------------------------------------------
| Info Row
|--------------------------------------------------------------------------
*/

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-xs text-zinc-600">
        {label}
      </span>

      <span className="max-w-[70%] text-right text-sm text-zinc-300">
        {String(value)}
      </span>
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
    recommendation || "Not available";

  const normalized =
    value.toLowerCase();

  let className =
    "border-zinc-800 bg-zinc-900 text-zinc-400";

  if (
    normalized.includes("strong") ||
    normalized.includes("excellent") ||
    normalized.includes("hire")
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
      className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-medium ${className}`}
    >
      {value.replace(/_/g, " ")}
    </span>
  );
}

/*
|--------------------------------------------------------------------------
| Score Badge
|--------------------------------------------------------------------------
*/

function getScoreBadge(
  score: number
): string {
  if (score >= 80) {
    return "border-emerald-400/20 bg-emerald-400/10 text-emerald-400";
  }

  if (score >= 60) {
    return "border-yellow-400/20 bg-yellow-400/10 text-yellow-400";
  }

  return "border-red-400/20 bg-red-400/10 text-red-400";
}

/*
|--------------------------------------------------------------------------
| Score Label
|--------------------------------------------------------------------------
*/

function getScoreLabel(
  score: number
): string {
  if (score >= 90) {
    return "Excellent";
  }

  if (score >= 80) {
    return "Strong";
  }

  if (score >= 60) {
    return "Needs Improvement";
  }

  if (score >= 40) {
    return "Weak";
  }

  return "Poor";
}

/*
|--------------------------------------------------------------------------
| ATS Description
|--------------------------------------------------------------------------
*/

function getATSDescription(
  score: number
): string {
  if (score >= 90) {
    return "Your resume is highly compatible with ATS systems and has strong overall structure and content.";
  }

  if (score >= 80) {
    return "Your resume has strong ATS compatibility with a few areas that can still be improved.";
  }

  if (score >= 60) {
    return "Your resume has reasonable ATS compatibility, but improvements are recommended before applying.";
  }

  return "Your resume needs significant improvements to perform well in ATS screening.";
}

