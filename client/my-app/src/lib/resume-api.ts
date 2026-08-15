
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";


export interface Resume {
  id: string;

  fileName: string;

  candidateName: string | null;
  candidateEmail: string | null;
  candidatePhone: string | null;

  aiScore: number;

  status: string;

  summary: string | null;

  skills: unknown;
  experience: unknown;
  education: unknown;
  projects: unknown;
  certifications: unknown;

  strengths: unknown;
  weaknesses: unknown;
  suggestions: unknown;

  extractedText?: string | null;

  createdAt: string;
  updatedAt: string;
}

/* ==========================================================================
   API RESPONSE TYPES
   ========================================================================== */

export interface ResumeResponse {
  success: boolean;
  data: Resume;
  message?: string;
}

export interface ResumesResponse {
  success: boolean;
  data: Resume[];
  message?: string;
}

export interface DeleteResumeResponse {
  success: boolean;
  message: string;
}

/* ==========================================================================
   UPDATE TYPES
   ========================================================================== */

export interface UpdateResumeData {
  candidateName?: string;
  candidateEmail?: string;
  candidatePhone?: string;

  summary?: string;

  skills?: string[];

  experience?: unknown[];

  education?: unknown[];

  projects?: unknown[];

  certifications?: unknown[];

  status?: string;
}

/* ==========================================================================
   TOKEN CONFIGURATION
   ========================================================================== */

const TOKEN_KEY = "resumeai_access_token";

/* ==========================================================================
   TOKEN HELPERS
   ========================================================================== */

function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error(
      "Unable to read access token:",
      error,
    );

    return null;
  }
}

function removeAccessToken(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error(
      "Unable to remove access token:",
      error,
    );
  }
}

/* ==========================================================================
   AUTH HEADERS
   ========================================================================== */

function getAuthHeaders(): HeadersInit {
  const token = getAccessToken();

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

/* ==========================================================================
   RESPONSE HELPER
   ========================================================================== */

async function parseResponse(
  response: Response,
): Promise<any> {
  let result: any = {};

  try {
    result = await response.json();
  } catch {
    result = {};
  }

  if (!response.ok) {
    if (response.status === 401) {
      removeAccessToken();

      throw new Error(
        result.message ||
          "Authentication required. Please login again.",
      );
    }

    if (response.status === 403) {
      throw new Error(
        result.message ||
          "You do not have permission to perform this action.",
      );
    }

    if (response.status === 404) {
      throw new Error(
        result.message ||
          "Resume not found.",
      );
    }

    throw new Error(
      result.message ||
        `Request failed with status ${response.status}`,
    );
  }

  return result;
}

/* ==========================================================================
   GET ALL RESUMES
   ========================================================================== */

export async function getResumes(): Promise<Resume[]> {
  const token = getAccessToken();

  if (!token) {
    throw new Error(
      "Authentication required. Please login again.",
    );
  }

  const response = await fetch(
    `${API_URL}/resumes`,
    {
      method: "GET",

      credentials: "include",

      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },

      cache: "no-store",
    },
  );

  const result = await parseResponse(response);

  if (!result.success) {
    throw new Error(
      result.message ||
        "Failed to fetch resumes",
    );
  }

  return result.data || [];
}

/* ==========================================================================
   GET RESUME BY ID
   ========================================================================== */

export async function getResume(
  id: string,
): Promise<Resume> {
  if (!id) {
    throw new Error(
      "Resume ID is required",
    );
  }

  const token = getAccessToken();

  if (!token) {
    throw new Error(
      "Authentication required. Please login again.",
    );
  }

  const response = await fetch(
    `${API_URL}/resumes/${id}`,
    {
      method: "GET",

      credentials: "include",

      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },

      cache: "no-store",
    },
  );

  const result = await parseResponse(response);

  if (
    !result.success ||
    !result.data
  ) {
    throw new Error(
      result.message ||
        "Failed to fetch resume",
    );
  }

  return result.data;
}

/* ==========================================================================
   UPLOAD RESUME
   ========================================================================== */

