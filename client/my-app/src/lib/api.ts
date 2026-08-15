"use client";

/* ==========================================================================
   API CONFIG
   ========================================================================== */

const DEFAULT_API_URL = "http://localhost:5000/api";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  DEFAULT_API_URL
).replace(/\/+$/, "");

console.log("[API] Base URL:", API_URL);

/* ==========================================================================
   GENERIC API RESPONSE
   ========================================================================== */

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  user?: User;
  error?: string;
}

/* ==========================================================================
   USER
   ========================================================================== */

export interface User {
  id: string;
  name?: string | null;
  email: string;
  role?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/* ==========================================================================
   JOB
   ========================================================================== */

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string;
  requiredSkills: string[];
  location?: string | null;
  employmentType?: string | null;
  salary?: string | null;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  createdById?: string;
}

export interface CreateJobInput {
  title: string;
  company: string;
  description: string;
  requirements: string;
  requiredSkills: string[];
  location?: string;
  employmentType?: string;
  salary?: string;
}

export interface UpdateJobInput {
  title?: string;
  company?: string;
  description?: string;
  requirements?: string;
  requiredSkills?: string[];
  location?: string;
  employmentType?: string;
  salary?: string;
  status?: "ACTIVE" | "CLOSED" | "DRAFT";
}

/* ==========================================================================
   RESUME
   ========================================================================== */

export interface Resume {
  id: string;

  uploadedById?: string;

  candidateName: string | null;
  candidateEmail: string | null;
  candidatePhone: string | null;

  fileName: string;
  originalName?: string;
  storedName?: string;

  fileSize?: number;
  mimeType?: string;

  extractedText?: string;

  aiScore: number;

  summary: string;

  skills: unknown[];
  experience: unknown[];
  education: unknown[];
  projects: unknown[];
  certifications: unknown[];

  strengths: string[];
  weaknesses: string[];
  suggestions: string[];

  status: string;

  analysisStatus?: string;

  atsScore?: number | null;

  atsAnalysis?: {
    score?: number;
    summary?: string;
    strengths?: string[];
    weaknesses?: string[];
    recommendations?: string[];
  };

  contact?: {
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
  };

  parsedData?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    summary?: string;
    skills?: string[];
    experience?: unknown[];
    education?: unknown[];
  };

  createdAt?: string;
  updatedAt?: string;
}

/* ==========================================================================
   RESUME STATS
   ========================================================================== */

export interface ResumeStats {
  total: number;
  analyzed: number;
  processing: number;
  failed: number;
  averageScore: number;
}

/* ==========================================================================
   RESUME BUILDER
   ========================================================================== */

export interface ResumeBuilderExperience {
  id?: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

export interface ResumeBuilderEducation {
  id?: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface ResumeBuilderProject {
  id?: string;
  name: string;
  description?: string;
  technologies?: string[];
  url?: string;
  github?: string;
}

export interface ResumeBuilderCertification {
  id?: string;
  name: string;
  issuer?: string;
  date?: string;
  url?: string;
}

export interface ResumeBuilderInput {
  title: string;

  candidateName?: string;
  candidateEmail?: string;
  candidatePhone?: string;

  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;

  summary?: string;

  skills?: string[];

  experience?: ResumeBuilderExperience[];
  education?: ResumeBuilderEducation[];
  projects?: ResumeBuilderProject[];
  certifications?: ResumeBuilderCertification[];

  languages?: string[];
  achievements?: string[];
}

export interface ResumeBuilder
  extends ResumeBuilderInput {
  id: string;

  userId?: string;
  createdById?: string;

  createdAt?: string;
  updatedAt?: string;
}

/* ==========================================================================
   ANALYSIS
   ========================================================================== */

export interface AnalysisResult {
  id: string;

  resumeId: string;
  jobId: string;

  matchScore: number;

  matchedSkills: string[];
  missingSkills: string[];

  strengths: string[];
  weaknesses: string[];

  recommendations: string[];

  hiringRecommendation: string;

  createdAt: string;
  updatedAt?: string;

  resume: AnalysisResume;
  job: AnalysisJob;
}

export interface AnalysisResume {
  id: string;

  fileName: string;
  storedName?: string;

  fileSize?: number;
  mimeType?: string;

  extractedText?: string;

  candidateName: string | null;
  candidateEmail: string | null;
  candidatePhone: string | null;

  aiScore: number;

  summary: string;

  skills: unknown[];
  experience: unknown[];
  education: unknown[];
  projects: unknown[];
  certifications: unknown[];

  strengths: string[];
  weaknesses: string[];
  suggestions: string[];

  status: string;

  createdAt?: string;
  updatedAt?: string;

  uploadedById?: string;
}

export interface AnalysisJob {
  id: string;

  title: string;
  company: string;

  location: string | null;
  employmentType: string | null;
  salary?: string | null;

  description: string;
  requirements: string;

  requiredSkills: string[];

  status?: string;

  createdAt?: string;
  updatedAt?: string;

  createdById?: string;
}

export interface RecentAnalysis {
  id: string;

  resumeId?: string;
  jobId?: string;

  matchScore: number;

  hiringRecommendation: string;

  createdAt: string;

  resume: {
    id: string;
    fileName: string;
    candidateName: string | null;
  };

  job: {
    id: string;
    title: string;
    company: string;
  };
}

/* ==========================================================================
   HISTORY
   ========================================================================== */

export interface HistoryAnalysis {
  id: string;

