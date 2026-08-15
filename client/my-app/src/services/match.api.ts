import type {
  JobMatchResponse,
  JobMatch,
} from "@/types/match";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

const TOKEN_KEY = "resumeai_access_token";

function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const token = localStorage.getItem(TOKEN_KEY);

    return token?.trim() || null;
  } catch (error) {
    console.error(
      "[MATCH AUTH] Failed to read token:",
      error
    );

    return null;
  }
}

function getAuthHeaders(): HeadersInit {
  const token = getAccessToken();

  if (!token) {
    console.warn(
      "[MATCH AUTH] No access token found."
    );

    return {
      "Content-Type": "application/json",
    };
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function handleResponse<T>(
  response: Response
): Promise<T> {
  const text = await response.text();

  let result: any = {};

  try {
    result = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(
      `Invalid server response. Status: ${response.status}`
    );
  }

  if (response.status === 401) {
    throw new Error(
      result.message ||
        "User not authenticated. Please login again."
    );
  }

  if (response.status === 403) {
    throw new Error(
      result.message ||
        "You do not have permission to perform this action."
    );
  }

  if (response.status === 404) {
    throw new Error(
      result.message ||
        "Requested resource was not found."
    );
  }

  if (!response.ok) {
    throw new Error(
      result.message ||
        `Request failed with status ${response.status}.`
    );
  }

  return result as T;
}

/* ============================================================
   GET JOB MATCHES
============================================================ */

export async function getJobMatches(
  jobId: string
): Promise<JobMatch[]> {
  if (!jobId?.trim()) {
    throw new Error("Job ID is required.");
  }

  const token = getAccessToken();

  if (!token) {
    throw new Error(
      "User not authenticated. Please login again."
    );
  }

  const url =
    `${API_URL}/matches/job/${encodeURIComponent(
      jobId.trim()
    )}`;

  console.log(
    "[MATCHES] GET:",
    url
  );

  console.log(
    "[MATCHES] Token available:",
    Boolean(token)
  );

  const response = await fetch(url, {
    method: "GET",

    headers: getAuthHeaders(),

    credentials: "include",

    cache: "no-store",
  });

  const result =
    await handleResponse<JobMatchResponse>(
      response
    );

  return Array.isArray(result.data)
    ? result.data
    : [];
}

/* ============================================================
   GET SINGLE MATCH
============================================================ */

export async function getMatchById(
  matchId: string
): Promise<JobMatch> {
  if (!matchId?.trim()) {
    throw new Error(
      "Match ID is required."
    );
  }

  const token = getAccessToken();

  if (!token) {
    throw new Error(
      "User not authenticated. Please login again."
    );
  }

  const url =
    `${API_URL}/matches/${encodeURIComponent(
      matchId.trim()
    )}`;

  const response = await fetch(url, {
    method: "GET",

    headers: getAuthHeaders(),

    credentials: "include",

    cache: "no-store",
  });

  const result =
    await handleResponse<{
      success: boolean;
      message?: string;
      data: JobMatch;
    }>(response);

  if (!result.data) {
    throw new Error(
      "Match data was not returned by the server."
    );
  }

  return result.data;
}

/* ============================================================
   CREATE MATCH
============================================================ */

export async function createMatch(
  jobId: string,
  resumeId: string
): Promise<JobMatch> {
  if (!jobId?.trim()) {
    throw new Error(
      "Job ID is required."
    );
  }

  if (!resumeId?.trim()) {
    throw new Error(
      "Resume ID is required."
    );
  }

  const token = getAccessToken();

  if (!token) {
    throw new Error(
      "User not authenticated. Please login again."
    );
  }

  const response = await fetch(
    `${API_URL}/matches`,
    {
      method: "POST",

      headers: getAuthHeaders(),

      credentials: "include",

      body: JSON.stringify({
        jobId: jobId.trim(),
        resumeId: resumeId.trim(),
      }),
    }
  );

  const result =
    await handleResponse<{
      success: boolean;
      message?: string;
      data: JobMatch;
    }>(response);

  if (!result.data) {
    throw new Error(
      "Match data was not returned by the server."
    );
  }

  return result.data;
}

/* ============================================================
   DELETE MATCH
============================================================ */

export async function deleteMatch(
  matchId: string
): Promise<void> {
  if (!matchId?.trim()) {
    throw new Error(
      "Match ID is required."
    );
  }

  const token = getAccessToken();

  if (!token) {
    throw new Error(
      "User not authenticated. Please login again."
    );
  }

  const response = await fetch(
    `${API_URL}/matches/${encodeURIComponent(
      matchId.trim()
    )}`,
    {
      method: "DELETE",

      headers: getAuthHeaders(),

      credentials: "include",
    }
  );

  await handleResponse<{
    success: boolean;
    message?: string;
  }>(response);
}