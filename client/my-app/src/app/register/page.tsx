"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError("Please enter your full name.");
      return;
    }

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      /*
       * authApi.register expects three arguments:
       *
       * register(name, email, password)
       */
      await authApi.register(
        trimmedName,
        trimmedEmail,
        password
      );

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error(
        "Registration failed:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to create your account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* =====================================================
            LEFT SIDE
        ====================================================== */}

        <section className="relative hidden overflow-hidden border-r border-[#202020] lg:flex">

          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:48px_48px]" />

          <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-[120px]" />

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">

            {/* Logo */}

            <Link
              href="/"
              className="flex w-fit items-center gap-2 text-lg font-semibold"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06]">
                <Sparkles className="h-4 w-4 text-violet-400" />
              </div>

              ResumeAI
            </Link>

            {/* Hero */}

            <div className="max-w-xl">

              <p className="mb-5 text-sm font-medium uppercase tracking-[0.2em] text-violet-400">
                Start optimizing
              </p>

              <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.04em] xl:text-6xl">
                Build a resume that gets noticed.
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-zinc-400">
                Join ResumeAI and use AI-powered
                analysis to understand your ATS
                score, identify skill gaps, and
                optimize every application.
              </p>

              <div className="mt-10 space-y-3">

                {[
                  "AI-powered ATS analysis",
                  "Job-specific resume matching",
                  "Personalized improvement recommendations",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 border border-[#242424] bg-white/[0.025] px-4 py-3"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-violet-400" />

                    <span className="text-sm text-zinc-400">
                      {item}
                    </span>
                  </div>
                ))}

              </div>

            </div>

            {/* Copyright */}

            <p className="text-xs text-zinc-600">
              © {new Date().getFullYear()} ResumeAI
            </p>

          </div>

        </section>

        {/* =====================================================
            RIGHT SIDE
        ====================================================== */}

        <section className="flex min-h-screen items-center justify-center px-6 py-12">

          <div className="w-full max-w-md">

            {/* Mobile Logo */}

            <Link
              href="/"
              className="mb-12 flex items-center gap-2 text-lg font-semibold lg:hidden"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06]">
                <Sparkles className="h-4 w-4 text-violet-400" />
              </div>

              ResumeAI
            </Link>

            {/* Heading */}

            <div className="mb-8">

              <h2 className="text-3xl font-semibold tracking-[-0.03em]">
                Create your account
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Start analyzing and optimizing your
                resume with AI.
              </p>

            </div>

            {/* Error */}

            {error && (
              <div
                role="alert"
                className="mb-5 border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400"
              >
                {error}
              </div>
            )}

            {/* Google */}

            <button
              type="button"
              className="flex h-12 w-full items-center justify-center gap-3 border border-[#292929] bg-[#101010] text-sm font-medium transition hover:border-[#3a3a3a] hover:bg-[#151515]"
            >
              <span className="text-base font-bold">
                G
              </span>

              Continue with Google
            </button>

            {/* Divider */}

            <div className="my-7 flex items-center gap-4">

              <div className="h-px flex-1 bg-[#222]" />

              <span className="text-xs text-zinc-600">
                OR
              </span>

              <div className="h-px flex-1 bg-[#222]" />

            </div>

            {/* Form */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Name */}

              <div>

                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Full name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Rohan Vetal"
                  className="h-12 w-full border border-[#292929] bg-[#0d0d0d] px-4 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20"
                />

              </div>

              {/* Email */}

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
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="you@example.com"
                  className="h-12 w-full border border-[#292929] bg-[#0d0d0d] px-4 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20"
                />

              </div>

              {/* Password */}

              <div>

                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Password
                </label>

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
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }
                    placeholder="At least 8 characters"
                    className="h-12 w-full border border-[#292929] bg-[#0d0d0d] px-4 pr-12 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20"
                  />

                  <button
                    type="button"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    onClick={() =>
                      setShowPassword(
                        (value) => !value
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 transition hover:text-zinc-300"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>

                </div>

              </div>

              {/* Confirm Password */}

              <div>

                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Confirm password
                </label>

                <div className="relative">

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    placeholder="Repeat your password"
                    className="h-12 w-full border border-[#292929] bg-[#0d0d0d] px-4 pr-12 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20"
                  />

                  <button
                    type="button"
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    onClick={() =>
                      setShowConfirmPassword(
                        (value) => !value
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 transition hover:text-zinc-300"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>

                </div>

              </div>

              {/* Submit */}

              <button
                type="submit"
                disabled={loading}
                className="group flex h-12 w-full items-center justify-center gap-2 bg-white text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />

                    Creating account...
                  </>
                ) : (
                  <>
                    Create account

                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}

              </button>

            </form>

            {/* Login */}

            <p className="mt-8 text-center text-sm text-zinc-500">

              Already have an account?{" "}

              <Link
                href="/login"
                className="font-medium text-white transition hover:text-violet-400"
              >
                Sign in
              </Link>

            </p>

            {/* Terms */}

            <p className="mt-6 text-center text-xs leading-5 text-zinc-700">

              By creating an account, you agree to
              our{" "}

              <Link
                href="/terms"
                className="hover:text-zinc-400"
              >
                Terms
              </Link>{" "}

              and{" "}

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