  resumeId?: string;
  jobId?: string;

  matchScore: number;

  matchedSkills: string[];
  missingSkills: string[];

  strengths: string[];
  weaknesses: string[];

  recommendations: string[];

  hiringRecommendation: string;

  createdAt: string;
  updatedAt?: string;

  resume?: {
    id: string;
    fileName: string;
    candidateName?: string | null;
  };

  job?: {
    id: string;
    title: string;
    company: string;
  };
}

/* ==========================================================================
   DASHBOARD
   ========================================================================== */

export interface DashboardStats {
  totalResumes: number;
  totalAnalyses: number;
  totalJobs: number;
  averageMatchScore: number;
  strongMatches: number;
}

export interface DashboardData {
  stats: DashboardStats;

  latestAnalysis: AnalysisResult | null;

  recentAnalyses: RecentAnalysis[];
}

/* ==========================================================================
   AI RESUME TYPES
   ========================================================================== */

export interface AIResumeAnalysis {
  score: number;

  atsScore?: number;

  summary: string;

  strengths: string[];
  weaknesses: string[];
  suggestions: string[];

  missingSkills?: string[];
  recommendedSkills?: string[];

  keywords?: string[];

  formattingIssues?: string[];

  experienceScore?: number;
  skillsScore?: number;
  educationScore?: number;
  projectsScore?: number;

  recommendations?: string[];
}

export interface AIResumeScore {
  score: number;

  atsScore?: number;

  explanation?: string;

  strengths?: string[];
  weaknesses?: string[];
}

export interface AIResumeSummary {
  summary: string;

  professionalSummary?: string;

  keywords?: string[];
}

export interface AISkillSuggestions {
  skills: string[];

  missingSkills?: string[];
  recommendedSkills?: string[];

  explanation?: string;
}

export interface AIExperienceImprovement {
  original: string;
  improved: string;

  bulletPoints?: string[];
  keywords?: string[];
  suggestions?: string[];
}

export interface AIProjectImprovement {
  original: string;
  improved: string;

  technologies?: string[];
  bulletPoints?: string[];
  suggestions?: string[];
}

export interface AIResumeImprovement {
  improvedResume?: string;

  summary?: string;

  experience?: string[];
  skills?: string[];
  projects?: string[];

  suggestions?: string[];
  changes?: string[];

  atsScore?: number;
}

export interface AIJobMatch {
  matchScore: number;

  matchedSkills: string[];
  missingSkills: string[];

  strengths: string[];
  weaknesses: string[];

  recommendations: string[];

  hiringRecommendation: string;
}

/* ==========================================================================
   AI INPUT TYPES
   ========================================================================== */

export interface AIResumeTextInput {
  resumeText: string;
}

export interface AIExperienceInput {
  experience: string;
  jobTitle?: string;
}

export interface AIProjectInput {
  project: string;
  technologies?: string[];
}

export interface AIJobMatchInput {
  resumeId?: string;
  jobId?: string;

  resumeText?: string;
  jobDescription?: string;
}

/* ==========================================================================
   API ERROR
   ========================================================================== */

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(
    message: string,
    status: number,
    data?: unknown
  ) {
    super(message);

    this.name = "ApiError";

    this.status = status;
    this.data = data;
  }
}

/* ==========================================================================
   AUTH REDIRECT
   ========================================================================== */

function redirectToLogin(): void {
  if (typeof window === "undefined") {
    return;
  }

  const pathname =
    window.location.pathname;

  if (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/register"
  ) {
    return;
  }

  const redirect =
    `${pathname}${window.location.search}`;

  const loginUrl =
    `/login?redirect=${encodeURIComponent(
      redirect
    )}`;

  console.log(
    "[AUTH] Redirecting to login:",
    loginUrl
  );

  window.location.replace(loginUrl);
}

/* ==========================================================================
   BUILD URL
   ========================================================================== */

function buildUrl(
  endpoint: string
): string {
  const cleanEndpoint =
    endpoint.startsWith("/")
      ? endpoint
      : `/${endpoint}`;

  return `${API_URL}${cleanEndpoint}`;
}

/* ==========================================================================
   ERROR MESSAGE
   ========================================================================== */

function getErrorMessage(
  data: unknown,
  status: number
): string {
  if (
    data &&
    typeof data === "object"
  ) {
    const response =
      data as {
        message?: unknown;
        error?: unknown;
      };

    if (
      typeof response.message ===
      "string"
    ) {
      return response.message;
    }

    if (
      typeof response.error ===
      "string"
    ) {
      return response.error;
    }
  }

  switch (status) {
    case 400:
      return "Invalid request.";

    case 401:
      return "Your session has expired. Please log in again.";

    case 403:
      return "You do not have permission to perform this action.";

    case 404:
      return "The requested resource was not found.";

    case 409:
      return "This request conflicts with existing data.";

    case 422:
      return "Please check the submitted information.";

    case 429:
      return "Too many requests. Please try again later.";

    case 500:
      return "Something went wrong on the server.";

    case 502:
      return "The server is temporarily unavailable.";

    case 503:
      return "The service is temporarily unavailable.";

    default:
      return `Request failed with status ${status}.`;
  }
}

/* ==========================================================================
   PARSE RESPONSE
   ========================================================================== */

async function parseResponse<T = unknown>(
  response: Response
): Promise<ApiResponse<T>> {
  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  let data: ApiResponse<T>;

  if (
    contentType.includes(
      "application/json"
    )
  ) {
    try {
      data =
        await response.json();
    } catch (error) {
      console.error(
        "[API] JSON parse error:",
        error
      );

      throw new ApiError(
        "Invalid JSON response from server.",
        response.status
      );
    }
  } else {
    let text = "";

    try {
      text =
        await response.text();
    } catch {
      text = "";
    }

    data = {
      success: false,

      message:
        text ||
        "Server returned an invalid response.",
    };
  }

  if (response.status === 401) {
    console.warn(
      "[AUTH] Backend returned 401"
    );

    redirectToLogin();

    throw new ApiError(
      data.message ||
        "Authentication required. Please log in again.",
      401,
      data
    );
  }

  if (response.status === 403) {
    throw new ApiError(
      data.message ||
        "You do not have permission to perform this action.",
      403,
      data
    );
  }

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(
        data,
        response.status
      ),
      response.status,
      data
    );
  }

  return data;
}

