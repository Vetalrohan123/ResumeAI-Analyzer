"use client";

import {
  CheckCircle2,
  AlertTriangle,
  FileText,
} from "lucide-react";

interface ResumeSection {
  name: string;
  score: number;
  status: string;
  recommendation: string;
}

interface ResumeSectionAnalysisProps {
  sections: ResumeSection[];
}

export default function ResumeSectionAnalysis({
  sections,
}: ResumeSectionAnalysisProps) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#111111] p-6">
      <div className="mb-6 flex items-start gap-3">
        <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-2">
          <FileText size={17} className="text-zinc-400" />
        </div>

        <div>
          <h2 className="text-lg font-semibold">
            Resume Section Analysis
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            AI feedback for each section of your resume.
          </p>
        </div>
      </div>

      <div className="divide-y divide-white/[0.06]">
        {sections.map((section) => {
          const excellent = section.score >= 90;

          return (
            <div
              key={section.name}
              className="py-5 first:pt-0 last:pb-0"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-3">
                  {excellent ? (
                    <CheckCircle2
                      size={18}
                      className="mt-0.5 shrink-0 text-emerald-400"
                    />
                  ) : (
                    <AlertTriangle
                      size={18}
                      className="mt-0.5 shrink-0 text-amber-400"
                    />
                  )}

                  <div>
                    <h3 className="text-sm font-medium">
                      {section.name}
                    </h3>

                    <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-500">
                      {section.recommendation}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
                  <span className="text-lg font-semibold">
                    {section.score}
                  </span>

                  <span
                    className={
                      excellent
                        ? "text-xs text-emerald-400"
                        : "text-xs text-amber-400"
                    }
                  >
                    {section.status}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}