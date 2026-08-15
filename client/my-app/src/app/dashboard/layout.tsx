"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  LayoutDashboard,
  FileText,
  Briefcase,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  UserCircle,
  WandSparkles
} from "lucide-react";

import { authApi } from "@/lib/api";

interface DashboardLayoutProps {
  children: ReactNode;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  
  {
    name: "Resumes",
    href: "/dashboard/resumes",
    icon: FileText,
  },
   {
    name: "Resume Builder",
    href: "/dashboard/builder",
    icon: WandSparkles,
  },
  {
    name: "Jobs",
    href: "/dashboard/jobs",
    icon: Briefcase,
  },
  {
    name: "Analysis",
    href: "/dashboard/analysis",
    icon: BarChart3,
  },
];

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  async function handleLogout() {
    try {
      setLoggingOut(true);

      await authApi.logout();
    } catch (error) {
      console.error(
        "Logout failed:",
        error
      );
    } finally {
      router.push("/login");
    }
  }

  function isActive(href: string) {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

  return (
    <div className="min-h-screen bg-[#070711] text-white">

      {/* =====================================================
          MOBILE SIDEBAR OVERLAY
      ====================================================== */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-72 flex-col
          border-r border-white/[0.08]
          bg-[#0b0b16]
          transition-transform duration-300
          lg:translate-x-0
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >

        {/* ===================================================
            LOGO
        ==================================================== */}

        <div className="flex h-20 items-center justify-between border-b border-white/[0.08] px-6">

          <Link
            href="/dashboard"
            onClick={() =>
              setSidebarOpen(false)
            }
            className="flex items-center gap-3"
          >

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/20">

              <Sparkles className="h-5 w-5 text-white" />

            </div>

            <div>
              <p className="text-base font-bold tracking-tight">
                ResumeAI
              </p>

              <p className="text-[11px] text-white/40">
                AI Resume Analyzer
              </p>
            </div>

          </Link>

          <button
            onClick={() =>
              setSidebarOpen(false)
            }
            className="rounded-lg p-2 text-white/50 hover:bg-white/[0.06] hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>

        </div>

        {/* ===================================================
            NAVIGATION
        ==================================================== */}

        <div className="flex-1 overflow-y-auto px-4 py-6">

          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
            Workspace
          </p>

          <nav className="space-y-1">

            {navigation.map((item) => {
              const Icon = item.icon;
              const active =
                isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() =>
                    setSidebarOpen(false)
                  }
                  className={`
                    group flex items-center gap-3
                    rounded-xl px-3 py-3
                    text-sm font-medium
                    transition-all duration-200
                    ${
                      active
                        ? "bg-violet-500/15 text-violet-300 shadow-[inset_0_0_0_1px_rgba(139,92,246,0.18)]"
                        : "text-white/50 hover:bg-white/[0.05] hover:text-white"
                    }
                  `}
                >

                  <div
                    className={`
                      flex h-9 w-9 shrink-0 items-center justify-center rounded-lg
                      ${
                        active
                          ? "bg-violet-500/20"
                          : "bg-white/[0.04] group-hover:bg-white/[0.07]"
                      }
                    `}
                  >
                    <Icon
                      className={`
                        h-[18px] w-[18px]
                        ${
                          active
                            ? "text-violet-400"
                            : "text-white/50 group-hover:text-white"
                        }
                      `}
                    />
                  </div>

                  <span className="flex-1">
                    {item.name}
                  </span>

                  {active && (
                    <ChevronRight className="h-4 w-4 text-violet-400" />
                  )}

                </Link>
              );
            })}

          </nav>

          {/* =================================================
              TOOLS
          ================================================== */}

          <p className="mb-3 mt-8 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
            Account
          </p>

          <nav className="space-y-1">

            <Link
              href="/dashboard/settings"
              onClick={() =>
                setSidebarOpen(false)
              }
              className={`
                group flex items-center gap-3
                rounded-xl px-3 py-3
                text-sm font-medium
                transition
                ${
                  isActive(
                    "/dashboard/settings"
                  )
                    ? "bg-violet-500/15 text-violet-300"
                    : "text-white/50 hover:bg-white/[0.05] hover:text-white"
                }
              `}
            >

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04] group-hover:bg-white/[0.07]">

                <Settings className="h-[18px] w-[18px]" />

              </div>

              <span>Settings</span>

            </Link>

          </nav>

        </div>

        {/* ===================================================
            USER / LOGOUT
        ==================================================== */}

        <div className="border-t border-white/[0.08] p-4">

          <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/[0.035] p-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/30 to-indigo-500/30">

              <UserCircle className="h-5 w-5 text-violet-300" />

            </div>

            <div className="min-w-0 flex-1">

              <p className="truncate text-sm font-medium text-white/80">
                Resume User
              </p>

              <p className="truncate text-xs text-white/35">
                AI Resume Workspace
              </p>

            </div>

          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-white/45 transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
          >

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04]">

              <LogOut className="h-[18px] w-[18px]" />

            </div>

            <span>
              {loggingOut
                ? "Logging out..."
                : "Logout"}
            </span>

          </button>

        </div>

      </aside>

      {/* =====================================================
          MAIN AREA
      ====================================================== */}

      <div className="lg:pl-72">

        {/* ===================================================
            TOP HEADER
        ==================================================== */}

        <header className="sticky top-0 z-30 h-20 border-b border-white/[0.08] bg-[#070711]/90 backdrop-blur-xl">

          <div className="flex h-full items-center justify-between px-5 sm:px-8">

            <div className="flex items-center gap-3">

              <button
                onClick={() =>
                  setSidebarOpen(true)
                }
                className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-2.5 text-white/60 hover:bg-white/[0.06] hover:text-white lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="hidden sm:block">

                <p className="text-sm font-medium text-white/80">
                  {getPageTitle(pathname)}
                </p>

                <p className="text-xs text-white/30">
                  AI-powered resume intelligence
                </p>

              </div>

            </div>

            {/* =================================================
                HEADER RIGHT
            ================================================== */}

            <div className="flex items-center gap-3">

              <div className="hidden items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 sm:flex">

                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]" />

                <span className="text-xs font-medium text-violet-300">
                  AI Engine Ready
                </span>

              </div>

              <Link
                href="/dashboard/resumes"
                className="hidden items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-500/10 transition hover:from-violet-500 hover:to-indigo-500 sm:flex"
              >

                <FileText className="h-4 w-4" />

                Upload Resume

              </Link>

            </div>

          </div>

        </header>

        {/* ===================================================
            PAGE CONTENT
        ==================================================== */}

        <main className="min-h-[calc(100vh-5rem)] bg-[#070711]">

          {children}

        </main>

      </div>

    </div>
  );
}

/* ============================================================
   PAGE TITLE
============================================================ */

function getPageTitle(
  pathname: string
): string {

  if (
    pathname === "/dashboard"
  ) {
    return "Dashboard";
  }

  if (
    pathname.startsWith(
      "/dashboard/resumes"
    )
  ) {
    return "Resumes";
  }

  if (
  pathname.startsWith(
    "/dashboard/builder"
  )
  ) {
   return "Resume Builder";
  }

  if (
    pathname.startsWith(
      "/dashboard/jobs"
    )
  ) {
    return "Jobs";
  }

  if (
    pathname.startsWith(
      "/dashboard/analysis"
    )
  ) {
    return "Analysis";
  }

  if (
    pathname.startsWith(
      "/dashboard/settings"
    )
  ) {
    return "Settings";
  }

  return "ResumeAI";
}

