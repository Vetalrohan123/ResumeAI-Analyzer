"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  Edit3,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

import {
  createJob,
  deleteJob,
  getJobs,
  updateJob,
  updateJobStatus,
} from "@/services/job.api";

import type {
  CreateJobInput,
  Job,
  UpdateJobInput,
} from "@/types/job";

/* ============================================================
   TYPES
============================================================ */

type JobStatus =
  | "ACTIVE"
  | "CLOSED"
  | "DRAFT";

type FilterStatus =
  | "ALL"
  | JobStatus;

interface JobFormData {
  title: string;
  company: string;
  location: string;
  employmentType: string;
  description: string;
  requirements: string;
  salary: string;
  requiredSkills: string;
  status: JobStatus;
}

/* ============================================================
   INITIAL FORM
============================================================ */

const initialForm: JobFormData = {
  title: "",
  company: "",
  location: "",
  employmentType: "",
  description: "",
  requirements: "",
  salary: "",
  requiredSkills: "",
  status: "ACTIVE",
};

/* ============================================================
   PAGE
============================================================ */

export default function JobsPage() {
  /* ==========================================================
     STATE
  ========================================================== */

  const [jobs, setJobs] = useState<Job[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [statusUpdatingId, setStatusUpdatingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<FilterStatus>("ALL");

  const [showModal, setShowModal] =
    useState(false);

  const [editingJob, setEditingJob] =
    useState<Job | null>(null);

  const [form, setForm] =
    useState<JobFormData>(initialForm);

  const [formErrors, setFormErrors] =
    useState<Record<string, string>>({});

  const [deleteTarget, setDeleteTarget] =
    useState<Job | null>(null);

  /* ==========================================================
     LOAD JOBS
  ========================================================== */

  const loadJobs = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const data = await getJobs();

        setJobs(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (err) {
        console.error(
          "[JOBS PAGE] Load error:",
          err
        );

        const message =
          err instanceof Error
            ? err.message
            : "Failed to load jobs.";

        setError(message);

        if (
          message
            .toLowerCase()
            .includes("session has expired")
        ) {
          window.location.href =
            "/login";
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  /* ==========================================================
     SUCCESS MESSAGE
  ========================================================== */

  const showSuccess = (
    message: string
  ) => {
    setSuccess(message);

    window.setTimeout(() => {
      setSuccess("");
    }, 3000);
  };

  /* ==========================================================
     FORM CHANGE
  ========================================================== */

  const updateForm = (
    field: keyof JobFormData,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setFormErrors((current) => {
      const next = {
        ...current,
      };

      delete next[field];

      return next;
    });
  };

  /* ==========================================================
     OPEN CREATE MODAL
  ========================================================== */

  const handleCreateClick = () => {
    setEditingJob(null);
    setForm(initialForm);
    setFormErrors({});
    setError("");
    setShowModal(true);
  };

  /* ==========================================================
     OPEN EDIT MODAL
  ========================================================== */

  const handleEdit = (
    job: Job
  ) => {
    setEditingJob(job);

    setForm({
      title: job.title || "",
      company: job.company || "",
      location: job.location || "",
      employmentType:
        job.employmentType || "",
      description:
        job.description || "",
      requirements:
        job.requirements || "",
      salary: job.salary || "",
      requiredSkills:
        job.requiredSkills?.join(", ") ||
        "",
      status:
        job.status || "DRAFT",
    });

    setFormErrors({});
    setError("");
    setShowModal(true);
  };

  /* ==========================================================
     CLOSE MODAL
  ========================================================== */

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingJob(null);
    setForm(initialForm);
    setFormErrors({});
  };

  /* ==========================================================
     VALIDATE FORM
  ========================================================== */

  const validateForm = () => {
    const errors: Record<
      string,
      string
    > = {};

    if (!form.title.trim()) {
      errors.title =
        "Job title is required.";
    } else if (
      form.title.trim().length < 2
    ) {
      errors.title =
        "Job title must be at least 2 characters.";
    }

    if (!form.company.trim()) {
      errors.company =
        "Company name is required.";
    } else if (
      form.company.trim().length < 2
    ) {
      errors.company =
        "Company name must be at least 2 characters.";
    }

    if (!form.description.trim()) {
      errors.description =
        "Job description is required.";
    } else if (
      form.description.trim().length < 20
    ) {
      errors.description =
        "Job description must be at least 20 characters.";
    }

    if (!form.requirements.trim()) {
      errors.requirements =
        "Requirements are required.";
    } else if (
      form.requirements.trim().length < 10
    ) {
      errors.requirements =
        "Requirements must be at least 10 characters.";
    }

    const skills = form.requiredSkills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    if (skills.length === 0) {
      errors.requiredSkills =
        "Add at least one required skill.";
    }

    setFormErrors(errors);

    return (
      Object.keys(errors).length === 0
    );
  };

  /* ==========================================================
     SUBMIT JOB
  ========================================================== */

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const requiredSkills =
        form.requiredSkills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean);

      if (editingJob) {
        const input: UpdateJobInput = {
          title: form.title.trim(),
          company: form.company.trim(),
          location:
            form.location.trim() || undefined,
          employmentType:
            form.employmentType.trim() ||
            undefined,
          description:
            form.description.trim(),
          requirements:
            form.requirements.trim(),
          salary:
            form.salary.trim() || undefined,
          requiredSkills,
          status: form.status,
        };

        const updated =
          await updateJob(
            editingJob.id,
            input
          );

        setJobs((current) =>
          current.map((job) =>
            job.id === editingJob.id
              ? updated
              : job
          )
        );

        showSuccess(
          "Job updated successfully."
        );
      } else {
        const input: CreateJobInput = {
          title: form.title.trim(),
          company: form.company.trim(),
          location:
            form.location.trim() || undefined,
          employmentType:
            form.employmentType.trim() ||
            undefined,
          description:
            form.description.trim(),
          requirements:
            form.requirements.trim(),
          salary:
            form.salary.trim() || undefined,
          requiredSkills,
          status: form.status,
        };

        const created =
          await createJob(input);

        setJobs((current) => [
          created,
          ...current,
        ]);

        showSuccess(
          "Job created successfully."
        );
      }

      closeModal();
    } catch (err) {
      console.error(
        "[JOBS PAGE] Save error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save job."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ==========================================================
     DELETE JOB
  ========================================================== */

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setDeletingId(
        deleteTarget.id
      );

      setError("");

      await deleteJob(
        deleteTarget.id
      );

      setJobs((current) =>
        current.filter(
          (job) =>
            job.id !== deleteTarget.id
        )
      );

      showSuccess(
        "Job deleted successfully."
      );

      setDeleteTarget(null);
    } catch (err) {
      console.error(
        "[JOBS PAGE] Delete error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete job."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* ==========================================================
     UPDATE STATUS
  ========================================================== */

  const handleStatusChange = async (
    job: Job,
    status: JobStatus
  ) => {
    try {
      setStatusUpdatingId(
        job.id
      );

      setError("");

      const updated =
        await updateJobStatus(
          job.id,
          status
        );

      setJobs((current) =>
        current.map((item) =>
          item.id === job.id
            ? updated
            : item
        )
      );

      showSuccess(
        "Job status updated."
      );
    } catch (err) {
      console.error(
        "[JOBS PAGE] Status error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update status."
      );
    } finally {
      setStatusUpdatingId(null);
    }
  };

  /* ==========================================================
     FILTER JOBS
  ========================================================== */

  const filteredJobs = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesSearch =
        !query ||
        job.title
          ?.toLowerCase()
          .includes(query) ||
        job.company
          ?.toLowerCase()
          .includes(query) ||
        job.location
          ?.toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        job.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    jobs,
    search,
    statusFilter,
  ]);

  /* ==========================================================
     STATISTICS
  ========================================================== */

  const activeJobs = jobs.filter(
    (job) =>
      job.status === "ACTIVE"
  ).length;

  const draftJobs = jobs.filter(
    (job) =>
      job.status === "DRAFT"
  ).length;

  const closedJobs = jobs.filter(
    (job) =>
      job.status === "CLOSED"
  ).length;

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <main className="min-h-screen bg-[#07070a] text-white">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">

        {/* ==================================================
            HEADER
        ================================================== */}

        <section className="mb-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>
              <div className="mb-3 flex items-center gap-2 text-sm text-violet-400">
                <Briefcase size={16} />
                Job Management
              </div>

              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Manage Jobs
              </h1>

              <p className="mt-2 text-sm text-zinc-400 md:text-base">
                Create, manage and track
                your job openings.
              </p>
            </div>

            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={() =>
                  loadJobs(true)
                }
                disabled={
                  loading ||
                  refreshing
                }
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh
              </button>

              <button
                type="button"
                onClick={
                  handleCreateClick
                }
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
              >
                <Plus size={17} />
                Create Job
              </button>

            </div>
          </div>
        </section>

        {/* ==================================================
            SUCCESS
        ================================================== */}

        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            <CheckCircle2 size={18} />
            {success}
          </div>
        )}

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-300">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <div className="flex-1">
              <p className="font-semibold">
                Something went wrong
              </p>

              <p className="mt-1 text-red-300/80">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="text-red-300/70 hover:text-red-300"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* ==================================================
            STATS
        ================================================== */}

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            label="Total Jobs"
            value={jobs.length}
          />

          <StatCard
            label="Active"
            value={activeJobs}
            positive
          />

          <StatCard
            label="Draft"
            value={draftJobs}
          />

          <StatCard
            label="Closed"
            value={closedJobs}
          />

        </section>

        {/* ==================================================
            SEARCH / FILTER
        ================================================== */}

        <section className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">

          <div className="flex flex-col gap-3 md:flex-row">

            <div className="relative flex-1">

              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search jobs, companies or locations..."
                className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-500/50"
              />

            </div>

            <div className="relative">

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target
                      .value as FilterStatus
                  )
                }
                className="w-full appearance-none rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 pr-10 text-sm text-white outline-none md:w-44"
              >
                <option value="ALL">
                  All Status
                </option>

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

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
              />

            </div>

          </div>
        </section>

        {/* ==================================================
            LOADING
        ================================================== */}

        {loading ? (
          <LoadingState />
        ) : filteredJobs.length === 0 ? (
          <EmptyState
            hasFilters={
              Boolean(search.trim()) ||
              statusFilter !== "ALL"
            }
            onCreate={
              handleCreateClick
            }
          />
        ) : (
          <section className="space-y-4">

            {filteredJobs.map(
              (job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onEdit={handleEdit}
                  onDelete={(item) =>
                    setDeleteTarget(item)
                  }
                  onStatusChange={
                    handleStatusChange
                  }
                  deleting={
                    deletingId === job.id
                  }
                  updatingStatus={
                    statusUpdatingId ===
                    job.id
                  }
                />
              )
            )}

          </section>
        )}
      </div>

      {/* ======================================================
          CREATE / EDIT MODAL
      ====================================================== */}

      {showModal && (
        <JobModal
          editingJob={editingJob}
          form={form}
          errors={formErrors}
          saving={saving}
          onChange={updateForm}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      )}

      {/* ======================================================
          DELETE MODAL
      ====================================================== */}

      {deleteTarget && (
        <DeleteModal
          job={deleteTarget}
          deleting={
            deletingId ===
            deleteTarget.id
          }
          onCancel={() =>
            setDeleteTarget(null)
          }
          onConfirm={
            handleDelete
          }
        />
      )}
    </main>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  label,
  value,
  positive = false,
}: {
  label: string;
  value: number;
  positive?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-sm text-zinc-500">
        {label}
      </p>

      <p
        className={`mt-2 text-3xl font-bold ${
          positive
            ? "text-emerald-400"
            : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   LOADING STATE
============================================================ */

function LoadingState() {
  return (
    <section className="space-y-4">
      {Array.from({
        length: 4,
      }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-2xl border border-white/10 bg-white/[0.03] p-6"
        >
          <div className="h-5 w-1/3 rounded bg-white/10" />

          <div className="mt-4 h-4 w-1/2 rounded bg-white/5" />

          <div className="mt-6 h-10 w-full rounded bg-white/5" />
        </div>
      ))}
    </section>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState({
  hasFilters,
  onCreate,
}: {
  hasFilters: boolean;
  onCreate: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-20 text-center">

      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10">
        <Briefcase
          size={28}
          className="text-violet-400"
        />
      </div>

      <h3 className="mt-5 text-lg font-semibold">
        {hasFilters
          ? "No jobs found"
          : "No jobs yet"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
        {hasFilters
          ? "Try changing your search or status filter."
          : "Create your first job opening to start matching candidates."}
      </p>

      {!hasFilters && (
        <button
          type="button"
          onClick={onCreate}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500"
        >
          <Plus size={16} />
          Create Job
        </button>
      )}

    </div>
  );
}

/* ============================================================
   JOB CARD
============================================================ */

function JobCard({
  job,
  onEdit,
  onDelete,
  onStatusChange,
  deleting,
  updatingStatus,
}: {
  job: Job;
  onEdit: (job: Job) => void;
  onDelete: (job: Job) => void;
  onStatusChange: (
    job: Job,
    status: JobStatus
  ) => void;
  deleting: boolean;
  updatingStatus: boolean;
}) {
  const status =
    job.status || "DRAFT";

  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/15 hover:bg-white/[0.045]">

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

        <div className="min-w-0">

          <div className="flex flex-wrap items-center gap-3">

            <h2 className="text-xl font-semibold text-white">
              {job.title ||
                "Untitled Job"}
            </h2>

            <StatusBadge
              status={status}
            />

          </div>

          <p className="mt-2 text-sm text-zinc-400">
            {job.company ||
              "Unknown Company"}

            {job.location
              ? ` • ${job.location}`
              : ""}
          </p>

          {job.description && (
            <p className="mt-4 line-clamp-2 max-w-3xl text-sm leading-6 text-zinc-500">
              {job.description}
            </p>
          )}

          {job.requiredSkills &&
            job.requiredSkills
              .length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {job.requiredSkills
                  .slice(0, 8)
                  .map(
                    (skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-xs text-violet-300"
                      >
                        {skill}
                      </span>
                    )
                  )}
              </div>
            )}

        </div>

        <div className="flex flex-wrap items-center gap-2">

          <div className="relative">

            <select
              value={status}
              disabled={
                updatingStatus
              }
              onChange={(event) =>
                onStatusChange(
                  job,
                  event.target
                    .value as JobStatus
                )
              }
              className="appearance-none rounded-lg border border-white/10 bg-[#0d0d12] px-3 py-2 pr-8 text-xs text-zinc-200 outline-none disabled:opacity-50"
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

            <ChevronDown
              size={13}
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500"
            />

          </div>

          <button
            type="button"
            onClick={() =>
              onEdit(job)
            }
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-white/[0.08]"
          >
            <Edit3 size={14} />
            Edit
          </button>

          <button
            type="button"
            disabled={deleting}
            onClick={() =>
              onDelete(job)
            }
            className="inline-flex items-center gap-2 rounded-lg border border-red-500/10 bg-red-500/5 px-3 py-2 text-xs font-medium text-red-300 hover:bg-red-500/10 disabled:opacity-50"
          >
            {deleting ? (
              <Loader2
                size={14}
                className="animate-spin"
              />
            ) : (
              <Trash2 size={14} />
            )}

            Delete
          </button>

        </div>
      </div>

      <div className="mt-6 grid gap-4 border-t border-white/5 pt-5 sm:grid-cols-3">

        <InfoItem
          label="Employment"
          value={
            job.employmentType ||
            "Not specified"
          }
        />

        <InfoItem
          label="Salary"
          value={
            job.salary ||
            "Not specified"
          }
        />

        <InfoItem
          label="Skills"
          value={`${job.requiredSkills?.length || 0} required`}
        />

      </div>
    </article>
  );
}

/* ============================================================
   INFO ITEM
============================================================ */

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-zinc-600">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-zinc-300">
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({
  status,
}: {
  status: JobStatus;
}) {
  const styles = {
    ACTIVE:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    DRAFT:
      "border-amber-500/20 bg-amber-500/10 text-amber-300",
    CLOSED:
      "border-red-500/20 bg-red-500/10 text-red-300",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

/* ============================================================
   JOB MODAL
============================================================ */

function JobModal({
  editingJob,
  form,
  errors,
  saving,
  onChange,
  onClose,
  onSubmit,
}: {
  editingJob: Job | null;
  form: JobFormData;
  errors: Record<string, string>;
  saving: boolean;
  onChange: (
    field: keyof JobFormData,
    value: string
  ) => void;
  onClose: () => void;
  onSubmit: (
    event: React.FormEvent
  ) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0d0d12] shadow-2xl">

        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0d0d12] px-6 py-5">

          <div>
            <h2 className="text-xl font-semibold">
              {editingJob
                ? "Edit Job"
                : "Create Job"}
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              {editingJob
                ? "Update the job details."
                : "Add a new job opening."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-white"
          >
            <X size={20} />
          </button>

        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-5 p-6"
        >

          <div className="grid gap-5 md:grid-cols-2">

            <FormField
              label="Job Title"
              required
              error={errors.title}
            >
              <input
                value={form.title}
                onChange={(event) =>
                  onChange(
                    "title",
                    event.target.value
                  )
                }
                placeholder="Senior Full Stack Developer"
                className={inputClass(
                  Boolean(
                    errors.title
                  )
                )}
              />
            </FormField>

            <FormField
              label="Company"
              required
              error={errors.company}
            >
              <input
                value={form.company}
                onChange={(event) =>
                  onChange(
                    "company",
                    event.target.value
                  )
                }
                placeholder="Acme Inc."
                className={inputClass(
                  Boolean(
                    errors.company
                  )
                )}
              />
            </FormField>

            <FormField
              label="Location"
              error={errors.location}
            >
              <input
                value={form.location}
                onChange={(event) =>
                  onChange(
                    "location",
                    event.target.value
                  )
                }
                placeholder="Pune, India / Remote"
                className={inputClass(
                  Boolean(
                    errors.location
                  )
                )}
              />
            </FormField>

            <FormField
              label="Employment Type"
              error={errors.employmentType}
            >
              <input
                value={
                  form.employmentType
                }
                onChange={(event) =>
                  onChange(
                    "employmentType",
                    event.target.value
                  )
                }
                placeholder="Full-time"
                className={inputClass(
                  Boolean(
                    errors.employmentType
                  )
                )}
              />
            </FormField>

            <FormField
              label="Salary"
              error={errors.salary}
            >
              <input
                value={form.salary}
                onChange={(event) =>
                  onChange(
                    "salary",
                    event.target.value
                  )
                }
                placeholder="₹8L - ₹15L"
                className={inputClass(
                  Boolean(
                    errors.salary
                  )
                )}
              />
            </FormField>

            <FormField
              label="Status"
              required
              error={errors.status}
            >
              <select
                value={form.status}
                onChange={(event) =>
                  onChange(
                    "status",
                    event.target.value
                  )
                }
                className={inputClass(
                  Boolean(
                    errors.status
                  )
                )}
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

          <FormField
            label="Job Description"
            required
            error={errors.description}
          >
            <textarea
              value={form.description}
              onChange={(event) =>
                onChange(
                  "description",
                  event.target.value
                )
              }
              rows={5}
              placeholder="Describe the role, responsibilities and expectations..."
              className={`${inputClass(
                Boolean(
                  errors.description
                )
              )} resize-none`}
            />
          </FormField>

          <FormField
            label="Requirements"
            required
            error={errors.requirements}
          >
            <textarea
              value={form.requirements}
              onChange={(event) =>
                onChange(
                  "requirements",
                  event.target.value
                )
              }
              rows={4}
              placeholder="List the required qualifications and experience..."
              className={`${inputClass(
                Boolean(
                  errors.requirements
                )
              )} resize-none`}
            />
          </FormField>

          <FormField
            label="Required Skills"
            required
            error={
              errors.requiredSkills
            }
            hint="Separate skills with commas."
          >
            <input
              value={
                form.requiredSkills
              }
              onChange={(event) =>
                onChange(
                  "requiredSkills",
                  event.target.value
                )
              }
              placeholder="React, Node.js, TypeScript, PostgreSQL"
              className={inputClass(
                Boolean(
                  errors.requiredSkills
                )
              )}
            />
          </FormField>

          <div className="flex justify-end gap-3 border-t border-white/10 pt-5">

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/[0.08] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving && (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              )}

              {saving
                ? "Saving..."
                : editingJob
                ? "Update Job"
                : "Create Job"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}

/* ============================================================
   FORM FIELD
============================================================ */

function FormField({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-300">
        {label}

        {required && (
          <span className="ml-1 text-red-400">
            *
          </span>
        )}
      </label>

      {children}

      {hint && !error && (
        <p className="mt-1.5 text-xs text-zinc-600">
          {hint}
        </p>
      )}

      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
}

/* ============================================================
   INPUT CLASS
============================================================ */

function inputClass(
  hasError: boolean
) {
  return `w-full rounded-xl border ${
    hasError
      ? "border-red-500/40"
      : "border-white/10"
  } bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-500/50`;
}

/* ============================================================
   DELETE MODAL
============================================================ */

function DeleteModal({
  job,
  deleting,
  onCancel,
  onConfirm,
}: {
  job: Job;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d0d12] p-6 shadow-2xl">

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
          <Trash2
            size={22}
            className="text-red-400"
          />
        </div>

        <h2 className="mt-5 text-lg font-semibold">
          Delete this job?
        </h2>

        <p className="mt-2 text-sm leading-6 text-zinc-500">
          You are about to delete{" "}
          <span className="font-medium text-zinc-300">
            {job.title}
          </span>
          . This action cannot be undone.
        </p>

        <div className="mt-6 flex justify-end gap-3">

          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/[0.08]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
          >
            {deleting ? (
              <Loader2
                size={15}
                className="animate-spin"
              />
            ) : (
              <Trash2 size={15} />
            )}

            {deleting
              ? "Deleting..."
              : "Delete Job"}
          </button>

        </div>
      </div>
    </div>
  );
}