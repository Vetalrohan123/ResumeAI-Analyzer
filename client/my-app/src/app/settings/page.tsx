
"use client";

import { useState } from "react";
import {
  User,
  Bell,
  Shield,
  Palette,
  CreditCard,
  Lock,
  Save,
  Check,
  Moon,
  Mail,
  Trash2,
} from "lucide-react";

type Section =
  | "profile"
  | "notifications"
  | "security"
  | "appearance"
  | "billing";

export default function SettingsPage() {
  const [activeSection, setActiveSection] =
    useState<Section>("profile");

  const [name, setName] = useState("Rohan Vetal");
  const [email, setEmail] = useState("rohan@example.com");
  const [jobTitle, setJobTitle] = useState("Software Developer");

  const [emailNotifications, setEmailNotifications] =
    useState(true);

  const [analysisNotifications, setAnalysisNotifications] =
    useState(true);

  const [marketingNotifications, setMarketingNotifications] =
    useState(false);

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const sections = [
    {
      id: "profile" as Section,
      label: "Profile",
      description: "Personal information",
      icon: User,
    },
    {
      id: "notifications" as Section,
      label: "Notifications",
      description: "Email preferences",
      icon: Bell,
    },
    {
      id: "security" as Section,
      label: "Security",
      description: "Password and security",
      icon: Shield,
    },
    {
      id: "appearance" as Section,
      label: "Appearance",
      description: "Customize your workspace",
      icon: Palette,
    },
    {
      id: "billing" as Section,
      label: "Billing",
      description: "Plan and payments",
      icon: CreditCard,
    },
  ];

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                Settings
              </h1>

              <p className="mt-2 text-sm text-zinc-500">
                Manage your account and ResumeAI preferences.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          {/* Sidebar */}
          <aside className="h-fit rounded-2xl border border-[#242424] bg-[#101010] p-2">
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                const active =
                  activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    onClick={() =>
                      setActiveSection(section.id)
                    }
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                      active
                        ? "bg-[#1a1a1a] text-white"
                        : "text-zinc-500 hover:bg-[#171717] hover:text-zinc-200"
                    }`}
                  >
                    <Icon
                      size={18}
                      strokeWidth={1.7}
                    />

                    <div>
                      <p className="text-sm font-medium">
                        {section.label}
                      </p>

                      <p className="mt-0.5 text-[11px] text-zinc-600">
                        {section.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Content */}
          <section className="min-w-0">
            {activeSection === "profile" && (
              <ProfileSection
                name={name}
                email={email}
                jobTitle={jobTitle}
                setName={setName}
                setEmail={setEmail}
                setJobTitle={setJobTitle}
                onSave={handleSave}
                saved={saved}
              />
            )}

            {activeSection === "notifications" && (
              <NotificationsSection
                emailNotifications={
                  emailNotifications
                }
                analysisNotifications={
                  analysisNotifications
                }
                marketingNotifications={
                  marketingNotifications
                }
                setEmailNotifications={
                  setEmailNotifications
                }
                setAnalysisNotifications={
                  setAnalysisNotifications
                }
                setMarketingNotifications={
                  setMarketingNotifications
                }
              />
            )}

            {activeSection === "security" && (
              <SecuritySection />
            )}

            {activeSection === "appearance" && (
              <AppearanceSection />
            )}

            {activeSection === "billing" && (
              <BillingSection />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

/* -------------------------------------------------
   Profile
-------------------------------------------------- */

function ProfileSection({
  name,
  email,
  jobTitle,
  setName,
  setEmail,
  setJobTitle,
  onSave,
  saved,
}: {
  name: string;
  email: string;
  jobTitle: string;
  setName: (value: string) => void;
  setEmail: (value: string) => void;
  setJobTitle: (value: string) => void;
  onSave: () => void;
  saved: boolean;
}) {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Profile"
        description="Update your personal information."
      />

      <div className="rounded-2xl border border-[#242424] bg-[#101010]">
        {/* Profile image */}
        <div className="border-b border-[#242424] p-6">
          <h2 className="text-sm font-medium">
            Profile photo
          </h2>

          <div className="mt-5 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#333] bg-[#181818] text-xl font-semibold">
              RV
            </div>

            <div>
              <button className="rounded-lg border border-[#303030] bg-[#171717] px-4 py-2 text-sm transition hover:bg-[#202020]">
                Change photo
              </button>

              <p className="mt-2 text-xs text-zinc-600">
                JPG, PNG or WEBP. Max 2MB.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-5 p-6">
          <Input
            label="Full name"
            value={name}
            onChange={setName}
          />

          <Input
            label="Email address"
            type="email"
            value={email}
            onChange={setEmail}
          />

          <Input
            label="Job title"
            value={jobTitle}
            onChange={setJobTitle}
          />

          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Bio
            </label>

            <textarea
              rows={4}
              defaultValue="Software developer focused on building modern web applications."
              className="w-full resize-none rounded-xl border border-[#292929] bg-[#0b0b0b] px-4 py-3 text-sm text-zinc-200 outline-none transition placeholder:text-zinc-700 focus:border-violet-500/60"
              placeholder="Tell us a little about yourself..."
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#242424] p-6">
          {saved ? (
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <Check size={16} />
              Changes saved
            </div>
          ) : (
            <div />
          )}

          <button
            onClick={onSave}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200"
          >
            <Save size={16} />
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------
   Notifications
-------------------------------------------------- */

function NotificationsSection({
  emailNotifications,
  analysisNotifications,
  marketingNotifications,
  setEmailNotifications,
  setAnalysisNotifications,
  setMarketingNotifications,
}: {
  emailNotifications: boolean;
  analysisNotifications: boolean;
  marketingNotifications: boolean;
  setEmailNotifications: (value: boolean) => void;
  setAnalysisNotifications: (value: boolean) => void;
  setMarketingNotifications: (value: boolean) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Notifications"
        description="Choose which notifications ResumeAI should send you."
      />

      <div className="overflow-hidden rounded-2xl border border-[#242424] bg-[#101010]">
        <NotificationRow
          icon={Mail}
          title="Email notifications"
          description="Receive important account and product updates."
          enabled={emailNotifications}
          onChange={setEmailNotifications}
        />

        <NotificationRow
          icon={Check}
          title="Analysis completed"
          description="Get notified when your resume analysis is ready."
          enabled={analysisNotifications}
          onChange={setAnalysisNotifications}
        />

        <NotificationRow
          icon={Bell}
          title="Product updates"
          description="Receive occasional news and feature announcements."
          enabled={marketingNotifications}
          onChange={setMarketingNotifications}
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------
   Security
-------------------------------------------------- */

function SecuritySection() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Security"
        description="Manage your password and account security."
      />

      <div className="rounded-2xl border border-[#242424] bg-[#101010]">
        <div className="border-b border-[#242424] p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#292929] bg-[#161616]">
              <Lock size={18} />
            </div>

            <div>
              <h2 className="text-sm font-medium">
                Change password
              </h2>

              <p className="mt-1 text-xs text-zinc-600">
                Update your password regularly to keep your account secure.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <PasswordInput label="Current password" />

          <PasswordInput label="New password" />

          <PasswordInput label="Confirm new password" />

          <button className="rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200">
            Update password
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.03] p-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 className="text-sm font-medium text-red-400">
              Delete account
            </h2>

            <p className="mt-2 max-w-xl text-xs leading-5 text-zinc-500">
              Permanently delete your ResumeAI account and all
              associated resumes, analyses, and data.
            </p>
          </div>

          <button className="flex shrink-0 items-center gap-2 rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/10">
            <Trash2 size={15} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------
   Appearance
-------------------------------------------------- */

function AppearanceSection() {
  const [theme, setTheme] = useState("dark");

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Appearance"
        description="Customize how ResumeAI looks on your device."
      />

      <div className="rounded-2xl border border-[#242424] bg-[#101010] p-6">
        <h2 className="text-sm font-medium">
          Theme
        </h2>

        <p className="mt-1 text-xs text-zinc-600">
          Select your preferred appearance.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <ThemeCard
            title="Dark"
            active={theme === "dark"}
            onClick={() => setTheme("dark")}
            icon={<Moon size={18} />}
          />

          <ThemeCard
            title="Light"
            active={theme === "light"}
            onClick={() => setTheme("light")}
            icon={<div className="h-4 w-4 rounded-full bg-white" />}
          />

          <ThemeCard
            title="System"
            active={theme === "system"}
            onClick={() => setTheme("system")}
            icon={
              <div className="flex">
                <div className="h-4 w-2 rounded-l-full bg-white" />
                <div className="h-4 w-2 rounded-r-full bg-zinc-600" />
              </div>
            }
          />
        </div>
      </div>

      <div className="rounded-2xl border border-[#242424] bg-[#101010] p-6">
        <h2 className="text-sm font-medium">
          Motion
        </h2>

        <p className="mt-1 text-xs text-zinc-600">
          Control animations and transitions across the application.
        </p>

        <div className="mt-5 flex items-center justify-between rounded-xl border border-[#242424] bg-[#0b0b0b] p-4">
          <div>
            <p className="text-sm text-zinc-300">
              Reduce motion
            </p>

            <p className="mt-1 text-xs text-zinc-600">
              Minimize interface animations.
            </p>
          </div>

          <Toggle
            enabled={false}
            onChange={() => {}}
          />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------
   Billing
-------------------------------------------------- */

function BillingSection() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Billing"
        description="Manage your ResumeAI subscription."
      />

      <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.03] p-6">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-violet-400">
              Current plan
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              Free
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              2 resume analyses per month
            </p>
          </div>

          <button className="rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200">
            Upgrade plan
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-[#242424] bg-[#101010] p-6">
        <h2 className="text-sm font-medium">
          Usage
        </h2>

        <div className="mt-5">
          <div className="mb-2 flex justify-between text-xs">
            <span className="text-zinc-500">
              Analyses
            </span>

            <span className="text-zinc-300">
              1 / 2
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-[#222]">
            <div className="h-full w-1/2 rounded-full bg-violet-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------
   Shared Components
-------------------------------------------------- */

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold">
        {title}
      </h2>

      <p className="mt-1 text-sm text-zinc-500">
        {description}
      </p>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-zinc-300">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-xl border border-[#292929] bg-[#0b0b0b] px-4 py-3 text-sm text-zinc-200 outline-none transition focus:border-violet-500/60"
      />
    </div>
  );
}

function PasswordInput({
  label,
}: {
  label: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-zinc-300">
        {label}
      </label>

      <input
        type="password"
        className="w-full rounded-xl border border-[#292929] bg-[#0b0b0b] px-4 py-3 text-sm text-zinc-200 outline-none transition focus:border-violet-500/60"
      />
    </div>
  );
}

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      aria-label="Toggle setting"
      className={`relative h-6 w-11 rounded-full transition ${
        enabled
          ? "bg-violet-500"
          : "bg-[#292929]"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
          enabled
            ? "left-6"
            : "left-1"
        }`}
      />
    </button>
  );
}

function NotificationRow({
  icon: Icon,
  title,
  description,
  enabled,
  onChange,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 border-b border-[#242424] p-6 last:border-b-0">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#292929] bg-[#161616]">
          <Icon size={17} />
        </div>

        <div>
          <p className="text-sm font-medium">
            {title}
          </p>

          <p className="mt-1 text-xs text-zinc-600">
            {description}
          </p>
        </div>
      </div>

      <Toggle
        enabled={enabled}
        onChange={onChange}
      />
    </div>
  );
}

function ThemeCard({
  title,
  active,
  onClick,
  icon,
}: {
  title: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex h-28 flex-col items-center justify-center gap-3 rounded-xl border transition ${
        active
          ? "border-violet-500/60 bg-violet-500/[0.06]"
          : "border-[#292929] bg-[#0b0b0b] hover:border-[#3a3a3a]"
      }`}
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg ${
          active
            ? "bg-violet-500/10 text-violet-400"
            : "bg-[#181818] text-zinc-500"
        }`}
      >
        {icon}
      </div>

      <span className="text-sm text-zinc-300">
        {title}
      </span>

      {active && (
        <div className="absolute right-3 top-3">
          <Check
            size={14}
            className="text-violet-400"
          />
        </div>
      )}
    </button>
  );
}

