
"use client";

import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Search,
  MoreHorizontal,
  Eye,
  Trash2,
  TrendingUp,
  Plus,
} from "lucide-react";
import { useMemo, useState } from "react";

type Analysis = {
  id: string;
  resumeName: string;
  jobTitle: string;
  company: string;
  atsScore: number;
  matchScore: number;
  date: string;
  status: "Completed" | "Processing";
};

const analyses: Analysis[] = [
  {
    id: "cmsj9p2ey0001uolo2yiunjk9",
    resumeName: "Backend Developer Resume",
    jobTitle: "Backend Developer",
    company: "Google",
    atsScore: 92,
    matchScore: 95,
    date: "Aug 7, 2026",
    status: "Completed",
  },
  {
    id: "analysis-002",
    resumeName: "Full Stack Developer Resume",
    jobTitle: "Full Stack Developer",
    company: "Microsoft",
    atsScore: 88,
    matchScore: 91,
    date: "Aug 5, 2026",
    status: "Completed",
  },
  {
    id: "analysis-003",
    resumeName: "React Developer Resume",
    jobTitle: "Frontend Developer",
    company: "Amazon",
    atsScore: 84,
    matchScore: 86,
    date: "Aug 2, 2026",
    status: "Completed",
  },
  {
    id: "analysis-004",
    resumeName: "Software Engineer Resume",
    jobTitle: "Software Engineer",
    company: "Atlassian",
    atsScore: 79,
    matchScore: 82,
    date: "Jul 29, 2026",
    status: "Completed",
  },
];

function Score({
  value,
}: {
  value: number;
}) {
  return (
    <span
      className={`font-medium ${
        value >= 90
          ? "text-emerald-400"
          : value >= 80
            ? "text-amber-400"
            : "text-red-400"
      }`}
    >
      {value}%
    </span>
  );
}