export async function uploadResume(
  file: File,
): Promise<Resume> {
  if (!file) {
    throw new Error(
      "Resume file is required",
    );
  }

  const token = getAccessToken();

  if (!token) {
    throw new Error(
      "Authentication required. Please login again.",
    );
  }

  /* ------------------------------------------------------------------------
     Validate file type
     ------------------------------------------------------------------------ */

  const allowedTypes = [
    "application/pdf",

    "application/msword",

    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      "Only PDF, DOC, and DOCX resume files are supported.",
    );
  }

  /* ------------------------------------------------------------------------
     Validate file size
     ------------------------------------------------------------------------ */

  const maxSize = 10 * 1024 * 1024;

  if (file.size > maxSize) {
    throw new Error(
      "Resume file size must be less than 10 MB.",
    );
  }

  /* ------------------------------------------------------------------------
     Create FormData
     ------------------------------------------------------------------------ */

  const formData = new FormData();

  formData.append(
    "resume",
    file,
  );

  /* ------------------------------------------------------------------------
     Upload request
     ------------------------------------------------------------------------ */

  const response = await fetch(
    `${API_URL}/resumes/upload`,
    {
      method: "POST",

      credentials: "include",

      headers: {
        ...getAuthHeaders(),
      },

      body: formData,
    },
  );

  const result = await parseResponse(response);

  if (
    !result.success ||
    !result.data
  ) {
    throw new Error(
      result.message ||
        "Resume upload failed",
    );
  }

  return result.data;
}

/* ==========================================================================
   UPDATE RESUME
   ========================================================================== */

export async function updateResume(
  id: string,
  data: UpdateResumeData,
): Promise<Resume> {
  if (!id) {
    throw new Error(
      "Resume ID is required",
    );
  }

  const token = getAccessToken();

  if (!token) {
    throw new Error(
      "Authentication required. Please login again.",
    );
  }

  const response = await fetch(
    `${API_URL}/resumes/${id}`,
    {
      method: "PUT",

      credentials: "include",

      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },

      body: JSON.stringify(data),
    },
  );

  const result = await parseResponse(response);

  if (
    !result.success ||
    !result.data
  ) {
    throw new Error(
      result.message ||
        "Failed to update resume",
    );
  }

  return result.data;
}

/* ==========================================================================
   DELETE RESUME
   ========================================================================== */

export async function deleteResume(
  id: string,
): Promise<DeleteResumeResponse> {
  if (!id) {
    throw new Error(
      "Resume ID is required",
    );
  }

  const token = getAccessToken();

  if (!token) {
    throw new Error(
      "Authentication required. Please login again.",
    );
  }

  const response = await fetch(
    `${API_URL}/resumes/${id}`,
    {
      method: "DELETE",

      credentials: "include",

      headers: {
        ...getAuthHeaders(),
      },
    },
  );

  const result = await parseResponse(response);

  if (!result.success) {
    throw new Error(
      result.message ||
        "Failed to delete resume",
    );
  }

  return {
    success: true,

    message:
      result.message ||
      "Resume deleted successfully",
  };
}

/* ==========================================================================
   DOWNLOAD RESUME
   ========================================================================== */

export async function downloadResume(
  id: string,
): Promise<Blob> {
  if (!id) {
    throw new Error(
      "Resume ID is required",
    );
  }

  const token = getAccessToken();

  if (!token) {
    throw new Error(
      "Authentication required. Please login again.",
    );
  }

  const response = await fetch(
    `${API_URL}/resumes/${id}/download`,
    {
      method: "GET",

      credentials: "include",

      headers: {
        ...getAuthHeaders(),
      },
    },
  );

  if (!response.ok) {
    let message =
      "Failed to download resume";

    try {
      const result =
        await response.json();

      message =
        result.message ||
        message;
    } catch {
      // Ignore JSON parsing error
    }

    if (response.status === 401) {
      removeAccessToken();

      message =
        "Authentication required. Please login again.";
    }

    if (response.status === 404) {
      message =
        "Resume not found.";
    }

    throw new Error(message);
  }

  return response.blob();
}

/* ==========================================================================
   DOWNLOAD RESUME TO BROWSER
   ========================================================================== */

export async function saveResumeFile(
  id: string,
  fileName?: string,
): Promise<void> {
  const blob =
    await downloadResume(id);

  const url =
    window.URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;

  link.download =
    fileName || "resume";

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.URL.revokeObjectURL(url);
}

/* ==========================================================================
   RESUME COUNT
   ========================================================================== */

export async function getResumeCount(): Promise<number> {
  const resumes =
    await getResumes();

  return resumes.length;
}

/* ==========================================================================
   FIND RESUME
   ========================================================================== */

export async function findResume(
  id: string,
): Promise<Resume | null> {
  try {
    return await getResume(id);
  } catch {
    return null;
  }
}

/* ==========================================================================
   AUTH HELPERS
   ========================================================================== */

export function isResumeApiAuthenticated(): boolean {
  return Boolean(
    getAccessToken(),
  );
}

export function clearResumeAuthentication(): void {
  removeAccessToken();
}