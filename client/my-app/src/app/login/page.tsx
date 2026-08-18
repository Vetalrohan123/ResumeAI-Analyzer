"use client";

import {
  FormEvent,
  Suspense,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";

import {
  useSearchParams,
} from "next/navigation";

import { authApi } from "@/lib/api";

/* ============================================================
   LOGIN FORM
============================================================ */

function LoginForm() {
  const searchParams = useSearchParams();

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  /* ==========================================================
     SUBMIT
  ========================================================== */

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    setError("");
    setLoading(true);

    try {
      /* ------------------------------------------------------
         VALIDATION
      ------------------------------------------------------ */

      const cleanEmail =
        email.trim().toLowerCase();

      if (!cleanEmail) {
        throw new Error(
          "Email is required."
        );
      }

      if (!password) {
        throw new Error(
          "Password is required."
        );
      }

      if (password.length < 8) {
        throw new Error(
          "Password must contain at least 8 characters."
        );
      }

      console.log(
        "[LOGIN] Starting login..."
      );

      /* ------------------------------------------------------
         LOGIN
      ------------------------------------------------------ */

      const response =
        await authApi.login(
          cleanEmail,
          password
        );

      console.log(
        "[LOGIN] Login response:",
        response
      );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Login failed."
        );
      }

      console.log(
        "[LOGIN] Login successful."
      );

      /* ------------------------------------------------------
         VERIFY SESSION
      ------------------------------------------------------ */

      console.log(
        "[LOGIN] Verifying authentication session..."
      );

      const me =
        await authApi.me();

      console.log(
        "[LOGIN] /auth/me response:",
        me
      );

      if (
        !me?.success ||
        !me?.user
      ) {
        throw new Error(
          "Login succeeded, but the authentication session could not be verified."
        );
      }

      console.log(
        "[LOGIN] Authenticated user:",
        me.user
      );

      /* ------------------------------------------------------
         REDIRECT
      ------------------------------------------------------ */

      const redirect =
        searchParams.get(
          "redirect"
        );

      /*
       * Only allow internal application paths.
       */

      const safeRedirect =
        redirect &&
        redirect.startsWith("/") &&
        !redirect.startsWith("//") &&
        redirect !== "/login" &&
        redirect !== "/register"
          ? redirect
          : "/dashboard";

      console.log(
        "[LOGIN] Redirecting to:",
        safeRedirect
      );

      /*
       * IMPORTANT:
       *
       * Do NOT use:
       *
       * router.replace()
       * router.refresh()
       *
       * here.
       *
       * window.location.href forces the browser to make
       * a completely new request with the authentication
       * cookie available.
       */

      window.location.href =
        safeRedirect;

    } catch (err) {
      console.error(
        "[LOGIN] Login failed:",
        err
      );

      if (
        err instanceof Error
      ) {
        setError(
          err.message
        );
      } else {
        setError(
          "Unable to sign in. Please try again."
        );
      }

      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* =====================================================
            LEFT SIDE
        ===================================================== */}

        <section className="relative hidden min-h-screen overflow-hidden border-r border-[#1d1d1d] lg:flex">

          {/* Background glow */}

          <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-[120px]" />

          {/* Content */}

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">

            {/* LOGO */}

            <Link
              href="/"
              className="flex w-fit items-center gap-2 text-lg font-semibold"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06]">
                <Sparkles className="h-4 w-4 text-violet-400" />
              </div>

              ResumeAI
            </Link>

            {/* HERO */}

            <div className="max-w-xl">

              <p className="mb-5 text-sm font-medium uppercase tracking-[0.2em] text-violet-400">
                AI-powered resume intelligence
              </p>

              <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.04em] xl:text-6xl">
                Turn your resume into your competitive advantage.
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-zinc-400">
                Analyze your resume against real job
                descriptions, discover skill gaps, and
                get actionable AI recommendations.
              </p>

              {/* STATS */}

              <div className="mt-10 grid grid-cols-3 gap-3">

                {[
                  ["92", "Avg. ATS score"],
                  ["94%", "Match accuracy"],
                  ["10k+", "Resumes analyzed"],
                ].map(
                  ([value, label]) => (
                    <div
                      key={label}
                      className="border border-[#242424] bg-white/[0.025] p-4"
                    >
                      <div className="text-xl font-semibold">
                        {value}
                      </div>

                      <div className="mt-1 text-xs text-zinc-500">
                        {label}
                      </div>
                    </div>
                  )
                )}

              </div>
            </div>

            {/* FOOTER */}

            <p className="text-xs text-zinc-600">
              © {new Date().getFullYear()} ResumeAI
            </p>

          </div>
        </section>

        {/* =====================================================
            RIGHT SIDE
        ===================================================== */}

        <section className="flex min-h-screen items-center justify-center px-6 py-12">

          <div className="w-full max-w-md">

            {/* MOBILE LOGO */}

            <Link
              href="/"
              className="mb-12 flex items-center gap-2 text-lg font-semibold lg:hidden"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06]">
                <Sparkles className="h-4 w-4 text-violet-400" />
              </div>

              ResumeAI
            </Link>

            {/* HEADER */}

            <div className="mb-8">

              <h2 className="text-3xl font-semibold tracking-[-0.03em]">
                Welcome back
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Sign in to continue analyzing and
                improving your resume.
              </p>

            </div>

            {/* ERROR */}

            {error && (
              <div
                role="alert"
                className="mb-5 border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400"
              >
                {error}
              </div>
            )}

            {/* GOOGLE */}

            <button
              type="button"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-3 border border-[#292929] bg-[#101010] text-sm font-medium transition hover:border-[#3a3a3a] hover:bg-[#151515] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="text-base font-bold">
                G
              </span>

              Continue with Google
            </button>

            {/* DIVIDER */}

            <div className="my-7 flex items-center gap-4">

              <div className="h-px flex-1 bg-[#222]" />

              <span className="text-xs text-zinc-600">
                OR
              </span>

              <div className="h-px flex-1 bg-[#222]" />

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* EMAIL */}

              <div>

                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Email address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  disabled={loading}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  placeholder="you@example.com"
                  className="h-12 w-full border border-[#292929] bg-[#0d0d0d] px-4 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                />

              </div>

              {/* PASSWORD */}

              <div>

                <div className="mb-2 flex items-center justify-between">

                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-zinc-300"
                  >
                    Password
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-xs text-zinc-500 transition hover:text-white"
                  >
                    Forgot password?
                  </Link>

                </div>

                <div className="relative">

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    required
                    autoComplete="current-password"
                    value={password}
                    disabled={loading}
                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }
                    placeholder="Enter your password"
                    className="h-12 w-full border border-[#292929] bg-[#0d0d0d] px-4 pr-12 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <button
                    type="button"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    disabled={loading}
                    onClick={() =>
                      setShowPassword(
                        (value) =>
                          !value
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 transition hover:text-zinc-300 disabled:cursor-not-allowed"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>

                </div>

              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={loading}
                className="group flex h-12 w-full items-center justify-center gap-2 bg-white text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />

                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in

                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}

              </button>

            </form>

            {/* REGISTER */}

            <p className="mt-8 text-center text-sm text-zinc-500">

              Don't have an account?{" "}

              <Link
                href="/register"
                className="font-medium text-white transition hover:text-violet-400"
              >
                Create one
              </Link>

            </p>

            {/* TERMS */}

            <p className="mt-10 text-center text-xs leading-5 text-zinc-700">

              By continuing, you agree to our{" "}

              <Link
                href="/terms"
                className="hover:text-zinc-400"
              >
                Terms
              </Link>

              {" "}and{" "}

              <Link
                href="/privacy"
                className="hover:text-zinc-400"
              >
                Privacy Policy
              </Link>

              .

            </p>

          </div>

        </section>

      </div>
    </main>
  );
}

/* ============================================================
   PAGE
============================================================ */

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#080808] text-white">

          <div className="flex flex-col items-center gap-4">

            <div className="h-7 w-7 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />

            <p className="text-sm text-zinc-500">
              Loading...
            </p>

          </div>

        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}