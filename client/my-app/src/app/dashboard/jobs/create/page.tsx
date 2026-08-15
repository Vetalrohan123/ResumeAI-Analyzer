"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CheckCircle2,
  Loader2,
  MapPin,
  Plus,
  X,
} from "lucide-react";

import {
  createJob,
  type CreateJobPayload,
} from "@/services/job.api";

type EmploymentType =
  | ""
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACT"
  | "INTERNSHIP"
  | "FREELANCE";

export default function CreateJobPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] =
    useState<EmploymentType>("");
  const [salary, setSalary] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");

  const [skillInput, setSkillInput] = useState("");
  const [requiredSkills, setRequiredSkills] =
    useState<string[]>([]);

  const [status, setStatus] = useState<
    "ACTIVE" | "CLOSED" | "DRAFT"
  >("ACTIVE");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ============================================================
     ADD SKILL
  ============================================================ */

  const addSkill = () => {
    const skill = skillInput.trim();

    if (!skill) {
      return;
    }

    const exists = requiredSkills.some(
      (item) => item.toLowerCase() === skill.toLowerCase()
    );

    if (exists) {
      setSkillInput("");
      return;
    }

    setRequiredSkills((current) => [
      ...current,
      skill,
    ]);

    setSkillInput("");
  };

  /* ============================================================
     REMOVE SKILL
  ============================================================ */

  const removeSkill = (skill: string) => {
    setRequiredSkills((current) =>
      current.filter((item) => item !== skill)
    );
  };

  /* ============================================================
     ENTER KEY
  ============================================================ */

  const handleSkillKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addSkill();
    }
  };

  /* ============================================================
     VALIDATION
  ============================================================ */

  const validateForm = (): string | null => {
    if (title.trim().length < 2) {
      return "Job title must be at least 2 characters.";
    }

    if (company.trim().length < 2) {
      return "Company name must be at least 2 characters.";
    }

    if (description.trim().length < 20) {
      return "Job description must be at least 20 characters.";
    }

    if (requirements.trim().length < 10) {
      return "Requirements must be at least 10 characters.";
    }

    if (requiredSkills.length === 0) {
      return "Add at least one required skill.";
    }

    return null;
  };

  /* ============================================================
     SUBMIT
  ============================================================ */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const payload: CreateJobPayload = {
        title: title.trim(),
        company: company.trim(),
        location: location.trim() || undefined,
        employmentType:
          employmentType || undefined,
        description: description.trim(),
        requirements: requirements.trim(),
        salary: salary.trim() || undefined,
        requiredSkills,
        status,
      };

      await createJob(payload);

      setSuccess("Job created successfully.");

      setTimeout(() => {
        router.push("/dashboard/jobs");
        router.refresh();
      }, 700);
    } catch (err) {
      console.error(
        "[CREATE JOB] Error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create job."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <main className="min-h-screen bg-[#07070a] text-white">
      <div className="mx-auto max-w-4xl px-6 py-10 lg:px-8">

        {/* HEADER */}

        <div className="mb-8">
          <Link
            href="/dashboard/jobs"
            className="mb-5 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to Jobs
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10">
              <Briefcase
                size={22}
                className="text-violet-400"
              />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Create Job
              </h1>

              <p className="mt-1 text-sm text-zinc-500">
                Add a new job to your recruitment pipeline.
              </p>
            </div>
          </div>
        </div>

        {/* ALERTS */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            <CheckCircle2 size={17} />
            {success}
          </div>
        )}

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* BASIC INFORMATION */}

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <div className="mb-6">
              <h2 className="text-lg font-semibold">
                Basic Information
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Enter the main information about the position.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">

              {/* TITLE */}

              <FormField
                label="Job Title"
                required
              >
                <input
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="e.g. Full Stack Developer"
                  className="input"
                />
              </FormField>

              {/* COMPANY */}

              <FormField
                label="Company"
                required
              >
                <div className="relative">
                  <Building2
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
                  />

                  <input
                    value={company}
                    onChange={(event) =>
                      setCompany(event.target.value)
                    }
                    placeholder="e.g. Acme Technologies"
                    className="input pl-10"
                  />
                </div>
              </FormField>

              {/* LOCATION */}

              <FormField label="Location">
                <div className="relative">
                  <MapPin
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
                  />

                  <input
                    value={location}
                    onChange={(event) =>
                      setLocation(event.target.value)
                    }
                    placeholder="e.g. Pune, Maharashtra"
                    className="input pl-10"
                  />
                </div>
              </FormField>

              {/* EMPLOYMENT */}

              <FormField label="Employment Type">
                <select
                  value={employmentType}
                  onChange={(event) =>
                    setEmploymentType(
                      event.target.value as EmploymentType
                    )
                  }
                  className="input"
                >
                  <option value="">
                    Select employment type
                  </option>

                  <option value="FULL_TIME">
                    Full Time
                  </option>

                  <option value="PART_TIME">
                    Part Time
                  </option>

                  <option value="CONTRACT">
                    Contract
                  </option>

                  <option value="INTERNSHIP">
                    Internship
                  </option>

                  <option value="FREELANCE">
                    Freelance
                  </option>
                </select>
              </FormField>

              {/* SALARY */}

              <FormField label="Salary">
                <input
                  value={salary}
                  onChange={(event) =>
                    setSalary(event.target.value)
                  }
                  placeholder="e.g. ₹8 - ₹12 LPA"
                  className="input"
                />
              </FormField>

              {/* STATUS */}

              <FormField label="Status">
                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target.value as
                        | "ACTIVE"
                        | "CLOSED"
                        | "DRAFT"
                    )
                  }
                  className="input"
                >
                  <option value="ACTIVE">
                    Active
                  </option>

                  <option value="DRAFT">
                    Draft
                  </option>

                  <option value="CLOSED">
                    Closed
                  </option>
                </select>
              </FormField>
            </div>
          </section>

          {/* DESCRIPTION */}

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <div className="mb-6">
              <h2 className="text-lg font-semibold">
                Job Details
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Provide enough detail for AI candidate matching.
              </p>
            </div>

            <div className="space-y-5">

              {/* DESCRIPTION */}

              <FormField
                label="Job Description"
                required
              >
                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Describe the role, responsibilities, team, and what the candidate will work on..."
                  rows={7}
                  className="input resize-none"
                />

                <p className="mt-2 text-xs text-zinc-600">
                  Minimum 20 characters
                </p>
              </FormField>

              {/* REQUIREMENTS */}

              <FormField
                label="Requirements"
                required
              >
                <textarea
                  value={requirements}
                  onChange={(event) =>
                    setRequirements(event.target.value)
                  }
                  placeholder="Describe experience, education, qualifications, and other requirements..."
                  rows={6}
                  className="input resize-none"
                />

                <p className="mt-2 text-xs text-zinc-600">
                  Minimum 10 characters
                </p>
              </FormField>
            </div>
          </section>

          {/* SKILLS */}

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <div className="mb-6">
              <h2 className="text-lg font-semibold">
                Required Skills
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Add the skills that candidates should have.
              </p>
            </div>

            <div className="flex gap-3">

              <input
                value={skillInput}
                onChange={(event) =>
                  setSkillInput(event.target.value)
                }
                onKeyDown={handleSkillKeyDown}
                placeholder="e.g. React"
                className="input flex-1"
              />

              <button
                type="button"
                onClick={addSkill}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
              >
                <Plus size={17} />
                Add
              </button>
            </div>

            {/* SKILL LIST */}

            {requiredSkills.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {requiredSkills.map((skill) => (
                  <div
                    key={skill}
                    className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-sm text-violet-300"
                  >
                    {skill}

                    <button
                      type="button"
                      onClick={() =>
                        removeSkill(skill)
                      }
                      className="rounded-full text-violet-400 transition hover:text-white"
                      aria-label={`Remove ${skill}`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-zinc-600">
                No skills added yet.
              </p>
            )}
          </section>

          {/* ACTIONS */}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <Link
              href="/dashboard/jobs"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />

                  Creating...
                </>
              ) : (
                <>
                  <Briefcase size={17} />

                  Create Job
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* INPUT STYLES */}

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.03);
          padding: 0.75rem 1rem;
          color: white;
          outline: none;
          transition: 150ms ease;
        }

        .input::placeholder {
          color: rgb(82 82 91);
        }

        .input:focus {
          border-color: rgba(139, 92, 246, 0.5);
          background: rgba(255, 255, 255, 0.04);
        }

        select.input {
          cursor: pointer;
        }

        select.input option {
          background: #0d0d12;
          color: white;
        }
      `}</style>
    </main>
  );
}

/* ============================================================
   FORM FIELD
============================================================ */

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

function FormField({
  label,
  required = false,
  children,
}: FormFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-300">
        {label}

        {required && (
          <span className="ml-1 text-violet-400">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}