/* ==========================================================================
   GENERIC API REQUEST
   ========================================================================== */

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url =
    buildUrl(endpoint);

  console.log(
    `[API] ${options.method || "GET"} ${url}`
  );

  const isFormData =
    typeof FormData !== "undefined" &&
    options.body instanceof FormData;

  const headers =
    new Headers(
      options.headers
    );

  headers.set(
    "Accept",
    "application/json"
  );

  if (
    options.body &&
    !isFormData
  ) {
    headers.set(
      "Content-Type",
      "application/json"
    );
  }

  const requestOptions: RequestInit = {
    ...options,

    headers,

    credentials: "include",

    cache: "no-store",
  };

  let response: Response;

  try {
    response =
      await fetch(
        url,
        requestOptions
      );
  } catch (error) {
    console.error(
      "[API] Network error:",
      error
    );

    throw new ApiError(
      "Unable to connect to the backend server. Make sure the API server is running on http://localhost:5000.",
      0,
      error
    );
  }

  console.log(
    `[API] Response ${response.status}: ${url}`
  );

  return parseResponse<T>(
    response
  );
}

/* ==========================================================================
   GET
   ========================================================================== */

export function apiGet<T>(
  endpoint: string
): Promise<ApiResponse<T>> {
  return apiRequest<T>(
    endpoint,
    {
      method: "GET",
    }
  );
}

/* ==========================================================================
   POST
   ========================================================================== */

export function apiPost<T>(
  endpoint: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  return apiRequest<T>(
    endpoint,
    {
      method: "POST",

      body:
        body !== undefined
          ? JSON.stringify(body)
          : undefined,
    }
  );
}

/* ==========================================================================
   PUT
   ========================================================================== */

export function apiPut<T>(
  endpoint: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  return apiRequest<T>(
    endpoint,
    {
      method: "PUT",

      body:
        body !== undefined
          ? JSON.stringify(body)
          : undefined,
    }
  );
}

/* ==========================================================================
   PATCH
   ========================================================================== */

export function apiPatch<T>(
  endpoint: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  return apiRequest<T>(
    endpoint,
    {
      method: "PATCH",

      body:
        body !== undefined
          ? JSON.stringify(body)
          : undefined,
    }
  );
}

/* ==========================================================================
   DELETE
   ========================================================================== */

export function apiDelete<T = unknown>(
  endpoint: string
): Promise<ApiResponse<T>> {
  return apiRequest<T>(
    endpoint,
    {
      method: "DELETE",
    }
  );
}

/* ==========================================================================
   AUTH API
   ========================================================================== */

export const authApi = {
  async login(
    email: string,
    password: string
  ): Promise<ApiResponse<User>> {
    if (!email?.trim()) {
      throw new ApiError(
        "Email is required.",
        400
      );
    }

    if (!password) {
      throw new ApiError(
        "Password is required.",
        400
      );
    }

    return apiRequest<User>(
      "/auth/login",
      {
        method: "POST",

        body: JSON.stringify({
          email:
            email
              .trim()
              .toLowerCase(),

          password,
        }),
      }
    );
  },

  async register(
    name: string,
    email: string,
    password: string
  ): Promise<ApiResponse<User>> {
    if (!name?.trim()) {
      throw new ApiError(
        "Name is required.",
        400
      );
    }

    if (!email?.trim()) {
      throw new ApiError(
        "Email is required.",
        400
      );
    }

    if (!password) {
      throw new ApiError(
        "Password is required.",
        400
      );
    }

    return apiRequest<User>(
      "/auth/register",
      {
        method: "POST",

        body: JSON.stringify({
          name: name.trim(),

          email:
            email
              .trim()
              .toLowerCase(),

          password,
        }),
      }
    );
  },

  async me(): Promise<ApiResponse<User>> {
    return apiRequest<User>(
      "/auth/me",
      {
        method: "GET",
      }
    );
  },

  async logout(): Promise<ApiResponse> {
    return apiRequest(
      "/auth/logout",
      {
        method: "POST",
      }
    );
  },
};

/* ==========================================================================
   RESUME UPLOAD
   ========================================================================== */

