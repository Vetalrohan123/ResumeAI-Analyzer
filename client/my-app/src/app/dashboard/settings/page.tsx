"use client";

import { useState } from "react";
import Link from "next/link";

import {
  User,
  Bell,
  Shield,
  Palette,
  Brain,
  Save,
  CheckCircle2,
  AlertCircle,
  Mail,
  Lock,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

import { motion } from "framer-motion";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  const [fullName, setFullName] =
    useState("Resume User");

  const [email, setEmail] =
    useState("user@example.com");

  const [jobTitle, setJobTitle] =
    useState("Software Developer");

  const [emailNotifications, setEmailNotifications] =
    useState(true);

  const [analysisNotifications, setAnalysisNotifications] =
    useState(true);

  const [weeklyReports, setWeeklyReports] =
    useState(false);

  const [aiSuggestions, setAiSuggestions] =
    useState(true);

  const [publicProfile, setPublicProfile] =
    useState(false);

  function handleSave() {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  }

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-[#070711] text-white">
      <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">

        {/* ================================================================
            HEADER
        ================================================================= */}

        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <div className="mb-3 flex items-center gap-2 text-xs text-violet-400">
              <Sparkles className="h-4 w-4" />

              AI Resume Analyzer
            </div>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Settings
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/40">
              Manage your profile, AI preferences,
              notifications, and account settings.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-white/60 transition hover:bg-white/[0.06] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />

            Back to Dashboard
          </Link>

        </div>

        {/* ================================================================
            SUCCESS MESSAGE
        ================================================================= */}

        {saved && (
          <motion.div
            initial={{
              opacity: 0,
              y: -10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.05] px-4 py-3"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />

            <p className="text-xs text-emerald-300">
              Your settings have been saved successfully.
            </p>
          </motion.div>
        )}

        {/* ================================================================
            SETTINGS GRID
        ================================================================= */}

        <div className="mt-8 grid gap-6 lg:grid-cols-[220px_1fr]">

          {/* ==============================================================
              SETTINGS NAVIGATION
          ============================================================== */}

          <aside className="h-fit rounded-2xl border border-white/[0.08] bg-[#0b0b16] p-3">

            <SettingsNavItem
              icon={User}
              label="Profile"
              active
            />

            <SettingsNavItem
              icon={Bell}
              label="Notifications"
            />

            <SettingsNavItem
              icon={Brain}
              label="AI Preferences"
            />

            <SettingsNavItem
              icon={Shield}
              label="Security"
            />

            <SettingsNavItem
              icon={Palette}
              label="Appearance"
            />

          </aside>

          {/* ==============================================================
              SETTINGS CONTENT
          ============================================================== */}

          <div className="space-y-6">

            {/* ============================================================
                PROFILE
            ============================================================= */}

            <SettingsSection
              icon={User}
              title="Profile"
              description="Manage your personal information."
            >

              <div className="grid gap-5 sm:grid-cols-2">

                <InputField
                  label="Full Name"
                  value={fullName}
                  onChange={setFullName}
                  icon={User}
                  placeholder="Enter your name"
                />

                <InputField
                  label="Email Address"
                  value={email}
                  onChange={setEmail}
                  icon={Mail}
                  type="email"
                  placeholder="Enter your email"
                />

                <InputField
                  label="Job Title"
                  value={jobTitle}
                  onChange={setJobTitle}
                  icon={Sparkles}
                  placeholder="e.g. Software Developer"
                />

              </div>

            </SettingsSection>

            {/* ============================================================
                NOTIFICATIONS
            ============================================================= */}

            <SettingsSection
              icon={Bell}
              title="Notifications"
              description="Choose which notifications you want to receive."
            >

              <div className="divide-y divide-white/[0.06]">

                <ToggleRow
                  title="Email Notifications"
                  description="Receive important account notifications by email."
                  enabled={emailNotifications}
                  onChange={setEmailNotifications}
                />

                <ToggleRow
                  title="Analysis Completed"
                  description="Get notified when an AI resume analysis is completed."
                  enabled={analysisNotifications}
                  onChange={setAnalysisNotifications}
                />

                <ToggleRow
                  title="Weekly Reports"
                  description="Receive a weekly summary of your resume performance."
                  enabled={weeklyReports}
                  onChange={setWeeklyReports}
                />

              </div>

            </SettingsSection>

            {/* ============================================================
                AI PREFERENCES
            ============================================================= */}

            <SettingsSection
              icon={Brain}
              title="AI Preferences"
              description="Customize how ResumeAI provides recommendations."
            >

              <div className="divide-y divide-white/[0.06]">

                <ToggleRow
                  title="AI Suggestions"
                  description="Allow AI to provide recommendations for improving your resume."
                  enabled={aiSuggestions}
                  onChange={setAiSuggestions}
                />

              </div>

              <div className="mt-5 rounded-xl border border-violet-400/15 bg-violet-400/[0.04] p-4">

                <div className="flex items-start gap-3">

                  <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-violet-400" />

                  <div>
                    <p className="text-sm font-medium text-violet-300">
                      AI-powered recommendations
                    </p>

                    <p className="mt-1 text-xs leading-5 text-white/35">
                      ResumeAI analyzes your resume,
                      skills, experience, and target jobs
                      to provide personalized recommendations.
                    </p>
                  </div>

                </div>

              </div>

            </SettingsSection>

            {/* ============================================================
                SECURITY
            ============================================================= */}

            <SettingsSection
              icon={Shield}
              title="Security"
              description="Manage your account security."
            >

              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04]">

                      <Lock className="h-4 w-4 text-white/50" />

                    </div>

                    <div>

                      <p className="text-sm font-medium">
                        Password
                      </p>

                      <p className="mt-1 text-xs text-white/30">
                        Last updated recently
                      </p>

                    </div>

                  </div>

                  <button
                    type="button"
                    className="rounded-lg border border-white/[0.08] px-4 py-2 text-xs font-medium text-white/60 transition hover:bg-white/[0.05] hover:text-white"
                  >
                    Change Password
                  </button>

                </div>

              </div>

              <div className="mt-4 rounded-xl border border-yellow-400/15 bg-yellow-400/[0.04] p-4">

                <div className="flex items-start gap-3">

                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />

                  <div>

                    <p className="text-xs font-medium text-yellow-300">
                      Security recommendation
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-yellow-300/50">
                      Use a strong, unique password and
                      never share your account credentials.
                    </p>

                  </div>

                </div>

              </div>

            </SettingsSection>

            {/* ============================================================
                APPEARANCE
            ============================================================= */}

            <SettingsSection
              icon={Palette}
              title="Appearance"
              description="Customize the look of your workspace."
            >

              <div className="grid gap-4 sm:grid-cols-3">

                <AppearanceCard
                  title="Dark"
                  active
                />

                <AppearanceCard
                  title="Light"
                />

                <AppearanceCard
                  title="System"
                />

              </div>

            </SettingsSection>

            {/* ============================================================
                PRIVACY
            ============================================================= */}

            <SettingsSection
              icon={Shield}
              title="Privacy"
              description="Control how your resume information is used."
            >

              <ToggleRow
                title="Public Profile"
                description="Allow your profile to be visible to other users."
                enabled={publicProfile}
                onChange={setPublicProfile}
              />

            </SettingsSection>

            {/* ============================================================
                SAVE
            ============================================================= */}

            <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-[#0b0b16] p-5 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-sm font-medium">
                  Save your changes
                </p>

                <p className="mt-1 text-xs text-white/30">
                  Your settings will be applied to your workspace.
                </p>

              </div>

              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-xs font-semibold text-white shadow-lg shadow-violet-500/10 transition hover:from-violet-500 hover:to-indigo-500"
              >
                <Save className="h-4 w-4" />

                Save Changes
              </button>

            </div>

          </div>

        </div>

      </div>
    </main>
  );
}

/*
|--------------------------------------------------------------------------
| Settings Navigation Item
|--------------------------------------------------------------------------
*/

function SettingsNavItem({
  icon: Icon,
  label,
  active = false,
}: {
  icon: React.ComponentType<{
    className?: string;
  }>;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`
        flex w-full items-center gap-3
        rounded-xl px-3 py-3
        text-left text-xs font-medium
        transition
        ${
          active
            ? "bg-violet-500/15 text-violet-300"
            : "text-white/40 hover:bg-white/[0.05] hover:text-white"
        }
      `}
    >
      <Icon
        className={`
          h-4 w-4
          ${
            active
              ? "text-violet-400"
              : "text-white/40"
          }
        `}
      />

      {label}
    </button>
  );
}

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{
    className?: string;
  }>;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-[#0b0b16] p-5 sm:p-6">

      <div className="flex items-start gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">

          <Icon className="h-5 w-5 text-violet-400" />

        </div>

        <div>

          <h2 className="text-base font-semibold">
            {title}
          </h2>

          <p className="mt-1 text-xs text-white/30">
            {description}
          </p>

        </div>

      </div>

      <div className="mt-6">
        {children}
      </div>

    </section>
  );
}

