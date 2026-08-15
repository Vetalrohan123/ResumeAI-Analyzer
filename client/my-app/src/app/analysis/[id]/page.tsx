"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  useParams,
} from "next/navigation";

import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  Download,
  FileText,
  Lightbulb,
  Loader2,
  Sparkles,
  Target,
  TrendingUp,
  XCircle,
} from "lucide-react";

import {
  motion,
} from "framer-motion";

import {
  getAnalysis,
  type AnalysisResult,
} from "@/lib/api";

import {
  exportAnalysisAsPDF,
} from "@/lib/export-analysis";


/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

interface Resume {
  id?: string;
  fileName?: string;
  candidateName?: string | null;
  summary?: string | null;
  extractedText?: string | null;
  skills?: unknown;
  experience?: unknown;
  education?: unknown;
  projects?: unknown;
  certifications?: unknown;
}

interface Job {
  id?: string;
  title?: string;
  company?: string;
  description?: string;
  requirements?: string;
  requiredSkills?: unknown;
}

interface AnalysisData {
  id: string;
  resumeId: string;
  jobId: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  hiringRecommendation: string;
  resume?: Resume;
  job?: Job;
  createdAt?: string;
  updatedAt?: string;
}


/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function AnalysisDetailsPage() {
  const params = useParams();

  const analysisId = String(
    params?.id ?? ""
  );

  const [analysis, setAnalysis] =
    useState<AnalysisData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);


  /*
  |--------------------------------------------------------------------------
  | Fetch Analysis
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!analysisId) {
      setError("Analysis ID is missing");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log(
          "[ANALYSIS PAGE] Analysis ID:",
          analysisId
        );

        const result =
          await getAnalysis(
            analysisId
          );

        if (cancelled) {
          return;
        }

        console.log(
          "[ANALYSIS PAGE] Analysis loaded:",
          result
        );

        setAnalysis(
          result as AnalysisData
        );

      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "[ANALYSIS PAGE] Fetch Analysis Error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load analysis"
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
  | Loading State
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#090909] text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-4">

            <Loader2
              className="h-8 w-8 animate-spin text-violet-500"
            />

            <p className="text-sm text-zinc-500">
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
      <main className="min-h-screen bg-[#090909] text-white">

        <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/20 bg-red-400/10">

            <CircleAlert
              className="h-6 w-6 text-red-400"
            />

          </div>

          <h1 className="mt-6 text-2xl font-semibold">
            Unable to load analysis
          </h1>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            {error ||
              "The requested analysis could not be found."}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">

            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >

              <ArrowLeft
                className="h-4 w-4"
              />

              Back to Dashboard

            </Link>

            <Link
              href="/analyze"
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
            >
              Try Again
            </Link>

          </div>

        </div>

      </main>
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Prepare Data
  |--------------------------------------------------------------------------
  */

  const resumeName =
    analysis.resume?.fileName ||
    "Resume";

  const jobTitle =
    analysis.job?.title ||
    "Target Position";

  const company =
    analysis.job?.company ||
    "Target Company";

  const atsScore =
    Number(
      analysis.matchScore ?? 0
    );

  const matchedKeywords =
    Array.isArray(
      analysis.matchedSkills
    )
      ? analysis.matchedSkills
      : [];

  const missingKeywords =
    Array.isArray(
      analysis.missingSkills
    )
      ? analysis.missingSkills
      : [];

  const strengths =
    Array.isArray(
      analysis.strengths
    )
      ? analysis.strengths
      : [];

  const weaknesses =
    Array.isArray(
      analysis.weaknesses
    )
      ? analysis.weaknesses
      : [];

  const recommendations =
    Array.isArray(
      analysis.recommendations
    )
      ? analysis.recommendations
      : [];


  /*
  |--------------------------------------------------------------------------
  | Derived Scores
  |--------------------------------------------------------------------------
  */

  const jobMatch =
    atsScore;

  const totalKeywords =
    matchedKeywords.length +
    missingKeywords.length;

  const keywordScore =
    totalKeywords > 0
      ? Math.round(
          (
            matchedKeywords.length /
            totalKeywords
          ) * 100
        )
      : 0;

  const skillsScore =
    keywordScore;

  const formattingScore =
    atsScore;

  const experienceScore =
    atsScore;


  /*
  |--------------------------------------------------------------------------
  | PDF Export Data
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  | No useMemo here.
  |
  | This prevents:
  | "Rendered more hooks than during the previous render"
  |
  |--------------------------------------------------------------------------
  */

  const exportData = {
    resumeName,

    jobTitle,

    atsScore,

    jobMatch,

    keywordScore,

    skillsScore,

    formattingScore,

    experienceScore,

    matchedKeywords,

    missingKeywords,

    recommendedKeywords:
      missingKeywords,

    skills:
      matchedKeywords.map(
        (skill) => ({
          name: skill,
          score: 100,
        })
      ),

    sections: [],

    recommendations:
      recommendations.map(
        (item) => ({
          priority: "High",
          title: "AI Recommendation",
          description: item,
        })
      ),
  };


  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <main className="min-h-screen bg-[#090909] text-white">

      {/* Header */}

      <header className="border-b border-white/10 bg-[#090909]/95">

        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between gap-4 px-4 lg:px-8">

          <div className="flex min-w-0 items-center gap-4">

            <Link
              href="/dashboard"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-400 transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft
                className="h-4 w-4"
              />
            </Link>

            <div className="hidden h-5 w-px bg-white/10 sm:block" />

            <div className="hidden min-w-0 sm:block">

              <p className="truncate text-sm font-medium">
                {resumeName}
              </p>

              <p className="truncate text-xs text-zinc-500">
                {jobTitle}
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={() =>
              exportAnalysisAsPDF(
                exportData
              )
            }
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white"
          >

            <Download
              className="h-4 w-4"
            />

            Export Report

          </button>

        </div>

      </header>


      {/* Content */}

      <div className="mx-auto max-w-[1500px] px-4 py-8 lg:px-8">

        {/* Page Header */}

        <div className="mb-8">

          <div className="mb-3 flex items-center gap-2 text-xs text-zinc-500">

            <FileText
              className="h-4 w-4"
            />

            Analysis ID:

            <span className="text-zinc-400">
              {analysis.id}
            </span>

          </div>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Resume Analysis
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">

            AI-powered analysis of your resume
            against{" "}

            <span className="text-zinc-300">
              {jobTitle}
            </span>

            {" "}position at{" "}

            <span className="text-zinc-300">
              {company}
            </span>.

          </p>

        </div>


        {/* Score Cards */}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

          <ScoreCard
            title="ATS Score"
            value={atsScore}
            suffix="/100"
            icon={
              <Target
                className="h-4 w-4"
              />
            }
            primary
          />

          <ScoreCard
            title="Job Match"
            value={jobMatch}
            suffix="%"
            icon={
              <TrendingUp
                className="h-4 w-4"
              />
            }
          />

          <ScoreCard
            title="Keywords"
            value={keywordScore}
            suffix="%"
            icon={
              <Sparkles
                className="h-4 w-4"
              />
            }
          />

          <ScoreCard
            title="Skills"
            value={skillsScore}
            suffix="%"
            icon={
              <CheckCircle2
                className="h-4 w-4"
              />
            }
          />

          <ScoreCard
            title="Experience"
            value={experienceScore}
            suffix="%"
            icon={
              <FileText
                className="h-4 w-4"
              />
            }
          />

        </section>


        {/* Main Analysis */}

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">

          {/* ATS */}

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

              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-400">

                {getScoreStatus(
                  atsScore
                )}

              </span>

            </div>


            <div className="mt-8 flex flex-col items-center">

              <div
                className="relative flex h-52 w-52 items-center justify-center rounded-full"
                style={{
                  background:
                    `conic-gradient(#8b5cf6 ${
                      Math.max(
                        0,
                        Math.min(
                          100,
                          atsScore
                        )
                      ) * 3.6
                    }deg, #27272a 0deg)`,
                }}
              >

                <div className="flex h-40 w-40 flex-col items-center justify-center rounded-full bg-[#101010]">

                  <span className="text-5xl font-semibold">
                    {Math.round(
                      atsScore
                    )}
                  </span>

                  <span className="text-xs text-zinc-500">
                    out of 100
                  </span>

                </div>

              </div>

              <p className="mt-6 max-w-md text-center text-sm leading-6 text-zinc-500">

                {getScoreDescription(
                  atsScore
                )}

              </p>

            </div>


            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">

              <MiniScore
                label="Formatting"
                score={
                  formattingScore
                }
              />

              <MiniScore
                label="Keywords"
                score={
                  keywordScore
                }
              />

              <MiniScore
                label="Skills"
                score={
                  skillsScore
                }
              />

              <MiniScore
                label="Experience"
                score={
                  experienceScore
                }
              />

            </div>

          </motion.section>


          {/* Keywords */}

          <KeywordCard
            matchedKeywords={
              matchedKeywords
            }
            missingKeywords={
              missingKeywords
            }
          />

        </div>


        {/* Strengths */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-[#101010] p-6">

          <SectionHeading
            title="Strengths"
            description="What your resume does well for this position."
          />

          <div className="mt-6 grid gap-3 md:grid-cols-2">

            {strengths.length > 0 ? (

              strengths.map(
                (
                  strength,
                  index
                ) => (

                  <div
                    key={`${strength}-${index}`}
                    className="rounded-xl border border-emerald-400/10 bg-emerald-400/[0.03] p-4"
                  >

                    <div className="flex items-start gap-3">

                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
                      />

                      <p className="text-sm leading-6 text-zinc-300">
                        {strength}
                      </p>

                    </div>

                  </div>

                )
              )

            ) : (

              <EmptyState
                text="No strengths available yet."
              />

            )}

          </div>

        </section>


        {/* Weaknesses */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-[#101010] p-6">

          <SectionHeading
            title="Weaknesses"
            description="Areas where your resume could better match the position."
          />

          <div className="mt-6 grid gap-3 md:grid-cols-2">

            {weaknesses.length > 0 ? (

              weaknesses.map(
                (
                  weakness,
                  index
                ) => (

                  <div
                    key={`${weakness}-${index}`}
                    className="rounded-xl border border-red-400/10 bg-red-400/[0.03] p-4"
                  >

                    <div className="flex items-start gap-3">

                      <XCircle
                        className="mt-0.5 h-4 w-4 shrink-0 text-red-400"
                      />

                      <p className="text-sm leading-6 text-zinc-300">
                        {weakness}
                      </p>

                    </div>

                  </div>

                )
              )

            ) : (

              <EmptyState
                text="No weaknesses available yet."
              />

            )}

          </div>

        </section>


        {/* Recommendations */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-[#101010] p-6">

          <SectionHeading
            title="AI Recommendations"
            description="Personalized improvements based on your resume and target job."
          />

          <div className="mt-6 grid gap-3">

            {recommendations.length > 0 ? (

              recommendations.map(
                (
                  recommendation,
                  index
                ) => (

                  <Recommendation
                    key={`${recommendation}-${index}`}
                    priority={
                      index === 0
                        ? "High"
                        : index === 1
                        ? "Medium"
                        : "Low"
                    }
                    title={
                      `Recommendation ${index + 1}`
                    }
                    description={
                      recommendation
                    }
                  />

                )
              )

            ) : (

              <EmptyState
                text="No recommendations available yet."
              />

            )}

          </div>

        </section>


        {/* Hiring Recommendation */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-[#101010] p-6">

          <SectionHeading
            title="Hiring Recommendation"
            description="AI-generated assessment based on the complete resume analysis."
          />

          <div className="mt-6 flex items-center gap-4 rounded-xl border border-violet-400/20 bg-violet-400/[0.04] p-5">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/10">

              <Sparkles
                className="h-5 w-5 text-violet-400"
              />

            </div>

            <div>

              <p className="text-sm font-semibold text-white">

                {formatHiringRecommendation(
                  analysis.hiringRecommendation
                )}

              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Based on the resume-to-job compatibility analysis.
              </p>

            </div>

          </div>

        </section>


        {/* Bottom Actions */}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">

          <Link
            href="/builder"
            className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
          >

            <Sparkles
              className="h-4 w-4"
            />

            Improve Resume with AI

          </Link>

          <Link
            href="/analyze"
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
          >

            Analyze Another Resume

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
        (
          primary
            ? "border-violet-400/20 bg-violet-400/[0.06]"
            : "border-white/10 bg-[#101010]"
        )
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

        <span className="ml-1 text-sm text-zinc-600">
          {suffix}
        </span>

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
  matchedKeywords,
  missingKeywords,
}: {
  matchedKeywords: string[];
  missingKeywords: string[];
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#101010] p-6">

      <SectionHeading
        title="Keyword Analysis"
        description="Keywords found and missing from your resume."
      />

      <KeywordGroup
        title="Matched"
        icon={
          <CheckCircle2
            className="h-4 w-4"
          />
        }
        items={
          matchedKeywords
        }
        type="matched"
      />

      <KeywordGroup
        title="Missing"
        icon={
          <XCircle
            className="h-4 w-4"
          />
        }
        items={
          missingKeywords
        }
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
  type:
    | "matched"
    | "missing"
    | "recommended";
}) {
  const styles = {
    matched:
      "border-emerald-400/20 bg-emerald-400/5 text-emerald-300",

    missing:
      "border-red-400/20 bg-red-400/5 text-red-300",

    recommended:
      "border-amber-400/20 bg-amber-400/5 text-amber-300",
  };

  return (
    <div className="mt-6">

      <div className="mb-3 flex items-center gap-2 text-xs text-zinc-400">

        {icon}

        {title}

      </div>

      <div className="flex flex-wrap gap-2">

        {items.length > 0 ? (

          items.map(
            (
              item,
              index
            ) => (

              <span
                key={`${item}-${index}`}
                className={
                  "rounded-lg border px-2.5 py-1.5 text-xs " +
                  styles[type]
                }
              >
                {item}
              </span>

            )
          )

        ) : (

          <span className="text-xs text-zinc-600">
            No {title.toLowerCase()} keywords available.
          </span>

        )}

      </div>

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
| Recommendation
|--------------------------------------------------------------------------
*/

function Recommendation({
  priority,
  title,
  description,
}: {
  priority: string;
  title: string;
  description: string;
}) {
  const isHigh =
    priority === "High";

  const isMedium =
    priority === "Medium";

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 md:flex-row">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10">

        {isHigh ? (

          <CircleAlert
            className="h-4 w-4 text-red-400"
          />

        ) : (

          <Lightbulb
            className={
              "h-4 w-4 " +
              (
                isMedium
                  ? "text-amber-400"
                  : "text-zinc-400"
              )
            }
          />

        )}

      </div>

      <div className="flex-1">

        <div className="flex flex-wrap items-center gap-2">

          <h3 className="text-sm font-medium">
            {title}
          </h3>

          <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-zinc-500">
            {priority}
          </span>

        </div>

        <p className="mt-1 text-xs leading-5 text-zinc-500">
          {description}
        </p>

      </div>

    </div>
  );
}


/*
|--------------------------------------------------------------------------
| Empty State
|--------------------------------------------------------------------------
*/

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">

      <p className="text-sm text-zinc-600">
        {text}
      </p>

    </div>
  );
}


/*
|--------------------------------------------------------------------------
| Score Status
|--------------------------------------------------------------------------
*/

function getScoreStatus(
  score: number
): string {
  if (score >= 90) {
    return "Excellent";
  }

  if (score >= 80) {
    return "Strong";
  }

  if (score >= 70) {
    return "Good";
  }

  if (score >= 60) {
    return "Potential";
  }

  if (score >= 40) {
    return "Weak";
  }

  return "Needs Improvement";
}


/*
|--------------------------------------------------------------------------
| Score Description
|--------------------------------------------------------------------------
*/

function getScoreDescription(
  score: number
): string {
  if (score >= 90) {
    return "Your resume is highly compatible with the target position and demonstrates strong alignment with the job requirements.";
  }

  if (score >= 80) {
    return "Your resume shows strong compatibility with the target position, with some areas that can still be improved.";
  }

  if (score >= 70) {
    return "Your resume has good compatibility with the target position, but improving skills and keyword alignment could increase your chances.";
  }

  if (score >= 60) {
    return "Your resume has potential for this position, but several improvements are recommended before applying.";
  }

  if (score >= 40) {
    return "Your resume has some relevant experience, but significant improvements are recommended for this position.";
  }

  return "Your resume currently has limited compatibility with this position. Consider improving the missing skills and relevant experience.";
}


/*
|--------------------------------------------------------------------------
| Hiring Recommendation
|--------------------------------------------------------------------------
*/

function formatHiringRecommendation(
  value: string
): string {
  switch (value) {
    case "STRONG_MATCH":
      return "Strong Match";

    case "GOOD_MATCH":
      return "Good Match";

    case "POTENTIAL_MATCH":
      return "Potential Match";

    case "WEAK_MATCH":
      return "Weak Match";

    case "NOT_RECOMMENDED":
      return "Not Recommended";

    default:
      return value ||
        "Not Available";
  }
}

