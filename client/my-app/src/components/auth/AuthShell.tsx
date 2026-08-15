"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

interface AuthShellProps {
  children: ReactNode;
  title: string;
  description: string;
  footerText: string;
  footerLink: string;
  footerHref: string;
}

export default function AuthShell({
  children,
  title,
  description,
  footerText,
  footerLink,
  footerHref,
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-violet-500/[0.06] blur-[120px]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="relative flex min-h-screen flex-col">
        {/* Header */}
        <header className="flex h-20 items-center justify-between border-b border-white/[0.08] px-6 lg:px-10">
          <Link
            href="/"
            className="group flex items-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
              <Sparkles
                size={16}
                className="text-violet-400"
              />
            </div>

            <span className="text-lg font-semibold tracking-tight">
              ResumeAI
            </span>
          </Link>

          <Link
            href="/"
            className="text-sm text-zinc-400 transition hover:text-white"
          >
            Back to home
          </Link>
        </header>

        {/* Content */}
        <div className="flex flex-1 items-center justify-center px-5 py-16">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {title}
              </h1>

              <p className="mt-3 text-sm leading-6 text-zinc-400">
                {description}
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-6 shadow-2xl shadow-black/30 sm:p-8">
              {children}
            </div>

            <div className="mt-6 text-center text-sm text-zinc-500">
              {footerText}{" "}
              <Link
                href={footerHref}
                className="font-medium text-white transition hover:text-violet-400"
              >
                {footerLink}
              </Link>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-zinc-600">
              <span>AI-powered resume intelligence</span>
              <ArrowRight size={12} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}