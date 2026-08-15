"use client";

import {
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

interface KeywordAnalysisProps {
  matchedKeywords: string[];
  missingKeywords: string[];
  recommendedKeywords: string[];
}

export default function KeywordAnalysis({
  matchedKeywords,
  missingKeywords,
  recommendedKeywords,
}: KeywordAnalysisProps) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#111111] p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">
          Keyword Analysis
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Compare your resume keywords against the job
          requirements.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <KeywordGroup
          title="Matched"
          description="Keywords already found"
          icon={CheckCircle2}
          keywords={matchedKeywords}
          type="matched"
        />

        <KeywordGroup
          title="Missing"
          description="Keywords you should consider"
          icon={AlertTriangle}
          keywords={missingKeywords}
          type="missing"
        />

        <KeywordGroup
          title="Recommended"
          description="Useful keywords to strengthen your resume"
          icon={Sparkles}
          keywords={recommendedKeywords}
          type="recommended"
        />
      </div>
    </div>
  );
}

function KeywordGroup({
  title,
  description,
  icon: Icon,
  keywords,
  type,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  keywords: string[];
  type: "matched" | "missing" | "recommended";
}) {
  const iconClass =
    type === "matched"
      ? "text-emerald-400"
      : type === "missing"
        ? "text-amber-400"
        : "text-violet-400";

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Icon size={17} className={iconClass} />

        <div>
          <p className="text-sm font-medium">{title}</p>

          <p className="text-xs text-zinc-600">
            {description}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {keywords.length > 0 ? (
          keywords.map((keyword) => (
            <span
              key={keyword}
              className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-300"
            >
              {keyword}
            </span>
          ))
        ) : (
          <span className="text-xs text-zinc-600">
            No keywords found
          </span>
        )}
      </div>
    </div>
  );
}