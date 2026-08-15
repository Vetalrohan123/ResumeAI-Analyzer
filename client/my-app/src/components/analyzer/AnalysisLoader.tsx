"use client";

import {
  Check,
  FileText,
  Search,
  Sparkles,
  Loader2,
} from "lucide-react";

import {
  motion,
} from "framer-motion";

interface AnalysisLoaderProps {
  step: number;
}

const steps = [
  {
    title: "Uploading resume",
    description:
      "Securely processing your resume file.",
    icon: FileText,
  },
  {
    title: "Extracting resume data",
    description:
      "Reading skills, experience, education, and projects.",
    icon: Search,
  },
  {
    title: "Analyzing with AI",
    description:
      "Comparing your resume against the job requirements.",
    icon: Sparkles,
  },
  {
    title: "Generating insights",
    description:
      "Preparing your ATS score and recommendations.",
    icon: Sparkles,
  },
];

export default function AnalysisLoader({
  step,
}: AnalysisLoaderProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="w-full max-w-xl"
    >
      <div className="mb-10 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/10">
          <Sparkles className="h-6 w-6 text-violet-400" />
        </div>

        <h1 className="text-2xl font-semibold">
          Analyzing your resume
        </h1>

        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Our AI is comparing your resume with
          the job requirements.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#101010] p-5 sm:p-6">
        <div className="space-y-1">
          {steps.map(
            (item, index) => {
              const Icon =
                item.icon;

              const completed =
                index < step;

              const active =
                index === step;

              return (
                <div
                  key={item.title}
                  className="relative flex gap-4"
                >
                  {index <
                    steps.length -
                      1 && (
                    <div className="absolute left-[18px] top-10 h-[calc(100%-8px)] w-px bg-white/10" />
                  )}

                  <div
                    className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition ${
                      completed
                        ? "border-emerald-400/30 bg-emerald-400/10"
                        : active
                        ? "border-violet-400/30 bg-violet-400/10"
                        : "border-white/10 bg-white/[0.03]"
                    }`}
                  >
                    {completed ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : active ? (
                      <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
                    ) : (
                      <Icon className="h-4 w-4 text-zinc-600" />
                    )}
                  </div>

                  <div className="pb-7">
                    <p
                      className={`text-sm font-medium ${
                        completed ||
                        active
                          ? "text-white"
                          : "text-zinc-600"
                      }`}
                    >
                      {item.title}
                    </p>

                    <p
                      className={`mt-1 text-xs leading-5 ${
                        active
                          ? "text-zinc-400"
                          : "text-zinc-600"
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      <p className="mt-5 text-center text-xs text-zinc-600">
        Please don't close this page while
        your analysis is processing.
      </p>
    </motion.div>
  );
}