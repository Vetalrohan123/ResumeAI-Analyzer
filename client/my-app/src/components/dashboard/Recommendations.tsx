"use client";

import {
  Sparkles,
  ArrowUpRight,
  CircleAlert,
} from "lucide-react";

interface Recommendation {
  priority: string;
  title: string;
  description: string;
}

interface RecommendationsProps {
  recommendations: Recommendation[];
}

export default function Recommendations({
  recommendations,
}: RecommendationsProps) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#111111] p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-violet-400">
            <Sparkles size={16} />

            <span className="text-xs font-medium uppercase tracking-wider">
              AI Insights
            </span>
          </div>

          <h2 className="text-lg font-semibold">
            Recommendations
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Actionable improvements generated specifically for
            your resume.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {recommendations.map((recommendation, index) => (
          <div
            key={`${recommendation.title}-${index}`}
            className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition hover:border-white/[0.11] hover:bg-white/[0.035]"
          >
            <div className="flex gap-4">
              <div className="mt-0.5 rounded-lg border border-white/[0.06] bg-white/[0.03] p-2">
                {recommendation.priority === "High" ? (
                  <CircleAlert
                    size={16}
                    className="text-red-400"
                  />
                ) : (
                  <Sparkles
                    size={16}
                    className="text-violet-400"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-medium">
                    {recommendation.title}
                  </h3>

                  <span
                    className={`rounded-md border px-2 py-0.5 text-[10px] ${
                      recommendation.priority === "High"
                        ? "border-red-500/20 text-red-400"
                        : recommendation.priority ===
                            "Medium"
                          ? "border-amber-500/20 text-amber-400"
                          : "border-white/10 text-zinc-500"
                    }`}
                  >
                    {recommendation.priority}
                  </span>
                </div>

                <p className="mt-1.5 text-sm leading-6 text-zinc-500">
                  {recommendation.description}
                </p>
              </div>

              <button
                aria-label={`Improve ${recommendation.title}`}
                className="self-start rounded-lg p-2 text-zinc-600 transition hover:bg-white/[0.05] hover:text-white"
              >
                <ArrowUpRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}