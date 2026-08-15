"use client";

import { motion } from "framer-motion";
import { Check, Sparkles, TrendingUp } from "lucide-react";

const recommendations = [
  "Add Docker to your skills section.",
  "Quantify your backend achievements.",
  "Your experience strongly matches this role.",
];

export default function ProductPreview() {
  return (
    <section id="product" className="border-t border-white/[0.06] py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 max-w-2xl">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
            Resume intelligence
          </p>

          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            See exactly where your resume stands.
          </h2>

          <p className="mt-5 text-zinc-400">
            ResumeAI turns your resume into actionable insights so you know
            what to improve before you hit Apply.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0c0c]"
        >
          <div className="grid lg:grid-cols-[1fr_1.3fr]">
            <div className="border-b border-white/[0.07] p-6 lg:border-b-0 lg:border-r lg:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500">Resume</p>
                  <p className="mt-1 text-sm font-medium text-white">
                    software-engineer.pdf
                  </p>
                </div>

                <span className="rounded-md border border-white/10 px-2 py-1 text-[10px] text-zinc-500">
                  PDF
                </span>
              </div>

              <div className="mt-8 rounded-xl border border-white/[0.06] bg-[#101010] p-6">
                <div className="h-3 w-32 rounded bg-zinc-700" />

                <div className="mt-4 space-y-2">
                  <div className="h-2 w-full rounded bg-zinc-800" />
                  <div className="h-2 w-[90%] rounded bg-zinc-800" />
                  <div className="h-2 w-[80%] rounded bg-zinc-800" />
                </div>

                <div className="mt-8">
                  <div className="h-2 w-20 rounded bg-zinc-700" />

                  <div className="mt-3 space-y-2">
                    <div className="h-2 w-full rounded bg-zinc-800" />
                    <div className="h-2 w-[95%] rounded bg-zinc-800" />
                    <div className="h-2 w-[82%] rounded bg-zinc-800" />
                    <div className="h-2 w-[72%] rounded bg-zinc-800" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 lg:p-8">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ["ATS Score", "92"],
                  ["Match", "94%"],
                  ["Keywords", "87%"],
                  ["Skills", "91%"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4"
                  >
                    <p className="text-[11px] text-zinc-500">{label}</p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-xl border border-white/[0.07] p-5">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-emerald-400" />

                  <span className="text-sm font-medium text-white">
                    Excellent compatibility
                  </span>
                </div>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-zinc-800">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "92%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="h-full rounded-full bg-violet-400"
                  />
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles size={15} className="text-violet-400" />

                  <span className="text-sm font-medium text-white">
                    AI recommendations
                  </span>
                </div>

                <div className="space-y-2">
                  {recommendations.map((recommendation) => (
                    <div
                      key={recommendation}
                      className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.015] p-3"
                    >
                      <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-emerald-500/30">
                        <Check size={9} className="text-emerald-400" />
                      </div>

                      <p className="text-xs leading-5 text-zinc-400">
                        {recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}