export async function uploadResume(
  file: File
): Promise<Resume> {
  if (!file) {
    throw new ApiError(
      "Resume file is required.",
      400
    );
  }

  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (
    !allowedTypes.includes(
      file.type
    )
  ) {
    throw new ApiError(
      "Only PDF, DOC, and DOCX files are allowed.",
      400
    );
  }

  if (
    file.size >
    5 * 1024 * 1024
  ) {
    throw new ApiError(
      "Resume file size cannot exceed 5 MB.",
      400
    );
  }

  const formData =
    new FormData();

  formData.append(
    "resume",
    file
  );

  const response =
    await apiRequest<Resume>(
      "/resumes/upload",
      {
        method: "POST",
        body: formData,
      }
    );

  if (
    !response.success ||
    !response.data
  ) {
    throw new ApiError(
      response.message ||
        "Resume upload failed.",
      400,
      response
    );
  }

  return response.data;
}

/* ==========================================================================
   GET ALL RESUMES
   ========================================================================== */

export async function getResumes(): Promise<
  Resume[]
> {
  const response =
    await apiRequest<Resume[]>(
      "/resumes",
      {
        method: "GET",
      }
    );

  if (!response.success) {
    throw new ApiError(
      response.message ||
        "Failed to fetch resumes.",
      400,
      response
    );
  }

  return response.data || [];
}

/* ==========================================================================
   GET RESUME
   ========================================================================== */

export async function getResume(
  id: string
): Promise<Resume> {
  if (!id?.trim()) {
    throw new ApiError(
      "Resume ID is required.",
      400
    );
  }

  const response =
    await apiRequest<Resume>(
      `/resumes/${encodeURIComponent(
        id.trim()
      )}`,
      {
        method: "GET",
      }
    );

  if (
    !response.success ||
    !response.data
  ) {
    throw new ApiError(
      response.message ||
        "Failed to fetch resume.",
      404,
      response
    );
  }

  return response.data;
}

/* ==========================================================================
   GET RESUME BY ID
   --------------------------------------------------------------------------
   Compatibility alias used by:
   src/app/dashboard/resumes/[id]/page.tsx
   ========================================================================== */

export async function getResumeById(
  id: string
): Promise<Resume> {
  return getResume(id);
}

/* ==========================================================================
   DELETE RESUME
   ========================================================================== */

export async function deleteResume(
  id: string
): Promise<ApiResponse> {
  if (!id?.trim()) {
    throw new ApiError(
      "Resume ID is required.",
      400
    );
  }

  return apiRequest(
    `/resumes/${encodeURIComponent(
      id.trim()
    )}`,
    {
      method: "DELETE",
    }
  );
}

/* ==========================================================================
   ANALYZE RESUME
   ========================================================================== */

export async function analyzeResume(
  id: string
): Promise<Resume> {
  if (!id?.trim()) {
    throw new ApiError(
      "Resume ID is required.",
      400
    );
  }

  const response =
    await apiRequest<Resume>(
      `/resumes/${encodeURIComponent(
        id.trim()
      )}/analyze`,
      {
        method: "POST",
      }
    );

  if (
    !response.success ||
    !response.data
  ) {
    throw new ApiError(
      response.message ||
        "Failed to analyze resume.",
      400,
      response
    );
  }

  return response.data;
}

/* ==========================================================================
   SEARCH RESUMES
   ========================================================================== */

export async function searchResumes(
  keyword: string
): Promise<Resume[]> {
  const params =
    new URLSearchParams();

  if (keyword?.trim()) {
    params.set(
      "keyword",
      keyword.trim()
    );
  }

  const query =
    params.toString();

  const endpoint =
    query
      ? `/resumes/search?${query}`
      : "/resumes/search";

  const response =
    await apiRequest<Resume[]>(
      endpoint,
      {
        method: "GET",
      }
    );

  return response.data || [];
}

/* ==========================================================================
   RESUME STATS
   ========================================================================== */

export async function getResumeStats(): Promise<
  ResumeStats
> {
  const response =
    await apiRequest<ResumeStats>(
      "/resumes/stats",
      {
        method: "GET",
      }
    );

  if (
    !response.success ||
    !response.data
  ) {
    throw new ApiError(
      response.message ||
        "Failed to fetch resume statistics.",
      400,
      response
    );
  }

  return response.data;
}

/* ==========================================================================
   RESUME BUILDER
   ========================================================================== */

export async function createResumeBuilder(
  data: ResumeBuilderInput
): Promise<ResumeBuilder> {
  if (!data.title?.trim()) {
    throw new ApiError(
      "Resume title is required.",
      400
    );
  }

  const response =
    await apiRequest<ResumeBuilder>(
      "/resume-builder",
      {
        method: "POST",

        body:
          JSON.stringify(data),
      }
    );

  if (
    !response.success ||
    !response.data
  ) {
    throw new ApiError(
      response.message ||
        "Failed to create resume.",
      400,
      response
    );
  }

  return response.data;
}

export async function getResumeBuilders(): Promise<
  ResumeBuilder[]
> {
  const response =
    await apiRequest<
      ResumeBuilder[]
    >(
      "/resume-builder",
      {
        method: "GET",
      }
    );

  if (!response.success) {
    throw new ApiError(
      response.message ||
        "Failed to fetch resumes.",
      400,
      response
    );
  }

  return response.data || [];
}

