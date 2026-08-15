/* ============================================================
   JOB TYPES
============================================================ */

/**
 * Available job statuses.
 */
export type JobStatus =
  | "ACTIVE"
  | "CLOSED"
  | "DRAFT";

/* ============================================================
   JOB
============================================================ */

export interface Job {
  id: string;

  title: string;

  company: string;

  location?: string;

  employmentType?: string;

  description: string;

  requirements: string;

  salary?: string;

  requiredSkills: string[];

  status: JobStatus;

  createdAt?: string;

  updatedAt?: string;
}

/* ============================================================
   CREATE JOB INPUT
============================================================ */

export interface CreateJobInput {
  title: string;

  company: string;

  location?: string;

  employmentType?: string;

  description: string;

  requirements: string;

  salary?: string;

  requiredSkills: string[];

  status?: JobStatus;
}

/* ============================================================
   UPDATE JOB INPUT
============================================================ */

export interface UpdateJobInput {
  title?: string;

  company?: string;

  location?: string;

  employmentType?: string;

  description?: string;

  requirements?: string;

  salary?: string;

  requiredSkills?: string[];

  status?: JobStatus;
}

/* ============================================================
   JOBS API RESPONSE
============================================================ */

export interface JobsResponse {
  success: boolean;

  message?: string;

  data?: Job[];
}

/* ============================================================
   SINGLE JOB API RESPONSE
============================================================ */

export interface JobResponse {
  success: boolean;

  message?: string;

  data?: Job;
}

/* ============================================================
   DELETE JOB RESPONSE
============================================================ */

export interface DeleteJobResponse {
  success: boolean;

  message?: string;
}

/* ============================================================
   JOB STATUS UPDATE INPUT
============================================================ */

export interface UpdateJobStatusInput {
  status: JobStatus;
}