export default function HistoryPage() {
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filteredAnalyses = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return analyses;
    }

    return analyses.filter(
      (analysis) =>
        analysis.resumeName.toLowerCase().includes(query) ||
        analysis.jobTitle.toLowerCase().includes(query) ||
        analysis.company.toLowerCase().includes(query),
    );
  }, [search]);

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080808]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>

            <div className="hidden h-5 w-px bg-white/10 sm:block" />

            <span className="hidden text-sm text-zinc-500 sm:block">
              Analysis History
            </span>
          </div>

          <Link
            href="/analyze"
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200"
          >
            <Plus className="h-4 w-4" />
            New Analysis
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Heading */}
        <section className="mb-10">
          <p className="mb-3 text-sm text-violet-400">
            Resume Intelligence
          </p>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Analysis History
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
            Review your previous resume analyses and track how your resume
            performs against different job opportunities.
          </p>
        </section>

        {/* Stats */}
        <section className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[#111111] p-5">
            <p className="text-sm text-zinc-500">
              Total Analyses
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {analyses.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111111] p-5">
            <p className="text-sm text-zinc-500">
              Average ATS Score
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {Math.round(
                analyses.reduce(
                  (total, item) => total + item.atsScore,
                  0,
                ) / analyses.length,
              )}
              %
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111111] p-5">
            <p className="text-sm text-zinc-500">
              Average Job Match
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {Math.round(
                analyses.reduce(
                  (total, item) => total + item.matchScore,
                  0,
                ) / analyses.length,
              )}
              %
            </p>
          </div>
        </section>

        {/* Search */}
        <section className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search analyses..."
              className="h-10 w-full rounded-lg border border-white/10 bg-[#111111] pl-10 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 transition focus:border-violet-500/40"
            />
          </div>

          <p className="text-sm text-zinc-600">
            {filteredAnalyses.length}{" "}
            {filteredAnalyses.length === 1
              ? "analysis"
              : "analyses"}
          </p>
        </section>

        {/* Desktop table */}
        <section className="hidden overflow-hidden rounded-2xl border border-white/10 bg-[#111111] md:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-zinc-600">
                  <th className="px-6 py-4 font-medium">
                    Resume
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Job
                  </th>

                  <th className="px-6 py-4 font-medium">
                    ATS Score
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Match
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Date
                  </th>

                  <th className="px-6 py-4 text-right font-medium">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredAnalyses.map((analysis) => (
                  <tr
                    key={analysis.id}
                    className="border-b border-white/[0.06] last:border-0 transition hover:bg-white/[0.02]"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03]">
                          <FileText className="h-4 w-4 text-zinc-400" />
                        </div>

                        <div>
                          <p className="text-sm font-medium text-white">
                            {analysis.resumeName}
                          </p>

                          <p className="mt-0.5 text-xs text-zinc-600">
                            Resume analysis
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <p className="text-sm text-zinc-300">
                        {analysis.jobTitle}
                      </p>

                      <p className="mt-0.5 text-xs text-zinc-600">
                        {analysis.company}
                      </p>
                    </td>

                    <td className="px-6 py-5 text-sm">
                      <Score value={analysis.atsScore} />
                    </td>

                    <td className="px-6 py-5 text-sm">
                      <Score value={analysis.matchScore} />
                    </td>

                    <td className="px-6 py-5 text-sm text-zinc-500">
                      {analysis.date}
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex justify-end">
                        <div className="relative">
                          <button
                            onClick={() =>
                              setOpenMenu(
                                openMenu === analysis.id
                                  ? null
                                  : analysis.id,
                              )
                            }
                            className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/5 hover:text-white"
                            aria-label="Open analysis actions"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>

                          {openMenu === analysis.id && (
                            <div className="absolute right-0 top-10 z-20 w-40 overflow-hidden rounded-xl border border-white/10 bg-[#181818] p-1 shadow-2xl">
                              <Link
                                href={`/dashboard/analysis/${analysis.id}`}
                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
                              >
                                <Eye className="h-4 w-4" />
                                View Analysis
                              </Link>

                              <button
                                onClick={() =>
                                  setOpenMenu(null)
                                }
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-500 transition hover:bg-red-500/5 hover:text-red-400"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAnalyses.length === 0 && (
            <EmptyState />
          )}
        </section>

        {/* Mobile cards */}
        <section className="space-y-3 md:hidden">
          {filteredAnalyses.map((analysis) => (
            <div
              key={analysis.id}
              className="rounded-2xl border border-white/10 bg-[#111111] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03]">
                    <FileText className="h-4 w-4 text-zinc-400" />
                  </div>

                  <div>
                    <p className="text-sm font-medium">
                      {analysis.resumeName}
                    </p>

                    <p className="mt-1 text-xs text-zinc-600">
                      {analysis.date}
                    </p>
                  </div>
                </div>

                <button className="text-zinc-600">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <p className="text-xs text-zinc-600">
                    Job
                  </p>

                  <p className="mt-1 text-sm text-zinc-300">
                    {analysis.jobTitle}
                  </p>

                  <p className="mt-0.5 text-xs text-zinc-600">
                    {analysis.company}
                  </p>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <p className="text-xs text-zinc-600">
                    ATS Score
                  </p>

                  <p className="mt-1 text-lg">
                    <Score value={analysis.atsScore} />
                  </p>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <p className="text-xs text-zinc-600">
                    Job Match
                  </p>

                  <p className="mt-1 text-lg">
                    <Score value={analysis.matchScore} />
                  </p>
                </div>
              </div>

              <Link
                href={`/dashboard/analysis/${analysis.id}`}
                className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-white/10 py-2.5 text-sm text-zinc-300 transition hover:border-white/20 hover:text-white"
              >
                <Eye className="h-4 w-4" />
                View Analysis
              </Link>
            </div>
          ))}

          {filteredAnalyses.length === 0 && (
            <EmptyState />
          )}
        </section>

        {/* Bottom CTA */}
        <section className="mt-10 flex flex-col items-center justify-between gap-5 rounded-2xl border border-white/10 bg-[#111111] p-6 sm:flex-row">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-violet-400" />

              <h2 className="font-medium">
                Want to improve your score?
              </h2>
            </div>

            <p className="mt-1 text-sm text-zinc-600">
              Analyze another resume against a new job description.
            </p>
          </div>

          <Link
            href="/analyze"
            className="flex shrink-0 items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200"
          >
            <Plus className="h-4 w-4" />
            New Analysis
          </Link>
        </section>
      </div>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
        <Search className="h-5 w-5 text-zinc-600" />
      </div>

      <h3 className="mt-4 font-medium">
        No analyses found
      </h3>

      <p className="mt-1 max-w-sm text-sm text-zinc-600">
        Try another search or create a new resume analysis.
      </p>
    </div>
  );
}
