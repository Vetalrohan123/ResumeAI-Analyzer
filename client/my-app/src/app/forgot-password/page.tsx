
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);

    // Backend password-reset API will be connected later.
    await new Promise((resolve) => setTimeout(resolve, 1200));

    setLoading(false);
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left */}
        <section className="relative hidden overflow-hidden border-r border-[#202020] lg:flex">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:48px_48px]" />

          <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-[120px]" />

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
            <Link
              href="/"
              className="flex w-fit items-center gap-2 text-lg font-semibold"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06]">
                <Sparkles className="h-4 w-4 text-violet-400" />
              </div>

              ResumeAI
            </Link>

            <div className="max-w-xl">
              <p className="mb-5 text-sm font-medium uppercase tracking-[0.2em] text-violet-400">
                Secure access
              </p>

              <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.04em] xl:text-6xl">
                Get back to building a resume that stands out.
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-zinc-400">
                Reset your password and continue using ResumeAI to analyze,
                optimize, and improve your applications.
              </p>

              <div className="mt-10 border border-[#242424] bg-white/[0.025] p-5">
                <div className="text-sm font-medium">
                  Your resume intelligence workspace
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="border border-[#242424] p-4">
                    <div className="text-2xl font-semibold">92</div>
                    <div className="mt-1 text-xs text-zinc-500">
                      ATS Score
                    </div>
                  </div>

                  <div className="border border-[#242424] p-4">
                    <div className="text-2xl font-semibold">94%</div>
                    <div className="mt-1 text-xs text-zinc-500">
                      Job Match
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-zinc-600">
              © {new Date().getFullYear()} ResumeAI
            </p>
          </div>
        </section>

        {/* Right */}
        <section className="flex min-h-screen items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <Link
              href="/"
              className="mb-12 flex items-center gap-2 text-lg font-semibold lg:hidden"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06]">
                <Sparkles className="h-4 w-4 text-violet-400" />
              </div>

              ResumeAI
            </Link>

            {!submitted ? (
              <>
                <Link
                  href="/login"
                  className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to sign in
                </Link>

                <div className="mb-8">
                  <h2 className="text-3xl font-semibold tracking-[-0.03em]">
                    Forgot your password?
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-zinc-500">
                    Enter the email address associated with your account and
                    we'll send you a password reset link.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
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
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="h-12 w-full border border-[#292929] bg-[#0d0d0d] px-4 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group flex h-12 w-full items-center justify-center gap-2 bg-white text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                        Sending link...
                      </>
                    ) : (
                      <>
                        Send reset link
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-8 border border-[#242424] bg-white/[0.02] p-4">
                  <p className="text-xs leading-5 text-zinc-600">
                    For security, we'll only send a reset link if an account
                    exists for this email address.
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-green-500/20 bg-green-500/10">
                  <CheckCircle2 className="h-7 w-7 text-green-400" />
                </div>

                <h2 className="mt-7 text-3xl font-semibold tracking-[-0.03em]">
                  Check your inbox
                </h2>

                <p className="mt-3 text-sm leading-6 text-zinc-500">
                  If an account exists for{" "}
                  <span className="font-medium text-zinc-300">{email}</span>,
                  we've sent instructions to reset your password.
                </p>

                <Link
                  href="/login"
                  className="group mt-8 flex h-12 w-full items-center justify-center gap-2 bg-white text-sm font-semibold text-black transition hover:bg-zinc-200"
                >
                  Return to sign in
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-5 text-sm text-zinc-500 transition hover:text-white"
                >
                  Try another email
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