/*
|--------------------------------------------------------------------------
| Input Field
|--------------------------------------------------------------------------
*/

function InputField({
  label,
  value,
  onChange,
  icon: Icon,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon: React.ComponentType<{
    className?: string;
  }>;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>

      <label className="mb-2 block text-xs font-medium text-white/60">
        {label}
      </label>

      <div className="relative">

        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />

        <input
          type={type}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/20 transition focus:border-violet-500/40 focus:bg-white/[0.05]"
        />

      </div>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Toggle Row
|--------------------------------------------------------------------------
*/

function ToggleRow({
  title,
  description,
  enabled,
  onChange,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 py-4">

      <div className="min-w-0">

        <p className="text-sm font-medium text-white/80">
          {title}
        </p>

        <p className="mt-1 max-w-2xl text-xs leading-5 text-white/30">
          {description}
        </p>

      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() =>
          onChange(!enabled)
        }
        className={`
          relative h-6 w-11 shrink-0 rounded-full
          transition
          ${
            enabled
              ? "bg-violet-600"
              : "bg-white/10"
          }
        `}
      >

        <span
          className={`
            absolute top-1 h-4 w-4 rounded-full bg-white
            shadow-sm transition-transform
            ${
              enabled
                ? "translate-x-6"
                : "translate-x-1"
            }
          `}
        />

      </button>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Appearance Card
|--------------------------------------------------------------------------
*/

function AppearanceCard({
  title,
  active = false,
}: {
  title: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`
        rounded-xl border p-3 text-left transition
        ${
          active
            ? "border-violet-500/40 bg-violet-500/[0.06]"
            : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05]"
        }
      `}
    >

      <div
        className={`
          h-20 rounded-lg border
          ${
            title === "Light"
              ? "border-zinc-200 bg-zinc-100"
              : title === "System"
                ? "border-white/10 bg-gradient-to-br from-[#111] via-[#111] to-zinc-200"
                : "border-white/10 bg-[#080808]"
          }
        `}
      >

        <div className="p-2">

          <div className="h-2 w-12 rounded-full bg-white/20" />

          <div className="mt-2 grid grid-cols-3 gap-1">

            <div className="h-10 rounded bg-white/[0.05]" />

            <div className="h-10 rounded bg-white/[0.08]" />

            <div className="h-10 rounded bg-violet-500/20" />

          </div>

        </div>

      </div>

      <div className="mt-3 flex items-center justify-between">

        <span className="text-xs font-medium">
          {title}
        </span>

        {active && (
          <CheckCircle2 className="h-4 w-4 text-violet-400" />
        )}

      </div>

    </button>
  );
}