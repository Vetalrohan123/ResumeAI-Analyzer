"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-28">
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      {/* Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-violet-500/[0.08] blur-[140px]" />

      <div className="relative mx-auto w-full max-w-6xl px-6">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs text-zinc-300"
          >
            <Sparkles size={14} className="text-violet-400" />
            AI-powered resume intelligence
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-balance text-5xl font-semibold tracking-[-0.055em] text-white sm:text-6xl md:text-7xl lg:text-[80px] lg:leading-[0.98]"
          >
            Your resume should work
            <span className="block text-zinc-500">
              as hard as you do.
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-7 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg"
          >
            Analyze your resume against any job description, discover what
            recruiters are looking for, and improve your chances of getting
            shortlisted.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            {/* Analyze My Resume → Login */}
            <Link
              href="/login"
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-black transition hover:bg-zinc-200 sm:w-auto"
            >
              Analyze My Resume

              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

            {/* How It Works */}
            <Link
              href="#how-it-works"
              className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-6 py-3.5 text-center text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white sm:w-auto"
            >
              See How It Works
            </Link>
          </motion.div>
        </div>

        {/* Product Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mx-auto mt-20 max-w-5xl"
        >
          <div className="relative overflow-hidden rounded-t-2xl border border-white/10 bg-[#0d0d0d] shadow-2xl shadow-black">
            {/* Browser Header */}
            <div className="flex h-10 items-center gap-2 border-b border-white/[0.07] px-4">
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />

              <div className="mx-auto rounded-md border border-white/[0.06] px-12 py-1 text-[10px] text-zinc-600">
                app.resumeai.com
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="grid min-h-[300px] grid-cols-1 md:grid-cols-[1fr_1.2fr]">
              {/* Resume Preview */}
              <div className="border-b border-white/[0.07] p-6 md:border-b-0 md:border-r">
                <div className="h-2 w-20 rounded bg-zinc-700" />

                <div className="mt-5 space-y-3">
                  <div className="h-2 w-full rounded bg-zinc-800" />
                  <div className="h-2 w-[90%] rounded bg-zinc-800" />
                  <div className="h-2 w-[75%] rounded bg-zinc-800" />
                </div>

                <div className="mt-10 space-y-3">
                  <div className="h-2 w-24 rounded bg-zinc-700" />
                  <div className="h-2 w-full rounded bg-zinc-800" />
                  <div className="h-2 w-[85%] rounded bg-zinc-800" />
                  <div className="h-2 w-[70%] rounded bg-zinc-800" />
                </div>
              </div>

              {/* ATS Analysis */}
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-500">
                      ATS Score
                    </p>

                    <p className="mt-1 text-4xl font-semibold text-white">
                      92
                      <span className="text-sm text-zinc-600">
                        /100
                      </span>
                    </p>
                  </div>

                  {/* Score Circle */}
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-violet-400/30 bg-violet-500/5">
                    <span className="text-sm font-medium text-violet-300">
                      92%
                    </span>
                  </div>
                </div>

                {/* Score Cards */}
                <div className="mt-8 grid grid-cols-2 gap-3">
                  {[
                    ["Match", "94%"],
                    ["Keywords", "87%"],
                    ["Skills", "91%"],
                    ["Format", "95%"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4"
                    >
                      <p className="text-[11px] text-zinc-500">
                        {label}
                      </p>

                      <p className="mt-1 text-lg font-medium text-white">
                        {value}
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