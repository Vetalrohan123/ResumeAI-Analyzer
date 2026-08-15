"use client";

import Link from "next/link";

import {
  ArrowLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  FileText,
  Search,
  Sparkles,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  getHistory,
  HistoryAnalysis,
} from "@/lib/api";

export default function HistoryPage() {
  const [analyses, setAnalyses] =
    useState<HistoryAnalysis[]>([]);

  const [page, setPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [total, setTotal] =
    useState(0);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadHistory();
  }, [page]);

  async function loadHistory() {
    try {
      setLoading(true);
      setError("");

      const result =
        await getHistory(
          page,
          10,
          search
        );

      setAnalyses(
        result.analyses
      );

      setTotal(
        result.pagination.total
      );

      setTotalPages(
        result.pagination.totalPages
      );
    } catch (error) {
      console.error(
        "History loading failed:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load history"
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setPage(1);

    loadHistory();
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white">

      {/* Header */}

      <header className="border-b border-zinc-800">

        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">

          <Link
            href="/dashboard"
            className="flex items-center gap-3 text-sm text-zinc-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />

            Dashboard
          </Link>

          <Link
            href="/analyze"
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200"
          >
            <Sparkles className="h-4 w-4" />

            New Analysis
          </Link>

        </div>

      </header>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">

        {/* Heading */}

        <section>

          <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
            Workspace
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Analysis History
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
            Review your previous resume analyses,
            job matches and AI recommendations.
          </p>

        </section>

        {/* Search */}

        <form
          onSubmit={handleSearch}
          className="mt-8 flex max-w-xl gap-3"
        >

          <div className="relative flex-1">

            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />

            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search resume, job or company..."
              className="h-11 w-full rounded-lg border border-zinc-800 bg-[#0d0d0d] pl-10 pr-4 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-violet-500/50"
            />

          </div>

          <button
            type="submit"
            className="rounded-lg bg-white px-5 text-sm font-medium text-black transition hover:bg-zinc-200"
          >
            Search
          </button>

        </form>

        {/* Count */}

        <div className="mt-8 flex items-center justify-between">

          <p className="text-xs text-zinc-600">
            {total}{" "}
            {total === 1
              ? "analysis"
              : "analyses"}
          </p>

        </div>

        {/* Error */}

        {error && (
          <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Loading */}

        {loading ? (
          <div className="mt-6 rounded-2xl border border-zinc-800 bg-[#0d0d0d] p-12 text-center">

            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />

            <p className="mt-4 text-sm text-zinc-600">
              Loading analyses...
            </p>

          </div>
        ) : analyses.length === 0 ? (

          /* Empty */

          <div className="mt-6 rounded-2xl border border-zinc-800 bg-[#0d0d0d] p-12 text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950">

              <FileText className="h-5 w-5 text-zinc-600" />

            </div>

            <h2 className="mt-5 font-medium">
              No analyses found
            </h2>

            <p className="mt-2 text-sm text-zinc-600">
              Start by uploading your resume
              and adding a job description.
            </p>

            <Link
              href="/analyze"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black hover:bg-zinc-200"
            >
              Analyze Resume

              <ArrowUpRight className="h-4 w-4" />
            </Link>

          </div>

        ) : (

          /* Results */

          <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-[#0d0d0d]">

            <div className="hidden md:block">

              <table className="w-full">

                <thead>

                  <tr className="border-b border-zinc-800 text-left text-xs text-zinc-600">

                    <th className="px-6 py-4 font-medium">
                      Resume
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Position
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Company
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Match
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Date
                    </th>

                    <th className="px-6 py-4" />

                  </tr>

                </thead>

                <tbody>

                  {analyses.map(
                    (analysis) => (
                      <tr
                        key={analysis.id}
                        className="border-b border-zinc-800 last:border-0 transition hover:bg-zinc-900/40"
                      >

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950">

                              <FileText className="h-4 w-4 text-zinc-500" />

                            </div>

                            <span className="max-w-[220px] truncate text-sm text-zinc-200">
                              {
                                analysis
                                  .resume
                                  .fileName
                              }
                            </span>

                          </div>

                        </td>

                        <td className="px-6 py-5 text-sm text-zinc-400">
                          {
                            analysis
                              .job
                              .title
                          }
                        </td>

                        <td className="px-6 py-5 text-sm text-zinc-500">
                          {
                            analysis
                              .job
                              .company
                          }
                        </td>

                        <td className="px-6 py-5">

                          <span
                            className={`text-sm font-medium ${
                              analysis.matchScore >=
                              80
                                ? "text-emerald-400"
                                : analysis.matchScore >=
                                  60
                                ? "text-amber-400"
                                : "text-red-400"
                            }`}
                          >
                            {
                              analysis.matchScore
                            }
                            %
                          </span>

                        </td>

                        <td className="px-6 py-5 text-xs text-zinc-600">
                          {new Date(
                            analysis.createdAt
                          ).toLocaleDateString()}
                        </td>

                        <td className="px-6 py-5 text-right">

                          <Link
                            href={`/analysis/${analysis.id}`}
                            className="inline-flex text-zinc-600 transition hover:text-white"
                          >
                            <ArrowUpRight className="h-4 w-4" />
                          </Link>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

            {/* Mobile */}

            <div className="divide-y divide-zinc-800 md:hidden">

              {analyses.map(
                (analysis) => (
                  <Link
                    key={analysis.id}
                    href={`/analysis/${analysis.id}`}
                    className="block p-5 transition hover:bg-zinc-900/50"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div className="min-w-0">

                        <p className="truncate text-sm font-medium text-zinc-200">
                          {
                            analysis
                              .resume
                              .fileName
                          }
                        </p>

                        <p className="mt-1 text-xs text-zinc-600">
                          {
                            analysis
                              .job
                              .title
                          }

                          {" · "}

                          {
                            analysis
                              .job
                              .company
                          }
                        </p>

                      </div>

                      <ArrowUpRight className="h-4 w-4 shrink-0 text-zinc-600" />

                    </div>

                    <div className="mt-5 flex gap-8">

                      <div>

                        <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                          Match
                        </p>

                        <p className="mt-1 text-sm text-emerald-400">
                          {
                            analysis
                              .matchScore
                          }
                          %
                        </p>

                      </div>

                      <div>

                        <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                          Date
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                          {new Date(
                            analysis.createdAt
                          ).toLocaleDateString()}
                        </p>

                      </div>

                    </div>

                  </Link>
                )
              )}

            </div>

          </div>
        )}

        {/* Pagination */}

        {!loading &&
          totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">

              <button
                disabled={page <= 1}
                onClick={() =>
                  setPage(
                    (value) =>
                      value - 1
                  )
                }
                className="flex items-center gap-1 rounded-lg border border-zinc-800 px-3 py-2 text-xs text-zinc-400 transition hover:bg-zinc-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />

                Previous
              </button>

              <span className="text-xs text-zinc-600">
                Page {page} of{" "}
                {totalPages}
              </span>

              <button
                disabled={
                  page >= totalPages
                }
                onClick={() =>
                  setPage(
                    (value) =>
                      value + 1
                  )
                }
                className="flex items-center gap-1 rounded-lg border border-zinc-800 px-3 py-2 text-xs text-zinc-400 transition hover:bg-zinc-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                Next

                <ChevronRight className="h-4 w-4" />
              </button>

            </div>
          )}

      </div>

    </main>
  );
}