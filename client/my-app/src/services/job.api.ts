import {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
} from "@/lib/api/client";

import type {
  Job,
  CreateJobInput,
  UpdateJobInput,
  JobStatus,
} from "@/types/job";

/* ============================================================
   RESPONSE TYPES
============================================================ */

interface JobsResponse {
  success?: boolean;
  message?: string;
  data?: Job[];
}

interface JobResponse {
  success?: boolean;
  message?: string;
  data?: Job;
}

/* ============================================================
   HELPER TYPES
============================================================ */

type JobsApiResponse =
  | JobsResponse
  | Job[];

type JobApiResponse =
  | JobResponse
  | Job;

/* ============================================================
   GET JOBS
   GET /api/jobs
============================================================ */

export async function getJobs(): Promise<Job[]> {
  const response =
    await apiGet<JobsApiResponse>("/jobs");

  /*
   * Backend response:
   *
   * {
   *   success: true,
   *   data: [...]
   * }
   */

  if (
    response &&
    typeof response === "object" &&
    !Array.isArray(response) &&
    "data" in response &&
    Array.isArray(response.data)
  ) {
    return response.data;
  }

  /*
   * Also support:
   *
   * [...]
   */

  if (Array.isArray(response)) {
    return response;
  }

  return [];
}

/* ============================================================
   GET SINGLE JOB
   GET /api/jobs/:id
============================================================ */

export async function getJob(
  id: string
): Promise<Job> {
  if (!id?.trim()) {
    throw new Error(
      "Job ID is required."
    );
  }

  const response =
    await apiGet<JobApiResponse>(
      `/jobs/${encodeURIComponent(id)}`
    );

  /*
   * Backend response:
   *
   * {
   *   success: true,
   *   data: {...}
   * }
   */

  if (
    response &&
    typeof response === "object" &&
    !Array.isArray(response) &&
    "data" in response &&
    response.data
  ) {
    return response.data;
  }

  /*
   * Also support:
   *
   * {...job}
   */

  return response as Job;
}

/* ============================================================
   CREATE JOB
   POST /api/jobs
============================================================ */

export async function createJob(
  input: CreateJobInput
): Promise<Job> {
  if (!input) {
    throw new Error(
      "Job information is required."
    );
  }

  const response =
    await apiPost<JobApiResponse>(
      "/jobs",
      input
    );

  /*
   * Backend response:
   *
   * {
   *   success: true,
   *   data: {...}
   * }
   */

  if (
    response &&
    typeof response === "object" &&
    !Array.isArray(response) &&
    "data" in response &&
    response.data
  ) {
    return response.data;
  }

  return response as Job;
}

/* ============================================================
   UPDATE JOB
   PUT /api/jobs/:id
============================================================ */

export async function updateJob(
  id: string,
  input: UpdateJobInput
): Promise<Job> {
  if (!id?.trim()) {
    throw new Error(
      "Job ID is required."
    );
  }

  if (!input) {
    throw new Error(
      "Update information is required."
    );
  }

  const response =
    await apiPut<JobApiResponse>(
      `/jobs/${encodeURIComponent(id)}`,
      input
    );

  /*
   * Backend response:
   *
   * {
   *   success: true,
   *   data: {...}
   * }
   */

  if (
    response &&
    typeof response === "object" &&
    !Array.isArray(response) &&
    "data" in response &&
    response.data
  ) {
    return response.data;
  }

  return response as Job;
}

/* ============================================================
   UPDATE JOB STATUS
   PUT /api/jobs/:id
============================================================ */

export async function updateJobStatus(
  id: string,
  status: JobStatus
): Promise<Job> {
  if (!id?.trim()) {
    throw new Error(
      "Job ID is required."
    );
  }

  const validStatuses: JobStatus[] = [
    "ACTIVE",
    "CLOSED",
    "DRAFT",
  ];

  if (!validStatuses.includes(status)) {
    throw new Error(
      "Invalid job status."
    );
  }

  return updateJob(
    id,
    {
      status,
    }
  );
}

/* ============================================================
   DELETE JOB
   DELETE /api/jobs/:id
============================================================ */

export async function deleteJob(
  id: string
): Promise<void> {
  if (!id?.trim()) {
    throw new Error(
      "Job ID is required."
    );
  }

  await apiDelete(
    `/jobs/${encodeURIComponent(id)}`
  );
}