export async function getResumeBuilder(
  id: string
): Promise<ResumeBuilder> {
  if (!id?.trim()) {
    throw new ApiError(
      "Resume ID is required.",
      400
    );
  }

  const response =
    await apiRequest<ResumeBuilder>(
      `/resume-builder/${encodeURIComponent(
        id.trim()
      )}`,
      {
        method: "GET",
      }
    );

  if (
    !response.success ||
    !response.data
  ) {
    throw new ApiError(
      response.message ||
        "Failed to fetch resume.",
      404,
      response
    );
  }

  return response.data;
}

export async function updateResumeBuilder(
  id: string,
  data: Partial<ResumeBuilderInput>
): Promise<ResumeBuilder> {
  if (!id?.trim()) {
    throw new ApiError(
      "Resume ID is required.",
      400
    );
  }

  const response =
    await apiRequest<ResumeBuilder>(
      `/resume-builder/${encodeURIComponent(
        id.trim()
      )}`,
      {
        method: "PUT",

        body:
          JSON.stringify(data),
      }
    );

  if (
    !response.success ||
    !response.data
  ) {
    throw new ApiError(
      response.message ||
        "Failed to update resume.",
      400,
      response
    );
  }

  return response.data;
}

export async function deleteResumeBuilder(
  id: string
): Promise<ApiResponse> {
  if (!id?.trim()) {
    throw new ApiError(
      "Resume ID is required.",
      400
    );
  }

  return apiRequest(
    `/resume-builder/${encodeURIComponent(
      id.trim()
    )}`,
    {
      method: "DELETE",
    }
  );
}

export async function duplicateResumeBuilder(
  id: string
): Promise<ResumeBuilder> {
  if (!id?.trim()) {
    throw new ApiError(
      "Resume ID is required.",
      400
    );
  }

  const response =
    await apiRequest<ResumeBuilder>(
      `/resume-builder/${encodeURIComponent(
        id.trim()
      )}/duplicate`,
      {
        method: "POST",
      }
    );

  if (
    !response.success ||
    !response.data
  ) {
    throw new ApiError(
      response.message ||
        "Failed to duplicate resume.",
      400,
      response
    );
  }

  return response.data;
}

/* ==========================================================================
   RESUME BUILDER PDF
   ========================================================================== */

export async function getResumeBuilderPdf(
  id: string,
  template?: string
): Promise<Blob> {
  if (!id?.trim()) {
    throw new ApiError(
      "Resume ID is required.",
      400
    );
  }

  let endpoint =
    `/resume-builder/${encodeURIComponent(
      id.trim()
    )}/pdf`;

  if (template) {
    endpoint +=
      `?template=${encodeURIComponent(
        template
      )}`;
  }

  const url =
    buildUrl(endpoint);

  let response: Response;

  try {
    response =
      await fetch(
        url,
        {
          method: "GET",

          credentials:
            "include",

          cache:
            "no-store",

          headers: {
            Accept:
              "application/pdf",
          },
        }
      );
  } catch (error) {
    throw new ApiError(
      "Unable to connect to the backend server.",
      0,
      error
    );
  }

  if (!response.ok) {
    let data: unknown = null;

    try {
      data =
        await response.json();
    } catch {
      // Ignore parsing errors.
    }

    if (
      response.status === 401
    ) {
      redirectToLogin();

      throw new ApiError(
        "Authentication required.",
        401,
        data
      );
    }

    throw new ApiError(
      getErrorMessage(
        data,
        response.status
      ),
      response.status,
      data
    );
  }

  return response.blob();
}

export async function downloadResumeBuilderPdf(
  id: string,
  template?: string,
  fileName = "resume.pdf"
): Promise<void> {
  const blob =
    await getResumeBuilderPdf(
      id,
      template
    );

  const blobUrl =
    window.URL.createObjectURL(
      blob
    );

  const anchor =
    document.createElement("a");

  anchor.href =
    blobUrl;

  anchor.download =
    fileName;

  document.body.appendChild(
    anchor
  );

  anchor.click();

  anchor.remove();

  window.URL.revokeObjectURL(
    blobUrl
  );
}

/* ==========================================================================
   JOB API
   ========================================================================== */

export async function createJob(
  data: CreateJobInput
): Promise<Job> {
  if (!data.title?.trim()) {
    throw new ApiError(
      "Job title is required.",
      400
    );
  }

  if (!data.company?.trim()) {
    throw new ApiError(
      "Company name is required.",
      400
    );
  }

  if (!data.description?.trim()) {
    throw new ApiError(
      "Job description is required.",
      400
    );
  }

  if (!data.requirements?.trim()) {
    throw new ApiError(
      "Job requirements are required.",
      400
    );
  }

  if (
    !Array.isArray(
      data.requiredSkills
    )
  ) {
    throw new ApiError(
      "Required skills must be an array.",
      400
    );
  }

  const response =
    await apiRequest<Job>(
      "/jobs",
      {
        method: "POST",

        body:
          JSON.stringify(data),
      }
    );

  if (
    !response.success ||
    !response.data
  ) {
    throw new ApiError(
      response.message ||
        "Failed to create job.",
      400,
      response
    );
  }

  return response.data;
}

export async function getJobs(): Promise<
  Job[]
> {
  const response =
    await apiRequest<Job[]>(
      "/jobs",
      {
        method: "GET",
      }
    );

  if (!response.success) {
    throw new ApiError(
      response.message ||
        "Failed to fetch jobs.",
      400,
      response
    );
  }

  return response.data || [];
}

export async function getJob(
  id: string
): Promise<Job> {
  if (!id?.trim()) {
    throw new ApiError(
      "Job ID is required.",
      400
    );
  }

  const response =
    await apiRequest<Job>(
      `/jobs/${encodeURIComponent(
        id.trim()
      )}`,
      {
        method: "GET",
      }
    );

  if (
    !response.success ||
    !response.data
  ) {
    throw new ApiError(
      response.message ||
        "Failed to fetch job.",
      404,
      response
    );
  }

  return response.data;
}

export async function updateJob(
  id: string,
  data: UpdateJobInput
): Promise<Job> {
  if (!id?.trim()) {
    throw new ApiError(
      "Job ID is required.",
      400
    );
  }

  const response =
    await apiRequest<Job>(
      `/jobs/${encodeURIComponent(
        id.trim()
      )}`,
      {
        method: "PUT",

        body:
          JSON.stringify(data),
      }
    );

  if (
    !response.success ||
    !response.data
  ) {
    throw new ApiError(
      response.message ||
        "Failed to update job.",
      400,
      response
    );
  }

  return response.data;
}

export async function updateJobStatus(
  id: string,
  status:
    | "ACTIVE"
    | "CLOSED"
    | "DRAFT"
): Promise<Job> {
  return updateJob(
    id,
    {
      status,
    }
  );
}

export async function deleteJob(
  id: string
): Promise<void> {
  if (!id?.trim()) {
    throw new ApiError(
      "Job ID is required.",
      400
    );
  }

  await apiRequest(
    `/jobs/${encodeURIComponent(
      id.trim()
    )}`,
    {
      method: "DELETE",
    }
  );
}

/* ==========================================================================
   ANALYSIS API
   ========================================================================== */

export async function createAnalysis(
  resumeId: string,
  jobId: string
): Promise<AnalysisResult> {
  if (!resumeId?.trim()) {
    throw new ApiError(
      "Resume ID is required.",
      400
    );
  }

  if (!jobId?.trim()) {
    throw new ApiError(
      "Job ID is required.",
      400
    );
  }

  const response =
    await apiRequest<AnalysisResult>(
      "/analysis",
      {
        method: "POST",

        body:
          JSON.stringify({
            resumeId:
              resumeId.trim(),

            jobId:
              jobId.trim(),
          }),
      }
    );

  if (
    !response.success ||
    !response.data
  ) {
    throw new ApiError(
      response.message ||
        "Failed to create analysis.",
      400,
      response
    );
  }

  return response.data;
}

export async function getAnalyses(): Promise<
  AnalysisResult[]
> {
  const response =
    await apiRequest<
      AnalysisResult[]
    >(
      "/analysis",
      {
        method: "GET",
      }
    );

  if (!response.success) {
    throw new ApiError(
      response.message ||
        "Failed to fetch analyses.",
      400,
      response
    );
  }

  return response.data || [];
}

export async function getAnalysis(
  id: string
): Promise<AnalysisResult> {
  if (!id?.trim()) {
    throw new ApiError(
      "Analysis ID is required.",
      400
    );
  }

  const response =
    await apiRequest<AnalysisResult>(
      `/analysis/${encodeURIComponent(
        id.trim()
      )}`,
      {
        method: "GET",
      }
    );

  if (
    !response.success ||
    !response.data
  ) {
    throw new ApiError(
      response.message ||
        "Failed to fetch analysis.",
      404,
      response
    );
  }

  return response.data;
}

export async function getResumeAnalyses(
  resumeId: string
): Promise<AnalysisResult[]> {
  if (!resumeId?.trim()) {
    throw new ApiError(
      "Resume ID is required.",
      400
    );
  }

  const analyses =
    await getAnalyses();

  return analyses
    .filter(
      (analysis) =>
        analysis.resumeId ===
        resumeId.trim()
    )
    .sort(
      (a, b) =>
        new Date(
          b.createdAt
        ).getTime() -
        new Date(
          a.createdAt
        ).getTime()
    );
}

export async function getLatestResumeAnalysis(
  resumeId: string
): Promise<
  AnalysisResult | null
> {
  const analyses =
    await getResumeAnalyses(
      resumeId
    );

  return analyses[0] || null;
}

export async function getResumeWithLatestAnalysis(
  resumeId: string
): Promise<{
  resume: Resume;
  analysis: AnalysisResult | null;
}> {
  if (!resumeId?.trim()) {
    throw new ApiError(
      "Resume ID is required.",
      400
    );
  }

  const cleanResumeId =
    resumeId.trim();

  const [
    resume,
    analysis,
  ] = await Promise.all([
    getResume(
      cleanResumeId
    ),

    getLatestResumeAnalysis(
      cleanResumeId
    ),
  ]);

  return {
    resume,
    analysis,
  };
}

export async function deleteAnalysis(
  id: string
): Promise<ApiResponse> {
  if (!id?.trim()) {
    throw new ApiError(
      "Analysis ID is required.",
      400
    );
  }

  return apiRequest(
    `/analysis/${encodeURIComponent(
      id.trim()
    )}`,
    {
      method: "DELETE",
    }
  );
}

/* ==========================================================================
   HISTORY API
   --------------------------------------------------------------------------
   This fixes:

   Export getHistory doesn't exist in target module
   ========================================================================== */

export async function getHistory(): Promise<
  HistoryAnalysis[]
> {
  const response =
    await apiRequest<
      HistoryAnalysis[]
    >(
      "/analysis",
      {
        method: "GET",
      }
    );

  if (!response.success) {
    throw new ApiError(
      response.message ||
        "Failed to fetch analysis history.",
      400,
      response
    );
  }

  return response.data || [];
}

/* ==========================================================================
   AI RESUME API
   ========================================================================== */

export async function aiAnalyzeResume(
  resumeId: string
): Promise<AIResumeAnalysis> {
  if (!resumeId?.trim()) {
    throw new ApiError(
      "Resume ID is required.",
      400
    );
  }

  const response =
    await apiRequest<AIResumeAnalysis>(
      `/ai/resume/${encodeURIComponent(
        resumeId.trim()
      )}/analyze`,
      {
        method: "POST",
      }
    );

  if (
    !response.success ||
    !response.data
  ) {
    throw new ApiError(
      response.message ||
        "AI resume analysis failed.",
      400,
      response
    );
  }

  return response.data;
}

export async function aiScoreResume(
  resumeId: string
): Promise<AIResumeScore> {
  if (!resumeId?.trim()) {
    throw new ApiError(
      "Resume ID is required.",
      400
    );
  }

  const response =
    await apiRequest<AIResumeScore>(
      `/ai/resume/${encodeURIComponent(
        resumeId.trim()
      )}/score`,
      {
        method: "POST",
      }
    );

  if (
    !response.success ||
    !response.data
  ) {
    throw new ApiError(
      response.message ||
        "Failed to calculate ATS score.",
      400,
      response
    );
  }

  return response.data;
}

export async function aiGenerateResumeSummary(
  resumeId: string
): Promise<AIResumeSummary> {
  if (!resumeId?.trim()) {
    throw new ApiError(
      "Resume ID is required.",
      400
    );
  }

  const response =
    await apiRequest<AIResumeSummary>(
      `/ai/resume/${encodeURIComponent(
        resumeId.trim()
      )}/summary`,
      {
        method: "POST",
      }
    );

  if (
    !response.success ||
    !response.data
  ) {
    throw new ApiError(
      response.message ||
        "Failed to generate resume summary.",
      400,
      response
    );
  }

  return response.data;
}

export async function aiSuggestSkills(
  resumeId: string
): Promise<AISkillSuggestions> {
  if (!resumeId?.trim()) {
    throw new ApiError(
      "Resume ID is required.",
      400
    );
  }

  const response =
    await apiRequest<AISkillSuggestions>(
      `/ai/resume/${encodeURIComponent(
        resumeId.trim()
      )}/skills`,
      {
        method: "POST",
      }
    );

  if (
    !response.success ||
    !response.data
  ) {
    throw new ApiError(
      response.message ||
        "Failed to generate skill suggestions.",
      400,
      response
    );
  }

  return response.data;
}

export async function aiImproveExperience(
  data: AIExperienceInput
): Promise<AIExperienceImprovement> {
  if (!data.experience?.trim()) {
    throw new ApiError(
      "Experience text is required.",
      400
    );
  }

  const response =
    await apiRequest<AIExperienceImprovement>(
      "/ai/resume/experience",
      {
        method: "POST",

        body:
          JSON.stringify(data),
      }
    );

  if (
    !response.success ||
    !response.data
  ) {
    throw new ApiError(
      response.message ||
        "Failed to improve experience.",
      400,
      response
    );
  }

  return response.data;
}

export async function aiImproveProject(
  data: AIProjectInput
): Promise<AIProjectImprovement> {
  if (!data.project?.trim()) {
    throw new ApiError(
      "Project description is required.",
      400
    );
  }

  const response =
    await apiRequest<AIProjectImprovement>(
      "/ai/resume/project",
      {
        method: "POST",

        body:
          JSON.stringify(data),
      }
    );

  if (
    !response.success ||
    !response.data
  ) {
    throw new ApiError(
      response.message ||
        "Failed to improve project.",
      400,
      response
    );
  }

  return response.data;
}

export async function aiImproveResume(
  resumeId: string
): Promise<AIResumeImprovement> {
  if (!resumeId?.trim()) {
    throw new ApiError(
      "Resume ID is required.",
      400
    );
  }

  const response =
    await apiRequest<AIResumeImprovement>(
      `/ai/resume/${encodeURIComponent(
        resumeId.trim()
      )}/improve`,
      {
        method: "POST",
      }
    );

  if (
    !response.success ||
    !response.data
  ) {
    throw new ApiError(
      response.message ||
        "Failed to improve resume.",
      400,
      response
    );
  }

  return response.data;
}

export async function aiGetResumeRecommendations(
  resumeId: string
): Promise<string[]> {
  if (!resumeId?.trim()) {
    throw new ApiError(
      "Resume ID is required.",
      400
    );
  }

  const response =
    await apiRequest<string[]>(
      `/ai/resume/${encodeURIComponent(
        resumeId.trim()
      )}/recommendations`,
      {
        method: "POST",
      }
    );

  if (!response.success) {
    throw new ApiError(
      response.message ||
        "Failed to generate recommendations.",
      400,
      response
    );
  }

  return response.data || [];
}

export async function aiMatchResumeToJob(
  data: AIJobMatchInput
): Promise<AIJobMatch> {
  if (
    !data.resumeId &&
    !data.resumeText
  ) {
    throw new ApiError(
      "Resume ID or resume text is required.",
      400
    );
  }

  if (
    !data.jobId &&
    !data.jobDescription
  ) {
    throw new ApiError(
      "Job ID or job description is required.",
      400
    );
  }

  const response =
    await apiRequest<AIJobMatch>(
      "/ai/job-match",
      {
        method: "POST",

        body:
          JSON.stringify(data),
      }
    );

  if (
    !response.success ||
    !response.data
  ) {
    throw new ApiError(
      response.message ||
        "Failed to match resume with job.",
      400,
      response
    );
  }

  return response.data;
}

export async function aiAnalyzeResumeText(
  resumeText: string
): Promise<AIResumeAnalysis> {
  if (!resumeText?.trim()) {
    throw new ApiError(
      "Resume text is required.",
      400
    );
  }

  const response =
    await apiRequest<AIResumeAnalysis>(
      "/ai/resume/analyze-text",
      {
        method: "POST",

        body:
          JSON.stringify({
            resumeText:
              resumeText.trim(),
          }),
      }
    );

  if (
    !response.success ||
    !response.data
  ) {
    throw new ApiError(
      response.message ||
        "AI resume analysis failed.",
      400,
      response
    );
  }

  return response.data;
}

/* ==========================================================================
   AI RESUME API OBJECT
   ========================================================================== */

export const resumeAI = {
  analyze:
    aiAnalyzeResume,

  score:
    aiScoreResume,

  generateSummary:
    aiGenerateResumeSummary,

  suggestSkills:
    aiSuggestSkills,

  improveExperience:
    aiImproveExperience,

  improveProject:
    aiImproveProject,

  improveResume:
    aiImproveResume,

  recommendations:
    aiGetResumeRecommendations,

  jobMatch:
    aiMatchResumeToJob,

  analyzeText:
    aiAnalyzeResumeText,
};

/* ==========================================================================
   DASHBOARD
   ========================================================================== */

export async function getDashboard(): Promise<
  DashboardData
> {
  const response =
    await apiRequest<DashboardData>(
      "/dashboard",
      {
        method: "GET",
      }
    );

  if (
    !response.success ||
    !response.data
  ) {
    throw new ApiError(
      response.message ||
        "Failed to fetch dashboard.",
      400,
      response
    );
  }

  return response.data;
}

/* ==========================================================================
   DASHBOARD FALLBACK
   ========================================================================== */

export async function getDashboardFallback(): Promise<
  DashboardData
> {
  const [
    resumes,
    jobs,
    analyses,
  ] = await Promise.all([
    getResumes(),
    getJobs(),
    getAnalyses(),
  ]);

  const validScores =
    analyses
      .map((analysis) =>
        Number(
          analysis.matchScore
        )
      )
      .filter(
        (score) =>
          Number.isFinite(score)
      );

  const averageMatchScore =
    validScores.length > 0
      ? Math.round(
          validScores.reduce(
            (sum, score) =>
              sum + score,
            0
          ) /
            validScores.length
        )
      : 0;

  const strongMatches =
    analyses.filter(
      (analysis) =>
        Number(
          analysis.matchScore
        ) >= 75
    ).length;

  const sortedAnalyses =
    [...analyses].sort(
      (a, b) =>
        new Date(
          b.createdAt
        ).getTime() -
        new Date(
          a.createdAt
        ).getTime()
    );

  const latestAnalysis =
    sortedAnalyses[0] ||
    null;

  const recentAnalyses =
    sortedAnalyses
      .slice(0, 10)
      .map(
        (analysis) => ({
          id:
            analysis.id,

          resumeId:
            analysis.resumeId,

          jobId:
            analysis.jobId,

          matchScore:
            analysis.matchScore,

          hiringRecommendation:
            analysis.hiringRecommendation,

          createdAt:
            analysis.createdAt,

          resume: {
            id:
              analysis.resume.id,

            fileName:
              analysis.resume.fileName,

            candidateName:
              analysis.resume
                .candidateName,
          },

          job: {
            id:
              analysis.job.id,

            title:
              analysis.job.title,

            company:
              analysis.job.company,
          },
        })
      );

  return {
    stats: {
      totalResumes:
        resumes.length,

      totalAnalyses:
        analyses.length,

      totalJobs:
        jobs.length,

      averageMatchScore,

      strongMatches,
    },

    latestAnalysis,

    recentAnalyses,
  };
}

export async function loadDashboard(): Promise<
  DashboardData
> {
  try {
    return await getDashboard();
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status === 401
    ) {
      throw error;
    }

    console.warn(
      "[DASHBOARD] Falling back:",
      error
    );

    return getDashboardFallback();
  }
}

/* ==========================================================================
   AUTH HELPERS
   ========================================================================== */

export function getStoredAccessToken():
  string | null {
  /*
   * Authentication uses HTTP-only cookies.
   * JavaScript cannot access the access token.
   */

  return null;
}

export async function isAuthenticated():
  Promise<boolean> {
  try {
    const response =
      await authApi.me();

    return Boolean(
      response.success &&
      response.user
    );
  } catch {
    return false;
  }
}

export function clearAuthentication():
  void {
  console.log(
    "[AUTH] Authentication uses HTTP-only cookies. Call authApi.logout()."
  );
}

/* ==========================================================================
   EXPORT API URL
   ========================================================================== */

export {
  API_URL,
};